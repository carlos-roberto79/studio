
"use client";

import type { UserRole } from '@/lib/constants';
import { USER_ROLES, APP_NAME } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';
import { getUserProfile, createUserProfile, type UserProfile } from '@/services/supabaseService'; // Ajuste para usar supabaseService

const SITE_ADMIN_EMAIL = "superadmin@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";
const SITE_ADMIN_PASS = "superadmin123";
const PROFESSIONAL_TEST_EMAIL = "profissional@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";
const PROFESSIONAL_TEST_PASS = "prof123";


interface User {
  id: string;
  email: string | undefined;
}

interface AuthContextType {
  user: User | null;
  session: SupabaseSession | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserRole | null>;
  signup: (email: string, pass: string, intendedRole: UserRole) => Promise<{ user: SupabaseUser | null; role: UserRole | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession?.user) {
        const supabaseUser = currentSession.user;
        const currentUser = { id: supabaseUser.id, email: supabaseUser.email?.toLowerCase() };
        setUser(currentUser);

        const userProfile = await getUserProfile(supabaseUser.id);
        if (userProfile?.role) {
          setRole(userProfile.role);
        } else {
          // Fallback para lógica de e-mail especial ou cliente padrão se perfil não encontrado
           const normalizedEmail = currentUser.email;
          if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
            setRole(USER_ROLES.SITE_ADMIN);
          } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) {
            setRole(USER_ROLES.PROFESSIONAL);
          } else {
             // Se não há perfil e não é um e-mail especial, não definir papel ou definir como cliente.
             // Para consistência, vamos tentar criar um perfil se não existir.
             if(normalizedEmail) {
                // console.warn(`Tentando criar perfil para usuário existente sem perfil: ${normalizedEmail}`);
                // await createUserProfile(supabaseUser.id, normalizedEmail, USER_ROLES.CLIENT);
             }
            setRole(USER_ROLES.CLIENT); // Default para cliente se nada mais for encontrado
          }
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setLoading(true);
      setSession(newSession);
      if (newSession?.user) {
        const supabaseUser = newSession.user;
        const currentUser = { id: supabaseUser.id, email: supabaseUser.email?.toLowerCase() };
        setUser(currentUser);

        const userProfile = await getUserProfile(supabaseUser.id);
        if (userProfile?.role) {
          setRole(userProfile.role);
        } else {
          const normalizedEmail = currentUser.email;
          if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
            setRole(USER_ROLES.SITE_ADMIN);
          } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) {
            setRole(USER_ROLES.PROFESSIONAL);
          } else {
            setRole(USER_ROLES.CLIENT);
          }
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<UserRole | null> => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    
    // Casos especiais para SITE_ADMIN e PROFESSIONAL_TEST_EMAIL
    if (normalizedEmail === SITE_ADMIN_EMAIL && pass === SITE_ADMIN_PASS) {
        // Simular um objeto de usuário Supabase mínimo para consistência
        const mockSiteAdminUser = { id: 'site_admin_mock_id', email: normalizedEmail };
        setUser(mockSiteAdminUser);
        setRole(USER_ROLES.SITE_ADMIN);
        setLoading(false);
        console.log(`AuthContext: Login mockado para ${normalizedEmail} como SITE_ADMIN`);
        return USER_ROLES.SITE_ADMIN;
    }
    if (normalizedEmail === PROFESSIONAL_TEST_EMAIL && pass === PROFESSIONAL_TEST_PASS) {
        const mockProfessionalUser = { id: 'prof_test_mock_id', email: normalizedEmail };
        setUser(mockProfessionalUser);
        setRole(USER_ROLES.PROFESSIONAL);
        setLoading(false);
        console.log(`AuthContext: Login mockado para ${normalizedEmail} como PROFESSIONAL`);
        return USER_ROLES.PROFESSIONAL;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: pass,
    });

    if (error) {
      setLoading(false);
      console.error("Supabase login error:", error.message);
      throw error;
    }

    if (data.user && data.session) {
      const userProfile = await getUserProfile(data.user.id);
      let userRoleToSet: UserRole | null = userProfile?.role || USER_ROLES.CLIENT; // Default para cliente se perfil ou papel não encontrado
      
      setRole(userRoleToSet);
      setUser({ id: data.user.id, email: data.user.email?.toLowerCase() });
      setSession(data.session);
      console.log(`Supabase Auth: Login bem-sucedido para ${normalizedEmail} com papel ${userRoleToSet}`);
      setLoading(false);
      return userRoleToSet;
    }
    
    setLoading(false);
    return null;
  };

 const signup = async (email: string, pass: string, intendedRole: UserRole): Promise<{ user: SupabaseUser | null; role: UserRole | null }> => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    
    let roleToSet = intendedRole;
     if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
      roleToSet = USER_ROLES.SITE_ADMIN;
    } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()){
      roleToSet = USER_ROLES.PROFESSIONAL;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: pass,
    });

    if (authError) {
      setLoading(false);
      console.error("Supabase signup error:", authError);
      throw authError; // Lança o erro do Supabase para ser pego pelo AuthForm
    }

    if (authData.user) {
      try {
        const profile = await createUserProfile(authData.user.id, normalizedEmail, roleToSet);
        if (!profile) {
          // Este é um ponto crítico. Se o usuário foi criado no Auth mas o perfil não,
          // idealmente, o usuário Auth deveria ser removido para consistência.
          // Mas isso requereria permissões de admin do lado do cliente, o que não é seguro.
          // Por agora, lançamos um erro que o AuthForm pegará.
          setLoading(false);
          console.error("AuthContext: Falha ao chamar createUserProfile ou perfil retornado como null.");
          throw new Error("Falha ao criar perfil do usuário após o cadastro.");
        }
        
        // Se a confirmação de e-mail estiver ativa, authData.session pode ser null aqui.
        // O onAuthStateChange tratará de definir user e session quando o login ocorrer.
        setRole(roleToSet); 
        console.log(`Supabase Auth: Signup para ${normalizedEmail} com papel ${roleToSet}. Perfil criado. Session: ${authData.session ? 'ativa' : 'inativa (aguardando confirmação?)'}`);
        setLoading(false);
        return { user: authData.user, role: roleToSet };

      } catch (profileError: any) {
        setLoading(false);
        console.error("AuthContext: Erro ao tentar criar perfil do usuário no supabaseService:", profileError);
        // Lança o erro para que o AuthForm possa exibi-lo.
        // Pode ser útil dar uma mensagem mais específica se profileError tiver detalhes.
        throw new Error(`Falha ao criar perfil: ${profileError.message || 'Erro desconhecido no serviço de perfil.'}`);
      }
    } else if (!authData.session && !authData.user && !authError) {
        // Caso de confirmação de email pendente (usuário criado no Supabase Auth mas sem sessão)
        console.log(`Supabase Auth: Usuário ${normalizedEmail} criado, aguardando confirmação de e-mail.`);
        setLoading(false);
        return { user: null, role: null }; 
    }
   
    setLoading(false);
    // Se chegar aqui, algo inesperado aconteceu.
    throw new Error("Resposta inesperada do Supabase durante o signup.");
  };


  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase logout error:", error.message);
    }
    setUser(null);
    setSession(null);
    setRole(null);
    console.log("Supabase Auth: Logout bem-sucedido.");
    setLoading(false);
  };
  
  return (
    <AuthContext.Provider value={{ user, session, role, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

