// src/services/supabaseService.ts
'use server'; 

import { supabase } from '@/lib/supabaseClient';
import type { UserRole } from '@/lib/constants';
// USER_ROLES não é mais necessário aqui diretamente, pois vem de AuthContext

export interface UserProfile {
  id: string; 
  email: string;
  role: UserRole;
  display_name?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyData {
  id?: string; // O ID da empresa, pode ser gerado pelo Supabase
  owner_uid: string; 
  company_name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string; 
  public_link_slug: string;
  description?: string;
  logo_url?: string;
  profile_complete?: boolean;
  operating_hours?: any; // JSONB
  plan_id?: string;
  created_at?: string;
  updated_at?: string;
  customization?: any; // JSONB
}

/**
 * Busca o perfil de um usuário (incluindo seu papel) do banco de dados Supabase.
 * @param userId O UID do usuário do Supabase Auth.
 * @returns O perfil do usuário ou null se não encontrado ou em caso de erro.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  console.log(`SupabaseService: Buscando perfil para UID: ${userId}`);
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PGRST116: "The result contains 0 rows"
        console.warn(`SupabaseService: Nenhum perfil encontrado para UID: ${userId}. Isso pode ser normal para um usuário novo.`);
        return null;
      }
      console.error('SupabaseService: Erro ao buscar perfil do usuário:', error.message);
      throw error; // Re-throw para ser pego pelo chamador se necessário
    }
    return data as UserProfile | null;
  } catch (err) {
    console.error('SupabaseService: Exceção em getUserProfile:', err);
    return null;
  }
}

/**
 * Cria um novo perfil de usuário na tabela 'profiles' do Supabase.
 * Chamado geralmente após o signup bem-sucedido no Supabase Auth.
 * @param userId O UID do usuário do Supabase Auth.
 * @param email O e-mail do usuário.
 * @param role O papel inicial do usuário.
 * @param displayName Nome de exibição opcional.
 * @returns O perfil do usuário criado ou null em caso de erro.
 */
export async function createUserProfile(userId: string, email: string, role: UserRole, displayName?: string): Promise<UserProfile | null> {
  const userProfileData: Partial<UserProfile> = { 
    id: userId, 
    email: email.toLowerCase(), 
    role,
    display_name: displayName || email.split('@')[0], // Default display name
  };
  console.log(`SupabaseService: Criando perfil para UID: ${userId}, Email: ${email}, Papel: ${role}`);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([userProfileData])
      .select()
      .single();

    if (error) {
      console.error('SupabaseService: Erro ao criar perfil do usuário:', error.message);
      throw error;
    }
    console.log('SupabaseService: Perfil de usuário criado com sucesso:', data);
    return data as UserProfile | null;
  } catch (err) {
    console.error('SupabaseService: Exceção em createUserProfile:', err);
    return null;
  }
}

/**
 * Adiciona os detalhes de uma empresa na tabela 'companies' do Supabase.
 * @param companyData Os dados da empresa. Campos como id, created_at, updated_at serão gerados pelo Supabase.
 * @returns O ID da empresa criada ou null em caso de erro.
 */
export async function addCompanyDetails(companyData: Omit<CompanyData, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  console.log(`SupabaseService: Adicionando detalhes da empresa para o proprietário ${companyData.owner_uid}:`, companyData);
  try {
    // Os campos 'id', 'created_at', 'updated_at' são gerenciados pelo DB (DEFAULT ou Triggers)
    const companyDataToInsert = {
        ...companyData,
        // Garantir que os campos JSONB opcionais sejam nulos se não fornecidos, ou o Supabase pode reclamar
        operating_hours: companyData.operating_hours || null,
        customization: companyData.customization || null,
        plan_id: companyData.plan_id || null,
        logo_url: companyData.logo_url || null,
        description: companyData.description || null,
    };

    const { data, error } = await supabase
      .from('companies')
      .insert([companyDataToInsert])
      .select('id') // Selecionar apenas o ID da empresa recém-criada
      .single();

    if (error) {
      console.error('SupabaseService: Erro ao salvar detalhes da empresa:', error.message);
      throw error;
    }
    console.log('SupabaseService: Detalhes da empresa salvos com sucesso, ID:', data?.id);
    return data?.id || null;
  } catch (err) {
    console.error('SupabaseService: Exceção em addCompanyDetails:', err);
    return null;
  }
}

/**
 * Busca os detalhes de uma empresa pelo UID do proprietário.
 * @param ownerUid O UID do usuário proprietário da empresa.
 * @returns Os dados da empresa ou null se não encontrados ou em caso de erro.
 */
export async function getCompanyDetailsByOwner(ownerUid: string): Promise<CompanyData | null> {
  console.log(`SupabaseService: Buscando detalhes da empresa para o proprietário UID: ${ownerUid}`);
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_uid', ownerUid)
      .maybeSingle(); // Use maybeSingle() para não dar erro se não encontrar, apenas retornar null

    if (error) {
      console.error('SupabaseService: Erro ao buscar detalhes da empresa:', error.message);
      throw error;
    }
    return data as CompanyData | null;
  } catch (err) {
    console.error('SupabaseService: Exceção em getCompanyDetailsByOwner:', err);
    return null;
  }
}

// Você adicionará mais funções aqui para interagir com outras tabelas (services, plans, appointments, etc.)
// Exemplo:
// export async function getServices(companyId: string): Promise<any[] | null> {
//   // const { data, error } = await supabase.from('services').select('*').eq('companyId', companyId);
//   // ...
//   return null;
// }
