
"use client";

import type { UserRole } from '@/lib/constants';
import { USER_ROLES, APP_NAME } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser, Session as SupabaseSession, AuthError } from '@supabase/supabase-js';
import { getUserProfile, createUserProfile, type UserProfile } from '@/services/supabaseService'; 

const SITE_ADMIN_EMAIL = "superadmin@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";
const SITE_ADMIN_PASS = "superadmin123"; // Mock password
const PROFESSIONAL_TEST_EMAIL = "profissional@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";
const PROFESSIONAL_TEST_PASS = "prof123"; // Mock password


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
  signup: (email: string, pass: string, intendedRole: UserRole) => Promise<{ user: SupabaseUser | null; role: UserRole | null; error?: AuthError | Error | null }>;
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
           const normalizedEmail = currentUser.email;
          if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) setRole(USER_ROLES.SITE_ADMIN);
          else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) setRole(USER_ROLES.PROFESSIONAL);
          else setRole(USER_ROLES.CLIENT); // Default
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
          if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) setRole(USER_ROLES.SITE_ADMIN);
          else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) setRole(USER_ROLES.PROFESSIONAL);
          else setRole(USER_ROLES.CLIENT); // Default
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
    
    // Special mock logins
    if (normalizedEmail === SITE_ADMIN_EMAIL && pass === SITE_ADMIN_PASS) {
        setUser({ id: 'site_admin_mock_id', email: normalizedEmail });
        setRole(USER_ROLES.SITE_ADMIN);
        setLoading(false);
        return USER_ROLES.SITE_ADMIN;
    }
    if (normalizedEmail === PROFESSIONAL_TEST_EMAIL && pass === PROFESSIONAL_TEST_PASS) {
        setUser({ id: 'prof_test_mock_id', email: normalizedEmail });
        setRole(USER_ROLES.PROFESSIONAL);
        setLoading(false);
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
      let userRoleToSet: UserRole | null = userProfile?.role || USER_ROLES.CLIENT;
      
      setRole(userRoleToSet);
      setUser({ id: data.user.id, email: data.user.email?.toLowerCase() });
      setSession(data.session);
      setLoading(false);
      return userRoleToSet;
    }
    
    setLoading(false);
    return null;
  };

 const signup = async (email: string, pass: string, intendedRole: UserRole): Promise<{ user: SupabaseUser | null; role: UserRole | null; error?: AuthError | Error | null }> => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    
    let roleToSet = intendedRole;
     if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) roleToSet = USER_ROLES.SITE_ADMIN;
     else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) roleToSet = USER_ROLES.PROFESSIONAL;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: pass,
    });

    if (authError) {
      setLoading(false);
      console.error("Supabase signup error:", authError);
      // Se o erro for "User already registered", precisamos checar se é por falta de confirmação
      if (authError.message.includes("User already registered") || authError.message.includes("already registered")) {
         // Poderia tentar buscar o usuário para ver se ele existe e não está confirmado.
         // Por simplicidade, vamos apenas relançar e deixar o AuthForm tratar a mensagem.
         // Ou podemos retornar um objeto específico para esse caso
         const { data: existingUserData } = await supabase.from('users').select('id, email_confirmed_at').eq('email', normalizedEmail).single();
         if (existingUserData && !existingUserData.email_confirmed_at) {
            return { user: null, role: null, error: new Error("Este e-mail já está registrado mas precisa ser confirmado. Verifique sua caixa de entrada.") };
         }
      }
      throw authError;
    }

    if (authData.user) {
      try {
        // Se o usuário foi criado mas a sessão não está ativa (aguardando confirmação de email)
        if (!authData.session && authData.user) {
          console.log(`Supabase Auth: Usuário ${normalizedEmail} criado, aguardando confirmação de e-mail.`);
          setLoading(false);
          // Não cria perfil ainda, espera a confirmação e primeiro login.
          // Ou, dependendo da sua lógica, você PODE criar o perfil aqui.
          // Por agora, vamos retornar para que o AuthForm mostre a mensagem de confirmação.
          return { user: null, role: null, error: null }; 
        }

        // Se chegou aqui, o usuário foi criado E a sessão está ativa (ex: email_confirm desabilitado no Supabase)
        const profile = await createUserProfile(authData.user.id, normalizedEmail, roleToSet);
        if (!profile) {
          setLoading(false);
          console.error("AuthContext: Falha ao chamar createUserProfile ou perfil retornado como null.");
          throw new Error("Falha ao criar perfil do usuário após o cadastro.");
        }
        
        setRole(roleToSet); 
        console.log(`Supabase Auth: Signup para ${normalizedEmail} com papel ${roleToSet}. Perfil criado.`);
        setLoading(false);
        return { user: authData.user, role: roleToSet, error: null };

      } catch (profileError: any) {
        setLoading(false);
        console.error("AuthContext: Erro ao tentar criar perfil do usuário no supabaseService:", profileError);
        throw profileError; // Re-lança o erro original
      }
    }
   
    setLoading(false);
    console.warn("AuthContext: Resposta inesperada do Supabase durante o signup, nem usuário nem erro retornado claramente.");
    return { user: null, role: null, error: new Error("Resposta inesperada do Supabase durante o signup.") };
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
