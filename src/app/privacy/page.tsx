
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { ShieldCheck } from "lucide-react";
import React, { useEffect } from 'react';

export const metadata: Metadata = {
  title: `Política de Privacidade - ${APP_NAME}`,
  description: `Entenda como o ${APP_NAME} coleta, usa e protege suas informações pessoais.`,
};

export default function PrivacyPolicyPage() {
  useEffect(() => {
    // Client-side effects if needed
  }, []);

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center mb-4">
            <ShieldCheck className="h-10 w-10 text-primary mr-3" />
            <CardTitle className="text-3xl font-bold">Política de Privacidade</CardTitle>
          </div>
          <CardDescription>
            Sua privacidade é importante para nós. Esta política explica como coletamos, usamos,
            compartilhamos e protegemos suas informações pessoais.
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert">
          <h2>1. Informações que Coletamos</h2>
          <p>
            Coletamos informações que você nos fornece diretamente, como quando você cria uma conta,
            agenda um horário, ou se comunica conosco. Isso pode incluir:
            <ul>
              <li>Nome, endereço de e-mail, número de telefone.</li>
              <li>Detalhes da empresa (para Administradores de Empresa e Profissionais), como nome da empresa, CNPJ, endereço.</li>
              <li>Informações de agendamento, como serviços selecionados, datas e horários.</li>
              <li>Qualquer outra informação que você decida nos fornecer.</li>
            </ul>
          </p>
          <p>
            Também podemos coletar automaticamente certas informações quando você usa nossa Plataforma,
            como seu endereço IP, tipo de navegador, informações do dispositivo e dados de uso.
          </p>

          <h2>2. Como Usamos Suas Informações</h2>
          <p>
            Usamos as informações que coletamos para:
            <ul>
              <li>Fornecer, operar e manter nossa Plataforma.</li>
              <li>Processar seus agendamentos e outras transações.</li>
              <li>Melhorar, personalizar e expandir nossa Plataforma.</li>
              <li>Entender e analisar como você usa nossa Plataforma.</li>
              <li>Desenvolver novos produtos, serviços, recursos e funcionalidades.</li>
              <li>Comunicar com você, diretamente ou através de um de nossos parceiros, incluindo para atendimento ao cliente, para fornecer atualizações e outras informações relacionadas à Plataforma, e para fins de marketing e promocionais (com seu consentimento, quando exigido por lei).</li>
              <li>Enviar e-mails e notificações.</li>
              <li>Encontrar e prevenir fraudes.</li>
            </ul>
          </p>

          <h2>3. Compartilhamento de Informações</h2>
          <p>
            Podemos compartilhar suas informações nas seguintes situações:
            <ul>
              <li>Com provedores de serviços: Podemos compartilhar suas informações com fornecedores terceirizados que prestam serviços em nosso nome, como processamento de pagamentos, análise de dados, hospedagem e marketing.</li>
              <li>Com empresas e profissionais: Se você é um cliente, suas informações de agendamento serão compartilhadas com a empresa e/ou profissional com quem você está agendando.</li>
              <li>Para conformidade legal: Podemos divulgar suas informações se formos obrigados por lei ou em resposta a solicitações válidas de autoridades públicas.</li>
              <li>Transferências de negócios: Se estivermos envolvidos em uma fusão, aquisição ou venda de ativos, suas informações podem ser transferidas.</li>
            </ul>
          </p>

          <h2>4. Segurança de Dados</h2>
          <p>
            Empregamos medidas de segurança razoáveis para proteger suas informações pessoais contra acesso,
            uso ou divulgação não autorizados. No entanto, nenhum método de transmissão pela Internet ou
            método de armazenamento eletrônico é 100% seguro.
          </p>

          <h2>5. Seus Direitos de Privacidade</h2>
          <p>
            Dependendo da sua localização, você pode ter certos direitos em relação às suas informações
            pessoais, como o direito de acessar, corrigir ou excluir seus dados. Para exercer esses
            direitos, entre em contato conosco.
          </p>

          <h2>6. Cookies e Tecnologias de Rastreamento</h2>
          <p>
            Usamos cookies e tecnologias de rastreamento semelhantes para rastrear a atividade em nossa
            Plataforma e manter certas informações. Você pode instruir seu navegador a recusar todos os
            cookies ou a indicar quando um cookie está sendo enviado.
          </p>

          <h2>7. Alterações a Esta Política de Privacidade</h2>
          <p>
            Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos você sobre
            quaisquer alterações publicando a nova Política de Privacidade nesta página.
          </p>

          <h2>8. Contato</h2>
          <p>
            Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco em privacidade@tdsagenda.com.
          </p>
          <p className="text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </CardContent>
      </Card>
    </div>
  );
}

