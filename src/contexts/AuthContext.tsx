
"use client";

import type { UserRole } from '@/lib/constants';
import { USER_ROLES } from '@/lib/constants'; 
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MockUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: MockUser | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string, role?: UserRole) => Promise<UserRole | null>; // Retorna o papel para redirecionamento
  signup: (email: string, pass: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS_ROLES_STORAGE_KEY = 'easyagenda_all_users_roles';
const SITE_ADMIN_EMAIL = "superadmin@easyagenda.com"; // E-mail do Site Admin

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserString = localStorage.getItem('easyagenda_user');
    const storedRoleString = localStorage.getItem('easyagenda_role');
    if (storedUserString && storedRoleString) {
      try {
        const storedUser: MockUser = JSON.parse(storedUserString);
        if (storedUser.email) {
          storedUser.email = storedUser.email.toLowerCase();
        }
        setUser(storedUser);
        setRole(storedRoleString as UserRole);
      } catch (e) {
        console.error("Falha ao parsear dados de autenticação do localStorage", e);
        localStorage.removeItem('easyagenda_user');
        localStorage.removeItem('easyagenda_role');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string, loginRole?: UserRole): Promise<UserRole | null> => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    let determinedRole: UserRole;

    if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase() && pass === "superadmin123") { // Senha mock para Site Admin
      determinedRole = USER_ROLES.SITE_ADMIN;
    } else {
      const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
      determinedRole = allUsersRoles[normalizedEmail] || loginRole || USER_ROLES.CLIENT;
    }
    
    const mockUser: MockUser = { uid: 'mock-uid-' + normalizedEmail, email: normalizedEmail };
    setUser(mockUser);
    setRole(determinedRole);
    localStorage.setItem('easyagenda_user', JSON.stringify(mockUser));
    localStorage.setItem('easyagenda_role', determinedRole);
    setLoading(false);
    return determinedRole;
  };

  const signup = async (email: string, _pass: string, signupRole: UserRole) => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    const mockUser: MockUser = { uid: 'mock-uid-' + normalizedEmail, email: normalizedEmail };
    setUser(mockUser);
    setRole(signupRole);

    const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
    allUsersRoles[normalizedEmail] = signupRole;
    localStorage.setItem(MOCK_USERS_ROLES_STORAGE_KEY, JSON.stringify(allUsersRoles));

    localStorage.setItem('easyagenda_user', JSON.stringify(mockUser));
    localStorage.setItem('easyagenda_role', signupRole);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    setUser(null);
    setRole(null);
    localStorage.removeItem('easyagenda_user');
    localStorage.removeItem('easyagenda_role');
    // Não remover easyagenda_all_users_roles ou easyagenda_companyProfileComplete_mock no logout padrão
    // A menos que seja um logout específico de "limpar tudo"
    setLoading(false);
  };
  
  const updateRole = (newRole: UserRole | null) => {
    setRole(newRole);
    if (user && newRole) { 
        const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
        if (user.email) {
             allUsersRoles[user.email] = newRole;
             localStorage.setItem(MOCK_USERS_ROLES_STORAGE_KEY, JSON.stringify(allUsersRoles));
        }
    }
    if (newRole) {
      localStorage.setItem('easyagenda_role', newRole); 
    } else {
      localStorage.removeItem('easyagenda_role');
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signup, logout, setRole: updateRole }}>
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
