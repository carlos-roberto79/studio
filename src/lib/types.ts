
export interface Plan {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: "mensal" | "anual";
  recursos: string[];
  ativo: boolean;
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
  "agendamento_cancelado_bloqueio", // Novo evento
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
  profissionalId: z.string().optional(),
  profissionalNome: z.string().optional(), // Não precisa ser obrigatório no schema de validação do form
  inicio: z.string().min(1, "Data/hora de início é obrigatória."),
  fim: z.string().min(1, "Data/hora de fim é obrigatória."),
  motivo: z.string().min(3, "O motivo deve ter pelo menos 3 caracteres."),
  repetirSemanalmente: z.boolean().default(false),
  ativo: z.boolean().default(true),
}).refine(data => {
  // Validação para profissionalId se targetType for profissional
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
