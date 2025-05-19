// src/services/supabaseService.ts
'use server'; // Embora as chamadas reais ao Supabase sejam client-side,
              // marcar como server action pode ser útil se você planejar chamá-las de server components no futuro.
              // Por agora, as chamadas serão feitas do client-side AuthContext.

import { supabase } from '@/lib/supabaseClient';
import type { UserRole } from '@/lib/constants';
import { USER_ROLES } from '@/lib/constants';

export interface UserProfile {
  id: string; // Deve ser o mesmo que o Supabase Auth UID
  email: string;
  role: UserRole;
  displayName?: string;
  // Outros campos que você queira no perfil do usuário
}

export interface CompanyData {
  ownerUid: string; // UID do usuário que criou/possui a empresa
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string; // Email de contato da empresa
  publicLinkSlug: string;
  profileComplete?: boolean;
  // Outros campos
}

/**
 * Busca o perfil de um usuário (incluindo seu papel) do banco de dados.
 * @param userId O UID do usuário do Supabase Auth.
 * @returns O perfil do usuário ou null se não encontrado.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  console.log(`SupabaseService (MOCK/Placeholder): Buscando perfil para UID: ${userId}`);
  // Lógica real do Supabase:
  // const { data, error } = await supabase
  //   .from('profiles') // Assumindo que você tem uma tabela 'profiles'
  //   .select('*')
  //   .eq('id', userId)
  //   .single();
  // if (error) {
  //   console.error('Erro ao buscar perfil do usuário:', error);
  //   return null;
  // }
  // return data as UserProfile | null;

  // Simulação para prototipagem:
  const mockProfiles: Record<string, UserProfile> = JSON.parse(localStorage.getItem('tdsagenda_supabase_profiles_mock') || '{}');
  const profile = mockProfiles[userId];
  if (profile) {
    return Promise.resolve(profile);
  }
  return Promise.resolve(null);
}

/**
 * Cria um novo perfil de usuário no banco de dados.
 * Chamado geralmente após o signup bem-sucedido no Supabase Auth.
 * @param userId O UID do usuário do Supabase Auth.
 * @param email O e-mail do usuário.
 * @param role O papel inicial do usuário.
 */
export async function createUserProfile(userId: string, email: string, role: UserRole): Promise<UserProfile | null> {
  const userProfile: UserProfile = { id: userId, email, role };
  console.log(`SupabaseService (MOCK/Placeholder): Criando perfil para UID: ${userId}, Email: ${email}, Papel: ${role}`);
  
  // Lógica real do Supabase:
  // const { data, error } = await supabase
  //   .from('profiles')
  //   .insert([userProfile])
  //   .select()
  //   .single();
  // if (error) {
  //   console.error('Erro ao criar perfil do usuário:', error);
  //   return null;
  // }
  // return data as UserProfile | null;

  // Simulação para prototipagem:
  const mockProfiles: Record<string, UserProfile> = JSON.parse(localStorage.getItem('tdsagenda_supabase_profiles_mock') || '{}');
  mockProfiles[userId] = userProfile;
  localStorage.setItem('tdsagenda_supabase_profiles_mock', JSON.stringify(mockProfiles));
  return Promise.resolve(userProfile);
}

/**
 * Adiciona ou atualiza os detalhes de uma empresa no banco de dados.
 * @param companyData Os dados da empresa.
 * @returns O ID da empresa (pode ser o ownerUid ou um ID gerado) ou null em caso de erro.
 */
export async function addCompanyDetails(companyData: CompanyData): Promise<string | null> {
  console.log(`SupabaseService (MOCK/Placeholder): Adicionando/Atualizando detalhes da empresa para o usuário ${companyData.ownerUid}:`, companyData);
  // Lógica real do Supabase:
  // Assumindo que o ID da empresa é o ownerUid para simplificar, ou você pode gerar um.
  // const { data, error } = await supabase
  //   .from('companies')
  //   .upsert({ id: companyData.ownerUid, ...companyData }, { onConflict: 'id' }) // 'id' seria a PK da tabela companies
  //   .select('id')
  //   .single();
  // if (error) {
  //   console.error('Erro ao salvar detalhes da empresa:', error);
  //   return null;
  // }
  // return data?.id || null;

  // Simulação para prototipagem:
  const mockCompanies: Record<string, CompanyData> = JSON.parse(localStorage.getItem('tdsagenda_supabase_companies_mock') || '{}');
  mockCompanies[companyData.ownerUid] = companyData; // Usando ownerUid como ID mockado
  localStorage.setItem('tdsagenda_supabase_companies_mock', JSON.stringify(mockCompanies));
  localStorage.setItem('tdsagenda_companyProfileComplete_mock', 'true');
  localStorage.setItem('tdsagenda_companyName_mock', companyData.companyName);
  localStorage.setItem('tdsagenda_companyEmail_mock', companyData.email);
  return Promise.resolve(companyData.ownerUid);
}

/**
 * Busca os detalhes de uma empresa pelo UID do proprietário.
 * @param ownerUid O UID do usuário proprietário da empresa.
 * @returns Os dados da empresa ou null se não encontrados.
 */
export async function getCompanyDetailsByOwner(ownerUid: string): Promise<CompanyData | null> {
  console.log(`SupabaseService (MOCK/Placeholder): Buscando detalhes da empresa para o proprietário UID: ${ownerUid}`);
  // Lógica real do Supabase:
  // const { data, error } = await supabase
  //   .from('companies')
  //   .select('*')
  //   .eq('ownerUid', ownerUid) // Ou .eq('id', ownerUid) se o ID da empresa for o ownerUid
  //   .single();
  // if (error) {
  //   console.error('Erro ao buscar detalhes da empresa:', error);
  //   return null;
  // }
  // return data as CompanyData | null;

  // Simulação para prototipagem:
  const mockCompanies: Record<string, CompanyData> = JSON.parse(localStorage.getItem('tdsagenda_supabase_companies_mock') || '{}');
  const company = Object.values(mockCompanies).find(c => c.ownerUid === ownerUid);
  return Promise.resolve(company || null);
}

// Você adicionará mais funções aqui para interagir com outras tabelas (services, plans, appointments, etc.)
// Exemplo:
// export async function getServices(companyId: string): Promise<any[] | null> {
//   // const { data, error } = await supabase.from('services').select('*').eq('companyId', companyId);
//   // ...
//   return null;
// }
