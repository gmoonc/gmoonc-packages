export interface Mensagem {
  id: string;
  user_id: string | null;
  nome: string;
  email: string;
  telefone: string | null;
  empresa_fazenda: string;
  mensagem: string;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MensagemFormData {
  nome: string;
  email: string;
  telefone: string;
  empresa_fazenda: string;
  mensagem: string;
}

export interface MensagemFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export const STATUS_OPTIONS = [
  { value: '', label: 'Todos os Status' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' }
] as const;

export const STATUS_COLORS = {
  rascunho: 'bg-gray-100 text-gray-700 border border-gray-300 font-semibold',
  pendente: 'bg-indigo-50 text-[#879FED] border border-indigo-200 font-semibold',
  em_analise: 'bg-yellow-50 text-yellow-800 border border-yellow-200 font-semibold',
  concluida: 'bg-green-50 text-green-700 border border-green-200 font-semibold',
  cancelada: 'bg-red-50 text-red-700 border border-red-200 font-semibold'
} as const;
