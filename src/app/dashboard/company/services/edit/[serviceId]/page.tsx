
"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_NAME } from "@/lib/constants";
import { ArrowLeft, Save, Trash2, ImagePlus, XCircle, Copy } from "lucide-react";
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
import { useParams, useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const MOCK_PROFESSIONALS = [
  { id: "prof1", name: "Dr. João Silva" },
  { id: "prof2", name: "Dra. Maria Oliveira" },
  { id: "prof3", name: "Carlos Souza (Esteticista)" },
];

const MOCK_AVAILABILITY_TYPES = [
  { id: "type1", name: "Horário Comercial Padrão" },
  { id: "type2", name: "Plantão Final de Semana" },
  { id: "type3", name: "Horário Noturno Reduzido" },
];

const serviceCategories = [
  "Beleza e Estética",
  "Saúde e Bem-estar",
  "Consultoria",
  "Educação",
  "Reparos e Manutenção",
  "Eventos",
  "Outros",
];

const serviceSchema = z.object({
  name: z.string().min(3, "O nome do serviço deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  professionals: z.array(z.string()).optional().default([]).describe("Profissionais que realizam este serviço"),
  category: z.string().min(1, "A categoria é obrigatória."),
  image: z.string().optional(),
  duration: z.coerce.number().int().positive("A duração deve ser um número positivo.").min(5, "Duração mínima de 5 minutos."),
  displayDuration: z.boolean().default(true),
  uniqueSchedulingLink: z.string().min(3, "O link deve ter pelo menos 3 caracteres.").regex(/^[a-z0-9-]+$/, { message: "O link pode conter apenas letras minúsculas, números e hífens." }),
  price: z.string().min(1, "O preço é obrigatório.").regex(/^\d+(,\d{2})?$/, "Formato de preço inválido (ex: 50 ou 50,00)"),
  commissionType: z.enum(["fixed", "percentage"]).optional(),
  commissionValue: z.coerce.number().nonnegative("A comissão não pode ser negativa.").optional(),
  hasBookingFee: z.boolean().default(false),
  bookingFeeValue: z.coerce.number().nonnegative("A taxa não pode ser negativa.").optional(),
  simultaneousAppointmentsPerUser: z.coerce.number().int().min(1, "Mínimo de 1 agendamento simultâneo por usuário.").default(1),
  simultaneousAppointmentsPerSlot: z.coerce.number().int().min(1, "Mínimo de 1 agendamento simultâneo por horário.").default(1),
  simultaneousAppointmentsPerSlotAutomatic: z.boolean().default(false),
  blockAfter24Hours: z.boolean().default(false),
  intervalBetweenSlots: z.coerce.number().int().min(0, "O intervalo não pode ser negativo.").default(0),
  confirmationType: z.enum(["manual", "automatic"]).default("automatic"),
  availabilityTypeId: z.string().optional().describe("Tipo de disponibilidade vinculado a este serviço."),
  active: z.boolean().default(true),
}).refine(data => {
  if (data.hasBookingFee && (data.bookingFeeValue === undefined || data.bookingFeeValue < 0)) {
    return false;
  }
  return true;
}, {
  message: "O valor da taxa de agendamento é obrigatório e deve ser positivo se a taxa estiver habilitada.",
  path: ["bookingFeeValue"],
}).refine(data => {
    if (data.commissionType && (data.commissionValue === undefined || data.commissionValue < 0)) {
        return false;
    }
    return true;
}, {
    message: "O valor da comissão é obrigatório e deve ser positivo se um tipo de comissão for selecionado.",
    path: ["commissionValue"],
});

type ServiceFormData = z.infer<typeof serviceSchema>;

// Mock data now includes all fields for services
const mockExistingServices: { [key: string]: ServiceFormData } = {
  "1": { 
    name: "Corte de Cabelo Masculino", 
    description: "Corte moderno e estiloso para homens. Inclui lavagem e finalização.", 
    professionals: ["prof1", "prof3"], 
    category: "Beleza e Estética", 
    duration: 45, 
    displayDuration: true, 
    active: true, 
    image: "https://placehold.co/300x200.png?text=Corte+Masc", 
    price: "50,00", 
    uniqueSchedulingLink: "corte-masculino", 
    commissionType: "percentage", 
    commissionValue: 10, 
    hasBookingFee: false, 
    bookingFeeValue: 0, 
    simultaneousAppointmentsPerUser: 1, 
    simultaneousAppointmentsPerSlot: 1, 
    simultaneousAppointmentsPerSlotAutomatic: false, 
    blockAfter24Hours: false, 
    intervalBetweenSlots: 15, 
    confirmationType: "automatic", 
    availabilityTypeId: "type1" 
  },
  "2": { 
    name: "Consulta Psicológica Online", 
    description: "Sessão de terapia online com psicólogo qualificado. Atendimento focado em suas necessidades.", 
    professionals: ["prof2"], 
    category: "Saúde e Bem-estar", 
    duration: 50, 
    displayDuration: true, 
    active: true, 
    image: "https://placehold.co/300x200.png?text=Psico+Online", 
    price: "120,00", 
    uniqueSchedulingLink: "consulta-psico-online", 
    commissionType: "fixed", 
    commissionValue: 20, 
    hasBookingFee: true, 
    bookingFeeValue: 10, 
    simultaneousAppointmentsPerUser: 1, 
    simultaneousAppointmentsPerSlot: 1, 
    simultaneousAppointmentsPerSlotAutomatic: true, 
    blockAfter24Hours: true, 
    intervalBetweenSlots: 0, 
    confirmationType: "manual", 
    availabilityTypeId: "" 
  },
};


export default function EditServicePage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });
  
  const serviceName = form.watch("name");
  const watchHasBookingFee = form.watch("hasBookingFee");

  useEffect(() => {
    if (serviceId) {
      console.log(`BACKEND_SIM: Buscando dados do serviço com ID: ${serviceId}`);
      const existingService = mockExistingServices[serviceId];
      if (existingService) {
        form.reset(existingService); 
        setImagePreview(existingService.image || "https://placehold.co/300x200.png?text=Serviço");
        setIsLoading(false);
      } else {
        toast({ title: "Erro", description: "Serviço não encontrado.", variant: "destructive" });
        setIsLoading(false); 
         router.push('/dashboard/company/services'); 
      }
    } else {
        setIsLoading(false); 
    }
  }, [serviceId, form, toast, router]);
  
  useEffect(() => {
    if (serviceName) {
      document.title = `Editar: ${serviceName} - ${APP_NAME}`;
    } else {
      document.title = `Editar Serviço - ${APP_NAME}`;
    }
  }, [serviceName]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("image", result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    const placeholder = "https://placehold.co/300x200.png?text=Serviço";
    setImagePreview(placeholder);
    form.setValue("image", placeholder, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsSaving(true);
    console.log("BACKEND_SIM: Dados do serviço a serem atualizados:", { serviceId, data });
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    toast({
      title: "Serviço Atualizado! (Simulação)",
      description: `O serviço "${data.name}" foi atualizado com sucesso (simulação frontend).`,
    });
    setIsSaving(false);
    router.push('/dashboard/company/services');
  };

  const handleDelete = async () => {
    setIsSaving(true); 
    console.log("BACKEND_SIM: Solicitação de exclusão para o serviço ID:", serviceId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Serviço Excluído (Simulação)",
      description: `O serviço "${form.getValues("name")}" foi excluído (simulação frontend).`,
    });
    router.push('/dashboard/company/services');
  };

  const handleDuplicate = () => {
    const currentValues = form.getValues();
    const duplicatedValues = { 
      ...currentValues, 
      name: `${currentValues.name} (Cópia)`, 
      uniqueSchedulingLink: `${currentValues.uniqueSchedulingLink}-copia`
    };
    
    console.log("BACKEND_SIM: Dados do serviço duplicado (frontend) para pré-preencher formulário de adição:", duplicatedValues);
    localStorage.setItem('duplicate_service_data', JSON.stringify(duplicatedValues));
    
    toast({
      title: "Serviço Pronto para Duplicação",
      description: `Os dados de "${form.getValues("name")}" foram copiados. Você será redirecionado para a página de adicionar serviço. Ajuste e salve como um novo serviço.`,
    });
    router.push('/dashboard/company/services/add?fromDuplicate=true');
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Carregando dados do serviço...</p></div>;
  }
  if (!isLoading && !mockExistingServices[serviceId] && serviceId) {
     return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <p className="text-xl text-destructive">Serviço com ID '{serviceId}' não encontrado.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/company/services">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Serviços
          </Link>
        </Button>
      </div>
    );
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/company/services">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <CardHeader className="p-0">
              <CardTitle className="text-2xl md:text-3xl font-bold">Editar: {serviceName || "Serviço"}</CardTitle>
            </CardHeader>
          </div>
          <div className="flex items-center gap-2">
            <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 mb-0">
                      <FormControl>
                          <Switch
                              id="service-active-edit"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                          />
                      </FormControl>
                      <Label htmlFor="service-active-edit" className="text-sm mb-0 pt-0">Ativo</Label>
                  </FormItem>
                )}
              />
            <Button type="button" variant="outline" onClick={handleDuplicate} disabled={isSaving}><Copy className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">Duplicar</span></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isSaving}><Trash2 className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">Excluir</span></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o serviço "{form.getValues("name")}"? Esta ação não poderá ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Confirmar Exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="configurations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="configurations">Configurações</TabsTrigger>
            <TabsTrigger value="availability" disabled>Disponibilidade Avançada</TabsTrigger> 
            <TabsTrigger value="professionalsTab" disabled>Profissionais (Detalhes)</TabsTrigger> 
            <TabsTrigger value="bling" disabled>Bling (Integração)</TabsTrigger> 
          </TabsList>

          <TabsContent value="configurations">
            <Card className="shadow-lg">
              <CardContent className="pt-6 space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Serviço</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição Detalhada</FormLabel>
                          <FormControl>
                            <Textarea rows={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                        control={form.control}
                        name="professionals"
                        render={() => (
                            <FormItem>
                            <div className="mb-2">
                                <FormLabel className="text-base">Profissionais Responsáveis</FormLabel>
                                <FormDescription>Selecione os profissionais que podem realizar este serviço.</FormDescription>
                            </div>
                            <div className="space-y-2">
                                {MOCK_PROFESSIONALS.map((prof) => (
                                <FormField
                                    key={prof.id}
                                    control={form.control}
                                    name="professionals"
                                    render={({ field }) => {
                                    return (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border rounded-md hover:bg-secondary/50">
                                        <FormControl>
                                            <Checkbox
                                            checked={field.value?.includes(prof.id)}
                                            onCheckedChange={(checked) => {
                                                const currentValue = field.value || [];
                                                return checked
                                                ? field.onChange([...currentValue, prof.id])
                                                : field.onChange(
                                                    currentValue.filter(
                                                    (value) => value !== prof.id
                                                    )
                                                );
                                            }}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal text-sm">
                                            {prof.name}
                                        </FormLabel>
                                        </FormItem>
                                    );
                                    }}
                                />
                                ))}
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria do Serviço</FormLabel>
                           <FormControl>
                            <Input placeholder="Ex: Beleza, Saúde, Consultoria" {...field} list="service-categories-datalist-edit" />
                          </FormControl>
                          <datalist id="service-categories-datalist-edit">
                            {serviceCategories.map(cat => <option key={cat} value={cat} />)}
                          </datalist>
                          <FormDescription>Digite uma categoria existente ou crie uma nova.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ fieldState }) => ( 
                        <FormItem>
                          <FormLabel>Imagem Ilustrativa do Serviço</FormLabel>
                          <FormControl>
                            <>
                              <div className="flex items-center gap-4">
                                {imagePreview && (
                                  <div className="relative w-[150px] h-[100px] md:w-[200px] md:h-[133px]">
                                    <Image src={imagePreview} alt="Preview do serviço" layout="fill" objectFit="cover" className="rounded-md border" data-ai-hint="ilustração serviço evento" />
                                    {form.getValues("image") !== "https://placehold.co/300x200.png?text=Serviço" && (
                                      <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 bg-background/70 hover:bg-destructive hover:text-destructive-foreground h-6 w-6" onClick={removeImage}>
                                        <XCircle className="h-4 w-4"/>
                                      </Button>
                                    )}
                                  </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" id="service-image-upload-edit" />
                                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                  <ImagePlus className="mr-2 h-4 w-4" /> Selecionar Imagem
                                </Button>
                              </div>
                            </>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Duração (em minutos)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Preço (R$)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                    </div>
                     <FormField
                      control={form.control}
                      name="uniqueSchedulingLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link Único de Agendamento para o Serviço</FormLabel>
                          <FormControl>
                             <div className="flex items-center">
                                <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 text-xs text-muted-foreground">
                                /agendar/empresa/servico/
                                </span>
                                <Input placeholder="meu-servico-incrivel" {...field} onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="rounded-l-none"/>
                            </div>
                          </FormControl>
                          <FormDescription>Será usado para: {`easyagenda.com/agendar/nome-empresa/servico/${field.value || "meu-servico"}`}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2 p-4 border rounded-md">
                        <h4 className="font-medium text-md">Comissão do Profissional</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="commissionType"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Comissão</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="commissionValue"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor da Comissão</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="Ex: 10 ou 25" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>
                    </div>

                    <div className="space-y-3 p-4 border rounded-md">
                        <FormField
                        control={form.control}
                        name="hasBookingFee"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                id="has-booking-fee-edit"
                                />
                            </FormControl>
                            <FormLabel htmlFor="has-booking-fee-edit" className="font-medium mb-0">Cobrar Taxa de Agendamento</FormLabel>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        {watchHasBookingFee && (
                             <FormField
                                control={form.control}
                                name="bookingFeeValue"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor da Taxa de Agendamento (R$)</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="Ex: 10,00" {...field} />
                                    </FormControl>
                                    <FormDescription>Cliente pagará este valor para confirmar.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="simultaneousAppointmentsPerUser"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agend. Ativos por Usuário</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Quantos agendamentos deste serviço um cliente pode ter ativos ao mesmo tempo.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="space-y-1">
                         <FormField
                            control={form.control}
                            name="simultaneousAppointmentsPerSlot"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agend. por Horário</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} disabled={form.watch("simultaneousAppointmentsPerSlotAutomatic")} />
                                </FormControl>
                                <FormDescription>Quantos clientes podem agendar no mesmo horário.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="simultaneousAppointmentsPerSlotAutomatic"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-2">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} id="simultaneous-auto-edit" />
                                </FormControl>
                                <FormLabel htmlFor="simultaneous-auto-edit" className="text-xs font-normal">Automático (profissionais)</FormLabel>
                                </FormItem>
                            )}
                            />
                        </div>
                    </div>
                     <FormField
                      control={form.control}
                      name="blockAfter24Hours"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="block-24h-edit"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel htmlFor="block-24h-edit">Bloquear novo agendamento por 24h</FormLabel>
                             <FormDescription className="text-xs">Cliente só poderá reagendar este serviço após 24h do último agendamento feito.</FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="intervalBetweenSlots"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Intervalo entre Slots de Horários (minutos)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="Ex: 10" {...field} />
                            </FormControl>
                             <FormDescription>Define um intervalo em minutos após a conclusão de um horário antes que o próximo possa ser agendado.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmationType"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Confirmação</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="manual">Manual (Empresa/Profissional aprova)</SelectItem>
                                <SelectItem value="automatic">Automática</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormDescription>Se "Taxa de Agendamento" estiver marcada, a confirmação pode se tornar automática após pagamento.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="availabilityTypeId"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Disponibilidade Vinculado</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione um tipo de disponibilidade" /></SelectTrigger></FormControl>
                                <SelectContent>
                                     <SelectItem value="">Nenhum (usar horários do profissional/empresa)</SelectItem>
                                    {MOCK_AVAILABILITY_TYPES.map(type => (
                                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Vincule um modelo de disponibilidade previamente cadastrado a este serviço. Se não selecionado, usará a disponibilidade do profissional e/ou da empresa.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                      control={form.control}
                      name="displayDuration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="display-duration-edit"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel htmlFor="display-duration-edit">Exibir duração na página de agendamento</FormLabel>
                          </div>
                          <FormMessage/>
                        </FormItem>
                      )}
                    />
              </CardContent>
            </Card>
          </TabsContent>
           {/* Placeholder Tabs */}
           <TabsContent value="availability">
            <Card>
              <CardHeader><CardTitle>Disponibilidade Avançada</CardTitle><CardDescription>Configure regras detalhadas de disponibilidade para este serviço (em breve).</CardDescription></CardHeader>
              <CardContent><p className="text-muted-foreground">Configurações avançadas de disponibilidade (ex: horários específicos, recorrência, bloqueios) para este serviço estarão disponíveis aqui, integradas com o "Tipo de Disponibilidade" selecionado.</p></CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="professionalsTab">
            <Card>
              <CardHeader><CardTitle>Profissionais (Detalhes)</CardTitle><CardDescription>Gerencie detalhes da atribuição de profissionais a este serviço (em breve).</CardDescription></CardHeader>
              <CardContent><p className="text-muted-foreground">Configurações avançadas por profissional para este serviço (ex: preço diferenciado, prioridade).</p></CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="bling">
            <Card>
              <CardHeader><CardTitle>Integração Bling</CardTitle><CardDescription>Configure a integração com o Bling para este serviço (em breve).</CardDescription></CardHeader>
              <CardContent><p className="text-muted-foreground">Detalhes da integração com o Bling para emissão de notas ou controle de estoque (se aplicável).</p></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}

    
