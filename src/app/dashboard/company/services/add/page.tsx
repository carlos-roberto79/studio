
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_NAME } from "@/lib/constants";
import { ArrowLeft, Save, Trash2, ImagePlus, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  price: z.string().min(1, "O preço é obrigatório.").regex(/^\d+(,\d{2})?$/, "Formato de preço inválido (ex: 50 ou 50,00)"), // Allow R$XX or R$XX,YY
  active: z.boolean().default(true),
  image: z.string().optional(), // Store as base64 data URL or a placeholder URL
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function AddServicePage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
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
      price: "",
      active: true,
      image: "https://placehold.co/300x200.png?text=Serviço",
    },
  });

  useEffect(() => {
    document.title = `Adicionar Novo Serviço - ${APP_NAME}`;
    setImagePreview(form.getValues("image") || "https://placehold.co/300x200.png?text=Serviço");
  }, [form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue("image", result); // Store base64
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
    console.log("Salvando serviço:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Serviço Adicionado!",
      description: `O serviço "${data.name}" foi cadastrado com sucesso.`,
    });
    form.reset();
    removeImage(); // Reset image to placeholder
    setIsSaving(false);
    // Potentially redirect to services list: router.push('/dashboard/company/services');
  };

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
            <CardTitle className="text-2xl md:text-3xl font-bold">Adicionar Novo Serviço</CardTitle>
          </CardHeader>
        </div>
        <div className="flex items-center gap-2">
           <Controller
              name="active"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="service-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="service-active" className="text-sm">Ativo</Label>
                </div>
              )}
            />
          <Button type="button" variant="destructive" disabled> <Trash2 className="mr-0 md:mr-2 h-4 w-4" /> <span className="hidden md:inline">Excluir</span></Button>
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Serviço</FormLabel>
                        <Input {...field} placeholder="Ex: Psicoterapia Breve (Patrus)" />
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
                        <Textarea {...field} placeholder="Transforme sua vida com..." rows={4} />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormItem>
                    <FormLabel>Imagem do Serviço</FormLabel>
                    <div className="flex items-center gap-4">
                      {imagePreview && (
                        <div className="relative w-[150px] h-[100px] md:w-[200px] md:h-[133px]">
                           <Image src={imagePreview} alt="Preview do serviço" layout="fill" objectFit="cover" className="rounded-md border" data-ai-hint="ilustração serviço" />
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
                     <FormMessage>{form.formState.errors.image?.message}</FormMessage>
                  </FormItem>

                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duração (em minutos)</FormLabel>
                            <Input type="number" {...field} placeholder="60" />
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
                            <Input {...field} placeholder="Ex: 120,00 ou 120" />
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                 </div>

                  <Controller
                    name="displayDuration"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Exibir duração na página de agendamento</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  {/* Botão Salvar já está no cabeçalho da página */}
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

    