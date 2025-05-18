
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, PackagePlus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from '@/lib/constants';
import type { Plan } from '@/lib/types'; // Importando o tipo Plan
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

const initialMockPlans: Plan[] = [
  { id: "plan_basic_01", nome: "Plano Básico", descricao: "Ideal para começar.", preco: 49.90, duracao: "mensal", recursos: ["1 Profissional", "100 Agendamentos/mês", "Suporte por E-mail"], ativo: true },
  { id: "plan_pro_02", nome: "Plano Profissional", descricao: "Para negócios em crescimento.", preco: 99.90, duracao: "mensal", recursos: ["5 Profissionais", "500 Agendamentos/mês", "Notificações IA", "Página da Empresa"], ativo: true },
  { id: "plan_premium_03", nome: "Plano Premium", descricao: "Solução completa para grandes empresas.", preco: 199.90, duracao: "mensal", recursos: ["Profissionais Ilimitados", "Agendamentos Ilimitados", "Suporte Prioritário", "API de Integração"], ativo: false },
  { id: "plan_anual_basic_04", nome: "Plano Básico Anual", descricao: "Economize com o plano anual.", preco: 499.00, duracao: "anual", recursos: ["1 Profissional", "100 Agendamentos/mês", "Suporte por E-mail"], ativo: true },
];

export default function ManagePlansPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = `Gerenciar Planos - Painel Site Admin - ${APP_NAME}`;
    // Simular carregamento de dados
    setTimeout(() => {
      setPlans(initialMockPlans);
      setIsLoading(false);
    }, 500);
  }, []);

  const togglePlanStatus = (planId: string) => {
    setPlans(prevPlans =>
      prevPlans.map(plan =>
        plan.id === planId ? { ...plan, ativo: !plan.ativo } : plan
      )
    );
    const plan = plans.find(p => p.id === planId);
    toast({
      title: `Status do Plano Alterado`,
      description: `O plano "${plan?.nome}" foi ${plan?.ativo ? "desativado" : "ativado"} (simulação).`,
    });
  };

  const handleDeletePlan = (planId: string) => {
    const planName = plans.find(p => p.id === planId)?.nome;
    setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
    toast({
      title: "Plano Excluído",
      description: `O plano "${planName}" foi excluído (simulação).`,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return <div className="text-center p-10">Carregando planos...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardHeader className="p-0">
          <div className='flex items-center'>
            <PackagePlus className="mr-3 h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Gerenciar Planos de Assinatura</CardTitle>
              <CardDescription>Crie, edite e gerencie os planos disponíveis para as empresas.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Button asChild>
          <Link href="/site-admin/plans/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Plano
          </Link>
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum plano cadastrado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{plan.nome}</CardTitle>
                  <Badge variant={plan.ativo ? "default" : "outline"} className={plan.ativo ? "bg-green-500 text-white" : "border-destructive text-destructive"}>
                    {plan.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription className="text-sm h-10 overflow-hidden">{plan.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-2xl font-bold text-primary">
                  R$ {plan.preco.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">/{plan.duracao}</span>
                </p>
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {plan.recursos.map((recurso, index) => (
                    <li key={index} className="flex items-center">
                      <PlusCircle className="mr-2 h-3 w-3 text-green-500 flex-shrink-0" />
                      {recurso}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`status-${plan.id}`}
                    checked={plan.ativo}
                    onCheckedChange={() => togglePlanStatus(plan.id)}
                    aria-label={plan.ativo ? "Desativar plano" : "Ativar plano"}
                  />
                  <label htmlFor={`status-${plan.id}`} className="text-xs text-muted-foreground cursor-pointer">
                    {plan.ativo ? <EyeOff className="inline mr-1 h-3 w-3"/> : <Eye className="inline mr-1 h-3 w-3"/>}
                    {plan.ativo ? "Desativar" : "Ativar"}
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/site-admin/plans/edit/${plan.id}`}>
                      <Edit className="mr-1 h-3 w-3" /> Editar
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-1 h-3 w-3" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o plano "{plan.nome}"? Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePlan(plan.id)} className="bg-destructive hover:bg-destructive/90">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
