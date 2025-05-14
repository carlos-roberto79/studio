
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { Mail, Phone, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: `Contato - ${APP_NAME}`,
  description: `Entre em contato com a equipe do ${APP_NAME}. Estamos aqui para ajudar!`,
};

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Entre em Contato</CardTitle>
          <CardDescription>
            Tem alguma dúvida ou sugestão? Preencha o formulário abaixo ou utilize nossos outros canais de comunicação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Seu Nome</label>
              <Input id="name" placeholder="João Silva" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Seu E-mail</label>
              <Input type="email" id="email" placeholder="voce@exemplo.com" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">Assunto</label>
              <Input id="subject" placeholder="Dúvida sobre agendamento" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">Sua Mensagem</label>
              <Textarea id="message" placeholder="Escreva sua mensagem aqui..." rows={5} />
            </div>
            <Button type="submit" className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" /> Enviar Mensagem
            </Button>
          </form>
          <div className="text-center">
            <p className="text-muted-foreground">Ou se preferir:</p>
            <p className="flex items-center justify-center mt-2">
              <Mail className="mr-2 h-5 w-5 text-primary" /> suporte@easyagenda.com
            </p>
            <p className="flex items-center justify-center mt-1">
              <Phone className="mr-2 h-5 w-5 text-primary" /> (123) 456-7890
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
