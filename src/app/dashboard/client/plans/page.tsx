
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Package, CreditCard, Barcode, QrCode, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from '@/lib/constants';
import type { Plan } from '@/lib/types'; // Importando o tipo Plan
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

const initialMockPlans: Plan[] = [
  { id: "plan_basic_01", nome: "Plano Básico", descricao: "Ideal para começar suas atividades.", preco: 49.90, duracao: "mensal", recursos: ["1 Profissional", "100 Agendamentos/mês", "Suporte por E-mail"], ativo: true },
  { id: "plan_pro_02", nome: "Plano Profissional", descricao: "Perfeito para negócios em crescimento.", preco: 99.90, duracao: "mensal", recursos: ["5 Profissionais", "500 Agendamentos/mês", "Notificações IA", "Página da Empresa"], ativo: true },
  { id: "plan_anual_basic_04", nome: "Plano Básico Anual", descricao: "Economize com o plano anual e tenha os mesmos benefícios do mensal.", preco: 499.00, duracao: "anual", recursos: ["1 Profissional", "100 Agendamentos/mês", "Suporte por E-mail"], ativo: true },
  { id: "plan_premium_03", nome: "Plano Premium", descricao: "Solução completa para grandes empresas.", preco: 199.90, duracao: "mensal", recursos: ["Profissionais Ilimitados", "Agendamentos Ilimitados", "Suporte Prioritário", "API de Integração"], ativo: false }, // Exemplo de plano inativo
];

