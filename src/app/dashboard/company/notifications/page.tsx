
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from '@/lib/constants';
import type { WhatsAppConnection, NotificationTemplate, NotificationLog } from '@/lib/types';
import { NotificationEvents, NotificationRecipients, NotificationTypes } from '@/lib/types';
import { Bell, PlusCircle, Edit, Trash2, MessageSquare, CheckCircle, AlertTriangle, ExternalLink, Filter, ListChecks, Save, Smartphone, Mail, History, QrCode, Loader2 } from "lucide-react"; // Adicionado QrCode, Loader2
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import NextImage from "next/image"; // Adicionado NextImage

// Zod Schema para template de notificação (mantido)
const notificationTemplateSchema = z.object({
  id: z.string().optional(),
  evento: z.enum(NotificationEvents, { required_error: "Evento é obrigatório." }),
  destinatario: z.enum(NotificationRecipients, { required_error: "Destinatário é obrigatório." }),
  tipo: z.enum(NotificationTypes, { required_error: "Tipo é obrigatório." }),
  mensagem: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
  ativo: z.boolean().default(true),
});
type NotificationTemplateFormData = z.infer<typeof notificationTemplateSchema>;


// Mock Data (mantido)
const mockInitialWhatsAppConnection: WhatsAppConnection = {
  empresaId: "mockEmpresa123",
  numeroWhatsApp: "",
  conectado: false,
  provedor: "QR Code Scan", // Default para a nova abordagem
};

const mockNotificationTemplates: NotificationTemplate[] = [
  { id: "tpl1", evento: "agendamento_criado", destinatario: "cliente", tipo: "whatsapp", mensagem: "Olá {{cliente_nome}}, seu agendamento para {{servico}} com {{profissional_nome}} em {{data_hora}} foi criado! Status: {{status}}.", ativo: true },
  { id: "tpl2", evento: "agendamento_aprovado", destinatario: "cliente", tipo: "email", mensagem: "Seu agendamento para {{servico}} com {{profissional_nome}} em {{data_hora}} foi APROVADO pela {{empresa_nome}}.", ativo: true },
  { id: "tpl3", evento: "agendamento_cancelado", destinatario: "profissional", tipo: "whatsapp", mensagem: "Atenção {{profissional_nome}}, o agendamento de {{cliente_nome}} para {{servico}} em {{data_hora}} foi cancelado.", ativo: false },
  { id: "tpl4", evento: "agendamento_cancelado_bloqueio", destinatario: "cliente", tipo: "whatsapp", mensagem: "Olá {{cliente_nome}}, seu agendamento em {{data_hora}} com {{empresa_nome}} foi cancelado devido a uma indisponibilidade. Por favor, escolha um novo horário. Agradecemos a compreensão.", ativo: true },
];

const mockNotificationLogs: NotificationLog[] = [
  { id: "log1", tipo: "whatsapp", para: "+5511999998888", mensagem: "Olá João, seu agendamento...", data_envio: new Date(Date.now() - 3600000).toISOString(), status: "enviado", evento: "agendamento_criado", usuarioId: "cliente_joao" },
  { id: "log2", tipo: "email", para: "maria@cliente.com", mensagem: "Seu agendamento foi aprovado...", data_envio: new Date(Date.now() - 7200000).toISOString(), status: "enviado", evento: "agendamento_aprovado", usuarioId: "cliente_maria" },
  { id: "log3", tipo: "whatsapp", para: "+5521988887777", mensagem: "Falha ao enviar...", data_envio: new Date(Date.now() - 10800000).toISOString(), status: "falhou", evento: "pagamento_falhou", usuarioId: "cliente_pedro" },
];

const availableVariables = [
  { variable: "{{cliente_nome}}", description: "Nome do cliente" },
  { variable: "{{profissional_nome}}", description: "Nome do profissional" },
  { variable: "{{empresa_nome}}", description: "Nome da empresa" },
  { variable: "{{data_hora}}", description: "Data e hora do agendamento formatada" },
  { variable: "{{status}}", description: "Status atual do agendamento" },
  { variable: "{{link_pagamento}}", description: "Link para pagamento (caso aplicável)" },
  { variable: "{{telefone_cliente}}", description: "Telefone do cliente" },
  { variable: "{{servico}}", description: "Nome do serviço agendado" },
];

