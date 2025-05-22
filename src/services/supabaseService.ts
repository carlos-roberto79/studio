// src/services/supabaseService.ts
'use server'; 

import { supabase } from '@/lib/supabaseClient';
import type { UserRole } from '@/lib/constants';
import type { AppointmentData } from '@/lib/types';

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

// Tipos para Serviços
export interface ServiceData {
  id?: string;
  company_id: string;
  name: string;
  description?: string;
  // professionalIds: string[]; // Para simplificar, não vamos gerenciar a relação M-M com profissionais nesta etapa via Supabase
  category: string;
  image_url?: string;
  duration_minutes: number;
  display_duration: boolean;
  unique_scheduling_link_slug?: string;
  price: number; // Armazenar como número
  commission_type?: 'fixed' | 'percentage';
  commission_value?: number;
  has_booking_fee: boolean;
  booking_fee_value?: number;
  simultaneous_appointments_per_user: number;
  simultaneous_appointments_per_slot: number;
  simultaneous_appointments_per_slot_automatic: boolean;
  block_after_24_hours: boolean;
  interval_between_slots_minutes: number;
  confirmation_type: 'manual' | 'automatic';
  availability_type_id?: string | null; // Permitir null
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Tipos para Profissionais
export interface ProfessionalData {
  id?: string;
  company_id: string;
  user_id?: string | null; // Se o profissional tem uma conta de usuário
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  bio?: string;
  profile_picture_url?: string;
  services_offered_text?: string; // Campo de texto para serviços
  availability?: any; // JSONB para horários padrão
  created_at?: string;
  updated_at?: string;
}

// Tipos para Tipos de Disponibilidade
export interface AvailabilityTypeData {
  id?: string;
  company_id: string;
  name: string;
  description?: string;
  schedule: any; // JSONB no Supabase
  created_at?: string;
  updated_at?: string;
}

// Tipos para Bloqueios de Agenda
export interface AgendaBlockData {
  id?: string;
  company_id: string;
  professional_id?: string | null;
  target_type: 'empresa' | 'profissional';
  start_time: string; // ISO string
  end_time: string;   // ISO string
  reason: string;
  repeats_weekly: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}


export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  console.log(`SupabaseService: Buscando perfil para UID: ${userId}`);
  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && status !== 406) { 
      console.error('SupabaseService: Erro ao buscar perfil do usuário:', error.message);
      return null;
    }
     if (!data) {
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
    console.error('Detalhes do Erro em createUserProfile:', JSON.stringify(err, null, 2));
    throw err;
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
        description: companyData.description || null,
        logo_url: companyData.logo_url || null,
        profile_complete: true, 
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
  console.log(`SupabaseService: Atualizando detalhes da empresa ID ${companyId}:`);
  try {
    const dataToUpdate = {
      ...companyData,
      profile_complete: true, 
      updated_at: new Date().toISOString(), 
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

// --- Funções CRUD para Serviços ---
export async function addService(companyId: string, serviceData: Omit<ServiceData, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<ServiceData | null> {
  console.log(`SupabaseService: Adicionando serviço para empresa ID ${companyId}:`);
  try {
    const dataToInsert = {
      ...serviceData,
      company_id: companyId,
      price: parseFloat(String(serviceData.price).replace(",", ".")), 
      availability_type_id: serviceData.availability_type_id === "none" || serviceData.availability_type_id === "" ? null : serviceData.availability_type_id,
    };
    const { data, error } = await supabase
      .from('services')
      .insert([dataToInsert])
      .select()
      .single();
    if (error) {
      console.error('SupabaseService: Erro ao adicionar serviço:', error);
      throw error;
    }
    console.log('SupabaseService: Serviço adicionado:', data);
    return data as ServiceData;
  } catch (err) {
    console.error('SupabaseService: Exceção em addService:', err);
    throw err;
  }
}

export async function getServicesByCompany(companyId: string): Promise<ServiceData[]> {
  console.log(`SupabaseService: Buscando serviços para empresa ID ${companyId}`);
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });
    if (error) {
      console.error('SupabaseService: Erro ao buscar serviços:', error);
      throw error;
    }
    return (data as ServiceData[]) || [];
  } catch (err) {
    console.error('SupabaseService: Exceção em getServicesByCompany:', err);
    throw err;
  }
}

export async function getServiceById(serviceId: string): Promise<ServiceData | null> {
  console.log(`SupabaseService: Buscando serviço por ID: ${serviceId}`);
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();
    if (error) {
      console.error('SupabaseService: Erro ao buscar serviço por ID:', error.message);
      if (error.code === 'PGRST116') return null; 
      throw error; 
    }
    return data as ServiceData;
  } catch (err) {
    console.error('SupabaseService: Exceção em getServiceById:', err);
    throw err;
  }
}

