
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, PlusCircle, Edit, Trash2, ShoppingBag, Eye, EyeOff, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // Import useRouter
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mock data for services now includes all fields for comprehensive testing
const mockServicesData = [
  { 
    id: "1", 
    name: "Corte de Cabelo Masculino", 
    description: "Corte moderno e estiloso para homens.", 
    professionals: ["prof1", "prof3"], 
    category: "Beleza e Estética", 
    duration: 45, 
    displayDuration: true, 
    active: true, 
    image: "https://placehold.co/64x64.png?text=CM", 
    price: "R$ 50,00", 
    uniqueSchedulingLink: "corte-masculino", 
    commissionType: "percentage", 
    commissionValue: 10, 
    hasBookingFee: false, 
    bookingFeeValue: 0, 
    simultaneousAppointmentsPerUser: 1, 
    simultaneousAppointmentsPerSlot: 1, 
    simultaneousAppointmentsPerSlotAutomatic: false, 
    blockAfter24Hours: false, 
    intervalBetweenSlots: 15, 
    confirmationType: "automatic", 
    specificAvailability: "seg 09:00-12:00" 
  },
  { 
    id: "2", 
    name: "Consulta Psicológica Online", 
    description: "Sessão de terapia online com psicólogo.", 
    professionals: ["prof2"], 
    category: "Saúde e Bem-estar", 
    duration: 50, 
    displayDuration: true, 
    active: true, 
    image: "https://placehold.co/64x64.png?text=CP", 
    price: "R$ 120,00", 
    uniqueSchedulingLink: "consulta-psico", 
    commissionType: "fixed", 
    commissionValue: 20, 
    hasBookingFee: true, 
    bookingFeeValue: 10, 
    simultaneousAppointmentsPerUser: 1, 
    simultaneousAppointmentsPerSlot: 1, 
    simultaneousAppointmentsPerSlotAutomatic: true, 
    blockAfter24Hours: true, 
    intervalBetweenSlots: 0, 
    confirmationType: "manual", 
    specificAvailability: "" 
  },
  { 
    id: "3", 
    name: "Manicure e Pedicure Completa", 
    description: "Cuidado completo para suas mãos e pés.", 
    professionals: ["prof3"], 
    category: "Beleza e Estética", 
    duration: 90, 
    displayDuration: true, 
    active: false, 
    image: "https://placehold.co/64x64.png?text=MP", 
    price: "R$ 75,00", 
    uniqueSchedulingLink: "manicure-pedicure-completa", 
    commissionType: "percentage", 
    commissionValue: 15, 
    hasBookingFee: false, 
    bookingFeeValue: 0, 
    simultaneousAppointmentsPerUser: 2, 
    simultaneousAppointmentsPerSlot: 1, 
    simultaneousAppointmentsPerSlotAutomatic: false, 
    blockAfter24Hours: false, 
    intervalBetweenSlots: 5, 
    confirmationType: "automatic", 
    specificAvailability: "qua 10:00-19:00; sex 10:00-19:00" 
  },
];


