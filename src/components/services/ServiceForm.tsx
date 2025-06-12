'use client'; // Indica que este é um Client Component no Next.js 13+

import React, { useState } from 'react';
import { Service } from '@/lib/types/service'; // Importa a interface Service

// Estrutura inicial para os dados do formulário
const initialServiceState: Service = {
  name: '',
  description: '',
  professionalIds: [], // Começamos com array vazio
  category: '',
  durationMinutes: 0,
  schedulingLink: '', // Este talvez seja gerado pelo backend
  price: 0,
  commissionType: 'fixed', // Default
  commissionValue: 0,
  bookingFeeEnabled: false,
  simultaneousBookingsPerUser: 1, // Default
  simultaneousBookingsPerSlot: 1, // Default
  block24Hours: false,
  intervalBetweenSlotsMinutes: 0,
  confirmationType: 'automatic', // Default
  availabilityType: 'general', // Default
  isActive: true, // Default ativo
  displayDuration: true, // Default exibir duração
  // specificAvailability não incluído na inicialização simples
};

const ServiceForm: React.FC = () => {
  const [serviceData, setServiceData] = useState<Service>(initialServiceState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Trata checkboxes separadamente
    if (type === 'checkbox') {
      setServiceData({
        ...serviceData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setServiceData({
        ...serviceData,
        [name]: value,
      });
    }
  };

   const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServiceData({
      ...serviceData,
      [name]: parseFloat(value) || 0, // Converte para float, default 0 se não for número
    });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do Serviço:', serviceData);
    // Aqui você integraria a lógica para salvar os dados (API call)
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Serviço</label>
        <input
          type="text"
          name="name"
          id="name"
          value={serviceData.name}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          name="description"
          id="description"
          rows={3}
          value={serviceData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        ></textarea>
      </div>

       <div>
        <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700">Duração (minutos)</label>
        <input
          type="number"
          name="durationMinutes"
          id="durationMinutes"
          value={serviceData.durationMinutes}
          onChange={handleNumberInputChange}
           min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

       <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço</label>
        <input
          type="number"
          name="price"
          id="price"
          value={serviceData.price}
          onChange={handleNumberInputChange}
          min="0"
          step="0.01" // Para permitir centavos
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          checked={serviceData.isActive}?
          onChange={handleInputChange}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Serviço Ativo</label>
      </div>


      {/* Outros campos (Profissionais, Categoria, Imagem, Link, Comissão, Taxa, Simultâneos, Bloqueio 24h, Intervalo, Confirmação, Disponibilidade Específica) serão adicionados em etapas futuras */}

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Salvar Serviço
      </button>
    </form>
  );
};

export default ServiceForm;
