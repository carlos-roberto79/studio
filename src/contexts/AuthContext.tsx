
"use client";

import type { UserRole } from '@/lib/constants';
import { USER_ROLES, APP_NAME } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser, Session as SupabaseSession, AuthError, ApiError } from '@supabase/supabase-js';
import { getUserProfile, createUserProfile, type UserProfile, type CompanyData, getCompanyDetailsByOwner, addCompanyDetails as addCompanyDetailsService } from '@/services/supabaseService'; // Ajustado para evitar conflito

const SITE_ADMIN_EMAIL = "superadmin@easyagenda.com"; // Ajustado para o email fornecido pelo usuário
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
  signup: (email: string, pass: string, intendedRole: UserRole) => Promise<{ user: SupabaseUser | null; role: UserRole | null; error?: AuthError | Error | null, needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  createProfessionalUserAccount: (email: string, temporaryPassword: string) => Promise<SupabaseUser | null>;
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
          // else setRole(USER_ROLES.CLIENT); // Default pode ser definido após falha em buscar perfil
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
          // else setRole(USER_ROLES.CLIENT);
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
    
    // Special mock logins - manter por enquanto para acesso facilitado a estes perfis
    if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase() && pass === SITE_ADMIN_PASS) { // Comparar com lowercase
        setUser({ id: 'site_admin_mock_id', email: normalizedEmail });
        setRole(USER_ROLES.SITE_ADMIN);
        setLoading(false);
        return USER_ROLES.SITE_ADMIN;
    }
    if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase() && pass === PROFESSIONAL_TEST_PASS) { // Comparar com lowercase
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
      console.error("Supabase login error:", error);
      throw error;
    }

    if (data.user && data.session) {
      const userProfile = await getUserProfile(data.user.id);
      let userRoleToSet: UserRole | null = userProfile?.role || null;
      
      // Se o perfil não foi encontrado no DB mas é um e-mail de teste, definir o papel mockado.
      if (!userProfile?.role) {
        if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) userRoleToSet = USER_ROLES.SITE_ADMIN;
        else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) userRoleToSet = USER_ROLES.PROFESSIONAL;
        else userRoleToSet = USER_ROLES.CLIENT; // Default fallback
      }
      
      setRole(userRoleToSet);
      setUser({ id: data.user.id, email: data.user.email?.toLowerCase() });
      setSession(data.session);
      setLoading(false);
      return userRoleToSet;
    }
    
    setLoading(false);
    return null;
  };

  const signup = async (email: string, pass: string, intendedRole: UserRole): Promise<{ user: SupabaseUser | null; role: UserRole | null; error?: AuthError | Error | null, needsConfirmation?: boolean }> => {
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
      console.error("Supabase signup error (AuthContext):", authError);
      return { user: null, role: null, error: authError, needsConfirmation: false };
    }

    if (authData.user) {
      // Se o usuário foi criado mas a sessão não está ativa (aguardando confirmação de email)
      // ou se o usuário já existe e está confirmado, mas não tem sessão (caso de re-envio de confirmação)
      if (!authData.session && authData.user.aud === 'authenticated' && authData.user.email_confirmed_at === null) {
        console.log(`Supabase Auth: Usuário ${normalizedEmail} criado, aguardando confirmação de e-mail.`);
        setLoading(false);
        return { user: authData.user, role: null, error: null, needsConfirmation: true };
      }

      // Se chegou aqui, o usuário foi criado E a sessão está ativa OU o email já foi confirmado (ex: email_confirm desabilitado no Supabase)
      try {
        const profile = await createUserProfile(authData.user.id, normalizedEmail, roleToSet);
        if (!profile) {
          setLoading(false);
          console.error("AuthContext: Falha ao chamar createUserProfile ou perfil retornado como null.");
          const profileCreationError = new Error("Falha ao criar perfil do usuário após o cadastro.");
          return { user: authData.user, role: null, error: profileCreationError, needsConfirmation: false };
        }
        
        setRole(roleToSet); 
        console.log(`Supabase Auth: Signup para ${normalizedEmail} com papel ${roleToSet}. Perfil criado/verificado.`);
        setLoading(false);
        return { user: authData.user, role: roleToSet, error: null, needsConfirmation: false };

      } catch (profileError: any) {
        setLoading(false);
        console.error("AuthContext: Erro ao tentar criar/verificar perfil do usuário no supabaseService:", profileError);
        return { user: authData.user, role: null, error: profileError, needsConfirmation: false };
      }
    }
   
    setLoading(false);
    console.warn("AuthContext: Resposta inesperada do Supabase durante o signup.");
    return { user: null, role: null, error: new Error("Resposta inesperada do Supabase durante o signup."), needsConfirmation: false };
  };

  const createProfessionalUserAccount = async (email: string, temporaryPassword: string): Promise<SupabaseUser | null> => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: temporaryPassword,
    });

    if (authError) {
      setLoading(false);
      console.error("AuthContext.createProfessionalUserAccount - Supabase Auth signUp error:", authError);
      throw authError; // Lançar o erro para ser tratado pelo chamador
    }

    if (authData.user) {
      // Mesmo que o e-mail precise de confirmação, o perfil ainda deve ser criado
      try {
        const profile = await createUserProfile(authData.user.id, normalizedEmail, USER_ROLES.PROFESSIONAL);
        if (!profile) {
          setLoading(false);
          console.error("AuthContext.createProfessionalUserAccount: Falha ao criar perfil para profissional.");
          // Considerar se deve deletar o usuário do auth se o perfil não puder ser criado.
          // Por simplicidade, vamos apenas lançar um erro.
          throw new Error("Falha ao criar o perfil do profissional após criar a conta de autenticação.");
        }
        console.log(`AuthContext.createProfessionalUserAccount: Conta e perfil criados para profissional ${normalizedEmail}.`);
        setLoading(false);
        return authData.user;
      } catch (profileError: any) {
        setLoading(false);
        console.error("AuthContext.createProfessionalUserAccount: Erro ao criar perfil do profissional:", profileError);
        // Importante: Se a criação do perfil falhar, o usuário no Supabase Auth pode ficar "órfão" sem um perfil.
        // Em um sistema de produção, seria bom ter uma lógica para lidar com isso (ex: deletar o usuário do Auth ou tentar novamente).
        throw profileError; 
      }
    }
    
    setLoading(false);
    console.warn("AuthContext.createProfessionalUserAccount: Resposta inesperada do Supabase durante o signUp.");
    throw new Error("Resposta inesperada do Supabase ao tentar criar conta de profissional.");
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
    <AuthContext.Provider value={{ user, session, role, loading, login, signup, logout, createProfessionalUserAccount }}>
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

    