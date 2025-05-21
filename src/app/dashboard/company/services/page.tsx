
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState, useCallback } from 'react';
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, PlusCircle, Edit, Trash2, ShoppingBag, Eye, EyeOff, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // Importação adicionada
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getCompanyDetailsByOwner } from "@/services/supabaseService";
import { getServicesByCompany, deleteService, updateService, type ServiceData } from "@/services/supabaseService";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyServicesPage() {
  const { toast } = useToast();
  const router = useRouter(); 
  const { user, role } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = useCallback(async (currentCompanyId: string) => {
    setIsLoading(true);
    try {
      const fetchedServices = await getServicesByCompany(currentCompanyId);
      setServices(fetchedServices || []); 
    } catch (error: any) {
      toast({ title: "Erro ao buscar serviços", description: error.message, variant: "destructive" });
      setServices([]); 
    } finally {
      setIsLoading(false);
    }
  }, [toast]); 

  useEffect(() => {
    document.title = `Gerenciar Serviços - ${APP_NAME}`;
    if (user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
      getCompanyDetailsByOwner(user.id).then(companyDetails => {
        if (companyDetails && companyDetails.id) {
          setCompanyId(companyDetails.id);
        } else {
          toast({ title: "Erro", description: "Empresa não encontrada.", variant: "destructive" });
          setIsLoading(false);
          setServices([]); 
        }
      }).catch(err => {
        toast({ title: "Erro ao buscar detalhes da empresa", description: err.message, variant: "destructive" });
        setIsLoading(false);
        setServices([]);
      });
    } else if (!user && isLoading) { // Ajustado para verificar isLoading também
        // Não faz nada se estiver autenticando
    } else if (!user) {
        setIsLoading(false);
        setServices([]);
        router.push('/login'); // Redireciona se não houver usuário após o carregamento inicial
    } else {
        // Usuário logado, mas não é COMPANY_ADMIN, pode redirecionar ou mostrar mensagem
        setIsLoading(false);
        setServices([]);
        router.push('/dashboard');
    }
  }, [user, role, toast, isLoading, router]); // Adicionado router a dependência

  useEffect(() => {
    if (companyId) {
      fetchServices(companyId);
    }
  }, [companyId, fetchServices]);


  const handleDeleteService = async (serviceId: string) => {
    const serviceToDelete = services.find(s => s.id === serviceId);
    if (!serviceToDelete) return;

    try {
      await deleteService(serviceId);
      setServices(prevServices => 
        Array.isArray(prevServices) ? prevServices.filter(service => service.id !== serviceId) : []
      );
      toast({
        title: "Serviço Excluído",
        description: `O serviço "${serviceToDelete.name}" foi removido.`,
      });
    } catch (error: any) {
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    }
  };

  const handleDuplicateService = (serviceId: string) => {
    const serviceToDuplicate = services.find(s => s.id === serviceId);
    if (serviceToDuplicate) {
      localStorage.setItem('tdsagenda_duplicate_service_data', JSON.stringify({ 
        ...serviceToDuplicate,
        name: `${serviceToDuplicate.name} (Cópia)`,
        unique_scheduling_link_slug: `${serviceToDuplicate.unique_scheduling_link_slug || serviceToDuplicate.name.toLowerCase().replace(/\s+/g, '-')}-copia`
      }));
      toast({
        title: "Preparando Duplicação",
        description: `Você será redirecionado para adicionar um novo serviço com os dados de "${serviceToDuplicate.name}" pré-preenchidos.`,
      });
      router.push(`/dashboard/company/services/add?fromDuplicate=true`);
    }
  };

  const toggleServiceStatus = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service || !companyId) return;

    const newStatus = !service.active;
    try {
      const updatedService = await updateService(serviceId, { active: newStatus });
      if (updatedService) {
        setServices(prevServices =>
          Array.isArray(prevServices) ? prevServices.map(s =>
            s.id === serviceId ? { ...s, active: newStatus } : s
          ) : []
        );
        toast({
          title: `Status Alterado`,
          description: `O serviço "${service.name}" foi ${newStatus ? "ativado" : "desativado"}.`,
        });
      }
    } catch (error: any) {
      toast({ title: "Erro ao Alterar Status", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading && services.length === 0) { 
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-3/5" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }


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
          {isLoading && services.length > 0 && <div className="text-center my-4"><Loader2 className="h-6 w-6 animate-spin inline-block"/> Carregando mais...</div>}
          {!isLoading && services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum serviço cadastrado ainda.</p>
              <Button asChild>
                <Link href="/dashboard/company/services/add">
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Primeiro Serviço
                </Link>
              </Button>
            </div>
          ) : (
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
                      <Image 
                        src={service.image_url || "https://placehold.co/64x64.png?text=Serv"} 
                        alt={service.name} 
                        width={40} height={40} 
                        className="rounded-md object-cover" 
                        data-ai-hint="ilustração serviço"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell>R$ {service.price ? service.price.toFixed(2).replace('.', ',') : '0,00'}</TableCell>
                    <TableCell>
                      <Badge variant={service.active ? "default" : "outline"} className={service.active ? "bg-green-500 hover:bg-green-600" : "bg-red-100 text-red-700 hover:bg-red-200"}>
                        {service.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleServiceStatus(service.id!)} title={service.active ? "Desativar serviço" : "Ativar serviço"}>
                        {service.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDuplicateService(service.id!)} title="Duplicar serviço">
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
                              onClick={() => handleDeleteService(service.id!)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    
