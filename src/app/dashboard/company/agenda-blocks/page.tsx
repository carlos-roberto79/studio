
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlusCircle, Edit, Trash2, CalendarOff, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME, USER_ROLES } from '@/lib/constants';
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
import { getCompanyDetailsByOwner, getAgendaBlocksByCompany, deleteAgendaBlock, updateAgendaBlock, type AgendaBlockData } from "@/services/supabaseService";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";

export default function AgendaBlocksListPage() {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<AgendaBlockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = `Bloqueios de Agenda - ${APP_NAME}`;
    if (user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
      getCompanyDetailsByOwner(user.id).then(companyDetails => {
        if (companyDetails && companyDetails.id) {
          setCompanyId(companyDetails.id);
          fetchAgendaBlocks(companyDetails.id);
        } else {
          toast({ title: "Erro", description: "Empresa não encontrada.", variant: "destructive" });
          setIsLoading(false);
        }
      });
    } else {
      setIsLoading(false);
    }
  }, [user, role, toast]);

  const fetchAgendaBlocks = async (currentCompanyId: string) => {
    setIsLoading(true);
    try {
      const fetchedBlocks = await getAgendaBlocksByCompany(currentCompanyId);
      setBlocks(fetchedBlocks);
    } catch (error: any) {
      toast({ title: "Erro ao buscar bloqueios", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    const blockToDelete = blocks.find(b => b.id === blockId);
    if (!blockToDelete) return;

    try {
      await deleteAgendaBlock(blockId);
      setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
      toast({
        title: "Bloqueio Excluído",
        description: `O bloqueio "${blockToDelete.reason}" foi removido.`,
      });
    } catch (error: any) {
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    }
  };
  
  const toggleBlockStatus = async (blockId: string) => {
    const blockToToggle = blocks.find(b => b.id === blockId);
    if (!blockToToggle) return;

    const newStatus = !blockToToggle.active;
    try {
      const updatedBlock = await updateAgendaBlock(blockId, { active: newStatus });
      if (updatedBlock) {
        setBlocks(prevBlocks => prevBlocks.map(b => b.id === blockId ? { ...b, active: newStatus } : b));
        toast({
          title: `Status Alterado`,
          description: `O bloqueio "${blockToToggle.reason}" foi ${newStatus ? "ativado" : "desativado"}.`,
        });
      }
    } catch (error: any) {
      toast({ title: "Erro ao Alterar Status", description: error.message, variant: "destructive" });
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data inválida";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  if (isLoading && blocks.length === 0) {
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
                <div className="space-y-2 flex-grow"> <Skeleton className="h-4 w-1/5" /> <Skeleton className="h-3 w-3/5" /></div>
                <Skeleton className="h-6 w-20" /> <Skeleton className="h-8 w-24" />
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
            <CalendarOff className="mr-3 h-8 w-8 text-primary" /> Gerenciar Bloqueios de Agenda
          </CardTitle>
          <CardDescription>Crie, edite e visualize períodos em que não haverá agendamentos disponíveis.</CardDescription>
        </CardHeader>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/company">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/company/agenda-blocks/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Bloqueio
            </Link>
          </Button>
        </div>
      </div>
      
      <Card className="shadow-sm border-blue-500/50 bg-blue-500/5">
        <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                    Bloqueios de agenda impedem que clientes ou a equipe agendem horários nos períodos definidos.
                    Bloqueios para "Empresa Inteira" afetam todos os profissionais e serviços.
                    Bloqueios para "Profissional Específico" afetam apenas a agenda daquele profissional.
                </p>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardContent className="pt-6">
          {isLoading && blocks.length > 0 && <div className="text-center my-4"><Loader2 className="h-6 w-6 animate-spin inline-block"/> Carregando mais...</div>}
          {!isLoading && blocks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum bloqueio de agenda cadastrado.</p>
              <Button asChild>
                <Link href="/dashboard/company/agenda-blocks/add">
                  <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar Primeiro Bloqueio
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alvo</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-center">Repete</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell className="font-medium">
                      {block.target_type === "empresa" ? "Empresa Inteira" : `Prof: ${(block as any).professionalName || "N/A"}`}
                    </TableCell>
                    <TableCell>{formatDate(block.start_time)}</TableCell>
                    <TableCell>{formatDate(block.end_time)}</TableCell>
                    <TableCell className="max-w-xs truncate">{block.reason}</TableCell>
                    <TableCell className="text-center">{block.repeats_weekly ? <Badge variant="outline">Semanal</Badge> : "Não"}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        id={`status-${block.id}`}
                        checked={block.active}
                        onCheckedChange={() => toggleBlockStatus(block.id!)}
                        aria-label={block.active ? "Desativar bloqueio" : "Ativar bloqueio"}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild title="Editar bloqueio">
                        <Link href={`/dashboard/company/agenda-blocks/edit/${block.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Excluir bloqueio">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o bloqueio "{block.reason}"? Esta ação não poderá ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBlock(block.id!)}
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

    