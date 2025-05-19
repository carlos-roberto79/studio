
// src/services/firestoreService.ts
'use server';

import type { UserRole } from '@/lib/constants';
// import { db } from '@/lib/firebase'; // Firebase import commented out
// import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, DocumentData } from 'firebase/firestore';

const USERS_COLLECTION = 'users';
const COMPANIES_COLLECTION = 'companies';

export async function getUserRole(uid: string): Promise<UserRole | null> {
  console.log(`FirestoreService (MOCK): Buscando papel para UID: ${uid}`);
  // Simular retorno para fins de prototipagem sem backend
  // Em um sistema real, esta lógica seria baseada no localStorage ou outra forma de mock
  // Esta função pode não ser mais diretamente chamada pelo AuthContext mockado.
  return null; 
}

export async function setUserRole(uid: string, email: string, role: UserRole): Promise<void> {
  console.log(`FirestoreService (MOCK): Definindo papel para UID: ${uid}, Email: ${email}, Papel: ${role}`);
  // Simular escrita. Em um sistema real, esta lógica seria baseada no localStorage ou outra forma de mock
  // Esta função pode não ser mais diretamente chamada pelo AuthContext mockado.
  return Promise.resolve();
}

export interface CompanyData {
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  publicLinkSlug: string;
  profileComplete?: boolean;
  ownerUid?: string; 
}

export async function addCompanyDetails(userId: string, companyData: CompanyData): Promise<string> {
  console.log(`FirestoreService (MOCK): Adicionando/Atualizando detalhes da empresa para o usuário ${userId}:`, companyData);
  // Simulação: não faz nada com o backend.
  return Promise.resolve("mockCompanyId123"); // Retorna um ID mockado
}

export async function getCompanyDetails(userId: string): Promise<(CompanyData & { id: string }) | null> {
  console.log(`FirestoreService (MOCK): Buscando detalhes da empresa para o usuário ${userId}`);
  // Simulação: retorna null ou dados mockados se necessário para algum componente.
  return Promise.resolve(null);
}
