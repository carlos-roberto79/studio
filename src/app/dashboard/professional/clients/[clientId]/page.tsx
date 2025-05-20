
"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { useAuth } from '@/contexts/AuthContext';
import { APP_NAME, USER_ROLES } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { User, Phone, MapPin, CalendarDays, History, Edit2, Trash2, FileText, UploadCloud, PlusCircle, Eye, EyeOff, BarChartHorizontalBig, Star, ImagePlus, ChevronDown, SearchIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";


// TODO: Substituir este mock por chamadas ao SupabaseService
// Para buscar: detalhes do cliente, agendamentos (passados/futuros), anotações, arquivos e imagens.
interface ClientNote {
  id: string;
  dateTime: string;
  title: string;
  content: string;
  rating: number;
  visibleToClient: boolean;
}

interface ClientFile {
  id: string;
  customName: string;
  fileName: string;
  fileType: string;
  fileUrl: string; // Placeholder or Data URL for preview
  visibleToClient: boolean;
  fileData?: File; // Store actual file object for temporary use
}

interface ClientImage {
  id: string;
  title: string;
  observation?: string;
  imageUrl: string; // Placeholder or Data URL
  visibleToClient: boolean;
  fileData?: File; // Store actual file object for temporary use
  dataAiHint?: string; 
}

interface ClientData {
  id: string;
  name: string;
  phone: string;
  address?: string;
  pastAppointments: Array<{ service: string; date: string; time: string; professional: string }>;
  futureAppointments: Array<{ service: string; date: string; time: string; professional: string }>;
  serviceNotesEnabled: boolean;
  notes: ClientNote[];
  files: ClientFile[];
  images: ClientImage[];
}

const mockClientDatabase: Record<string, ClientData> = {
  "client123": {
    id: "client123",
    name: "Fernanda Costa",
    phone: "(21) 98765-4321",
    address: "Rua das Palmeiras, 101, Rio de Janeiro, RJ",
    pastAppointments: [
      { service: "Sessão de Terapia Inicial", date: "10/06/2024", time: "14:00", professional: "Dr. Silva" },
      { service: "Acompanhamento Semanal", date: "17/06/2024", time: "14:00", professional: "Dr. Silva" },
    ],
    futureAppointments: [
      { service: "Acompanhamento Semanal", date: "01/07/2024", time: "15:00", professional: "Dr. Silva" },
    ],
    serviceNotesEnabled: true,
    notes: [
      { id: "note1", dateTime: new Date(2024, 5, 10, 15, 0).toISOString(), title: "Primeira Sessão", content: "Cliente apresentou-se ansiosa, discutimos objetivos iniciais.", rating: 7, visibleToClient: false },
      { id: "note2", dateTime: new Date(2024, 5, 17, 15, 0).toISOString(), title: "Progresso e Desafios", content: "Houve melhora na gestão da ansiedade, mas dificuldades com prazos no trabalho persistem.", rating: 8, visibleToClient: true },
    ],
    files: [
      { id: "file1", customName: "Resultados Teste Ansiedade", fileName: "teste_ansiedade.pdf", fileType: "application/pdf", fileUrl: "#", visibleToClient: true },
    ],
    images: [
      { id: "img1", title: "Quadro de Emoções", observation: "Construído na sessão de 24/06", imageUrl: "https://placehold.co/300x200.png?text=Quadro", visibleToClient: false, dataAiHint:"quadro emocoes"},
    ],
  },
  "client456": {
    id: "client456",
    name: "Roberto Almeida",
    phone: "(11) 91234-5678",
    address: "Av. Paulista, 500, São Paulo, SP",
    pastAppointments: [
      { service: "Consulta de Avaliação", date: "05/05/2024", time: "10:00", professional: "Dra. Oliveira" },
    ],
    futureAppointments: [],
    serviceNotesEnabled: true,
    notes: [
      { id: "note3", dateTime: new Date(2024, 4, 5, 11, 0).toISOString(), title: "Avaliação Inicial", content: "Cliente busca orientação vocacional.", rating: 6, visibleToClient: true },
    ],
    files: [],
    images: [],
  },
  "client789": {
    id: "client789",
    name: "Carla Dias",
    phone: "(31) 99876-1234",
    address: "", // Sem endereço
    pastAppointments: [],
    futureAppointments: [
        { service: "Sessão de Coaching", date: "10/08/2024", time: "10:00", professional: "Dr. Silva" },
    ],
    serviceNotesEnabled: false,
    notes: [],
    files: [],
    images: [],
  },
};

const allClientsForSelection = Object.keys(mockClientDatabase).map(key => ({
  id: key,
  name: mockClientDatabase[key].name,
}));


export default function ClientProfilePage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;

  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);

  // State for new note form
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteRating, setNewNoteRating] = useState<number>(5);
  const [newNoteVisible, setNewNoteVisible] = useState(false);

  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState("");
  const [fileVisibleToClient, setFileVisibleToClient] = useState(false);

  // State for image upload
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageTitle, setImageTitle] = useState("");
  const [imageObservation, setImageObservation] = useState("");
  const [imageVisibleToClient, setImageVisibleToClient] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  useEffect(() => {
    document.title = `Perfil do Cliente - ${APP_NAME}`;
    if (!authLoading) {
      if (!user || role !== USER_ROLES.PROFESSIONAL) {
        router.push('/dashboard');
      }
    }
  }, [user, role, authLoading, router]);

  useEffect(() => {
    if (clientId) {
      setLoadingData(true);
      // TODO: Em uma implementação real, buscar os dados do cliente (e seus relacionamentos) do Supabase
      // usando o supabaseService e o clientId.
      // Ex: getClientDetails(clientId), getClientAppointments(clientId), getClientNotes(clientId), etc.
      setTimeout(() => {
        const data = mockClientDatabase[clientId];
        if (data) {
          setClientData(data);
        } else {
          toast({ title: "Erro", description: "Cliente não encontrado.", variant: "destructive" });
          // Não redirecionar imediatamente, pode ser que o usuário queira selecionar outro cliente
          // router.push("/dashboard/professional"); 
        }
        setLoadingData(false);
      }, 500);
    }
  }, [clientId]);

  const handleAddNote = () => {
    // TODO: Substituir por chamada ao supabaseService para adicionar nota.
    if (!clientData || !newNoteTitle || !newNoteContent) {
      toast({ title: "Erro", description: "Título e conteúdo da nota são obrigatórios.", variant: "destructive"});
      return;
    }
    const newNote: ClientNote = {
      id: `note${Date.now()}`,
      dateTime: new Date().toISOString(),
      title: newNoteTitle,
      content: newNoteContent,
      rating: newNoteRating,
      visibleToClient: newNoteVisible,
    };
    setClientData(prev => prev ? { ...prev, notes: [...prev.notes, newNote].sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()) } : null);
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteRating(5);
    setNewNoteVisible(false);
    toast({ title: "Anotação Adicionada", description: "Sua anotação foi salva (simulação)." });
  };
  
  const toggleNoteVisibility = (noteId: string) => {
    // TODO: Substituir por chamada ao supabaseService para atualizar visibilidade da nota.
    setClientData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        notes: prev.notes.map(note => 
          note.id === noteId ? { ...note, visibleToClient: !note.visibleToClient } : note
        )
      };
    });
  };

  const handleFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setCustomFileName(event.target.files[0].name.split('.')[0]); 
    }
  };

  const handleAddFile = () => {
    // TODO: Substituir por chamada ao supabaseService para fazer upload do arquivo e salvar metadados.
    if (!clientData || !selectedFile || !customFileName) {
        toast({ title: "Erro", description: "Selecione um arquivo e forneça um nome.", variant: "destructive"});
        return;
    }
    const newFile: ClientFile = {
        id: `file${Date.now()}`,
        customName: customFileName,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileUrl: URL.createObjectURL(selectedFile), 
        visibleToClient: fileVisibleToClient,
        fileData: selectedFile,
    };
    setClientData(prev => prev ? { ...prev, files: [...prev.files, newFile] } : null);
    setSelectedFile(null);
    setCustomFileName("");
    setFileVisibleToClient(false);
    if (document.getElementById('file-upload-input')) {
        (document.getElementById('file-upload-input') as HTMLInputElement).value = "";
    }
    toast({ title: "Arquivo Adicionado", description: `${customFileName} foi adicionado (simulação).` });
  };

  const toggleFileVisibility = (fileId: string) => {
    // TODO: Substituir por chamada ao supabaseService para atualizar visibilidade do arquivo.
     setClientData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        files: prev.files.map(file => 
          file.id === fileId ? { ...file, visibleToClient: !file.visibleToClient } : file
        )
      };
    });
  };

  const handleImageSelected = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        setSelectedImageFile(file);
        setImageTitle(file.name.split('.')[0]);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        }
        reader.readAsDataURL(file);
    }
  };

  const handleAddImage = () => {
    // TODO: Substituir por chamada ao supabaseService para fazer upload da imagem e salvar metadados.
     if (!clientData || !selectedImageFile || !imageTitle) {
        toast({ title: "Erro", description: "Selecione uma imagem e forneça um título.", variant: "destructive"});
        return;
    }
    const newImage: ClientImage = {
        id: `img${Date.now()}`,
        title: imageTitle,
        observation: imageObservation,
        imageUrl: imagePreview || "https://placehold.co/150x100.png?text=IMG",
        visibleToClient: imageVisibleToClient,
        fileData: selectedImageFile,
        dataAiHint: "imagem cliente" 
    };
    setClientData(prev => prev ? { ...prev, images: [...prev.images, newImage] } : null);
    setSelectedImageFile(null);
    setImageTitle("");
    setImageObservation("");
    setImageVisibleToClient(false);
    setImagePreview(null);
     if (document.getElementById('image-upload-input')) {
        (document.getElementById('image-upload-input') as HTMLInputElement).value = "";
    }
    toast({ title: "Imagem Adicionada", description: `A imagem "${imageTitle}" foi adicionada (simulação).` });
  };

  const toggleImageVisibility = (imageId: string) => {
    // TODO: Substituir por chamada ao supabaseService para atualizar visibilidade da imagem.
    setClientData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        images: prev.images.map(img => 
          img.id === imageId ? { ...img, visibleToClient: !img.visibleToClient } : img
        )
      };
    });
  };

  const filteredClientsForSelection = allClientsForSelection.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (authLoading || loadingData) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <Skeleton className="h-8 w-1/2" />
            </div>
            <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="grid md:grid-cols-2 gap-6">
          <Card><CardHeader><Skeleton className="h-6 w-1/3 mb-2" /><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-1/3 mb-2" /><Skeleton className="h-4 w-2/3" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
        <div className="space-y-6 p-4 md:p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Cliente não encontrado ou nenhum cliente selecionado</CardTitle>
                    <CardDescription>Use o seletor abaixo para encontrar um cliente.</CardDescription>
                </CardHeader>
                <CardContent>
                <Popover open={isClientSelectorOpen} onOpenChange={setIsClientSelectorOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                        Selecionar Cliente <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                        <div className="p-2 border-b">
                        <div className="flex items-center space-x-2">
                            <SearchIcon className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-8"
                            />
                        </div>
                        </div>
                        <ScrollArea className="h-[200px]">
                        {filteredClientsForSelection.length > 0 ? (
                            filteredClientsForSelection.map(client => (
                            <Button
                                key={client.id}
                                variant="ghost"
                                className="w-full justify-start text-sm py-1.5 h-auto rounded-none"
                                onClick={() => {
                                router.push(`/dashboard/professional/clients/${client.id}`);
                                setIsClientSelectorOpen(false);
                                setSearchTerm(""); 
                                }}
                            >
                                {client.name}
                            </Button>
                            ))
                        ) : (
                            <p className="p-2 text-sm text-muted-foreground text-center">Nenhum cliente encontrado.</p>
                        )}
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
                </CardContent>
            </Card>
        </div>
    )
  }
  
  const notesChartData = clientData.notes
    .filter(note => note.rating > 0)
    .map(note => ({
      name: note.title.substring(0, 15) + (note.title.length > 15 ? "..." : ""), 
      Nota: note.rating,
      data: format(new Date(note.dateTime), "dd/MM", { locale: ptBR })
    }));


  return (
    <div className="space-y-6 p-1 md:p-2 lg:p-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
            <div className='flex items-center'>
                <User className="h-8 w-8 text-primary mr-3 flex-shrink-0" />
                <CardTitle className="text-2xl sm:text-3xl font-bold">{clientData.name}</CardTitle>
            </div>
            <Popover open={isClientSelectorOpen} onOpenChange={setIsClientSelectorOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto text-sm">
                  Trocar Cliente <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="end">
                <div className="p-2 border-b">
                  <div className="flex items-center space-x-2">
                     <SearchIcon className="h-4 w-4 text-muted-foreground" />
                     <Input
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8"
                     />
                  </div>
                </div>
                <ScrollArea className="h-[200px]">
                  {filteredClientsForSelection.length > 0 ? (
                    filteredClientsForSelection.map(client => (
                      <Button
                        key={client.id}
                        variant="ghost"
                        className="w-full justify-start text-sm py-1.5 h-auto rounded-none"
                        onClick={() => {
                          router.push(`/dashboard/professional/clients/${client.id}`);
                          setIsClientSelectorOpen(false);
                          setSearchTerm(""); 
                        }}
                      >
                        {client.name}
                      </Button>
                    ))
                  ) : (
                    <p className="p-2 text-sm text-muted-foreground text-center">Nenhum cliente encontrado.</p>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          <CardDescription>Painel de acompanhamento completo do cliente. <span className="text-xs text-muted-foreground">(Dados mockados. Integração com Supabase pendente)</span></CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <p className="flex items-center"><Phone className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Telefone:</strong> <span className="ml-1">{clientData.phone}</span></p>
                {clientData.address && <p className="flex items-center"><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> <strong>Endereço:</strong> <span className="ml-1">{clientData.address}</span></p>}
            </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="infoGerais" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="infoGerais">Info Gerais</TabsTrigger>
          <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
          <TabsTrigger value="imagens">Imagens</TabsTrigger>
        </TabsList>

        <TabsContent value="infoGerais">
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><History className="mr-2 h-5 w-5 text-primary" />Agendamentos Passados</CardTitle></CardHeader>
              <CardContent>
                {clientData.pastAppointments.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow><TableHead>Serviço</TableHead><TableHead>Data</TableHead><TableHead>Hora</TableHead><TableHead>Profissional</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {clientData.pastAppointments.map((appt, i) => (
                        <TableRow key={`past-${i}`}><TableCell>{appt.service}</TableCell><TableCell>{appt.date}</TableCell><TableCell>{appt.time}</TableCell><TableCell>{appt.professional}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">Nenhum agendamento passado.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" />Agendamentos Futuros</CardTitle></CardHeader>
              <CardContent>
                 {clientData.futureAppointments.length > 0 ? (
                  <Table>
                    <TableHeader><TableRow><TableHead>Serviço</TableHead><TableHead>Data</TableHead><TableHead>Hora</TableHead><TableHead>Profissional</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {clientData.futureAppointments.map((appt, i) => (
                        <TableRow key={`future-${i}`}><TableCell>{appt.service}</TableCell><TableCell>{appt.date}</TableCell><TableCell>{appt.time}</TableCell><TableCell>{appt.professional}</TableCell></TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <p className="text-muted-foreground">Nenhum agendamento futuro.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anotacoes">
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Anotações de Atendimento</CardTitle>
                    {!clientData.serviceNotesEnabled && <CardDescription className="text-orange-600">Funcionalidade de notas de serviço não está ativa para este cliente.</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-6">
                    {clientData.serviceNotesEnabled && (
                        <Card className="p-4 bg-secondary/50">
                            <CardTitle className="text-lg mb-2">Nova Anotação</CardTitle>
                            <div className="space-y-3">
                                <Input placeholder="Título da Anotação" value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} />
                                <Textarea placeholder="Detalhes da anotação..." value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} rows={4} />
                                <div className="flex items-center gap-4">
                                    <Label htmlFor="note-rating">Nota (1-10):</Label>
                                    <Select value={String(newNoteRating)} onValueChange={val => setNewNoteRating(Number(val))}>
                                        <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>{Array.from({length: 10}, (_, i) => i + 1).map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="note-visible" checked={newNoteVisible} onCheckedChange={setNewNoteVisible} />
                                    <Label htmlFor="note-visible">Visível para o Cliente</Label>
                                </div>
                                <Button onClick={handleAddNote}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Anotação</Button>
                            </div>
                        </Card>
                    )}

                    {clientData.notes.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mt-6 mb-3">Histórico de Anotações</h3>
                            <div className="space-y-4">
                                {clientData.notes.sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()).map(note => (
                                    <Card key={note.id}>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-md">{note.title}</CardTitle>
                                                    <CardDescription className="text-xs">{format(new Date(note.dateTime), "dd/MM/yyyy HH:mm", {locale: ptBR})}</CardDescription>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={note.visibleToClient ? "default" : "secondary"} className={note.visibleToClient ? "bg-green-500 text-white" : ""}>{note.visibleToClient ? "Visível" : "Oculto"}</Badge>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleNoteVisibility(note.id)} title={note.visibleToClient ? "Ocultar do cliente" : "Tornar visível para cliente"}>
                                                        {note.visibleToClient ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                            <p className="whitespace-pre-wrap">{note.content}</p>
                                            <div className="flex items-center mt-2">
                                               <Star className="h-4 w-4 text-yellow-400 mr-1" /> <span className="font-medium">{note.rating}/10</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-2">
                                            <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => alert("Funcionalidade de editar anotação a ser implementada.")}>Editar</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                    {clientData.serviceNotesEnabled && notesChartData.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader><CardTitle className="text-lg flex items-center"><BarChartHorizontalBig className="mr-2 h-5 w-5"/> Histórico de Notas (Gráfico)</CardTitle></CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={notesChartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" domain={[0, 10]} ticks={[0,2,4,6,8,10]} />
                                        <YAxis dataKey="data" type="category" width={50} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Nota" fill="hsl(var(--primary))" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="arquivos">
            <Card className="mt-6">
                <CardHeader><CardTitle className="flex items-center"><UploadCloud className="mr-2 h-5 w-5 text-primary"/>Gerenciamento de Arquivos</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <Card className="p-4 bg-secondary/50">
                        <CardTitle className="text-lg mb-3">Adicionar Novo Arquivo</CardTitle>
                        <div className="space-y-3">
                            <Input id="file-upload-input" type="file" accept=".txt,.doc,.docx,.xls,.xlsx,.pdf" onChange={handleFileSelected} />
                            <Input placeholder="Nome personalizado para o arquivo" value={customFileName} onChange={e => setCustomFileName(e.target.value)} disabled={!selectedFile} />
                            <div className="flex items-center space-x-2">
                                <Switch id="file-visible" checked={fileVisibleToClient} onCheckedChange={setFileVisibleToClient} disabled={!selectedFile}/>
                                <Label htmlFor="file-visible">Visível para o Cliente</Label>
                            </div>
                            <Button onClick={handleAddFile} disabled={!selectedFile || !customFileName}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Arquivo</Button>
                        </div>
                    </Card>
                    {clientData.files.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mt-6 mb-3">Arquivos Anexados</h3>
                            <Table>
                                <TableHeader><TableRow><TableHead>Nome Personalizado</TableHead><TableHead>Arquivo Original</TableHead><TableHead>Tipo</TableHead><TableHead>Visibilidade</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {clientData.files.map(file => (
                                        <TableRow key={file.id}>
                                            <TableCell>{file.customName}</TableCell>
                                            <TableCell className="text-xs">{file.fileName}</TableCell>
                                            <TableCell className="text-xs">{file.fileType}</TableCell>
                                            <TableCell>
                                               <Switch checked={file.visibleToClient} onCheckedChange={() => toggleFileVisibility(file.id)} />
                                            </TableCell>
                                            <TableCell className="text-right space-x-1">
                                                <Button variant="outline" size="sm" onClick={() => alert(`Simulando download de ${file.fileName}`)}>Baixar</Button>
                                                <Button variant="ghost" size="icon" onClick={() => alert("Funcionalidade de editar arquivo a ser implementada.")} title="Editar"><Edit2 className="h-4 w-4"/></Button>
                                                {/* Botão de excluir arquivo pode ser adicionado aqui */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="imagens">
            <Card className="mt-6">
                <CardHeader><CardTitle className="flex items-center"><ImagePlus className="mr-2 h-5 w-5 text-primary"/>Gerenciamento de Imagens</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                     <Card className="p-4 bg-secondary/50">
                        <CardTitle className="text-lg mb-3">Adicionar Nova Imagem</CardTitle>
                        <div className="space-y-3">
                            {imagePreview && <Image src={imagePreview} alt="Preview da imagem" width={150} height={100} className="rounded-md border object-cover" data-ai-hint="preview imagem upload"/>}
                            <Input id="image-upload-input" type="file" accept="image/*" onChange={handleImageSelected} />
                            <Input placeholder="Título da Imagem" value={imageTitle} onChange={e => setImageTitle(e.target.value)} disabled={!selectedImageFile} />
                            <Textarea placeholder="Observação (opcional)" value={imageObservation} onChange={e => setImageObservation(e.target.value)} rows={2} disabled={!selectedImageFile} />
                            <div className="flex items-center space-x-2">
                                <Switch id="image-visible" checked={imageVisibleToClient} onCheckedChange={setImageVisibleToClient} disabled={!selectedImageFile}/>
                                <Label htmlFor="image-visible">Visível para o Cliente</Label>
                            </div>
                            <Button onClick={handleAddImage} disabled={!selectedImageFile || !imageTitle}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Imagem</Button>
                        </div>
                    </Card>
                    {clientData.images.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mt-6 mb-3">Imagens Anexadas</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {clientData.images.map(img => (
                                    <Card key={img.id} className="overflow-hidden">
                                        <Image src={img.imageUrl} alt={img.title} width={300} height={200} className="w-full h-40 object-cover" data-ai-hint={img.dataAiHint || "foto cliente"}/>
                                        <CardContent className="p-3 text-sm">
                                            <p className="font-semibold truncate">{img.title}</p>
                                            {img.observation && <p className="text-xs text-muted-foreground truncate">{img.observation}</p>}
                                            <div className="flex items-center justify-between mt-2">
                                                <Label htmlFor={`img-vis-${img.id}`} className="text-xs">Visível:</Label>
                                                <Switch id={`img-vis-${img.id}`} checked={img.visibleToClient} onCheckedChange={() => toggleImageVisibility(img.id)} />
                                            </div>
                                            <Button variant="link" size="xs" className="p-0 h-auto mt-1" onClick={() => alert("Funcionalidade de editar imagem a ser implementada.")}>Editar</Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
