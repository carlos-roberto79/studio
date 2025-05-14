"use client";

import type { UserRole } from '@/lib/constants';
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
  login: (email: string, pass: string, role?: UserRole) => Promise<void>; // Added role for mock login
  signup: (email: string, pass: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole | null) => void; // Allow role to be set externally for dev/testing
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock Firebase Auth behavior
  useEffect(() => {
    // Simulate checking auth state
    const storedUser = localStorage.getItem('easyagenda_user');
    const storedRole = localStorage.getItem('easyagenda_role');
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole as UserRole);
    }
    setLoading(false);

    // In a real app, you'd use onAuthStateChanged from Firebase
    // const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
    //   setUser(firebaseUser);
    //   // Fetch user role from Firestore or custom claims here
    //   setLoading(false);
    // });
    // return () => unsubscribe();
  }, []);

  const login = async (email: string, _pass: string, loginRole?: UserRole) => {
    setLoading(true);
    // Mock login
    const mockUser = { uid: 'mock-uid-' + Math.random().toString(36).substring(7), email };
    setUser(mockUser);
    const newRole = loginRole || 'client'; // Default to client if no role provided
    setRole(newRole);
    localStorage.setItem('easyagenda_user', JSON.stringify(mockUser));
    localStorage.setItem('easyagenda_role', newRole);
    setLoading(false);
  };

  const signup = async (email: string, _pass: string, signupRole: UserRole) => {
    setLoading(true);
    // Mock signup
    const mockUser = { uid: 'mock-uid-' + Math.random().toString(36).substring(7), email };
    setUser(mockUser);
    setRole(signupRole);
    localStorage.setItem('easyagenda_user', JSON.stringify(mockUser));
    localStorage.setItem('easyagenda_role', signupRole);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    // Mock logout
    setUser(null);
    setRole(null);
    localStorage.removeItem('easyagenda_user');
    localStorage.removeItem('easyagenda_role');
    setLoading(false);
  };
  
  const updateRole = (newRole: UserRole | null) => {
    setRole(newRole);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
