
export interface Plan {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: "mensal" | "anual";
  recursos: string[];
  ativo: boolean;
}

// Tipo para Usuários (incorporando detalhes de plano)
export interface User {
  // Assuming other user fields like id, email, name, etc. exist
  planoAtual?: string; // ID do plano atual assinado
  metodoPagamento?: "pix" | "boleto" | "cartao";
  statusPagamento?: "pendente" | "confirmado" | "falhou";
  // ... other user properties
}

// Tipos para o Sistema de Notificações
export interface WhatsAppConnection {
  empresaId: string; 
  numeroWhatsApp: string;
  conectado: boolean;
  data_conexao?: string;
  tokenAPI?: string;
  provedor?: "Z-API" | "Chat-API" | "WhatsApp Cloud API" | "";
}

export const NotificationEvents = [
  "agendamento_criado",
  "agendamento_aprovado",
  "agendamento_pendente_pagamento",
  "agendamento_cancelado",
  "agendamento_cancelado_bloqueio",
  "pagamento_confirmado",
  "pagamento_falhou",
] as const;
export type NotificationEvent = typeof NotificationEvents[number];

export const NotificationRecipients = ["cliente", "profissional"] as const;
export type NotificationRecipient = typeof NotificationRecipients[number];

export const NotificationTypes = ["whatsapp", "email"] as const;
export type NotificationType = typeof NotificationTypes[number];

export interface NotificationTemplate {
  id: string;
  tipo: NotificationType;
  evento: NotificationEvent;
  destinatario: NotificationRecipient;
  mensagem: string;
  ativo: boolean;
}

export interface NotificationLog {
  id: string;
  tipo: NotificationType;
  para: string;
  mensagem: string;
  data_envio: string;
  status: "enviado" | "falhou" | "pendente";
  usuarioId?: string; 
  evento: NotificationEvent;
}

// Tipos para Bloqueio de Agenda
export interface AgendaBlock {
  id: string;
  targetType: "empresa" | "profissional";
  profissionalId?: string;
  profissionalNome?: string; // Para exibição
  inicio: string; // ISO string or datetime-local string
  fim: string;    // ISO string or datetime-local string
  motivo: string;
  repetirSemanalmente: boolean;
  ativo: boolean;
}

// Tipo para simular agendamentos conflitantes
export interface MockConflictingAppointment {
  id: string;
  clienteNome: string;
  dataHora: string; // Formato "dd/MM/yyyy HH:mm" para exibição simples
  servico: string;
}

import { z } from "zod";

export const agendaBlockSchema = z.object({
  id: z.string().optional(),
  targetType: z.enum(["empresa", "profissional"], { required_error: "Selecione o alvo do bloqueio." }),
  profissionalId: z.string().optional().nullable(), // Ajustado para nullable
  profissionalNome: z.string().optional(),
  inicio: z.string().min(1, "Data/hora de início é obrigatória."),
  fim: z.string().min(1, "Data/hora de fim é obrigatória."),
  motivo: z.string().min(3, "O motivo deve ter pelo menos 3 caracteres."),
  repetirSemanalmente: z.boolean().default(false),
  ativo: z.boolean().default(true),
}).refine(data => {
  if (data.targetType === "profissional" && !data.profissionalId) {
    return false;
  }
  return true;
}, {
  message: "Selecione um profissional se o alvo for 'Profissional Específico'.",
  path: ["profissionalId"], 
}).refine(data => new Date(data.fim) > new Date(data.inicio), {
  message: "A data/hora de fim deve ser posterior à data/hora de início.",
  path: ["fim"],
});
export type AgendaBlockFormData = z.infer<typeof agendaBlockSchema>;

// Tipo para Agendamentos (Appointments)
export interface AppointmentData {
  id: string;
  company_id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  client_name?: string; // Denormalized
  professional_name?: string; // Denormalized
  service_name: string; // Denormalized
  appointment_datetime: string; // ISO string
  duration_minutes: number;
  price_at_booking: number;
  status: 'confirmado' | 'pendente_confirmacao' | 'pendente_pagamento' | 'cancelado_cliente' | 'cancelado_profissional' | 'cancelado_bloqueio' | 'concluido' | 'falta_cliente';
  payment_status?: 'pago' | 'pendente_taxa_agendamento' | 'reembolsado' | 'nao_aplicavel' | 'falhou';
  notes_client?: string;
  created_at: string;
  updated_at?: string;
  // Para join, se fizermos
  companies?: { company_name: string; logo_url?: string }; // Para obter nome e logo da empresa
}
