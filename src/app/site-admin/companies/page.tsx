
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Lock, Unlock, Search, Briefcase } from "lucide-react";
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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

interface ManagedCompany {
  id: string;
  name: string;
  email: string;
  paymentStatus: "Pago" | "Pendente" | "Atrasado";
  plan: "Básico" | "Pro" | "Empresarial";
  isBlocked: boolean;
}

const initialMockCompanies: ManagedCompany[] = [
  { id: "comp1", name: "Salão Cortes Modernos", email: "contato@cortesmodernos.com", paymentStatus: "Pago", plan: "Pro", isBlocked: false },
  { id: "comp2", name: "Clínica Sorriso Feliz", email: "adm@sorrisofeliz.com", paymentStatus: "Pendente", plan: "Básico", isBlocked: false },
  { id: "comp3", name: "Academia Corpo em Movimento", email: "financeiro@corpoemmovimento.com", paymentStatus: "Atrasado", plan: "Empresarial", isBlocked: true },
  { id: "comp4", name: "Consultoria Mentes Brilhantes", email: "suporte@mentesbrilhantes.com", paymentStatus: "Pago", plan: "Pro", isBlocked: false },
];

export default function ManageCompaniesPage() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<ManagedCompany[]>(initialMockCompanies);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = `Gerenciar Empresas - Painel Site Admin - ${APP_NAME}`;
    // Em uma aplicação real, aqui seriam buscadas as empresas do backend.
    // Por agora, usamos initialMockCompanies.
  }, []);

  const handleToggleBlockCompany = (companyId: string) => {
    setCompanies(prevCompanies =>
      prevCompanies.map(company =>
        company.id === companyId ? { ...company, isBlocked: !company.isBlocked } : company
      )
    );
    const company = companies.find(c => c.id === companyId);
    toast({
      title: `Empresa ${company?.isBlocked ? "Desbloqueada" : "Bloqueada"}`,
      description: `A empresa "${company?.name}" foi ${company?.isBlocked ? "desbloqueada" : "bloqueada"} com sucesso (simulação).`,
    });
  };

  const handleDeleteCompany = (companyId: string) => {
    const companyName = companies.find(c => c.id === companyId)?.name;
    setCompanies(prevCompanies => prevCompanies.filter(company => company.id !== companyId));
    toast({
      title: "Empresa Excluída",
      description: `A empresa "${companyName}" foi excluída (simulação).`,
      variant: "destructive",
    });
  };
  
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className='flex items-center'>
            <Briefcase className="mr-3 h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Gestão de Empresas</CardTitle>
              <CardDescription>Visualize e gerencie todas as empresas cadastradas na plataforma.</CardDescription>
            </div>
          </div>
          <Button asChild>
            <Link href="/site-admin/companies/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Empresa
            </Link>
          </Button>
        </div>
      </CardHeader>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Buscar empresa por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredCompanies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Empresa</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status Pagamento</TableHead>
                  <TableHead>Status Sistema</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell><Badge variant="secondary">{company.plan}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={
                        company.paymentStatus === "Pago" ? "default" :
                        company.paymentStatus === "Pendente" ? "outline" : "destructive"
                      }
                      className={company.paymentStatus === "Pago" ? "bg-green-500 hover:bg-green-600" : company.paymentStatus === "Pendente" ? "border-yellow-500 text-yellow-600" : "" }
                      >
                        {company.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={company.isBlocked ? "destructive" : "default"} className={company.isBlocked ? "" : "bg-green-500 hover:bg-green-600"}>
                        {company.isBlocked ? "Bloqueada" : "Ativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleBlockCompany(company.id)} title={company.isBlocked ? "Desbloquear Empresa" : "Bloquear Empresa"}>
                        {company.isBlocked ? <Unlock className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-red-600" />}
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Editar Empresa">
                        <Link href={`/site-admin/companies/edit/${company.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Excluir Empresa">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a empresa "{company.name}"? Esta ação não poderá ser desfeita e removerá todos os dados associados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteCompany(company.id)}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Excluir Permanentemente
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
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma empresa encontrada com os critérios de busca ou nenhuma empresa cadastrada.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
