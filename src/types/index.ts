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
