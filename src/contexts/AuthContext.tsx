
"use client";

import type { UserRole } from '@/lib/constants';
import { USER_ROLES, APP_NAME } from '@/lib/constants';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auth, User as FirebaseUser, 
         createUserWithEmailAndPassword, 
         signInWithEmailAndPassword, 
         signOut, 
         onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Importa a instância 'auth' do Firebase
import { getUserRole, setUserRole } from '@/services/firestoreService'; // Funções para interagir com Firestore

// Configuração para o admin do site
const SITE_ADMIN_EMAIL = "superadmin@" + APP_NAME.toLowerCase().replace(/\s+/g, '') + ".com"; // Ex: superadmin@tdsagenda.com

interface AuthContextType {
  user: FirebaseUser | null; // Usará o tipo FirebaseUser
  role: UserRole | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserRole | null>;
  signup: (email: string, pass: string, intendedRole: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  // setRole não é mais necessário aqui, pois o papel vem do Firestore ou é definido no signup/login especial
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Verificar se é o SITE_ADMIN pelo e-mail (simplificação para protótipo)
        // Em produção, usar Custom Claims ou um método mais seguro.
        if (firebaseUser.email?.toLowerCase() === SITE_ADMIN_EMAIL.toLowerCase()) {
          setRole(USER_ROLES.SITE_ADMIN);
          console.log("Usuário logado é SITE_ADMIN:", firebaseUser.email);
        } else {
          // Buscar papel do Firestore para outros usuários
          try {
            const userRoleFromDb = await getUserRole(firebaseUser.uid);
            setRole(userRoleFromDb);
            console.log("Papel do usuário " + firebaseUser.uid + " buscado do Firestore:", userRoleFromDb);
          } catch (error) {
            console.error("Erro ao buscar papel do usuário do Firestore:", error);
            setRole(null); // Ou um papel padrão de erro, se aplicável
          }
        }
      } else {
        setUser(null);
        setRole(null);
        console.log("Nenhum usuário logado.");
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const login = async (email: string, pass: string): Promise<UserRole | null> => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      const firebaseUser = userCredential.user;
      
      // A lógica de `onAuthStateChanged` já cuidará de definir `user` e `role`.
      // Apenas retornamos o papel para o AuthForm poder redirecionar corretamente.
      if (firebaseUser.email?.toLowerCase() === SITE_ADMIN_EMAIL.toLowerCase()) {
        // Não precisa chamar setRole aqui, onAuthStateChanged fará isso.
        console.log("Login bem-sucedido como SITE_ADMIN.");
        setLoading(false);
        return USER_ROLES.SITE_ADMIN;
      } else {
        const userRoleFromDb = await getUserRole(firebaseUser.uid);
        // Não precisa chamar setRole aqui, onAuthStateChanged fará isso.
        console.log("Login bem-sucedido, papel do Firestore:", userRoleFromDb);
        setLoading(false);
        return userRoleFromDb;
      }
    } catch (error) {
      setLoading(false);
      console.error("Erro no login Firebase:", error);
      throw error; // Re-lança o erro para AuthForm tratar
    }
  };

  const signup = async (email: string, pass: string, intendedRole: UserRole) => {
    setLoading(true);
    const normalizedEmail = email.toLowerCase();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
      const firebaseUser = userCredential.user;

      // Salvar o papel do usuário no Firestore
      // Tratar o caso especial do SITE_ADMIN (não deveria ser cadastrável publicamente)
      let roleToSet = intendedRole;
      if (normalizedEmail === SITE_ADMIN_EMAIL.toLowerCase()) {
        // Este é um caso de segurança: idealmente, o SITE_ADMIN não é criado via signup público.
        // Para o protótipo, podemos permitir, mas em produção, isso seria gerenciado de outra forma.
        console.warn("Tentativa de cadastro como SITE_ADMIN. Em produção, isso deve ser restrito.");
        roleToSet = USER_ROLES.SITE_ADMIN;
      }
      
      await setUserRole(firebaseUser.uid, normalizedEmail, roleToSet);
      console.log("Usuário cadastrado e papel salvo no Firestore. UID:", firebaseUser.uid, "Papel:", roleToSet);
      
      // onAuthStateChanged cuidará de definir user e role no estado.
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro no signup Firebase:", error);
      throw error; // Re-lança o erro para AuthForm tratar
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged cuidará de limpar user e role.
      console.log("Logout bem-sucedido.");
    } catch (error) {
      console.error("Erro no logout Firebase:", error);
    } finally {
      setLoading(false);
    }
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
