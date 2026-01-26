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

    // ========================================
    // RELATÓRIOS PDF (DOWNLOADS)
    // ========================================

    // ========================================
    // RELATÓRIOS PDF (DOWNLOADS - DIRECT LINK STRATEGY)
    // ========================================
    // Using direct window.open to avoid "browser freeze" caused by massive Client-Side Blob processing
    // and to let the browser handle the stream naturally.

    downloadReceitaCaixaPdf: async (mes: number, ano: number) => {
        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr).token : null;
        console.log('[FinanceiroService] User string found:', !!userStr);
        console.log('[FinanceiroService] Token parsed:', token ? token.substring(0, 10) + '...' : 'NULL');
        // Construct URL manually to bypass axios blob processing
        const url = `${api.defaults.baseURL}relatorios/contabeis/receita-caixa?mes=${mes}&ano=${ano}&token=${token}`;
        console.log('[FinanceiroService] Opening URL:', url);
        window.open(url, '_blank');
    },

    downloadFluxoCaixaPdf: async (mes: number, ano: number) => {
        try {
            console.log(`[FinanceiroService] Baixando PDF Fluxo Caixa: ${mes}/${ano}`);
            const response = await api.get(
                `/relatorios/contabeis/fluxo-caixa?mes=${mes}&ano=${ano}`,
                {
                    responseType: 'blob'
                }
            );

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `fluxo-caixa-${ano}-${mes}.pdf`);

            // Append to html to click then remove
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            console.log('[FinanceiroService] PDF baixado com sucesso');
        } catch (error) {
            console.error('[FinanceiroService] Erro ao baixar PDF:', error);
            throw error;
        }
    },

    downloadContasPagarPdf: async (mes: number, ano: number) => {
        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr).token : null;
        console.log('[FinanceiroService] User string found:', !!userStr);
        console.log('[FinanceiroService] Token parsed:', token ? token.substring(0, 10) + '...' : 'NULL');
        const url = `${api.defaults.baseURL}relatorios/contabeis/contas-pagar?mes=${mes}&ano=${ano}&token=${token}`;
        console.log('[FinanceiroService] Opening URL:', url);
        window.open(url, '_blank');
    },

    downloadDistribuicaoLucrosPdf: async (mes: number, ano: number) => {
        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr).token : null;
        console.log('[FinanceiroService] User string found:', !!userStr);
        console.log('[FinanceiroService] Token parsed:', token ? token.substring(0, 10) + '...' : 'NULL');
        const url = `${api.defaults.baseURL}relatorios/contabeis/distribuicao-lucros?mes=${mes}&ano=${ano}&token=${token}`;
        console.log('[FinanceiroService] Opening URL:', url);
        window.open(url, '_blank');
    },
};

export default financeiroService;
