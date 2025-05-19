
"use client";

import type { UserRole } from '@/lib/constants';
import { USER_ROLES, APP_NAME } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';
import { getUserProfile, createUserProfile, type UserProfile } from '@/services/supabaseService';

const SITE_ADMIN_EMAIL = "superadmin@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";
const PROFESSIONAL_TEST_EMAIL = "profissional@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";

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
        if (userProfile && userProfile.role) {
          setRole(userProfile.role);
        } else {
          // Fallback para lógica de e-mail especial ou cliente padrão se perfil não encontrado
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
        if (userProfile && userProfile.role) {
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
      let userRoleToSet: UserRole | null = null;

      if (userProfile && userProfile.role) {
        userRoleToSet = userProfile.role;
      } else {
        if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
          userRoleToSet = USER_ROLES.SITE_ADMIN;
        } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) {
          userRoleToSet = USER_ROLES.PROFESSIONAL;
        } else {
          userRoleToSet = USER_ROLES.CLIENT; 
        }
        if (data.user.email && userRoleToSet) {
            // Tenta criar perfil se não existir (pode ser necessário para usuários antigos sem perfil)
            await createUserProfile(data.user.id, data.user.email, userRoleToSet);
        }
      }
      
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
    // No fluxo de cadastro público do AuthForm, intendedRole já é COMPANY_ADMIN

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: pass,
    });

    if (authError) {
      setLoading(false);
      console.error("Supabase signup error:", authError.message);
      throw authError;
    }

    if (authData.user) {
      // Usuário criado no Supabase Auth, agora criar perfil no banco de dados
      const profile = await createUserProfile(authData.user.id, normalizedEmail, roleToSet);
      if (!profile) {
        // Importante: Se a criação do perfil falhar, o usuário pode ficar em um estado inconsistente.
        // Idealmente, você pode querer tentar excluir o usuário do Supabase Auth aqui ou registrar um erro crítico.
        // Por enquanto, vamos lançar um erro para o AuthForm tratar.
        setLoading(false);
        throw new Error("Falha ao criar perfil do usuário após o cadastro no Supabase Auth.");
      }
      // Se o signup no Supabase Auth não resultar em uma sessão imediata (devido à confirmação de e-mail),
      // o onAuthStateChange tratará de definir user e session quando o e-mail for confirmado e o login ocorrer.
      // Mas podemos definir o role no contexto aqui se o perfil foi criado.
      setRole(roleToSet); 
      console.log(`Supabase Auth: Signup para ${normalizedEmail} com papel ${roleToSet}. Perfil criado. Session: ${authData.session ? 'ativa' : 'inativa (aguardando confirmação?)'}`);
      setLoading(false);
      return { user: authData.user, role: roleToSet };

    } else if (!authData.session && !authData.user && !authError) {
        // Caso de confirmação de email pendente (usuário criado no Supabase Auth mas sem sessão)
        console.log(`Supabase Auth: Usuário ${normalizedEmail} criado, aguardando confirmação de e-mail.`);
        setLoading(false);
        return { user: null, role: null }; // Indica que precisa de confirmação de e-mail
    }
   
    setLoading(false);
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
