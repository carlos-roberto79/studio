
// src/services/supabaseService.ts
'use server'; 

import { supabase } from '@/lib/supabaseClient';
import type { UserRole } from '@/lib/constants';

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
  id?: string; 
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
  operating_hours?: any; 
  plan_id?: string;
  created_at?: string;
  updated_at?: string;
  customization?: any; 
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  console.log(`SupabaseService: Buscando perfil para UID: ${userId}`);
  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && status !== 406) { // 406: "Not Acceptable", usually when no rows are found for .single()
      console.error('SupabaseService: Erro ao buscar perfil do usuário:', error);
      return null;
    }
     if (!data) {
        console.warn(`SupabaseService: Nenhum perfil encontrado para UID: ${userId}. Isso é esperado para novos usuários antes da criação do perfil.`);
        return null;
    }
    return data as UserProfile;
  } catch (err) {
    console.error('SupabaseService: Exceção em getUserProfile:', err);
    return null;
  }
}

export async function createUserProfile(userId: string, email: string, role: UserRole, displayName?: string): Promise<UserProfile | null> {
  const userProfileData = { 
    id: userId, 
    email: email.toLowerCase(), 
    role,
    display_name: displayName || email.split('@')[0],
  };
  console.log(`SupabaseService: Tentando criar perfil para UID: ${userId}, Email: ${email}, Papel: ${role}`);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([userProfileData])
      .select()
      .single(); 

    if (error) {
      console.error('SupabaseService: Erro ao criar perfil do usuário no banco de dados:', error);
      throw error; 
    }
    console.log('SupabaseService: Perfil de usuário criado com sucesso no banco de dados:', data);
    return data as UserProfile;
  } catch (err: any) {
    console.error('SupabaseService: Exceção em createUserProfile:', err);
    throw err.code ? err : new Error(err.message || 'Erro desconhecido ao criar perfil.');
  }
}

export async function addCompanyDetails(companyData: Omit<CompanyData, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
  console.log(`SupabaseService: Adicionando detalhes da empresa para o proprietário ${companyData.owner_uid}:`, companyData);
  try {
    const companyDataToInsert = {
        owner_uid: companyData.owner_uid,
        company_name: companyData.company_name,
        cnpj: companyData.cnpj,
        address: companyData.address,
        phone: companyData.phone,
        email: companyData.email,
        public_link_slug: companyData.public_link_slug,
        profile_complete: true, // Sempre marcar como completo ao adicionar detalhes
        description: companyData.description || null,
        logo_url: companyData.logo_url || null,
        operating_hours: companyData.operating_hours || null,
        plan_id: companyData.plan_id || null,
        customization: companyData.customization || null,
    };

    const { data, error } = await supabase
      .from('companies')
      .insert([companyDataToInsert]) 
      .select('id') 
      .single();

    if (error) {
      console.error('SupabaseService: Erro ao salvar detalhes da empresa no Supabase:', error); 
      throw error;
    }
    console.log('SupabaseService: Detalhes da empresa salvos com sucesso, ID:', data?.id);
    return data?.id || null;
  } catch (err: any) { 
    console.error('SupabaseService: Exceção CATCH em addCompanyDetails:', err); 
    throw err; 
  }
}

export async function updateCompanyDetails(companyId: string, companyData: Partial<Omit<CompanyData, 'id' | 'owner_uid' | 'created_at'>>): Promise<CompanyData | null> {
  console.log(`SupabaseService: Atualizando detalhes da empresa ID ${companyId}:`, companyData);
  try {
    const dataToUpdate = {
      ...companyData,
      profile_complete: true, // Sempre garantir que está completo após uma edição
      updated_at: new Date().toISOString(), // Atualiza o campo updated_at
    };

    const { data, error } = await supabase
      .from('companies')
      .update(dataToUpdate)
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      console.error('SupabaseService: Erro ao atualizar detalhes da empresa no Supabase:', error);
      throw error;
    }
    console.log('SupabaseService: Detalhes da empresa atualizados com sucesso:', data);
    return data as CompanyData | null;
  } catch (err: any) {
    console.error('SupabaseService: Exceção CATCH em updateCompanyDetails:', err);
    throw err;
  }
}


export async function getCompanyDetailsByOwner(ownerUid: string): Promise<CompanyData | null> {
  console.log(`SupabaseService: Buscando detalhes da empresa para o proprietário UID: ${ownerUid}`);
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_uid', ownerUid)
      .maybeSingle(); 

    if (error) {
      console.error('SupabaseService: Erro ao buscar detalhes da empresa:', error);
      return null; 
    }
    return data as CompanyData | null;
  } catch (err) {
    console.error('SupabaseService: Exceção em getCompanyDetailsByOwner:', err);
    return null;
  }
}
