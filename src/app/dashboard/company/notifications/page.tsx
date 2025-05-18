
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
import type { WhatsAppConnection, NotificationTemplate, NotificationLog, NotificationEvent, NotificationRecipient, NotificationType } from '@/lib/types';
import { NotificationEvents, NotificationRecipients, NotificationTypes } from '@/lib/types';
import { Bell, PlusCircle, Edit, Trash2, MessageSquare, CheckCircle, AlertTriangle, ExternalLink, Filter, ListChecks, Save, Smartphone, Mail, History } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Zod Schemas
const whatsAppConnectionSchema = z.object({
  numeroWhatsApp: z.string().min(10, "Número de WhatsApp inválido."),
  provedor: z.enum(["Z-API", "Chat-API", "WhatsApp Cloud API", ""], { required_error: "Selecione um provedor." }),
  tokenAPI: z.string().optional(),
});
type WhatsAppConnectionFormData = z.infer<typeof whatsAppConnectionSchema>;

const notificationTemplateSchema = z.object({
  id: z.string().optional(),
  evento: z.enum(NotificationEvents, { required_error: "Evento é obrigatório." }),
  destinatario: z.enum(NotificationRecipients, { required_error: "Destinatário é obrigatório." }),
  tipo: z.enum(NotificationTypes, { required_error: "Tipo é obrigatório." }),
  mensagem: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
  ativo: z.boolean().default(true),
});
type NotificationTemplateFormData = z.infer<typeof notificationTemplateSchema>;


// Mock Data
const mockInitialWhatsAppConnection: WhatsAppConnection = {
  empresaId: "mockEmpresa123",
  numeroWhatsApp: "",
  conectado: false,
  provedor: "",
  tokenAPI: "",
};

const mockNotificationTemplates: NotificationTemplate[] = [
  { id: "tpl1", evento: "agendamento_criado", destinatario: "cliente", tipo: "whatsapp", mensagem: "Olá {{cliente_nome}}, seu agendamento para {{servico}} com {{profissional_nome}} em {{data_hora}} foi criado! Status: {{status}}.", ativo: true },
  { id: "tpl2", evento: "agendamento_aprovado", destinatario: "cliente", tipo: "email", mensagem: "Seu agendamento para {{servico}} com {{profissional_nome}} em {{data_hora}} foi APROVADO pela {{empresa_nome}}.", ativo: true },
  { id: "tpl3", evento: "agendamento_cancelado", destinatario: "profissional", tipo: "whatsapp", mensagem: "Atenção {{profissional_nome}}, o agendamento de {{cliente_nome}} para {{servico}} em {{data_hora}} foi cancelado.", ativo: false },
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

  const whatsAppForm = useForm<WhatsAppConnectionFormData>({
    resolver: zodResolver(whatsAppConnectionSchema),
    defaultValues: {
      numeroWhatsApp: whatsAppConnection.numeroWhatsApp || "",
      provedor: whatsAppConnection.provedor || "",
      tokenAPI: whatsAppConnection.tokenAPI || "",
    },
  });

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
    // Simular carregamento de dados existentes
    whatsAppForm.reset({
        numeroWhatsApp: whatsAppConnection.numeroWhatsApp,
        provedor: whatsAppConnection.provedor || "", // Ensure empty string if undefined
        tokenAPI: whatsAppConnection.tokenAPI || ""
    });
  }, [whatsAppConnection, whatsAppForm]);


  const handleSaveWhatsAppConnection = (data: WhatsAppConnectionFormData) => {
    console.log("BACKEND_SIM: Salvando conexão WhatsApp", data);
    setWhatsAppConnection(prev => ({
      ...prev,
      ...data,
      conectado: true, // Simular conexão bem-sucedida
      data_conexao: new Date().toISOString()
    }));
    toast({ title: "Conexão WhatsApp Salva (Simulação)", description: "A conexão foi configurada." });
    setIsWhatsAppModalOpen(false);
  };

  const handleTestWhatsAppConnection = () => {
    const data = whatsAppForm.getValues();
    if(!data.numeroWhatsApp || !data.provedor) {
        toast({title: "Erro", description: "Número e provedor são obrigatórios para testar.", variant: "destructive"});
        return;
    }
    console.log("BACKEND_SIM: Testando conexão WhatsApp", data);
    toast({ title: "Teste de Conexão (Simulação)", description: "Enviando mensagem de teste..." });
    // Simular sucesso/falha
    setTimeout(() => toast({ description: "Mensagem de teste enviada/recebida com sucesso (simulado)." }), 2000);
  };

  const handleSaveTemplate = (data: NotificationTemplateFormData) => {
    if (editingTemplate) {
      // Edit
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...editingTemplate, ...data } : t));
      toast({ title: "Modelo Atualizado (Simulação)" });
    } else {
      // Add
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

              <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
                <DialogTrigger asChild>
                  <Button><Smartphone className="mr-2"/> {whatsAppConnection.conectado ? "Gerenciar Conexão" : "Conectar Número WhatsApp"}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Configurar Conexão WhatsApp</DialogTitle>
                    <DialogDescription>Insira os detalhes da sua API de WhatsApp.</DialogDescription>
                  </DialogHeader>
                  <Form {...whatsAppForm}>
                    <form onSubmit={whatsAppForm.handleSubmit(handleSaveWhatsAppConnection)} className="space-y-4 py-4">
                      <FormField
                        control={whatsAppForm.control}
                        name="numeroWhatsApp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número WhatsApp (com código do país)</FormLabel>
                            <FormControl><Input placeholder="+5511999999999" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={whatsAppForm.control}
                        name="provedor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provedor da API</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Selecione um provedor" /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="Z-API">Z-API</SelectItem>
                                <SelectItem value="Chat-API">Chat-API</SelectItem>
                                <SelectItem value="WhatsApp Cloud API">WhatsApp Cloud API</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={whatsAppForm.control}
                        name="tokenAPI"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Token da API (se aplicável)</FormLabel>
                            <FormControl><Input type="password" placeholder="Seu token secreto" {...field} /></FormControl>
                            <FormDescription>Consulte a documentação do seu provedor.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={handleTestWhatsAppConnection}>Testar Conexão</Button>
                        <Button type="submit">Salvar Conexão</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <CardDescription className="text-xs">Recomendamos o uso de APIs oficiais ou provedores confiáveis para integração com o WhatsApp.</CardDescription>
            </CardContent>
            
            {/* Placeholder para Configurações de Email */}
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
                        <ul className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                            {availableVariables.map(v => <li key={v.variable}><code className="bg-primary/20 p-0.5 rounded text-primary font-mono">{v.variable}</code>: {v.description}</li>)}
                        </ul>
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
                            <Switch checked={tpl.ativo} onCheckedChange={() => toggleTemplateStatus(tpl.id)} aria-label={tpl.ativo ? 'Desativar' : 'Ativar'}/>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditTemplateModal(tpl)}><Edit className="h-4 w-4"/></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir este modelo de mensagem? Esta ação não poderá ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteTemplate(tpl.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Excluir</AlertDialogAction></AlertDialogFooter>
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
