
"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // Usado para o Switch 'Ativo'
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_NAME } from "@/lib/constants";
import { ArrowLeft, Save, Trash2, ImagePlus, XCircle } from "lucide-react";
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
import { useParams, useRouter }
from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


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
  category: z.string().min(1, "Selecione uma categoria."),
  duration: z.coerce.number().int().positive("A duração deve ser um número positivo.").min(5, "Duração mínima de 5 minutos."),
  displayDuration: z.boolean().default(true),
  price: z.string().min(1, "O preço é obrigatório.").regex(/^\d+(,\d{2})?$/, "Formato de preço inválido (ex: 50 ou 50,00)"),
  active: z.boolean().default(true),
  image: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const mockExistingServices: { [key: string]: ServiceFormData } = {
  "1": { name: "Corte de Cabelo Masculino", description: "Corte moderno e estiloso para homens.", category: "Beleza e Estética", duration: 45, displayDuration: true, active: true, image: "https://placehold.co/300x200.png?text=Corte+Masc", price: "50,00" },
  "2": { name: "Consulta Psicológica Online", description: "Sessão de terapia online com psicólogo.", category: "Saúde e Bem-estar", duration: 50, displayDuration: true, active: true, image: "https://placehold.co/300x200.png?text=Psico+Online", price: "120,00" },
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
    defaultValues: {
      name: "",
      description: "",
      category: "",
      duration: 60,
      displayDuration: true,
      active: true,
      image: "https://placehold.co/300x200.png?text=Serviço",
      price: "",
    },
  });
  
  const serviceName = form.watch("name");

  useEffect(() => {
    if (serviceId) {
      const existingService = mockExistingServices[serviceId];
      if (existingService) {
        form.reset(existingService);
        setImagePreview(existingService.image || "https://placehold.co/300x200.png?text=Serviço");
      } else {
        toast({ title: "Erro", description: "Serviço não encontrado.", variant: "destructive" });
      }
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
        form.setValue("image", result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    const placeholder = "https://placehold.co/300x200.png?text=Serviço";
    setImagePreview(placeholder);
    form.setValue("image", placeholder);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    setIsSaving(true);
    console.log("Atualizando serviço:", serviceId, data);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Serviço Atualizado!",
      description: `O serviço "${data.name}" foi atualizado com sucesso.`,
    });
    setIsSaving(false);
  };

  const handleDelete = async () => {
    console.log("Excluindo serviço:", serviceId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Serviço Excluído",
      description: `O serviço "${form.getValues("name")}" foi excluído.`,
      variant: "destructive"
    });
    router.push('/dashboard/company/services');
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><p>Carregando dados do serviço...</p></div>;
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
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
           <Controller
              name="active"
              control={form.control}
              render={({ field }) => (
                 <FormItem className="flex items-center space-x-2">
                    <FormControl>
                        <Switch
                            id="service-active"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <Label htmlFor="service-active" className="text-sm mb-0">Ativo</Label>
                 </FormItem>
              )}
            />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive"><Trash2 className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">Excluir</span></Button>
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
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
            <Save className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">{isSaving ? "Salvando..." : "Salvar"}</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="configurations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="configurations">Configurações</TabsTrigger>
          <TabsTrigger value="availability" disabled>Disponibilidade</TabsTrigger>
          <TabsTrigger value="users" disabled>Profissionais</TabsTrigger>
          <TabsTrigger value="bling" disabled>Bling (Integração)</TabsTrigger>
        </TabsList>

        <TabsContent value="configurations">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <Form {...form}>
                <form className="space-y-6"> {/* onSubmit é tratado pelo botão Salvar no header */}
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
                        <FormLabel>Descrição</FormLabel>
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
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => ( // field é passado, mas não usado diretamente para input file. setValue é usado no onChange.
                      <FormItem>
                        <FormLabel>Imagem do Serviço</FormLabel>
                        <FormControl>
                          <>
                            <div className="flex items-center gap-4">
                              {imagePreview && (
                                <div className="relative w-[150px] h-[100px] md:w-[200px] md:h-[133px]">
                                  <Image src={imagePreview} alt="Preview do serviço" layout="fill" objectFit="cover" className="rounded-md border" data-ai-hint="ilustração serviço"/>
                                  {form.getValues("image") !== "https://placehold.co/300x200.png?text=Serviço" && (
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 bg-background/70 hover:bg-destructive hover:text-destructive-foreground h-6 w-6" onClick={removeImage}>
                                      <XCircle className="h-4 w-4"/>
                                    </Button>
                                  )}
                                </div>
                              )}
                              <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" id="service-image-upload" />
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
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="availability">
          <Card>
            <CardHeader><CardTitle>Disponibilidade do Serviço</CardTitle><CardDescription>Defina quando este serviço está disponível (em breve).</CardDescription></CardHeader>
            <CardContent><p className="text-muted-foreground">Configurações de disponibilidade específica para este serviço estarão disponíveis aqui.</p></CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="users">
          <Card>
            <CardHeader><CardTitle>Profissionais</CardTitle><CardDescription>Associe profissionais a este serviço (em breve).</CardDescription></CardHeader>
            <CardContent><p className="text-muted-foreground">Selecione quais profissionais podem realizar este serviço.</p></CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="bling">
          <Card>
            <CardHeader><CardTitle>Integração Bling</CardTitle><CardDescription>Configure a integração com o Bling para este serviço (em breve).</CardDescription></CardHeader>
            <CardContent><p className="text-muted-foreground">Detalhes da integração com o Bling.</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    