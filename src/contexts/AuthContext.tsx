
"use client";

import type { UserRole } from '@/lib/constants';
import { USER_ROLES, APP_NAME } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

// Configuração para o admin do site e profissional de teste
const SITE_ADMIN_EMAIL = "superadmin@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";
const PROFESSIONAL_TEST_EMAIL = "profissional@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";

const MOCK_USERS_ROLES_STORAGE_KEY = 'tdsagenda_all_users_roles';

interface User {
  id: string; // Supabase user ID (UUID)
  email: string | undefined;
}

interface AuthContextType {
  user: User | null;
  session: SupabaseSession | null; // Adicionado para gerenciar a sessão do Supabase
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserRole | null>;
  signup: (email: string, pass: string, intendedRole: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Funções auxiliares para papéis mockados (mantidas temporariamente)
const getMockAllUsersRoles = (): Record<string, UserRole> => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }
  return {};
};

const setMockAllUsersRoles = (roles: Record<string, UserRole>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_USERS_ROLES_STORAGE_KEY, JSON.stringify(roles));
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const getInitialSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        const currentUser = { id: currentSession.user.id, email: currentSession.user.email };
        setUser(currentUser);
        // Lógica de definição de papel ao carregar a sessão
        const normalizedEmail = currentUser.email?.toLowerCase();
        if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
          setRole(USER_ROLES.SITE_ADMIN);
        } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) {
          setRole(USER_ROLES.PROFESSIONAL);
        } else if (normalizedEmail) {
          const allUsersRoles = getMockAllUsersRoles();
          setRole(allUsersRoles[normalizedEmail] || USER_ROLES.CLIENT); // Default para cliente se não encontrado
        }
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setLoading(true);
      setSession(newSession);
      if (newSession?.user) {
        const currentUser = { id: newSession.user.id, email: newSession.user.email };
        setUser(currentUser);
        const normalizedEmail = currentUser.email?.toLowerCase();
        if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
          setRole(USER_ROLES.SITE_ADMIN);
        } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) {
          setRole(USER_ROLES.PROFESSIONAL);
        } else if (normalizedEmail) {
          const allUsersRoles = getMockAllUsersRoles();
          setRole(allUsersRoles[normalizedEmail] || USER_ROLES.CLIENT);
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
      throw new Error(error.message || "Falha no login com Supabase (simulado).");
    }

    if (data.user && data.session) {
      let userRoleToSet: UserRole;
      if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
        userRoleToSet = USER_ROLES.SITE_ADMIN;
      } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) {
        userRoleToSet = USER_ROLES.PROFESSIONAL;
      } else {
        const allUsersRoles = getMockAllUsersRoles();
        userRoleToSet = allUsersRoles[normalizedEmail] || USER_ROLES.CLIENT; // Default para cliente
      }
      setRole(userRoleToSet); // O onAuthStateChange também vai disparar, mas podemos definir aqui para feedback imediato.
      console.log(`Supabase Auth: Login bem-sucedido para ${normalizedEmail} com papel ${userRoleToSet}`);
      setLoading(false);
      return userRoleToSet;
    }
    
    setLoading(false);
    return null;
  };

  const signup = async (email: string, pass: string, intendedRole: UserRole) => {
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
      options: {
        data: { 
          // Você pode passar metadados aqui, mas o papel será gerenciado pelo mock пока
          // role: roleToSet 
        }
      }
    });

    if (error) {
      setLoading(false);
      console.error("Supabase signup error:", error.message);
      throw new Error(error.message || "Falha no cadastro com Supabase (simulado).");
    }

    if (data.user) {
      // Salvar no mock de papéis
      const allUsersRoles = getMockAllUsersRoles();
      allUsersRoles[normalizedEmail] = roleToSet;
      setMockAllUsersRoles(allUsersRoles);
      
      setRole(roleToSet); // O onAuthStateChange também deve atualizar isso
      console.log(`Supabase Auth: Signup bem-sucedido para ${normalizedEmail} com papel ${roleToSet}. Verifique seu e-mail para confirmação se habilitado.`);
    } else if (!data.session && !data.user) {
        // Caso comum se a confirmação de e-mail estiver habilitada
        console.log(`Supabase Auth: Usuário criado para ${normalizedEmail}. Aguardando confirmação de e-mail.`);
        const allUsersRoles = getMockAllUsersRoles();
        allUsersRoles[normalizedEmail] = roleToSet;
        setMockAllUsersRoles(allUsersRoles);
    }
    
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase logout error:", error.message);
      // Mesmo com erro, tentamos limpar o estado local
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

