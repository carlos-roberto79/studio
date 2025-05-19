
"use client";

import type { UserRole } from '@/lib/constants';
import { USER_ROLES, APP_NAME } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';
import { getUserProfile, createUserProfile, type UserProfile } from '@/services/supabaseService'; // Importar funções do supabaseService

const SITE_ADMIN_EMAIL = "superadmin@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";
const PROFESSIONAL_TEST_EMAIL = "profissional@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";

// A chave MOCK_USERS_ROLES_STORAGE_KEY não é mais primariamente usada para determinar o papel após o login,
// mas mantida para a lógica de signup definir o papel inicial no perfil mockado.
const MOCK_USERS_ROLES_STORAGE_KEY = 'tdsagenda_all_users_roles'; // Mantido para signup do company_admin

interface User {
  id: string; // Supabase user ID (UUID)
  email: string | undefined;
  // Outros campos do Supabase User que você possa precisar
}

interface AuthContextType {
  user: User | null;
  session: SupabaseSession | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserRole | null>;
  signup: (email: string, pass: string, intendedRole: UserRole) => Promise<SupabaseUser | null>;
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
        const currentUser = { id: supabaseUser.id, email: supabaseUser.email };
        setUser(currentUser);

        // Tentar buscar o perfil/papel do banco de dados
        const userProfile = await getUserProfile(supabaseUser.id);
        if (userProfile) {
          setRole(userProfile.role);
        } else {
          // Fallback para lógica de e-mail especial ou cliente padrão se perfil não encontrado
          const normalizedEmail = currentUser.email?.toLowerCase();
          if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
            setRole(USER_ROLES.SITE_ADMIN);
          } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) {
            setRole(USER_ROLES.PROFESSIONAL);
          } else {
            setRole(USER_ROLES.CLIENT); // Papel padrão se nenhum perfil encontrado
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setLoading(true);
      setSession(newSession);
      if (newSession?.user) {
        const supabaseUser = newSession.user;
        const currentUser = { id: supabaseUser.id, email: supabaseUser.email };
        setUser(currentUser);

        const userProfile = await getUserProfile(supabaseUser.id);
        if (userProfile) {
          setRole(userProfile.role);
        } else {
          const normalizedEmail = currentUser.email?.toLowerCase();
          if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
            setRole(USER_ROLES.SITE_ADMIN);
          } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) {
            setRole(USER_ROLES.PROFESSIONAL);
          } else {
            // Se o perfil não existe, poderia ser um usuário recém-cadastrado
            // A lógica de signup deveria ter criado o perfil.
            // Para segurança, default para CLIENT ou null.
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
      throw new Error(error.message || "Falha no login com Supabase.");
    }

    if (data.user && data.session) {
      const userProfile = await getUserProfile(data.user.id);
      let userRoleToSet: UserRole | null = null;

      if (userProfile) {
        userRoleToSet = userProfile.role;
      } else {
        // Fallback para e-mails especiais (menos ideal, mas mantido da lógica anterior)
        if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
          userRoleToSet = USER_ROLES.SITE_ADMIN;
        } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) {
          userRoleToSet = USER_ROLES.PROFESSIONAL;
        } else {
          userRoleToSet = USER_ROLES.CLIENT; // Default
        }
        // Tentativa de criar perfil se não existir (pode ser necessário para usuários antigos sem perfil)
        if (data.user.email) {
            await createUserProfile(data.user.id, data.user.email, userRoleToSet);
        }
      }
      
      setRole(userRoleToSet);
      // O onAuthStateChange também vai disparar, mas podemos definir aqui para feedback imediato.
      console.log(`Supabase Auth: Login bem-sucedido para ${normalizedEmail} com papel ${userRoleToSet}`);
      setLoading(false);
      return userRoleToSet;
    }
    
    setLoading(false);
    return null;
  };

  const signup = async (email: string, pass: string, intendedRole: UserRole): Promise<SupabaseUser | null> => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    
    let roleToSet = intendedRole;
     if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
      roleToSet = USER_ROLES.SITE_ADMIN;
    } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()){
      roleToSet = USER_ROLES.PROFESSIONAL;
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: pass,
    });

    if (error) {
      setLoading(false);
      console.error("Supabase signup error:", error.message);
      throw new Error(error.message || "Falha no cadastro com Supabase.");
    }

    if (data.user) {
      // Após o signup no Supabase Auth, crie o perfil no banco de dados Supabase
      const profileCreationResult = await createUserProfile(data.user.id, normalizedEmail, roleToSet);
      if (!profileCreationResult) {
        // Tentar logout se a criação do perfil falhar para evitar estado inconsistente
        await supabase.auth.signOut();
        setLoading(false);
        throw new Error("Falha ao criar perfil do usuário após o cadastro.");
      }
      setRole(roleToSet);
      console.log(`Supabase Auth: Signup bem-sucedido para ${normalizedEmail} com papel ${roleToSet}. Perfil criado.`);
       setLoading(false);
      return data.user;
    } else if (!data.session && !data.user && !error) {
        // Caso comum se a confirmação de e-mail estiver habilitada e o usuário ainda não confirmou
        // O perfil será criado quando o usuário confirmar e logar pela primeira vez, ou podemos criar aqui
        // mas o usuário não terá uma sessão ainda.
        // Para simplificar o fluxo de teste (se a confirmação de e-mail estiver desabilitada),
        // vamos assumir que a criação do perfil é adiada ou o usuário é retornado para o onAuthStateChange.
        console.log(`Supabase Auth: Usuário potencialmente criado para ${normalizedEmail}, aguardando confirmação de e-mail ou primeiro login para criar perfil.`);
    }
   
    setLoading(false);
    return data.user; // Pode ser null se a sessão não for estabelecida imediatamente (ex: confirmação de email)
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