export async function updateService(serviceId: string, serviceData: Partial<Omit<ServiceData, 'id' | 'company_id' | 'created_at' | 'updated_at'>>): Promise<ServiceData | null> {
  console.log(`SupabaseService: Atualizando serviço ID ${serviceId}:`);
  try {
    const dataToUpdate = { ...serviceData, updated_at: new Date().toISOString() };
    if (serviceData.price !== undefined) {
      dataToUpdate.price = parseFloat(String(serviceData.price).replace(",", "."));
    }
    if (serviceData.availability_type_id === "") { 
        dataToUpdate.availability_type_id = null;
    }


    const { data, error } = await supabase
      .from('services')
      .update(dataToUpdate)
      .eq('id', serviceId)
      .select()
      .single();
    if (error) {
      console.error('SupabaseService: Erro ao atualizar serviço:', error);
      throw error;
    }
    console.log('SupabaseService: Serviço atualizado:', data);
    return data as ServiceData;
  } catch (err) {
    console.error('SupabaseService: Exceção em updateService:', err);
    throw err;
  }
}

export async function deleteService(serviceId: string): Promise<boolean> {
  console.log(`SupabaseService: Deletando serviço ID ${serviceId}`);
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
    if (error) {
      console.error('SupabaseService: Erro ao deletar serviço:', error);
      throw error;
    }
    console.log('SupabaseService: Serviço deletado com sucesso.');
    return true;
  } catch (err) {
    console.error('SupabaseService: Exceção em deleteService:', err);
    throw err;
  }
}

// --- Funções CRUD para Profissionais ---
export async function addProfessional(companyId: string, professionalData: Omit<ProfessionalData, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<ProfessionalData | null> {
  console.log(`SupabaseService: Adicionando profissional para empresa ID ${companyId}:`, professionalData);
  try {
    const dataToInsert = { ...professionalData, company_id: companyId };
    const { data, error } = await supabase
      .from('professionals')
      .insert([dataToInsert])
      .select()
      .single();
    if (error) {
      console.error('SupabaseService: Erro ao adicionar profissional:', error);
      throw error;
    }
    console.log('SupabaseService: Profissional adicionado:', data);
    return data as ProfessionalData;
  } catch (err) {
    console.error('SupabaseService: Exceção em addProfessional:', err);
    throw err;
  }
}

export async function getProfessionalsByCompany(companyId: string): Promise<ProfessionalData[]> {
  console.log(`SupabaseService: Buscando profissionais para empresa ID ${companyId}`);
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });
    if (error) {
      console.error('SupabaseService: Erro ao buscar profissionais:', error);
      throw error;
    }
    return (data as ProfessionalData[]) || [];
  } catch (err) {
    console.error('SupabaseService: Exceção em getProfessionalsByCompany:', err);
    throw err;
  }
}

export async function getProfessionalByUserId(userId: string): Promise<ProfessionalData | null> {
  console.log(`SupabaseService: Buscando profissional por user_id: ${userId}`);
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*, companies ( company_name )') 
      .eq('user_id', userId)
      .maybeSingle(); 

    if (error) {
      console.error('SupabaseService: Erro ao buscar profissional por user_id:', error.message);
      throw error;
    }
    return data as ProfessionalData | null;
  } catch (err) {
    console.error('SupabaseService: Exceção em getProfessionalByUserId:', err);
    throw err;
  }
}

