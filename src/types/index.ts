export interface Faturamento {
    id: number;
    dataFaturamento: string;
    valor: number;
    dataCriacao: string;
}

export interface FaturamentoRequest {
    dataFaturamento: string;
    valor: number;
}

export interface PagamentoAdiantado {
    id: number;
    dataPagamento: string;
    valor: number;
    descricao?: string;
    dataCriacao: string;
}

export interface AdiantamentoRequest {
    dataPagamento: string;
    valor: number;
    descricao?: string;
}

export interface ComissaoCalculada {
    anoMesReferencia: string;
    faturamentoMensal: number;
    faixaComissao: string;
    porcentagemComissao: number;
    valorBrutoComissao: number;
    valorAdiantado: number;
    saldoAReceber: number;
}

export type CategoriaDespesa = 'ALIMENTACAO' | 'COMBUSTIVEL' | 'FERRAMENTAS' | 'MARKETING' | 'INFRAESTRUTURA' | 'PROLABORE' | 'DIVERSOS' | 'OUTROS';

export interface Despesa {
    id: number;
    dataDespesa: string;
    valor: number;
    categoria: CategoriaDespesa;
    descricao?: string;
    dataCriacao: string;
}

export interface DespesaRequest {
    dataDespesa: string;
    valor: number;
    categoria: CategoriaDespesa;
    descricao?: string;
}

export interface RelatorioFinanceiro {
    despesasPorCategoria: Record<string, number>;
    faturamentoTotal: number;
    despesasTotal: number;
    imposto: number;
    adiantamentosTotal: number;
    comissaoAlocada: number;
    saldoRemanescenteComissao: number;
    totalGeral: number;
    lucroLiquido: number;
}

export interface ErrorResponse {
    status: number;
    message: string;
    error: string;
    timestamp: string;
    path: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ErrorResponse;
    isLoading: boolean;
    isError: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string; // User specified 'password' in the JSON example
}

export interface UserResponse {
    token: string;
    email: string;
    role?: string;
    roles?: string[];
    expiresIn: number;
}

export interface User {
    id: number;
    email: string;
    role?: 'USER' | 'ADMIN' | string;
    roles?: string[];
    active: boolean;
}
