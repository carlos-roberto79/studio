
export interface Plan {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: "mensal" | "anual";
  recursos: string[];
  ativo: boolean;
}

// Outros tipos globais podem ser adicionados aqui
