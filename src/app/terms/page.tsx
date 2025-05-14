
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { FileText } from "lucide-react";
import React, { useEffect } from 'react';

export const metadata: Metadata = {
  title: `Termos de Serviço - ${APP_NAME}`,
  description: `Leia os termos de serviço para utilização da plataforma ${APP_NAME}.`,
};

export default function TermsPage() {
  useEffect(() => {
    // useEffect for client-side actions, e.g. setting document.title dynamically if needed elsewhere
    // For static title, metadata API is preferred for server components.
    // If this page becomes more dynamic, this hook is a good place.
  }, []);

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center mb-4">
            <FileText className="h-10 w-10 text-primary mr-3" />
            <CardTitle className="text-3xl font-bold">Termos de Serviço</CardTitle>
          </div>
          <CardDescription>
            Ao utilizar a plataforma {APP_NAME}, você concorda com os seguintes termos e condições.
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Bem-vindo ao {APP_NAME} ("Plataforma"). Ao acessar ou usar nossa Plataforma, você concorda em
            cumprir e estar vinculado a estes Termos de Serviço ("Termos"). Se você não concorda com estes
            Termos, não use nossa Plataforma.
          </p>

          <h2>2. Descrição do Serviço</h2>
          <p>
            {APP_NAME} é uma plataforma de software como serviço (SaaS) projetada para facilitar o agendamento
            de horários e o gerenciamento de compromissos para empresas, profissionais e seus clientes.
            Os recursos incluem, mas não se limitam a, criação de perfis de empresa, gerenciamento de
            profissionais, agendamento de clientes e notificações.
          </p>

          <h2>3. Contas de Usuário</h2>
          <p>
            Para acessar certos recursos da Plataforma, você pode ser obrigado a criar uma conta.
            Você é responsável por manter a confidencialidade das informações da sua conta, incluindo
            sua senha, e por todas as atividades que ocorrem em sua conta. Você concorda em notificar
            o {APP_NAME} imediatamente sobre qualquer uso não autorizado de sua conta ou qualquer outra
            violação de segurança.
          </p>
          <p>
            Distinguimos os seguintes tipos de usuários:
            <ul>
              <li><strong>Administradores de Empresa:</strong> Indivíduos que se registram em nome de uma empresa para gerenciar os serviços, profissionais e agendamentos da empresa.</li>
              <li><strong>Profissionais:</strong> Indivíduos associados a uma empresa que prestam serviços aos clientes.</li>
              <li><strong>Clientes:</strong> Indivíduos que usam a plataforma para agendar horários com empresas ou profissionais.</li>
            </ul>
          </p>

          <h2>4. Uso Aceitável</h2>
          <p>
            Você concorda em não usar a Plataforma para qualquer finalidade ilegal ou proibida por estes Termos.
            Você não pode usar a Plataforma de qualquer maneira que possa danificar, desabilitar, sobrecarregar
            ou prejudicar a Plataforma, ou interferir no uso e aproveitamento da Plataforma por qualquer outra parte.
          </p>

          <h2>5. Propriedade Intelectual</h2>
          <p>
            A Plataforma e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade
            exclusiva do {APP_NAME} e seus licenciadores. A Plataforma é protegida por direitos autorais,
            marcas registradas e outras leis do Brasil e de países estrangeiros.
          </p>

          <h2>6. Limitação de Responsabilidade</h2>
          <p>
            Em nenhuma circunstância o {APP_NAME}, nem seus diretores, funcionários, parceiros, agentes,
            fornecedores ou afiliados, serão responsáveis por quaisquer danos indiretos, incidentais,
            especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados,
            uso, goodwill ou outras perdas intangíveis, resultantes de (i) seu acesso ou uso ou incapacidade
            de acessar ou usar a Plataforma; (ii) qualquer conduta ou conteúdo de terceiros na Plataforma;
            (iii) qualquer conteúdo obtido da Plataforma; e (iv) acesso não autorizado, uso ou alteração
            de suas transmissões ou conteúdo, seja com base em garantia, contrato, ato ilícito (incluindo
            negligência) ou qualquer outra teoria legal, quer tenhamos sido informados ou não da
            possibilidade de tais danos.
          </p>

          <h2>7. Modificações nos Termos</h2>
          <p>
            Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos
            a qualquer momento. Se uma revisão for material, forneceremos um aviso com pelo menos 30 dias
            de antecedência antes que quaisquer novos termos entrem em vigor. O que constitui uma alteração
            material será determinado a nosso exclusivo critério.
          </p>

          <h2>8. Lei Aplicável</h2>
          <p>
            Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem consideração
            a seus conflitos de disposições legais.
          </p>

          <h2>9. Contato</h2>
          <p>
            Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em suporte@easyagenda.com.
          </p>
          <p className="text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