export default function CompanyServicesPage() {
  const { toast } = useToast();
  const router = useRouter(); 
  const [services, setServices] = useState(mockServicesData);

  useEffect(() => {
    document.title = `Gerenciar Serviços - ${APP_NAME}`;
    console.log("BACKEND_SIM: Buscando lista de serviços da empresa...");
  }, []);

  const handleDeleteService = (serviceId: string) => {
    console.log("BACKEND_SIM: Enviando solicitação para excluir serviço ID:", serviceId);
    // SIMULAÇÃO DE CHAMADA DE API PARA EXCLUIR
    // Em um app real:
    // try {
    //   await api.deleteService(serviceId);
    //   setServices(prevServices => prevServices.filter(service => service.id !== serviceId));
    //   toast({ title: "Serviço Excluído", description: "O serviço foi removido do servidor." });
    // } catch (error) {
    //   toast({ title: "Erro no Servidor", description: "Não foi possível excluir o serviço.", variant: "destructive" });
    // }
    setServices(prevServices => prevServices.filter(service => service.id !== serviceId));
    toast({
      title: "Serviço Excluído (Simulação)",
      description: "O serviço foi removido da sua lista (simulação frontend).",
    });
  };

  const handleDuplicateService = (serviceId: string) => {
    const serviceToDuplicate = services.find(s => s.id === serviceId);
    if (serviceToDuplicate) {
      console.log("BACKEND_SIM: Preparando para duplicar serviço (frontend) ID:", serviceId, serviceToDuplicate);
      // Armazena os dados do serviço a ser duplicado para a página de adicionar pegar
      localStorage.setItem('duplicate_service_data', JSON.stringify({
        ...serviceToDuplicate,
        name: `${serviceToDuplicate.name} (Cópia)`, // Sugere um novo nome
        uniqueSchedulingLink: `${serviceToDuplicate.uniqueSchedulingLink}-copia` // Sugere um novo link
      }));
      toast({
        title: "Preparando Duplicação (Simulação)",
        description: `Você será redirecionado para adicionar um novo serviço com os dados de "${serviceToDuplicate.name}" pré-preenchidos.`,
      });
      router.push(`/dashboard/company/services/add?fromDuplicate=true`);
    }
  };

  const toggleServiceStatus = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const newStatus = !service.active;
    console.log(`BACKEND_SIM: Enviando solicitação para alterar status do serviço ID ${serviceId} para ${newStatus ? 'ativo' : 'inativo'}`);
    // SIMULAÇÃO DE CHAMADA DE API PARA ATUALIZAR STATUS
    // try {
    //   await api.updateServiceStatus(serviceId, newStatus);
    //   setServices(prevServices =>
    //     prevServices.map(s =>
    //       s.id === serviceId ? { ...s, active: newStatus } : s
    //     )
    //   );
    //   toast({ title: "Status Alterado", description: `O serviço "${service.name}" foi ${newStatus ? "ativado" : "desativado"} no servidor.` });
    // } catch (error) {
    //   toast({ title: "Erro no Servidor", description: "Não foi possível alterar o status do serviço.", variant: "destructive" });
    // }
    setServices(prevServices =>
      prevServices.map(s =>
        s.id === serviceId ? { ...s, active: newStatus } : s
      )
    );
    toast({
      title: `Status Alterado (Simulação)`,
      description: `O serviço "${service.name}" foi ${newStatus ? "ativado" : "desativado"} (simulação frontend).`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold flex items-center">
            <ShoppingBag className="mr-3 h-8 w-8 text-primary" /> Gerenciar Serviços
          </CardTitle>
          <CardDescription>Adicione, edite ou remova os serviços oferecidos pela sua empresa.</CardDescription>
        </CardHeader>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/company">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/company/services/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Serviço
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          {services.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[64px]">Imagem</TableHead>
                  <TableHead>Nome do Serviço</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <Image src={service.image} alt={service.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint="ilustração serviço" />
                    </TableCell>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell>{service.price}</TableCell>
                    <TableCell>
                      <Badge variant={service.active ? "default" : "outline"} className={service.active ? "bg-green-500 hover:bg-green-600" : "bg-red-100 text-red-700 hover:bg-red-200"}>
                        {service.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleServiceStatus(service.id)} title={service.active ? "Desativar serviço" : "Ativar serviço"}>
                        {service.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDuplicateService(service.id)} title="Duplicar serviço">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Editar serviço">
                        <Link href={`/dashboard/company/services/edit/${service.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Excluir serviço">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o serviço "{service.name}"? Esta ação não poderá ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteService(service.id)}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum serviço cadastrado ainda.</p>
              <Button asChild>
                <Link href="/dashboard/company/services/add">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Primeiro Serviço
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    