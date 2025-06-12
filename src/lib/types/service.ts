import { Timestamp } from 'firebase/firestore'; // Assumindo que você pode usar Timestamps se estiver integrando com Firebase

// Tipos auxiliares para clareza
export type CommissionType = 'fixed' | 'percentage';
export type ConfirmationType = 'manual' | 'automatic';
export type AvailabilityType = 'general' | 'specific' | 'inherited'; // Tipos de disponibilidade: geral da empresa/profissional, específica do serviço, ou herdada

export interface Service {
  id?: string; // ID único do serviço (opcional, pode ser gerado pelo banco de dados)
  name: string; // Nome do serviço
  description: string; // Descrição detalhada do serviço
  professionalIds: string[]; // IDs dos profissionais responsáveis por este serviço
  category: string; // Categoria do serviço (pode ser um ID se tiver uma coleção de categorias)
  imageUrl?: string; // URL da imagem ilustrativa (opcional)
  durationMinutes: number; // Duração do serviço em minutos
  schedulingLink: string; // Link único de agendamento para este serviço
  price: number; // Preço do serviço
  commissionType: CommissionType; // Tipo de comissão (fixa ou porcentagem)
  commissionValue: number; // Valor ou porcentagem da comissão
  bookingFeeEnabled: boolean; // Indica se a taxa de agendamento está habilitada
  bookingFeeAmount?: number; // Valor da taxa de agendamento (opcional, se habilitada)
  simultaneousBookingsPerUser: number; // Quantidade de agendamentos simultâneos por usuário
  simultaneousBookingsPerSlot: number; // Quantidade de agendamentos simultâneos por horário
  autoSimultaneousBookingsPerSlot?: boolean; // Habilitar ajuste automático da quantidade por horário
  block24Hours: boolean; // Bloqueio de 24 horas após o agendamento
  intervalBetweenSlotsMinutes: number; // Intervalo entre slots de horários em minutos
  confirmationType: ConfirmationType; // Tipo de confirmação do agendamento
  availabilityType: AvailabilityType; // Como a disponibilidade é definida para este serviço
  specificAvailability?: { // Disponibilidade específica (se availabilityType for 'specific')
    // Estrutura de exemplo para disponibilidade específica por dia e horários
    days?: number[]; // Ex: [0, 1, 5] para Domingo, Segunda, Sexta
    timeRanges?: { start: string; end: string }[]; // Ex: [{ start: '08:00', end: '12:00' }, { start: '14:00', end: '18:00' }]
    // Esta estrutura pode precisar ser mais detalhada dependendo da necessidade (intervalos, pausas, etc.)
  };
  isActive: boolean; // Indica se o serviço está ativo e disponível para agendamento
  displayDuration: boolean; // Indica se a duração deve ser exibida publicamente
  // Campos de timestamp comuns para rastreamento
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}