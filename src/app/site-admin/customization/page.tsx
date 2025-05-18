
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Settings, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { APP_NAME } from '@/lib/constants';

// Mock para lista de empresas (para o seletor)
const mockCompaniesForCustomization = [
  { id: "comp1", name: "Salão Cortes Modernos" },
  { id: "comp2", name: "Clínica Sorriso Feliz" },
  { id: "comp3", name: "Academia Corpo em Movimento" },
];

export default function CustomizationPage() {
  const { toast } = useToast();
  const [globalPrimaryColor, setGlobalPrimaryColor] = useState("#A0CED9"); // Ex: --primary HSL: 195 37% 75%
  const [globalBackgroundColor, setGlobalBackgroundColor] = useState("#F2F4F6"); // Ex: --background HSL: 210 17% 95%
  
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companyPrimaryColor, setCompanyPrimaryColor] = useState("#3066BE");
  const [companyLayout, setCompanyLayout] = useState<string>("default");

  useEffect(() => {
    document.title = `Personalização - Painel Site Admin - ${APP_NAME}`;
  }, []);

  const handleSaveGlobalSettings = () => {
    console.log("BACKEND_SIM (SITE_ADMIN): Salvando configurações globais de personalização:", { globalPrimaryColor, globalBackgroundColor });
    toast({ title: "Configurações Globais Salvas (Simulação)", description: "As alterações de layout e cor globais foram aplicadas." });
    // Em uma aplicação real, isso atualizaria variáveis CSS globais ou um tema.
  };

  const handleSaveCompanySettings = () => {
    if (!selectedCompany) {
      toast({ title: "Erro", description: "Selecione uma empresa para aplicar personalizações.", variant: "destructive" });
      return;
    }
    console.log("BACKEND_SIM (SITE_ADMIN): Salvando personalizações para empresa:", { companyId: selectedCompany, companyPrimaryColor, companyLayout });
    toast({ title: "Personalização da Empresa Salva (Simulação)", description: `As alterações para "${mockCompaniesForCustomization.find(c=>c.id===selectedCompany)?.name}" foram salvas.` });
  };

  return (
    <div className="space-y-8">
      <CardHeader className="px-0">
        <div className="flex items-center">
          <Palette className="mr-3 h-8 w-8 text-primary" />
          <div>
            <CardTitle className="text-3xl font-bold">Personalização da Interface</CardTitle>
            <CardDescription>Ajuste a aparência global do sistema ou personalize para empresas específicas.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Settings className="mr-2 h-5 w-5"/> Configurações Globais de Aparência</CardTitle>
          <CardDescription>Estas configurações afetarão a aparência padrão para todas as empresas, a menos que uma personalização específica seja aplicada.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="global-primary-color">Cor Primária Global (Hex)</Label>
              <Input 
                id="global-primary-color" 
                type="color" 
                value={globalPrimaryColor} 
                onChange={(e) => setGlobalPrimaryColor(e.target.value)} 
                className="h-10 p-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Exemplo: A cor principal de botões e destaques.</p>
            </div>
            <div>
              <Label htmlFor="global-bg-color">Cor de Fundo Global (Hex)</Label>
              <Input 
                id="global-bg-color" 
                type="color" 
                value={globalBackgroundColor} 
                onChange={(e) => setGlobalBackgroundColor(e.target.value)}
                className="h-10 p-1"
              />
               <p className="text-xs text-muted-foreground mt-1">Exemplo: A cor de fundo principal das páginas.</p>
            </div>
          </div>
          {/* Adicionar mais opções globais aqui (ex: fonte, logo padrão do sistema) */}
          <div className="flex justify-end">
            <Button onClick={handleSaveGlobalSettings}>Salvar Configurações Globais (Simulação)</Button>
          </div>
          <p className="text-sm text-muted-foreground italic">
            Nota: A aplicação real dessas cores e layouts no CSS dinamicamente é uma tarefa complexa.
            Esta interface serve para demonstrar os campos de entrada.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Building className="mr-2 h-5 w-5"/> Personalização por Empresa</CardTitle>
          <CardDescription>Sobrescreva as configurações globais para uma empresa específica.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="select-company">Selecione uma Empresa</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger id="select-company">
                <SelectValue placeholder="Escolha uma empresa..." />
              </SelectTrigger>
              <SelectContent>
                {mockCompaniesForCustomization.map(company => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompany && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-primary-color">Cor Primária da Empresa (Hex)</Label>
                  <Input 
                    id="company-primary-color" 
                    type="color" 
                    value={companyPrimaryColor} 
                    onChange={(e) => setCompanyPrimaryColor(e.target.value)}
                    className="h-10 p-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="company-layout">Layout da Empresa</Label>
                  <Select value={companyLayout} onValueChange={setCompanyLayout}>
                    <SelectTrigger id="company-layout">
                      <SelectValue placeholder="Padrão do Sistema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Padrão do Sistema</SelectItem>
                      <SelectItem value="compact">Compacto</SelectItem>
                      <SelectItem value="modern">Moderno com Barra Lateral Larga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Adicionar mais opções de personalização por empresa (ex: logo da empresa, banner) */}
              <div className="flex justify-end">
                <Button onClick={handleSaveCompanySettings}>Salvar Personalização da Empresa (Simulação)</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    