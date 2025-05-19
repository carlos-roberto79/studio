// src/services/firestoreService.ts
'use server'; // Marque como Server Action se for chamá-lo de componentes de servidor ou Server Actions

import type { UserRole } from '@/lib/constants';
import { db } from '@/lib/firebase'; // Importa a instância 'db' do Firestore
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Constantes para nomes de coleções
const USERS_COLLECTION = 'users';
// Adicione outras constantes de coleção conforme necessário (ex: companies, services, plans)

/**
 * Obtém o papel de um usuário do Firestore.
 * @param uid O ID do usuário.
 * @returns O papel do usuário ou null se não encontrado.
 */
export async function getUserRole(uid: string): Promise<UserRole | null> {
  console.log(`FirestoreService: Tentando buscar papel para UID: ${uid}`);
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      console.log(`FirestoreService: Papel encontrado para UID ${uid}:`, userData.role);
      return userData.role as UserRole;
    } else {
      console.log(`FirestoreService: Nenhum documento encontrado para UID ${uid} na coleção ${USERS_COLLECTION}.`);
      return null;
    }
  } catch (error) {
    console.error(`FirestoreService: Erro ao buscar papel para UID ${uid}:`, error);
    // Em um app real, você poderia tratar o erro de forma mais específica
    // ou lançá-lo para ser tratado pelo chamador.
    return null; // Retorna null em caso de erro para manter a simulação simples
  }
}

/**
 * Define o papel de um usuário no Firestore.
 * Geralmente chamado durante o processo de signup ou quando um papel é alterado.
 * @param uid O ID do usuário.
 * @param email O e-mail do usuário (pode ser útil armazenar).
 * @param role O papel a ser definido para o usuário.
 */
export async function setUserRole(uid: string, email: string, role: UserRole): Promise<void> {
  console.log(`FirestoreService: Tentando definir papel para UID: ${uid}, Email: ${email}, Papel: ${role}`);
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userDocRef, {
      uid: uid,
      email: email.toLowerCase(), // Armazenar email normalizado
      role: role,
      createdAt: new Date().toISOString(), // Opcional: data de criação do registro
    });
    console.log(`FirestoreService: Papel definido com sucesso para UID ${uid}.`);
  } catch (error) {
    console.error(`FirestoreService: Erro ao definir papel para UID ${uid}:`, error);
    // Tratar ou lançar o erro conforme necessário
    throw error; // Re-lança o erro para que o AuthContext possa tratá-lo
  }
}

// --- Outras Funções Placeholder (Exemplos) ---
// Você precisará implementar funções similares para cada entidade do seu sistema.

interface CompanyDataPlaceholder {
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  publicLinkSlug: string;
  // Adicione outros campos da empresa aqui
  profileComplete?: boolean;
}

export async function addCompanyDetails(userId: string, companyData: CompanyDataPlaceholder): Promise<void> {
  console.log(`FirestoreService: Adicionando/atualizando detalhes da empresa para o usuário ${userId}:`, companyData);
  // Lógica para adicionar/atualizar na coleção 'companies' no Firestore, usando userId ou um companyId.
  // Exemplo: const companyDocRef = doc(db, 'companies', userId);
  // await setDoc(companyDocRef, { ...companyData, ownerUid: userId }, { merge: true });
  return Promise.resolve(); // Simulação
}

export async function getCompanyDetails(userId: string): Promise<CompanyDataPlaceholder | null> {
  console.log(`FirestoreService: Buscando detalhes da empresa para o usuário ${userId}`);
  // Lógica para buscar da coleção 'companies'.
  // Exemplo: const companyDocRef = doc(db, 'companies', userId);
  // const companyDocSnap = await getDoc(companyDocRef);
  // if (companyDocSnap.exists()) return companyDocSnap.data() as CompanyDataPlaceholder;
  return Promise.resolve(null); // Simulação
}

// Adicione mais funções conforme necessário para serviços, planos, bloqueios, etc.
// Exemplo:
// export async function addService(companyId: string, serviceData: any): Promise<string> {
//   console.log(`FirestoreService: Adicionando serviço para a empresa ${companyId}:`, serviceData);
//   // const servicesCollectionRef = collection(db, 'companies', companyId, 'services');
//   // const docRef = await addDoc(servicesCollectionRef, serviceData);
//   // return docRef.id;
//   return Promise.resolve("mockServiceId");
// }

// Lembre-se de criar as regras de segurança no Firestore para proteger seus dados!
