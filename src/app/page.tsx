
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, CalendarDays, BellRing, Building } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Autenticação de Usuários",
      description: "Login seguro para clientes, profissionais e empresas com acesso baseado em função.",
    },
    {
      icon: <Building className="h-10 w-10 text-primary" />,
      title: "Cadastro de Empresas",
      description: "Fácil integração de empresas com links públicos de agendamento personalizados.",
    },
    {
      icon: <CalendarDays className="h-10 w-10 text-primary" />,
      title: "Agendamento de Consultas",
      description: "Agendamento intuitivo, disponibilidade de profissionais e evitação de conflitos em tempo real.",
    },
    {
      icon: <BellRing className="h-10 w-10 text-primary" />,
      title: "Notificações Inteligentes",
      description: "Notificações personalizadas e alimentadas por IA para confirmações, lembretes e atualizações.",
    },
  ];

  const pricingPlans = [
    { 
      name: "Básico", 
      price: "Grátis", 
      features: ["1 Profissional", "50 Agendamentos/mês", "Notificações Básicas"],
      ctaText: "Comece Gratuitamente",
      ctaLink: "/signup",
      variant: "outline" as "outline" | "default",
    },
    { 
      name: "Pro", 
      price: "R$29/mês", 
      features: ["5 Profissionais", "500 Agendamentos/mês", "Notificações Inteligentes", "Página da Empresa"],
      ctaText: "Assinar Plano Pro",
      ctaLink: "/signup",
      variant: "default" as "outline" | "default",
    },
    { 
      name: "Empresarial", 
      price: "Personalizado", 
      features: ["Profissionais Ilimitados", "Agendamentos Ilimitados", "Suporte Dedicado", "Acesso API"],
      ctaText: "Contatar Vendas",
      ctaLink: "/contact",
      variant: "outline" as "outline" | "default",
    },
  ];

  return (
    <div className="flex flex-col ">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Agendamento <span className="text-primary">Sem Esforço</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            TDS+Agenda ajuda você a gerenciar agendamentos de forma transparente. Concentre-se em seus clientes,
            nós cuidamos das complexidades do agendamento.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" asChild>
              <Link href="/signup">Comece Gratuitamente</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#features">Saiba Mais</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground">
            Por que Escolher o TDS+Agenda?
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-center text-muted-foreground">
            Recursos poderosos projetados para sua conveniência e eficiência.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works / Visual Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Otimize Seu Fluxo de Trabalho
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                TDS+Agenda simplifica cada etapa do processo de agendamento, da reserva aos lembretes.
                Nossa interface intuitiva garante uma experiência tranquila para você e seus clientes.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Reduza não comparecimentos com lembretes automatizados.",
                  "Gerencie múltiplos profissionais e locais.",
                  "Acesse sua agenda a qualquer hora, em qualquer lugar.",
                  "Obtenha insights com relatórios abrangentes."
                ].map(item => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="mt-8" asChild>
                <Link href="/register-company">Cadastre Sua Empresa</Link>
              </Button>
            </div>
            <div>
              <Image
                src="https://placehold.co/600x450.png?text=Painel+TDS+Agenda"
                alt="Prévia do Painel TDS+Agenda"
                width={600}
                height={450}
                className="rounded-lg shadow-2xl"
                data-ai-hint="dashboard interface"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section Placeholder */}
      <section id="pricing" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Preços Simples e Transparentes</h2>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
            Escolha um plano que se adapte às suas necessidades. Sem taxas ocultas, nunca.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {pricingPlans.map(plan => (
              <Card key={plan.name} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-primary">{plan.name}</CardTitle>
                  <p className="text-4xl font-bold text-foreground mt-2">{plan.price}</p>
                  {plan.name === "Pro" && <p className="text-sm text-muted-foreground">por mês</p>}
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground my-6">
                    {plan.features.map(f => <li key={f} className="flex items-center"><CheckCircle className="h-5 w-5 text-primary mr-2"/>{f}</li>)}
                  </ul>
                  <Button className="w-full" variant={plan.variant} asChild>
                    <Link href={plan.ctaLink}>{plan.ctaText}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Pronto para Simplificar Seus Agendamentos?
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-lg">
            Junte-se a centenas de empresas e profissionais que confiam no TDS+Agenda.
            Cadastre-se hoje e sinta a diferença.
          </p>
          <Button size="lg" variant="secondary" className="mt-10" asChild>
            <Link href="/signup">Cadastre-se Agora</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
