
"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import NextImage from "next/image"; 
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
import { APP_NAME, USER_ROLES } from "@/lib/constants";
import { ArrowLeft, Save, Trash2, ImagePlus, XCircle, Copy, Loader2 } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { getServiceById, updateService, deleteService, getAvailabilityTypesForSelect, getCompanyDetailsByOwner } from "@/services/supabaseService";
import type { ServiceData } from "@/services/supabaseService";
import { Skeleton } from "@/components/ui/skeleton";

const serviceCategories = [
  "Beleza e Estética",
  "Saúde e Bem-estar",
  "Consultoria",
  "Educação",
  "Reparos e Manutenção",
  "Eventos",
  "Outros",
];

// Zod schema for service form data
const serviceSchema = z.object({
  name: z.string().min(3, "O nome do serviço deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  category: z.string().min(1, "A categoria é obrigatória."),
  image_url: z.string().url("URL da imagem inválida").optional().or(z.literal("")),
  duration_minutes: z.coerce.number().int().positive("A duração deve ser um número positivo.").min(5, "Duração mínima de 5 minutos."),
  display_duration: z.boolean().default(true),
  unique_scheduling_link_slug: z.string()
    .min(3, "O link deve ter pelo menos 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, { message: "O link pode conter apenas letras minúsculas, números e hífens." })
    .optional().or(z.literal('')),
  price: z.string().min(1, "O preço é obrigatório.").regex(/^\d+([,.]\d{1,2})?$/, "Formato de preço inválido (ex: 50 ou 50,00)"),
  commission_type: z.enum(["fixed", "percentage"]).optional(),
  commission_value: z.coerce.number().nonnegative("A comissão não pode ser negativa.").optional().or(z.literal(NaN)),
  has_booking_fee: z.boolean().default(false),
  booking_fee_value: z.coerce.number().nonnegative("A taxa não pode ser negativa.").optional().or(z.literal(NaN)),
  simultaneous_appointments_per_user: z.coerce.number().int().min(1, "Mínimo de 1 agendamento simultâneo por usuário.").default(1),
  simultaneous_appointments_per_slot: z.coerce.number().int().min(1, "Mínimo de 1 agendamento simultâneo por horário.").default(1),
  simultaneous_appointments_per_slot_automatic: z.boolean().default(false),
  block_after_24_hours: z.boolean().default(false),
  interval_between_slots_minutes: z.coerce.number().int().min(0, "O intervalo não pode ser negativo.").default(0),
  confirmation_type: z.enum(["manual", "automatic"]).default("automatic"),
  availability_type_id: z.string().optional().nullable(),
  active: z.boolean().default(true),
}).refine(data => {
  if (data.has_booking_fee && (data.booking_fee_value === undefined || isNaN(data.booking_fee_value) || data.booking_fee_value < 0)) {
    return false;
  }
  return true;
}, {
  message: "O valor da taxa de agendamento é obrigatório e deve ser positivo se a taxa estiver habilitada.",
  path: ["booking_fee_value"],
}).refine(data => {
    if (data.commission_type && (data.commission_value === undefined || isNaN(data.commission_value) || data.commission_value < 0)) {
        return false;
    }
    return true;
}, {
    message: "O valor da comissão é obrigatório e deve ser positivo se um tipo de comissão for selecionado.",
    path: ["commission_value"],
});

type ServiceFormZodData = z.infer<typeof serviceSchema>;

const defaultServiceEditValues: Partial<ServiceFormZodData> = {
  name: "",
  description: "",
  category: "",
  image_url: "https://placehold.co/300x200.png?text=Serviço",
  duration_minutes: 60,
  display_duration: true,
  unique_scheduling_link_slug: "",
  price: "0,00", // Sera convertido para numero no submit
  commission_type: undefined,
  commission_value: NaN,
  has_booking_fee: false,
  booking_fee_value: NaN,
  simultaneous_appointments_per_user: 1,
  simultaneous_appointments_per_slot: 1,
  simultaneous_appointments_per_slot_automatic: false,
  block_after_24_hours: false,
  interval_between_slots_minutes: 10,
  confirmation_type: "automatic",
  availability_type_id: "", // string vazia para o select
  active: true,
};

export default function EditServicePage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;
  const { user, role, loading: authLoading } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isDataProcessed, setIsDataProcessed] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availabilityTypes, setAvailabilityTypes] = useState<{ id: string; name: string }[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null); 

  const form = useForm<ServiceFormZodData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: defaultServiceEditValues as ServiceFormZodData,
  });
  
  const serviceName = form.watch("name");
  const watchHasBookingFee = form.watch("has_booking_fee");
  const formReset = form.reset; // Estabilizar referência

  useEffect(() => {
    let isMounted = true;
    if (authLoading) {
      // Ainda aguardando dados de autenticação, não fazer nada
      return;
    }

    if (!user || role !== USER_ROLES.COMPANY_ADMIN) {
      toast({ title: "Acesso Negado", description: "Você não tem permissão para editar serviços.", variant: "destructive" });
      router.push('/dashboard');
      if (isMounted) setIsLoadingPage(false);
      return;
    }

    if (user && user.id && role === USER_ROLES.COMPANY_ADMIN) {
      setIsLoadingPage(true);
      setIsDataProcessed(false);
      getCompanyDetailsByOwner(user.id).then(companyDetails => {
        if (!isMounted) return;
        if (companyDetails && companyDetails.id) {
          setCompanyId(companyDetails.id); 
          fetchAvailabilityTypes(companyDetails.id);
          if (serviceId) {
            fetchServiceData(serviceId);
          } else {
            toast({ title: "Erro", description: "ID do serviço não fornecido.", variant: "destructive" });
            router.push('/dashboard/company/services');
            setIsLoadingPage(false);
          }
        } else {
          toast({ title: "Erro", description: "Empresa não encontrada. Cadastre os detalhes da empresa primeiro.", variant: "destructive" });
          router.push('/dashboard/company');
          setIsLoadingPage(false);
        }
      }).catch(() => { // Adicionado catch para getCompanyDetailsByOwner
        if(isMounted) {
          toast({ title: "Erro ao buscar empresa", description: "Não foi possível verificar os dados da sua empresa.", variant: "destructive" });
          router.push('/dashboard/company');
          setIsLoadingPage(false);
        }
      });
    }
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role, serviceId, router, toast, authLoading]); // formReset foi removido das dependências

  const fetchServiceData = async (currentServiceId: string) => {
    try {
      const existingService = await getServiceById(currentServiceId);
      if (existingService) {
        formReset({ // Usar a referência estável
          ...defaultServiceEditValues,
          ...existingService,
          price: String(existingService.price || "0").replace('.', ','), // Garantir que price é string e formatado
          image_url: existingService.image_url || defaultServiceEditValues.image_url,
          availability_type_id: existingService.availability_type_id || "",
          description: existingService.description || "",
          unique_scheduling_link_slug: existingService.unique_scheduling_link_slug || "",
          commission_type: existingService.commission_type || undefined,
          commission_value: existingService.commission_value ?? NaN,
          booking_fee_value: existingService.booking_fee_value ?? NaN,
          duration_minutes: existingService.duration_minutes || 60, // Add default if missing
          // Adicionar outros campos que podem ser null/undefined do DB para seus defaults
        });
        setImagePreview(existingService.image_url || defaultServiceEditValues.image_url);
        setIsDataProcessed(true);
      } else {
        toast({ title: "Erro", description: "Serviço não encontrado.", variant: "destructive" });
        router.push('/dashboard/company/services');
      }
    } catch (error: any) {
      toast({ title: "Erro ao Carregar Serviço", description: error.message, variant: "destructive" });
      router.push('/dashboard/company/services');
    } finally {
      setIsLoadingPage(false); // Movido para o finally da função de fetch principal ou do useEffect
    }
  };
  
  const fetchAvailabilityTypes = async (currentCompanyId: string) => {
    try {
      const types = await getAvailabilityTypesForSelect(currentCompanyId);
      setAvailabilityTypes(types);
    } catch (error: any) {
      toast({ title: "Erro ao buscar tipos de disponibilidade", description: error.message, variant: "destructive" });
    }
  };
  
  useEffect(() => {
    if (serviceName) {
      document.title = `Editar: ${serviceName} - ${APP_NAME}`;
    } else if (!isLoadingPage) {
      document.title = `Editar Serviço - ${APP_NAME}`;
    }
  }, [serviceName, isLoadingPage]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("image_url", result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
      toast({title: "Simulação", description: "Imagem carregada para preview."});
    }
  };
  
  const removeImage = () => {
    const placeholder = defaultServiceEditValues.image_url!;
    setImagePreview(placeholder);
    form.setValue("image_url", placeholder, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const onSubmit = async (data: ServiceFormZodData) => {
    if (!serviceId) {
        toast({ title: "Erro", description: "ID do serviço não encontrado para atualização.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    const serviceDataToUpdate: Partial<Omit<ServiceData, 'id' | 'company_id' | 'created_at' | 'updated_at'>> = {
      ...data,
      price: parseFloat(data.price.replace(",", ".")),
      availability_type_id: data.availability_type_id === "" ? null : data.availability_type_id,
      image_url: data.image_url === "https://placehold.co/300x200.png?text=Serviço" ? undefined : data.image_url,
      commission_value: isNaN(data.commission_value as number) ? undefined : data.commission_value,
      booking_fee_value: isNaN(data.booking_fee_value as number) ? undefined : data.booking_fee_value,
    };

    try {
      await updateService(serviceId, serviceDataToUpdate);
      toast({
        title: "Serviço Atualizado!",
        description: `O serviço "${data.name}" foi atualizado com sucesso.`,
      });
      router.push('/dashboard/company/services');
    } catch (error: any) {
      toast({ title: "Erro ao Atualizar Serviço", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true); 
    try {
      await deleteService(serviceId);
      toast({
        title: "Serviço Excluído",
        description: `O serviço "${form.getValues("name")}" foi excluído.`,
      });
      router.push('/dashboard/company/services');
    } catch (error: any) {
      toast({ title: "Erro ao Excluir", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false); // Resetar isSaving mesmo em caso de erro
    }
  };

  const handleDuplicate = () => {
    const currentValues = form.getValues();
    const duplicatedValues = { 
      ...currentValues, 
      name: `${currentValues.name} (Cópia)`, 
      unique_scheduling_link_slug: `${currentValues.unique_scheduling_link_slug || currentValues.name.toLowerCase().replace(/\s+/g, '-')}-copia`
    };
    
    localStorage.setItem('tdsagenda_duplicate_service_data', JSON.stringify(duplicatedValues));
    
    toast({
      title: "Serviço Pronto para Duplicação",
      description: `Os dados de "${form.getValues("name")}" foram copiados. Você será redirecionado para a página de adicionar serviço. Ajuste e salve como um novo serviço.`,
    });
    router.push('/dashboard/company/services/add?fromDuplicate=true');
  };
  
  if (isLoadingPage && !isDataProcessed) {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-3/5" />
                <div className="flex gap-2"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-24" /></div>
            </div>
            <Tabs defaultValue="configurations" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
                    <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" /> <Skeleton className="h-10 w-full" />
                </TabsList>
                <TabsContent value="configurations"><Card className="shadow-lg"><CardContent className="pt-6 space-y-6">
                    {[...Array(5)].map((_,i) => <div key={i} className="space-y-2"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-10 w-full" /></div>)}
                </CardContent></Card></TabsContent>
            </Tabs>
        </div>
    );
  }
  
  if (!isDataProcessed && !isLoadingPage) { // Se terminou de carregar mas dados não foram processados (ex: serviço não encontrado)
     return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <p className="text-xl text-destructive">Não foi possível carregar os dados do serviço para edição.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/company/services">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
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
            <Button variant="outline" size="icon" asChild type="button">
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
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
            </Button>
          </div>
        </div>

        {isDataProcessed && ( // Renderizar o formulário somente após os dados serem processados
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
                        name="image_url"
                        render={({ fieldState }) => ( 
                            <FormItem>
                            <FormLabel>Imagem Ilustrativa do Serviço</FormLabel>
                            <FormControl>
                                <>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {imagePreview && (
                                    <div className="relative w-[150px] h-[100px] md:w-[200px] md:h-[133px] flex-shrink-0">
                                        <NextImage src={imagePreview} alt="Preview do serviço" layout="fill" objectFit="cover" className="rounded-md border" data-ai-hint="ilustração serviço evento" />
                                        {form.getValues("image_url") !== "https://placehold.co/300x200.png?text=Serviço" && (
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 bg-background/70 hover:bg-destructive hover:text-destructive-foreground h-6 w-6" onClick={removeImage}>
                                            <XCircle className="h-4 w-4"/>
                                        </Button>
                                        )}
                                    </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" id="service-image-upload-edit" />
                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto">
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
                            name="duration_minutes"
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
                        name="unique_scheduling_link_slug"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Link Único de Agendamento para o Serviço (Opcional)</FormLabel>
                            <FormControl>
                                <div className="flex items-center">
                                    <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 text-xs text-muted-foreground">
                                    /agendar/empresa/servico/
                                    </span>
                                    <Input placeholder="meu-servico-incrivel" {...field} onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="rounded-l-none"/>
                                </div>
                            </FormControl>
                            <FormDescription>Será usado para: {`${typeof window !== 'undefined' ? window.location.origin : 'https://tds.agenda'}/agendar/nome-empresa/servico/${field.value || "meu-servico"}`}</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    
                    <div className="space-y-2 p-4 border rounded-md">
                        <h4 className="font-medium text-md">Comissão do Profissional</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="commission_type"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Comissão</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
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
                            name="commission_value"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Valor da Comissão</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="Ex: 10 ou 25" {...field} value={isNaN(field.value as number) ? "" : field.value} />
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
                        name="has_booking_fee"
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
                                name="booking_fee_value"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valor da Taxa de Agendamento (R$)</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="Ex: 10,00" {...field} value={isNaN(field.value as number) ? "" : field.value} />
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
                            name="simultaneous_appointments_per_user"
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
                            name="simultaneous_appointments_per_slot"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agend. por Horário</FormLabel>
                                <FormControl>
                                <Input type="number" {...field} disabled={form.watch("simultaneous_appointments_per_slot_automatic")} />
                                </FormControl>
                                <FormDescription>Quantos clientes podem agendar no mesmo horário.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="simultaneous_appointments_per_slot_automatic"
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
                        name="block_after_24_hours"
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
                        name="interval_between_slots_minutes"
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
                        name="confirmation_type"
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
                        name="availability_type_id"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo de Disponibilidade Vinculado</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione um tipo de disponibilidade" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="">Nenhum (usar horários do profissional/empresa)</SelectItem>
                                    {availabilityTypes.map(type => (
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
                        name="display_duration"
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
        )}
      </form>
    </Form>
  );
}
