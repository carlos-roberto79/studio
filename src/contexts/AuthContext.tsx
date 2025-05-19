
"use client";

import type { UserRole } from '@/lib/constants';
import { USER_ROLES, APP_NAME } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Firebase Auth foi removido, voltando para mock localStorage

// Configuração para o admin do site
const SITE_ADMIN_EMAIL = "superadmin@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";
const PROFESSIONAL_TEST_EMAIL = "profissional@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com";

const MOCK_USERS_ROLES_STORAGE_KEY = 'tdsagenda_all_users_roles'; // Usando a chave correta
const USER_STORAGE_KEY = 'tdsagenda_user';
const ROLE_STORAGE_KEY = 'tdsagenda_role';

interface User { // Interface simplificada para o mock
  email: string;
  // uid não é mais usado no mock frontend
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserRole | null>;
  signup: (email: string, pass: string, intendedRole: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função auxiliar para obter todos os papéis mockados
const getMockAllUsersRoles = (): Record<string, UserRole> => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }
  return {};
};

// Função auxiliar para salvar todos os papéis mockados
const setMockAllUsersRoles = (roles: Record<string, UserRole>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_USERS_ROLES_STORAGE_KEY, JSON.stringify(roles));
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial do estado de autenticação do localStorage
    setLoading(true);
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      const storedRole = localStorage.getItem(ROLE_STORAGE_KEY);

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser({email: parsedUser.email.toLowerCase()}); // Normaliza ao carregar
      }
      if (storedRole) {
        setRole(storedRole as UserRole);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<UserRole | null> => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    
    // Simulação de login (verificar apenas se o usuário existe no nosso mock de papéis)
    // A senha não é verificada neste mock simples.
    const allUsersRoles = getMockAllUsersRoles();
    
    let userRole: UserRole | null = null;

    if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase() && pass === "superadmin123") {
      userRole = USER_ROLES.SITE_ADMIN;
    } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase() && pass === "prof123") {
      userRole = USER_ROLES.PROFESSIONAL;
    } else if (allUsersRoles[normalizedEmail]) {
      userRole = allUsersRoles[normalizedEmail];
    } else {
      // Se não for admin nem profissional de teste e não estiver no mock, simula falha.
      // Em um sistema real, o Firebase Auth retornaria user-not-found ou wrong-password.
      setLoading(false);
      console.error("Mock Auth: Usuário não encontrado ou senha inválida (simulado).");
      throw new Error("E-mail ou senha inválidos (simulado).");
    }

    if (userRole) {
      const loggedInUser: User = { email: normalizedEmail };
      setUser(loggedInUser);
      setRole(userRole);
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
        localStorage.setItem(ROLE_STORAGE_KEY, userRole);
      }
      console.log(`Mock Auth: Login bem-sucedido para ${normalizedEmail} com papel ${userRole}`);
      setLoading(false);
      return userRole;
    }
    
    setLoading(false);
    return null; // Não deve chegar aqui se a lógica acima estiver correta
  };

  const signup = async (email: string, pass: string, intendedRole: UserRole) => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();

    const allUsersRoles = getMockAllUsersRoles();

    if (allUsersRoles[normalizedEmail]) {
      setLoading(false);
      console.error(`Mock Auth: E-mail ${normalizedEmail} já cadastrado.`);
      throw new Error("Este e-mail já está em uso por outra conta (simulado).");
    }

    let roleToSet = intendedRole;
    if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
      roleToSet = USER_ROLES.SITE_ADMIN;
       console.warn("Mock Auth: Cadastro como SITE_ADMIN (para teste).");
    } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()){
      roleToSet = USER_ROLES.PROFESSIONAL;
      console.log("Mock Auth: Cadastro como PROFISSIONAL_TEST_EMAIL (para teste).");
    }


    allUsersRoles[normalizedEmail] = roleToSet;
    setMockAllUsersRoles(allUsersRoles);

    const newUser: User = { email: normalizedEmail };
    setUser(newUser);
    setRole(roleToSet);

    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      localStorage.setItem(ROLE_STORAGE_KEY, roleToSet);
    }
    console.log(`Mock Auth: Signup bem-sucedido para ${normalizedEmail} com papel ${roleToSet}`);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    setUser(null);
    setRole(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(ROLE_STORAGE_KEY);
      // Não remover MOCK_USERS_ROLES_STORAGE_KEY aqui para simular persistência de papéis
    }
    console.log("Mock Auth: Logout bem-sucedido.");
    setLoading(false);
  };
  
  return (
    <AuthContext.Provider value={{ user, role, loading, login, signup, logout }}>
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
