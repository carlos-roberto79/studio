
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlusCircle, Edit, Trash2, CalendarOff, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from '@/lib/constants';
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
import type { AgendaBlock } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data - Adicionar alguns exemplos
const mockInitialBlocks: AgendaBlock[] = [
    { id: "block1", targetType: "empresa", inicio: new Date(Date.now() + 86400000 * 2).toISOString(), fim: new Date(Date.now() + 86400000 * 2 + 3600000 * 3).toISOString(), motivo: "Feriado Nacional", repetirSemanalmente: false, ativo: true },
    { id: "block2", targetType: "profissional", profissionalId: "prof1", profissionalNome: "Dr. João Silva", inicio: new Date(Date.now() + 86400000 * 5).toISOString(), fim: new Date(Date.now() + 86400000 * 5 + 3600000).toISOString(), motivo: "Almoço Dr. João", repetirSemanalmente: true, ativo: true },
    { id: "block3", targetType: "empresa", inicio: new Date(Date.now() - 86400000 * 1).toISOString(), fim: new Date(Date.now() - 86400000 * 1 + 3600000 * 2).toISOString(), motivo: "Manutenção Sistema (Passado)", repetirSemanalmente: false, ativo: false },
];


export default function AgendaBlocksListPage() {
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<AgendaBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = `Bloqueios de Agenda - ${APP_NAME}`;
    // Simular carregamento de dados
    setIsLoading(true);
    setTimeout(() => {
      const storedBlocks = localStorage.getItem('tds_agenda_blocks_mock');
      if (storedBlocks) {
        setBlocks(JSON.parse(storedBlocks));
      } else {
        setBlocks(mockInitialBlocks);
        localStorage.setItem('tds_agenda_blocks_mock', JSON.stringify(mockInitialBlocks));
      }
      setIsLoading(false);
    }, 700);
  }, []);

  const updateLocalStorage = (updatedBlocks: AgendaBlock[]) => {
    localStorage.setItem('tds_agenda_blocks_mock', JSON.stringify(updatedBlocks));
  };

  const handleDeleteBlock = (blockId: string) => {
    const blockToDelete = blocks.find(b => b.id === blockId);
    if (!blockToDelete) return;

    console.log("BACKEND_SIM: Excluindo bloqueio ID:", blockId);
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    setBlocks(updatedBlocks);
    updateLocalStorage(updatedBlocks);
    toast({
      title: "Bloqueio Excluído (Simulação)",
      description: `O bloqueio "${blockToDelete.motivo}" foi removido.`,
      variant: "destructive",
    });
  };
  
  const toggleBlockStatus = (blockId: string) => {
    const blockToToggle = blocks.find(b => b.id === blockId);
    if (!blockToToggle) return;

    const newStatus = !blockToToggle.ativo;
    console.log(`BACKEND_SIM: Alterando status do bloqueio ID ${blockId} para ${newStatus ? 'ativo' : 'inativo'}`);
    const updatedBlocks = blocks.map(b => b.id === blockId ? { ...b, ativo: newStatus } : b);
    setBlocks(updatedBlocks);
    updateLocalStorage(updatedBlocks);
    toast({
      title: `Status Alterado (Simulação)`,
      description: `O bloqueio "${blockToToggle.motivo}" foi ${newStatus ? "ativado" : "desativado"}.`,
    });
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">Carregando bloqueios de agenda...</div>;
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
          {blocks.length > 0 ? (
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
                      {block.targetType === "empresa" ? "Empresa Inteira" : `Prof: ${block.profissionalNome || "N/A"}`}
                    </TableCell>
                    <TableCell>{formatDate(block.inicio)}</TableCell>
                    <TableCell>{formatDate(block.fim)}</TableCell>
                    <TableCell className="max-w-xs truncate">{block.motivo}</TableCell>
                    <TableCell className="text-center">{block.repetirSemanalmente ? <Badge variant="outline">Semanal</Badge> : "Não"}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        id={`status-${block.id}`}
                        checked={block.ativo}
                        onCheckedChange={() => toggleBlockStatus(block.id)}
                        aria-label={block.ativo ? "Desativar bloqueio" : "Ativar bloqueio"}
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
                              Tem certeza que deseja excluir o bloqueio "{block.motivo}"? Esta ação não poderá ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBlock(block.id)}
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
              <p className="text-muted-foreground mb-4">Nenhum bloqueio de agenda cadastrado.</p>
              <Button asChild>
                <Link href="/dashboard/company/agenda-blocks/add">
                  <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar Primeiro Bloqueio
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