// Nova função para buscar profissional por ID da tabela 'professionals'
export async function getProfessionalById(professionalId: string): Promise<ProfessionalData | null> {
  console.log(`SupabaseService: Buscando profissional por ID: ${professionalId}`);
  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', professionalId)
      .single();
    if (error) {
      console.error('SupabaseService: Erro ao buscar profissional por ID:', error.message);
      if (error.code === 'PGRST116') return null; 
      throw error; 
    }
    return data as ProfessionalData;
  } catch (err) {
    console.error('SupabaseService: Exceção em getProfessionalById:', err);
    throw err;
  }
}

export async function updateProfessional(professionalId: string, professionalData: Partial<Omit<ProfessionalData, 'id' | 'company_id' | 'created_at' | 'updated_at'>>): Promise<ProfessionalData | null> {
  console.log(`SupabaseService: Atualizando profissional ID ${professionalId}:`, professionalData);
  try {
    const dataToUpdate = { ...professionalData, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('professionals')
      .update(dataToUpdate)
      .eq('id', professionalId)
      .select()
      .single();
    if (error) {
      console.error('SupabaseService: Erro ao atualizar profissional:', error);
      throw error;
    }
    console.log('SupabaseService: Profissional atualizado:', data);
    return data as ProfessionalData;
  } catch (err) {
    console.error('SupabaseService: Exceção em updateProfessional:', err);
    throw err;
  }
}

export async function deleteProfessional(professionalId: string): Promise<boolean> {
  console.log(`SupabaseService: Deletando profissional ID ${professionalId}`);
  try {
    const { error } = await supabase
      .from('professionals')
      .delete()
      .eq('id', professionalId);
    if (error) {
      console.error('SupabaseService: Erro ao deletar profissional:', error);
      throw error;
    }
    console.log('SupabaseService: Profissional deletado com sucesso.');
    return true;
  } catch (err) {
    console.error('SupabaseService: Exceção em deleteProfessional:', err);
    throw err;
  }
}


// --- Funções CRUD para Tipos de Disponibilidade ---
export async function addAvailabilityType(companyId: string, availabilityTypeData: Omit<AvailabilityTypeData, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<AvailabilityTypeData | null> {
  console.log(`SupabaseService: Adicionando tipo de disponibilidade para empresa ID ${companyId}:`);
  try {
    const dataToInsert = { ...availabilityTypeData, company_id: companyId };
    const { data, error } = await supabase
      .from('availability_types')
      .insert([dataToInsert])
      .select()
      .single();
    if (error) {
      console.error('SupabaseService: Erro ao adicionar tipo de disponibilidade:', error);
      throw error;
    }
    console.log('SupabaseService: Tipo de disponibilidade adicionado:', data);
    return data as AvailabilityTypeData;
  } catch (err) {
    console.error('SupabaseService: Exceção em addAvailabilityType:', err);
    throw err;
  }
}

export async function getAvailabilityTypesByCompany(companyId: string): Promise<AvailabilityTypeData[]> {
  console.log(`SupabaseService: Buscando tipos de disponibilidade para empresa ID ${companyId}`);
  try {
    const { data, error } = await supabase
      .from('availability_types')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });
    if (error) {
      console.error('SupabaseService: Erro ao buscar tipos de disponibilidade:', error);
      throw error;
    }
    return (data as AvailabilityTypeData[]) || [];
  } catch (err) {
    console.error('SupabaseService: Exceção em getAvailabilityTypesByCompany:', err);
    throw err;
  }
}

export async function getAvailabilityTypeById(typeId: string): Promise<AvailabilityTypeData | null> {
    console.log(`SupabaseService: Buscando tipo de disponibilidade por ID: ${typeId}`);
    try {
        const { data, error } = await supabase
            .from('availability_types')
            .select('*')
            .eq('id', typeId)
            .single();
        if (error) {
            console.error('SupabaseService: Erro ao buscar tipo de disponibilidade por ID:', error.message);
            if (error.code === 'PGRST116') return null; 
            throw error;
        }
        return data as AvailabilityTypeData;
    } catch (err) {
        console.error('SupabaseService: Exceção em getAvailabilityTypeById:', err);
        throw err;
    }
}


