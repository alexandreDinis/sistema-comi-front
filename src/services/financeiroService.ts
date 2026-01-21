import api from './api';
import type {
    ContaPagar,
    ContaReceber,
    ResumoFinanceiro,
    FluxoCaixa,
    PagarContaRequest,
    ReceberContaRequest
} from '../types';

export const financeiroService = {
    // ========================================
    // CONTAS A PAGAR
    // ========================================

    listarContasPagar: async (status?: string): Promise<ContaPagar[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await api.get(`/financeiro/contas-pagar${params}`);
        return response.data;
    },

    pagarConta: async (id: number, request: PagarContaRequest): Promise<ContaPagar> => {
        const response = await api.post(`/financeiro/contas-pagar/${id}/pagar`, request);
        return response.data;
    },

    // ========================================
    // CONTAS A RECEBER
    // ========================================

    listarContasReceber: async (status?: string): Promise<ContaReceber[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await api.get(`/financeiro/contas-receber${params}`);
        return response.data;
    },

    receberConta: async (id: number, request: ReceberContaRequest): Promise<ContaReceber> => {
        const response = await api.post(`/financeiro/contas-receber/${id}/receber`, request);
        return response.data;
    },

    // ========================================
    // FLUXO DE CAIXA
    // ========================================

    getFluxoCaixa: async (mes: number, ano: number): Promise<FluxoCaixa> => {
        const response = await api.get(`/financeiro/fluxo-caixa?mes=${mes}&ano=${ano}`);
        return response.data;
    },

    // ========================================
    // RESUMO FINANCEIRO
    // ========================================

    getResumo: async (): Promise<ResumoFinanceiro> => {
        const response = await api.get('/financeiro/resumo');
        return response.data;
    },

    // ========================================
    // DISTRIBUIÇÃO DE LUCROS
    // ========================================

    listarDistribuicoesLucro: async (): Promise<ContaPagar[]> => {
        const response = await api.get('/financeiro/distribuicao-lucros');
        return response.data;
    },

    criarDistribuicaoLucros: async (request: {
        valor: number;
        dataCompetencia: string;
        dataVencimento: string;
        descricao?: string;
    }): Promise<ContaPagar> => {
        const response = await api.post('/financeiro/distribuicao-lucros', request);
        return response.data;
    },

    // ========================================
    // RECEITA POR CAIXA (BASE DAS)
    // ========================================

    getReceitasCaixa: async (mes: number, ano: number) => {
        const response = await api.get(`/financeiro/receitas-caixa?mes=${mes}&ano=${ano}`);
        return response.data;
    },

    // ========================================
    // PAGAMENTO DE IMPOSTO (DAS)
    // ========================================

    criarImpostoPago: async (request: {
        valor: number;
        dataCompetencia: string;
        dataVencimento: string;
        descricao?: string;
    }): Promise<ContaPagar> => {
        const response = await api.post('/financeiro/imposto-pago', request);
        return response.data;
    },

    listarImpostosPagos: async (): Promise<ContaPagar[]> => {
        const response = await api.get('/financeiro/imposto-pago');
        return response.data;
    },
};

export default financeiroService;