export default function ClientPlansPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cartao");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<{planId: string | null, status: string | null}>({planId: null, status: null}); // Mock

  useEffect(() => {
    document.title = `Planos de Assinatura - ${APP_NAME}`;
    // Simular carregamento e buscar assinatura atual
    setIsLoading(true);
    setTimeout(() => {
      setPlans(initialMockPlans.filter(p => p.ativo)); // Apenas planos ativos para o cliente
      // Simular busca de assinatura atual do usuário
      const mockUserSubscription = localStorage.getItem('tds_user_subscription_mock');
      if (mockUserSubscription) {
        setCurrentSubscription(JSON.parse(mockUserSubscription));
      }
      setIsLoading(false);
    }, 700);
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    if (currentSubscription?.planId === plan.id && currentSubscription?.status === 'confirmado') {
        toast({ title: "Plano Atual", description: `Você já está inscrito no ${plan.nome}.` });
        return;
    }
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);

    console.log("BACKEND_SIM (CLIENT): Iniciando assinatura do plano:", {
      planId: selectedPlan.id,
      planName: selectedPlan.nome,
      paymentMethod: paymentMethod,
    });
    // Simulação de processamento de pagamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular resposta do backend
    const newSubscription = {
        planId: selectedPlan.id,
        status: "confirmado", // ou 'pendente' se boleto/pix e aguardando confirmação
        paymentId: `trans_${Date.now()}`,
    };
    localStorage.setItem('tds_user_subscription_mock', JSON.stringify(newSubscription));
    setCurrentSubscription(newSubscription);

    toast({
      title: "Assinatura Confirmada! (Simulação)",
      description: `Você assinou o ${selectedPlan.nome} com ${paymentMethod}. Detalhes seriam enviados por e-mail.`,
    });

    setIsProcessing(false);
    setIsDialogOpen(false);
    setSelectedPlan(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <CardHeader className="p-0">
          <Skeleton className="h-10 w-3/5" />
          <Skeleton className="h-6 w-4/5 mt-2" />
        </CardHeader>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <Card key={i} className="flex flex-col justify-between">
              <CardHeader><Skeleton className="h-7 w-1/2" /><Skeleton className="h-5 w-3/4 mt-2" /></CardHeader>
              <CardContent className="flex-grow"><Skeleton className="h-12 w-full" /></CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <CardHeader className="p-0 text-center md:text-left">
        <div className='flex items-center justify-center md:justify-start'>
          <Package className="mr-3 h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-3xl font-bold">Nossos Planos de Assinatura</CardTitle>
            <CardDescription>Escolha o plano que melhor se adapta às suas necessidades.</CardDescription>
          </div>
        </div>
      </CardHeader>

      {currentSubscription.planId && currentSubscription.status === 'confirmado' && (
        <Card className="bg-green-50 border-green-200 shadow-md">
            <CardHeader className="flex-row items-center gap-3">
                <CheckCircle className="h-7 w-7 text-green-600" />
                <div>
                    <CardTitle className="text-xl text-green-700">Você já tem um plano ativo!</CardTitle>
                    <CardDescription className="text-green-600">
                        Seu plano atual é o <strong>{plans.find(p=>p.id === currentSubscription.planId)?.nome || 'Desconhecido'}</strong>.
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}

      {plans.length === 0 ? (
         <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum plano disponível no momento. Por favor, volte mais tarde.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={`flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow ${currentSubscription?.planId === plan.id && currentSubscription?.status === 'confirmado' ? 'border-2 border-primary' : ''}`}>
              <CardHeader>
                <CardTitle className="text-xl">{plan.nome}</CardTitle>
                <CardDescription className="text-sm h-12 overflow-hidden">{plan.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold text-primary mb-4">
                  R$ {plan.preco.toFixed(2)}
                  <span className="text-base font-normal text-muted-foreground">/{plan.duracao}</span>
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {plan.recursos.map((recurso, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" />
                      {recurso}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                    className="w-full" 
                    onClick={() => handleSelectPlan(plan)}
                    disabled={currentSubscription?.planId === plan.id && currentSubscription?.status === 'confirmado'}
                >
                  {currentSubscription?.planId === plan.id && currentSubscription?.status === 'confirmado' ? 'Plano Atual' : 'Selecionar Plano'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedPlan && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Confirmar Assinatura: {selectedPlan.nome}</DialogTitle>
              <DialogDescription>
                Revise os detalhes do plano e escolha a forma de pagamento.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div>
                <h4 className="font-semibold">Detalhes do Plano:</h4>
                <p><strong>Preço:</strong> R$ {selectedPlan.preco.toFixed(2)} / {selectedPlan.duracao}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {selectedPlan.recursos.map((rec, i) => <li key={i} className="flex items-center"><CheckCircle className="mr-2 h-3 w-3 text-green-500"/>{rec}</li>)}
                </ul>
              </div>
              
              <div>
                <Label className="font-semibold block mb-2">Forma de Pagamento:</Label>
                <RadioGroup defaultValue={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                  <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 has-[:checked]:bg-accent has-[:checked]:text-accent-foreground">
                    <RadioGroupItem value="cartao" id="pay-cartao" />
                    <Label htmlFor="pay-cartao" className="cursor-pointer flex items-center gap-2 w-full"><CreditCard className="h-5 w-5"/> Cartão de Crédito/Débito</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 has-[:checked]:bg-accent has-[:checked]:text-accent-foreground">
                    <RadioGroupItem value="pix" id="pay-pix" />
                    <Label htmlFor="pay-pix" className="cursor-pointer flex items-center gap-2 w-full"><QrCode className="h-5 w-5"/> Pix</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 has-[:checked]:bg-accent has-[:checked]:text-accent-foreground">
                    <RadioGroupItem value="boleto" id="pay-boleto" />
                    <Label htmlFor="pay-boleto" className="cursor-pointer flex items-center gap-2 w-full"><Barcode className="h-5 w-5"/> Boleto Bancário</Label>
                  </div>
                </RadioGroup>
              </div>
              <p className="text-xs text-muted-foreground">
                Ao confirmar, você concorda com nossos <Link href="/terms" className="underline hover:text-primary">Termos de Serviço</Link>.
                Para pagamentos online, você será redirecionado para um ambiente seguro (simulação).
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isProcessing}>Cancelar</Button>
              </DialogClose>
              <Button onClick={handleConfirmSubscription} disabled={isProcessing}>
                {isProcessing ? "Processando..." : "Confirmar Assinatura e Pagar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
