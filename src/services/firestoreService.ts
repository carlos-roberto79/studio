// src/services/firestoreService.ts
'use server';

import type { UserRole } from '@/lib/constants';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, DocumentData } from 'firebase/firestore';

const USERS_COLLECTION = 'users';
const COMPANIES_COLLECTION = 'companies';

export async function getUserRole(uid: string): Promise<UserRole | null> {
  console.log(`FirestoreService: Buscando papel para UID: ${uid}`);
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      console.log(`FirestoreService: Papel encontrado para UID ${uid}:`, userData.role);
      return userData.role as UserRole;
    } else {
      console.warn(`FirestoreService: Nenhum documento encontrado para UID ${uid} na coleção ${USERS_COLLECTION}.`);
      return null;
    }
  } catch (error) {
    console.error(`FirestoreService: Erro ao buscar papel para UID ${uid}:`, error);
    return null;
  }
}

export async function setUserRole(uid: string, email: string, role: UserRole): Promise<void> {
  console.log(`FirestoreService: Definindo papel para UID: ${uid}, Email: ${email}, Papel: ${role}`);
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userDocRef, {
      uid: uid,
      email: email.toLowerCase(),
      role: role,
      createdAt: new Date().toISOString(),
    }, { merge: true }); // Usar merge: true para não sobrescrever outros campos se já existirem
    console.log(`FirestoreService: Papel definido com sucesso para UID ${uid}.`);
  } catch (error) {
    console.error(`FirestoreService: Erro ao definir papel para UID ${uid}:`, error);
    throw error;
  }
}

export interface CompanyData {
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  publicLinkSlug: string;
  profileComplete?: boolean;
  ownerUid?: string; // Adicionado para referenciar o dono
  // Adicione outros campos da empresa aqui
}

export async function addCompanyDetails(userId: string, companyData: CompanyData): Promise<string> {
  console.log(`FirestoreService: Adicionando detalhes da empresa para o usuário ${userId}:`, companyData);
  try {
    // Vamos verificar se já existe uma empresa para este ownerUid
    const q = query(collection(db, COMPANIES_COLLECTION), where("ownerUid", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Empresa já existe, vamos atualizar o primeiro documento encontrado
      const companyDoc = querySnapshot.docs[0];
      const companyDocRef = doc(db, COMPANIES_COLLECTION, companyDoc.id);
      await setDoc(companyDocRef, { ...companyData, ownerUid: userId, updatedAt: new Date().toISOString() }, { merge: true });
      console.log(`FirestoreService: Detalhes da empresa atualizados para ${userId}, Doc ID: ${companyDoc.id}`);
      return companyDoc.id;
    } else {
      // Nenhuma empresa encontrada, criar uma nova
      const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
        ...companyData,
        ownerUid: userId,
        createdAt: new Date().toISOString(),
      });
      console.log(`FirestoreService: Detalhes da empresa adicionados para ${userId}, Novo Doc ID: ${docRef.id}`);
      return docRef.id;
    }
  } catch (error) {
    console.error(`FirestoreService: Erro ao adicionar/atualizar detalhes da empresa para ${userId}:`, error);
    throw error;
  }
}

export async function getCompanyDetails(userId: string): Promise<(CompanyData & { id: string }) | null> {
  console.log(`FirestoreService: Buscando detalhes da empresa para o usuário ${userId}`);
  try {
    const q = query(collection(db, COMPANIES_COLLECTION), where("ownerUid", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const companyDoc = querySnapshot.docs[0]; // Assumindo que um usuário só pode ser dono de uma empresa
      console.log(`FirestoreService: Detalhes da empresa encontrados para ${userId}:`, companyDoc.data());
      return { id: companyDoc.id, ...companyDoc.data() } as (CompanyData & { id: string });
    } else {
      console.warn(`FirestoreService: Nenhuma empresa encontrada para ownerUid ${userId}`);
      return null;
    }
  } catch (error) {
    console.error(`FirestoreService: Erro ao buscar detalhes da empresa para ${userId}:`, error);
    return null;
  }
}
