
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/constants";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { ArrowLeft, PlusCircle, Edit, Trash2, ListChecks } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AvailabilityType {
  id: string;
  name: string;
  description: string;
  ruleSummary: string; // Resumo das regras para exibição
}

const mockAvailabilityTypes: AvailabilityType[] = [
  { id: "type1", name: "Horário Comercial Padrão", description: "Segunda a Sexta, das 9h às 18h, com pausa para almoço.", ruleSummary: "Seg-Sex 9-18h (Almoço 12-13h)" },
  { id: "type2", name: "Plantão Final de Semana", description: "Sábados e Domingos, horários específicos sob demanda.", ruleSummary: "Sáb/Dom - Flexível" },
  { id: "type3", name: "Horário Noturno Reduzido", description: "Segunda a Quinta, das 18h às 21h.", ruleSummary: "Seg-Qui 18-21h" },
];

export default function AvailabilityTypesPage() {
  const { toast } = useToast();
  const [availabilityTypes, setAvailabilityTypes] = useState(mockAvailabilityTypes);

  useEffect(() => {
    document.title = `Tipos de Disponibilidade - ${APP_NAME}`;
    console.log("BACKEND_SIM: Buscando lista de tipos de disponibilidade...");
  }, []);

  const handleDeleteType = (typeId: string) => {
    console.log("BACKEND_SIM: Enviando solicitação para excluir tipo de disponibilidade ID:", typeId);
    setAvailabilityTypes(prev => prev.filter(type => type.id !== typeId));
    toast({
      title: "Tipo de Disponibilidade Excluído (Simulação)",
      description: "O tipo foi removido da sua lista (simulação frontend).",
    });
  };

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
          {availabilityTypes.length > 0 ? (
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
                    <TableCell><Badge variant="secondary">{type.ruleSummary}</Badge></TableCell>
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
                              onClick={() => handleDeleteType(type.id)}
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
              <p className="text-muted-foreground mb-4">Nenhum tipo de disponibilidade cadastrado.</p>
              <Button asChild>
                <Link href="/dashboard/company/availability-types/add">
                  <PlusCircle className="mr-2 h-4 w-4" /> Cadastrar Primeiro Tipo
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
