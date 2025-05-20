
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, PlusCircle, Edit, Trash2, ListChecks, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { getCompanyDetailsByOwner, getAvailabilityTypesByCompany, deleteAvailabilityType, type AvailabilityTypeData } from "@/services/supabaseService";
import { Skeleton } from "@/components/ui/skeleton";

export default function AvailabilityTypesPage() {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [availabilityTypes, setAvailabilityTypes] = useState<AvailabilityTypeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = `Tipos de Disponibilidade - ${APP_NAME}`;
    if (user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
      getCompanyDetailsByOwner(user.id).then(companyDetails => {
        if (companyDetails && companyDetails.id) {
          setCompanyId(companyDetails.id);
          fetchAvailabilityTypes(companyDetails.id);
        } else {
          toast({ title: "Erro", description: "Empresa não encontrada.", variant: "destructive" });
          setIsLoading(false);
        }
      });
    } else {
        setIsLoading(false);
    }
  }, [user, role, toast]);

  const fetchAvailabilityTypes = async (currentCompanyId: string) => {
    setIsLoading(true);
    try {
      const types = await getAvailabilityTypesByCompany(currentCompanyId);
      setAvailabilityTypes(types);
    } catch (error: any) {
      toast({ title: "Erro ao buscar tipos de disponibilidade", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteType = async (typeId: string) => {
    const typeToDelete = availabilityTypes.find(t => t.id === typeId);
    if (!typeToDelete) return;

    try {
      await deleteAvailabilityType(typeId);
      setAvailabilityTypes(prev => prev.filter(type => type.id !== typeId));
      toast({
        title: "Tipo de Disponibilidade Excluído",
        description: `O tipo "${typeToDelete.name}" foi removido.`,
      });
    } catch (error: any) {
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    }
  };
  
  const getRuleSummary = (schedule: any): string => {
    if (!schedule) return "N/A";
    const activeDays = Object.entries(schedule)
      .filter(([_, dayDetails]) => (dayDetails as any).active && (dayDetails as any).intervals?.length > 0 && (dayDetails as any).intervals[0].start)
      .map(([dayKey, dayDetails]) => {
        const dayLabel = dayKey.substring(0,3).toUpperCase();
        const intervals = (dayDetails as any).intervals
          .map((int: any) => `${int.start}-${int.end}`)
          .join(', ');
        return `${dayLabel}: ${intervals}`;
      });
    return activeDays.length > 0 ? activeDays.slice(0, 2).join('; ') + (activeDays.length > 2 ? '...' : '') : "Nenhum horário definido";
  };


  if (isLoading && availabilityTypes.length === 0) {
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
                <div className="space-y-2 flex-grow">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
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
            <ListChecks className="mr-3 h-8 w-8 text-primary" /> Gerenciar Tipos de Disponibilidade
          </CardTitle>
          <CardDescription>Crie e gerencie modelos de horários que podem ser vinculados aos seus serviços.</CardDescription>
        </CardHeader>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/company">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/company/availability-types/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Tipo
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
         {isLoading && availabilityTypes.length > 0 && <div className="text-center my-4"><Loader2 className="h-6 w-6 animate-spin inline-block"/> Carregando mais...</div>}
          {!isLoading && availabilityTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum tipo de disponibilidade cadastrado.</p>
              <Button asChild>
                <Link href="/dashboard/company/availability-types/add">
                  <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar Primeiro Tipo
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Resumo das Regras</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availabilityTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{type.description}</TableCell>
                    <TableCell><Badge variant="secondary">{getRuleSummary(type.schedule)}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild title="Editar tipo">
                        <Link href={`/dashboard/company/availability-types/edit/${type.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Excluir tipo">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o tipo de disponibilidade "{type.name}"? Esta ação não poderá ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteType(type.id!)}
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

    