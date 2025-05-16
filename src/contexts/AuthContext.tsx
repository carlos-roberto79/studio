
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
const SITE_ADMIN_EMAIL = "superadmin@easyagenda.com";
const PROFESSIONAL_TEST_EMAIL = "profissional@easyagenda.com";
const PROFESSIONAL_TEST_PASSWORD = "prof123";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserString = localStorage.getItem('easyagenda_user');
    const storedRoleString = localStorage.getItem('easyagenda_role');
    if (storedUserString && storedRoleString) {
      try {
        let storedUser: MockUser = JSON.parse(storedUserString);
        if (storedUser.email) {
          storedUser.email = storedUser.email.toLowerCase(); // Normaliza ao carregar
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

    if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase() && pass === "superadmin123") {
      determinedRole = USER_ROLES.SITE_ADMIN;
    } else if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase() && pass === PROFESSIONAL_TEST_PASSWORD) {
      determinedRole = USER_ROLES.PROFESSIONAL;
      // Garante que o papel está no "banco de dados" mock de papéis
      const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
      if (allUsersRoles[normalizedEmail] !== USER_ROLES.PROFESSIONAL) {
        allUsersRoles[normalizedEmail] = USER_ROLES.PROFESSIONAL;
        localStorage.setItem(MOCK_USERS_ROLES_STORAGE_KEY, JSON.stringify(allUsersRoles));
      }
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
    let determinedSignupRole = signupRole;

    // Se o e-mail de cadastro for o de profissional, define o papel como profissional
    if (normalizedEmail === PROFESSIONAL_TEST_EMAIL.toLowerCase()) {
      determinedSignupRole = USER_ROLES.PROFESSIONAL;
    }
    
    const mockUser: MockUser = { uid: 'mock-uid-' + normalizedEmail, email: normalizedEmail };
    setUser(mockUser);
    setRole(determinedSignupRole);

    const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
    allUsersRoles[normalizedEmail] = determinedSignupRole;
    localStorage.setItem(MOCK_USERS_ROLES_STORAGE_KEY, JSON.stringify(allUsersRoles));

    localStorage.setItem('easyagenda_user', JSON.stringify(mockUser));
    localStorage.setItem('easyagenda_role', determinedSignupRole);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    setUser(null);
    setRole(null);
    localStorage.removeItem('easyagenda_user');
    localStorage.removeItem('easyagenda_role');
    setLoading(false);
  };
  
  const updateRole = (newRole: UserRole | null) => {
    setRole(newRole);
    if (user && newRole) { 
        const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
        if (user.email) {
             allUsersRoles[user.email.toLowerCase()] = newRole; // Usa e-mail normalizado
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