export default function CompanyNotificationsPage() {
  const { toast } = useToast();
  const [whatsAppConnection, setWhatsAppConnection] = useState<WhatsAppConnection>(mockInitialWhatsAppConnection);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(mockNotificationTemplates);
  const [logs, setLogs] = useState<NotificationLog[]>(mockNotificationLogs);
  
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  // Estados para o diálogo de conexão WhatsApp via QR Code
  const [companyWhatsAppNumberInput, setCompanyWhatsAppNumberInput] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("https://placehold.co/256x256.png?text=QR+Code+Empresa");
  const [qrDialogStatus, setQrDialogStatus] = useState<"idle" | "loading" | "connected" | "error">("idle");


  const templateForm = useForm<NotificationTemplateFormData>({
    resolver: zodResolver(notificationTemplateSchema),
    defaultValues: {
      evento: "agendamento_criado",
      destinatario: "cliente",
      tipo: "whatsapp",
      mensagem: "",
      ativo: true,
    },
  });
  
  useEffect(() => {
    document.title = `Configurar Notificações - ${APP_NAME}`;
    // Simular carregamento de dados existentes (se houver backend)
    // Por agora, o estado inicial `whatsAppConnection` já contém mock.
  }, []);

  const handleSaveWhatsAppConnection = () => {
    if (!companyWhatsAppNumberInput) {
        toast({ title: "Erro", description: "Por favor, insira um número de WhatsApp para simular a conexão.", variant: "destructive"});
        setQrDialogStatus("error");
        return;
    }
    setQrDialogStatus("loading");
    // Simulação de conexão
    setTimeout(() => {
      const success = Math.random() > 0.2; // Simular sucesso/falha
      if (success) {
        setQrDialogStatus("connected");
        setWhatsAppConnection(prev => ({
            ...prev,
            numeroWhatsApp: companyWhatsAppNumberInput,
            conectado: true,
            data_conexao: new Date().toISOString(),
            provedor: "QR Code Scan"
        }));
        toast({ title: "WhatsApp da Empresa Conectado!", description: `Conectado ao número ${companyWhatsAppNumberInput}.` });
        // setIsWhatsAppModalOpen(false); // Fecharia se fosse um fluxo real de QR
      } else {
        setQrDialogStatus("error");
        toast({ title: "Falha na Conexão", description: "Não foi possível conectar o WhatsApp. Tente gerar um novo QR Code.", variant: "destructive"});
      }
    }, 2500);
  };

  const handleGenerateNewQrCode = () => {
    setQrDialogStatus("loading");
    setCompanyWhatsAppNumberInput(""); // Limpa o input ao gerar novo QR
    setQrCodeUrl(`https://placehold.co/256x256.png?text=QR+Code+Empresa&v=${Date.now()}`); // Novo QR Code
    setTimeout(() => {
        if(qrDialogStatus !== 'connected') setQrDialogStatus("idle");
    }, 1500);
  };


  const handleSaveTemplate = (data: NotificationTemplateFormData) => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...editingTemplate, ...data } : t));
      toast({ title: "Modelo Atualizado (Simulação)" });
    } else {
      const newTemplate: NotificationTemplate = { ...data, id: `tpl${Date.now()}` };
      setTemplates(prev => [...prev, newTemplate]);
      toast({ title: "Modelo Adicionado (Simulação)" });
    }
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
    templateForm.reset({ evento: "agendamento_criado", destinatario: "cliente", tipo: "whatsapp", mensagem: "", ativo: true });
  };

  const openEditTemplateModal = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    templateForm.reset(template);
    setIsTemplateModalOpen(true);
  };
  
  const handleDeleteTemplate = (templateId: string) => {
     setTemplates(prev => prev.filter(t => t.id !== templateId));
     toast({title: "Modelo Excluído (Simulação)", variant: "destructive"});
  }

  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(prev => prev.map(t => t.id === templateId ? {...t, ativo: !t.ativo} : t));
    const template = templates.find(t => t.id === templateId);
    toast({ title: `Modelo ${template?.ativo ? 'Desativado' : 'Ativado'} (Simulação)`});
  }

  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl font-bold flex items-center">
          <Bell className="mr-3 h-8 w-8 text-primary" /> Configurar Notificações Automáticas
        </CardTitle>
        <CardDescription>Gerencie suas conexões de WhatsApp/Email e personalize os modelos de mensagens para diferentes eventos.</CardDescription>
      </CardHeader>

      <Tabs defaultValue="conexoes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="conexoes">Conexões</TabsTrigger>
          <TabsTrigger value="modelos">Modelos de Mensagem</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Envios</TabsTrigger>
        </TabsList>

        {/* CONEXÕES TAB */}
        <TabsContent value="conexoes">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Smartphone className="mr-2"/> Conexão WhatsApp</CardTitle>
              <CardDescription>Conecte um número de WhatsApp para enviar notificações automáticas aos seus clientes e profissionais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="p-4 bg-secondary/30">
                <h3 className="font-semibold mb-2">Status da Conexão Atual:</h3>
                {whatsAppConnection.conectado && whatsAppConnection.numeroWhatsApp ? (
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center text-green-600"><CheckCircle className="mr-2 h-4 w-4"/> Conectado</p>
                    <p><strong>Número:</strong> {whatsAppConnection.numeroWhatsApp}</p>
                    <p><strong>Provedor:</strong> {whatsAppConnection.provedor}</p>
                    <p><strong>Última Conexão:</strong> {whatsAppConnection.data_conexao ? new Date(whatsAppConnection.data_conexao).toLocaleString('pt-BR') : 'N/A'}</p>
                  </div>
                ) : (
                  <p className="flex items-center text-red-600"><AlertTriangle className="mr-2 h-4 w-4"/> Desconectado. Configure sua conexão abaixo.</p>
                )}
              </Card>

              <Dialog open={isWhatsAppModalOpen} onOpenChange={(open) => {
                  setIsWhatsAppModalOpen(open);
                  if (!open && qrDialogStatus !== 'connected') setQrDialogStatus("idle"); // Reset status if closed without connecting
                  if (!open && qrDialogStatus === 'connected') setCompanyWhatsAppNumberInput(""); // Limpa input se já conectou e fechou
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                      setQrDialogStatus(whatsAppConnection.conectado ? "connected" : "idle");
                      setCompanyWhatsAppNumberInput(whatsAppConnection.numeroWhatsApp || "");
                      setIsWhatsAppModalOpen(true);
                  }}>
                    <QrCode className="mr-2 h-4 w-4"/> 
                    {whatsAppConnection.conectado ? "Gerenciar Conexão WhatsApp" : "Conectar WhatsApp via QR Code"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Conectar WhatsApp da Empresa</DialogTitle>
                    <DialogDescription>
                      {qrDialogStatus !== 'connected' ? 
                        "Insira o número da empresa e escaneie o QR Code com o WhatsApp Business." : 
                        "WhatsApp da empresa conectado."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="my-6 flex flex-col items-center justify-center space-y-3">
                    {qrDialogStatus === "loading" && <Loader2 className="h-10 w-10 animate-spin text-primary"/>}
                    {(qrDialogStatus === "idle" || qrDialogStatus === "error") && (
                        <>
                            <Label htmlFor="company-whatsapp-number">Número WhatsApp da Empresa</Label>
                            <Input 
                                id="company-whatsapp-number"
                                placeholder="+5511999999999"
                                value={companyWhatsAppNumberInput}
                                onChange={(e) => setCompanyWhatsAppNumberInput(e.target.value)}
                                className="w-full max-w-xs mb-2"
                            />
                            <NextImage src={qrCodeUrl} alt="QR Code Placeholder" width={200} height={200} data-ai-hint="qrcode"/>
                        </>
                    )}
                    {qrDialogStatus === "connected" && (
                        <div className="text-center">
                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
                            <p className="text-green-600 font-semibold">Conectado com sucesso!</p>
                            <p className="text-sm text-muted-foreground">Número: {whatsAppConnection.numeroWhatsApp}</p>
                        </div>
                    )}
                    
                    {qrDialogStatus === "idle" && <p className="text-xs text-muted-foreground mt-1">Aguardando leitura do QR Code...</p>}
                    {qrDialogStatus === "loading" && <p className="text-sm text-muted-foreground">Processando...</p>}
                    {qrDialogStatus === "error" && <p className="text-sm text-destructive">Falha ao conectar. Tente novamente ou gere um novo código.</p>}
                  </div>
                  <DialogFooter className="sm:justify-between gap-2">
                    {qrDialogStatus !== "connected" && (
                        <Button type="button" variant="outline" onClick={handleGenerateNewQrCode} disabled={qrDialogStatus === "loading"}>
                            Gerar Novo QR
                        </Button>
                    )}
                    {qrDialogStatus !== "connected" ? (
                        <Button type="button" onClick={handleSaveWhatsAppConnection} disabled={qrDialogStatus === "loading"}>
                        {qrDialogStatus === "loading" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Conectando...</> : "Conectar Número"}
                        </Button>
                    ) : (
                        <Button type="button" variant="destructive" onClick={() => {
                             setWhatsAppConnection(prev => ({...prev, conectado: false, numeroWhatsApp: "", data_conexao: undefined}));
                             setQrDialogStatus("idle");
                             setCompanyWhatsAppNumberInput("");
                             toast({title: "WhatsApp Desconectado"});
                        }}>Desconectar</Button>
                    )}
                    <DialogClose asChild><Button variant="ghost">Fechar</Button></DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <CardDescription className="text-xs mt-2">Recomendamos o uso de APIs oficiais ou provedores confiáveis para integração com o WhatsApp.</CardDescription>
            </CardContent>
            
            <CardHeader className="mt-6 border-t pt-6">
              <CardTitle className="text-xl flex items-center"><Mail className="mr-2"/> Configurações de E-mail</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    (Em breve) Integre seu provedor SMTP (ex: Resend, SendGrid) para enviar notificações por e-mail.
                </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MODELOS DE MENSAGEM TAB */}
        <TabsContent value="modelos">
          <Card>
            <CardHeader className="flex-row justify-between items-center">
              <div>
                <CardTitle className="text-xl flex items-center"><ListChecks className="mr-2"/> Modelos de Mensagem</CardTitle>
                <CardDescription>Personalize as mensagens automáticas para cada evento e tipo de notificação.</CardDescription>
              </div>
              <Dialog open={isTemplateModalOpen} onOpenChange={(isOpen) => {
                setIsTemplateModalOpen(isOpen);
                if (!isOpen) {
                    setEditingTemplate(null);
                    templateForm.reset({ evento: "agendamento_criado", destinatario: "cliente", tipo: "whatsapp", mensagem: "", ativo: true });
                }
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingTemplate(null); templateForm.reset({ evento: "agendamento_criado", destinatario: "cliente", tipo: "whatsapp", mensagem: "", ativo: true }); setIsTemplateModalOpen(true); }}><PlusCircle className="mr-2"/> Novo Modelo</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingTemplate ? "Editar" : "Adicionar Novo"} Modelo de Mensagem</DialogTitle>
                  </DialogHeader>
                  <Form {...templateForm}>
                  <form onSubmit={templateForm.handleSubmit(handleSaveTemplate)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField control={templateForm.control} name="evento" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Evento de Disparo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{NotificationEvents.map(ev => <SelectItem key={ev} value={ev}>{ev.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={templateForm.control} name="destinatario" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Destinatário</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{NotificationRecipients.map(rec => <SelectItem key={rec} value={rec}>{rec.replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={templateForm.control} name="tipo" render={({ field }) => (
                             <FormItem>
                                <FormLabel>Tipo de Notificação</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{NotificationTypes.map(ty => <SelectItem key={ty} value={ty}>{ty.toUpperCase()}</SelectItem>)}</SelectContent>
                                </Select><FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                    <FormField control={templateForm.control} name="mensagem" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mensagem</FormLabel>
                            <FormControl><Textarea placeholder="Ex: Olá {{cliente_nome}}, seu agendamento..." rows={6} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <Card className="p-3 bg-muted/50">
                        <p className="text-xs font-semibold mb-1">Variáveis Disponíveis:</p>
                        <ScrollArea className="h-24">
                          <ul className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                              {availableVariables.map(v => <li key={v.variable}><code className="bg-primary/20 p-0.5 rounded text-primary font-mono">{v.variable}</code>: {v.description}</li>)}
                          </ul>
                        </ScrollArea>
                    </Card>
                     <FormField control={templateForm.control} name="ativo" render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                           <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                           <FormLabel className="mb-0! font-normal">Modelo Ativo (será usado para envios)</FormLabel>
                        </FormItem>
                    )}/>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                        <Button type="submit"><Save className="mr-2"/> Salvar Modelo</Button>
                    </DialogFooter>
                  </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {templates.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Evento</TableHead><TableHead>Destinatário</TableHead><TableHead>Tipo</TableHead><TableHead>Mensagem (Início)</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {templates.map(tpl => (
                      <TableRow key={tpl.id}>
                        <TableCell className="text-xs">{tpl.evento.replace(/_/g, ' ')}</TableCell>
                        <TableCell className="text-xs">{tpl.destinatario}</TableCell>
                        <TableCell><Badge variant={tpl.tipo === 'whatsapp' ? 'default' : 'secondary'} className={tpl.tipo === 'whatsapp' ? 'bg-green-500' : ''}>{tpl.tipo.toUpperCase()}</Badge></TableCell>
                        <TableCell className="text-xs max-w-xs truncate">{tpl.mensagem}</TableCell>
                        <TableCell>
                            <Switch checked={tpl.ativo} onCheckedChange={() => toggleTemplateStatus(tpl.id!)} aria-label={tpl.ativo ? 'Desativar' : 'Ativar'}/>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditTemplateModal(tpl)}><Edit className="h-4 w-4"/></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir este modelo de mensagem? Esta ação não poderá ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteTemplate(tpl.id!)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Excluir</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-muted-foreground text-center py-6">Nenhum modelo de mensagem cadastrado.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* HISTÓRICO DE ENVIOS TAB */}
        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><History className="mr-2"/> Histórico de Envios</CardTitle>
              <CardDescription>Auditoria de todas as notificações enviadas pelo sistema.</CardDescription>
              {/* Add filters for logs here: Period, Status, Type (WhatsApp/Email) */}
            </CardHeader>
            <CardContent>
              {logs.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Para</TableHead><TableHead>Evento</TableHead><TableHead>Mensagem (Início)</TableHead><TableHead>Data Envio</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {logs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell><Badge variant={log.tipo === 'whatsapp' ? 'default' : 'secondary'} className={log.tipo === 'whatsapp' ? 'bg-green-500' : ''}>{log.tipo.toUpperCase()}</Badge></TableCell>
                        <TableCell className="text-xs">{log.para}</TableCell>
                        <TableCell className="text-xs">{log.evento.replace(/_/g, ' ')}</TableCell>
                        <TableCell className="text-xs max-w-xs truncate">{log.mensagem}</TableCell>
                        <TableCell className="text-xs">{new Date(log.data_envio).toLocaleString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge variant={log.status === "enviado" ? "default" : log.status === "falhou" ? "destructive" : "outline"}
                                 className={log.status === "enviado" ? "bg-green-600" : log.status === "falhou" ? "" : "text-yellow-600 border-yellow-500"}>
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : <p className="text-muted-foreground text-center py-6">Nenhum histórico de envio encontrado.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