export async function updateAvailabilityType(typeId: string, availabilityTypeData: Partial<Omit<AvailabilityTypeData, 'id' | 'company_id' | 'created_at' | 'updated_at'>>): Promise<AvailabilityTypeData | null> {
  console.log(`SupabaseService: Atualizando tipo de disponibilidade ID ${typeId}:`);
  try {
    const dataToUpdate = { ...availabilityTypeData, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('availability_types')
      .update(dataToUpdate)
      .eq('id', typeId)
      .select()
      .single();
    if (error) {
      console.error('SupabaseService: Erro ao atualizar tipo de disponibilidade:', error);
      throw error;
    }
    console.log('SupabaseService: Tipo de disponibilidade atualizado:', data);
    return data as AvailabilityTypeData;
  } catch (err) {
    console.error('SupabaseService: Exceção em updateAvailabilityType:', err);
    throw err;
  }
}

export async function deleteAvailabilityType(typeId: string): Promise<boolean> {
  console.log(`SupabaseService: Deletando tipo de disponibilidade ID ${typeId}`);
  try {
    const { error } = await supabase
      .from('availability_types')
      .delete()
      .eq('id', typeId);
    if (error) {
      console.error('SupabaseService: Erro ao deletar tipo de disponibilidade:', error);
      throw error;
    }
    console.log('SupabaseService: Tipo de disponibilidade deletado.');
    return true;
  } catch (err) {
    console.error('SupabaseService: Exceção em deleteAvailabilityType:', err);
    throw err;
  }
}

// --- Funções CRUD para Bloqueios de Agenda ---
export async function addAgendaBlock(companyId: string, agendaBlockData: Omit<AgendaBlockData, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<AgendaBlockData | null> {
  console.log(`SupabaseService: Adicionando bloqueio de agenda para empresa ID ${companyId}:`);
  try {
    const dataToInsert = { 
      ...agendaBlockData, 
      company_id: companyId,
      professional_id: agendaBlockData.professional_id === "" ? null : agendaBlockData.professional_id,
      start_time: new Date(agendaBlockData.start_time).toISOString(), 
      end_time: new Date(agendaBlockData.end_time).toISOString(),     
    };
    const { data, error } = await supabase
      .from('agenda_blocks')
      .insert([dataToInsert])
      .select()
      .single();
    if (error) {
      console.error('SupabaseService: Erro ao adicionar bloqueio de agenda:', error);
      throw error;
    }
    console.log('SupabaseService: Bloqueio de agenda adicionado:', data);
    return data as AgendaBlockData;
  } catch (err) {
    console.error('SupabaseService: Exceção em addAgendaBlock:', err);
    throw err;
  }
}

export async function getAgendaBlocksByCompany(companyId: string): Promise<AgendaBlockData[]> {
  console.log(`SupabaseService: Buscando bloqueios de agenda para empresa ID ${companyId}`);
  try {
    const { data, error } = await supabase
      .from('agenda_blocks')
      .select('*, professionals ( name )') 
      .eq('company_id', companyId)
      .order('start_time', { ascending: false });
    if (error) {
      console.error('SupabaseService: Erro ao buscar bloqueios de agenda:', error);
      throw error;
    }
    return (data?.map(block => {
        const professionalRelation = block.professionals as { name: string } | null; 
        return {
            ...block,
            professionals: undefined, 
            professionalName: professionalRelation?.name || undefined
        };
    }) as AgendaBlockData[]) || [];
  } catch (err) {
    console.error('SupabaseService: Exceção em getAgendaBlocksByCompany:', err);
    throw err;
  }
}

export async function getAgendaBlockById(blockId: string): Promise<AgendaBlockData | null> {
    console.log(`SupabaseService: Buscando bloqueio de agenda por ID: ${blockId}`);
    try {
        const { data, error } = await supabase
            .from('agenda_blocks')
            .select('*')
            .eq('id', blockId)
            .single();
        if (error) {
            console.error('SupabaseService: Erro ao buscar bloqueio de agenda por ID:', error);
             if (error.code === 'PGRST116') return null; 
            throw error;
        }
        return data as AgendaBlockData;
    } catch (err) {
        console.error('SupabaseService: Exceção em getAgendaBlockById:', err);
        throw err;
    }
}

export async function updateAgendaBlock(blockId: string, agendaBlockData: Partial<Omit<AgendaBlockData, 'id' | 'company_id' | 'created_at' | 'updated_at'>>): Promise<AgendaBlockData | null> {
  console.log(`SupabaseService: Atualizando bloqueio de agenda ID ${blockId}:`);
  try {
    const dataToUpdate: any = { ...agendaBlockData, updated_at: new Date().toISOString() };
    
    if (agendaBlockData.professional_id === "") {
        dataToUpdate.professional_id = null;
    }
    if (dataToUpdate.start_time) dataToUpdate.start_time = new Date(dataToUpdate.start_time).toISOString();
    if (dataToUpdate.end_time) dataToUpdate.end_time = new Date(dataToUpdate.end_time).toISOString();
    
    const { data, error } = await supabase
      .from('agenda_blocks')
      .update(dataToUpdate)
      .eq('id', blockId)
      .select()
      .single();
    if (error) {
      console.error('SupabaseService: Erro ao atualizar bloqueio de agenda:', error);
      throw error;
    }
    console.log('SupabaseService: Bloqueio de agenda atualizado:', data);
    return data as AgendaBlockData;
  } catch (err) {
    console.error('SupabaseService: Exceção em updateAgendaBlock:', err);
    throw err;
  }
}

export async function deleteAgendaBlock(blockId: string): Promise<boolean> {
  console.log(`SupabaseService: Deletando bloqueio de agenda ID ${blockId}`);
  try {
    const { error } = await supabase
      .from('agenda_blocks')
      .delete()
      .eq('id', blockId);
    if (error) {
      console.error('SupabaseService: Erro ao deletar bloqueio de agenda:', error);
      throw error;
    }
    console.log('SupabaseService: Bloqueio de agenda deletado.');
    return true;
  } catch (err) {
    console.error('SupabaseService: Exceção em deleteAgendaBlock:', err);
    throw err;
  }
}

// --- Funções para Agendamentos (Appointments) ---
export async function getClientAppointments(clientId: string): Promise<AppointmentData[]> {
  console.log(`SupabaseService: Buscando agendamentos para o cliente ID ${clientId}`);
  try {
    const { data, error } = await supabase
      .from('appointments')
      // Exemplo de como fazer join para buscar o nome da empresa. Ajuste conforme sua necessidade.
      .select(`
        *,
        companies (
          company_name,
          logo_url
        )
      `)
      .eq('client_id', clientId)
      .order('appointment_datetime', { ascending: false }); // Ou true para futuros primeiro

    if (error) {
      console.error('SupabaseService: Erro ao buscar agendamentos do cliente:', error);
      throw error;
    }
    // O Supabase retorna o join como um objeto aninhado.
    // Você pode precisar mapear isso para a estrutura plana de AppointmentData se preferir.
    return (data as any[]) || [];
  } catch (err) {
    console.error('SupabaseService: Exceção em getClientAppointments:', err);
    throw err;
  }
}


// Função para buscar profissionais para o Select (ex: no formulário de AgendaBlock)
export async function getProfessionalsForSelect(companyId: string): Promise<{ id: string; name: string }[]> {
    const professionals = await getProfessionalsByCompany(companyId);
    return professionals.map(prof => ({ id: prof.id!, name: prof.name }));
}

export async function getAvailabilityTypesForSelect(companyId: string): Promise<{ id: string; name: string }[]> {
    const availabilityTypes = await getAvailabilityTypesByCompany(companyId);
    return availabilityTypes.map(type => ({ id: type.id!, name: type.name }));
}
