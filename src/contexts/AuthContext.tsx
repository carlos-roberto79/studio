
"use client";

import type { UserRole } from '@/lib/constants';
import { USER_ROLES } from '@/lib/constants'; // Import USER_ROLES
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { auth } from '@/lib/firebase'; // Will be used with actual Firebase
// import type { User as FirebaseUser } from 'firebase/auth'; // Actual Firebase User type

// Mock User type for now
interface MockUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: MockUser | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string, role?: UserRole) => Promise<void>;
  signup: (email: string, pass: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chave para o mock "banco de dados" de papéis de usuários
const MOCK_USERS_ROLES_STORAGE_KEY = 'easyagenda_all_users_roles';

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
        // Garantir que o email no estado seja normalizado ao carregar
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

  const login = async (email: string, _pass: string, loginRole?: UserRole) => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase(); // Normalizar e-mail
    const mockUser: MockUser = { uid: 'mock-uid-' + normalizedEmail, email: normalizedEmail };
    setUser(mockUser);

    const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
    // Usar e-mail normalizado para buscar o papel. O loginRole é um fallback menos prioritário.
    const determinedRole = allUsersRoles[normalizedEmail] || loginRole || USER_ROLES.CLIENT;

    setRole(determinedRole);
    localStorage.setItem('easyagenda_user', JSON.stringify(mockUser));
    localStorage.setItem('easyagenda_role', determinedRole);
    setLoading(false);
  };

  const signup = async (email: string, _pass: string, signupRole: UserRole) => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase(); // Normalizar e-mail
    const mockUser: MockUser = { uid: 'mock-uid-' + normalizedEmail, email: normalizedEmail };
    setUser(mockUser);
    setRole(signupRole);

    const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
    allUsersRoles[normalizedEmail] = signupRole; // Usar e-mail normalizado como chave
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
    setLoading(false);
  };
  
  const updateRole = (newRole: UserRole | null) => {
    setRole(newRole);
    if (user && newRole) { 
        const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
        if (user.email) { // user.email já deve estar normalizado aqui devido ao login/signup/useEffect
             allUsersRoles[user.email] = newRole; // Não precisa de .toLowerCase() aqui se user.email já está normalizado
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
