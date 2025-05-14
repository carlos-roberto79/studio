
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
        const storedUser = JSON.parse(storedUserString);
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
    const mockUser = { uid: 'mock-uid-' + email, email }; // UID mock mais estável
    setUser(mockUser);

    // Tenta obter o papel do "banco de dados" mock ou usa o loginRole/default
    const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
    const determinedRole = allUsersRoles[email] || loginRole || USER_ROLES.CLIENT;

    setRole(determinedRole);
    localStorage.setItem('easyagenda_user', JSON.stringify(mockUser));
    localStorage.setItem('easyagenda_role', determinedRole);
    setLoading(false);
  };

  const signup = async (email: string, _pass: string, signupRole: UserRole) => {
    setLoading(true);
    const mockUser = { uid: 'mock-uid-' + email, email };
    setUser(mockUser);
    setRole(signupRole);

    // Armazena este usuário e seu papel no "banco de dados" mock
    const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
    allUsersRoles[email] = signupRole;
    localStorage.setItem(MOCK_USERS_ROLES_STORAGE_KEY, JSON.stringify(allUsersRoles));

    // Define para a sessão atual
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
    // Não remove MOCK_USERS_ROLES_STORAGE_KEY para persistir os papéis para futuros logins mockados
    setLoading(false);
  };
  
  const updateRole = (newRole: UserRole | null) => {
    setRole(newRole);
    if (user && newRole) { // Atualiza também no "banco de dados" mock se usuário existir
        const allUsersRoles = JSON.parse(localStorage.getItem(MOCK_USERS_ROLES_STORAGE_KEY) || '{}');
        if (user.email) {
             allUsersRoles[user.email] = newRole;
             localStorage.setItem(MOCK_USERS_ROLES_STORAGE_KEY, JSON.stringify(allUsersRoles));
        }
    }
    if (newRole) {
      localStorage.setItem('easyagenda_role', newRole); // Atualiza o papel da sessão atual
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
