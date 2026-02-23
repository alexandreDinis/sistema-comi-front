import api from './api';
import type { ComissaoCalculada, ComparacaoFaturamentoDTO } from '../types';

export const comissaoService = {
    async obterComissaoMensal(ano: number, mes: number, force: boolean = false): Promise<ComissaoCalculada> {
        const params: any = { force };
        if (force) params._t = Date.now();
        const response = await api.get<ComissaoCalculada>(`comissao/${ano}/${mes}`, { params });
        return response.data;
    },

    async obterComparacaoYoY(ano: number, mes: number): Promise<ComparacaoFaturamentoDTO> {
        const response = await api.get<ComparacaoFaturamentoDTO>(`dashboard/yoy/${ano}/${mes}`);
        return response.data;
    },

    async quitarComissao(id: number): Promise<string> {
        const response = await api.post<string>(`comissao/quitar/${id}`);
        return response.data;
    },

    async gerarPagamentoComissao(id: number, dataVencimento?: string): Promise<void> {
        await api.post(`comissao/gerar-pagamento/${id}`, null, {
            params: { dataVencimento }
        });
    },

    async listarComissoesEmpresa(ano: number, mes: number, force: boolean = false): Promise<ComissaoFuncionario[]> {
        const params: any = { force };
        if (force) params._t = Date.now();
        const response = await api.get<ComissaoFuncionario[]>(`comissao/empresa/${ano}/${mes}`, { params });
        return response.data;
    },
};

// DTO para listagem de comissões de funcionários
export interface ComissaoFuncionario {
    id: number;
    funcionarioId: number;
    funcionarioNome: string;
    funcionarioEmail: string;
    anoMesReferencia: string;
    faturamento: number;
    porcentagem: number;
    valorBruto: number;
    adiantamentos: number;
    valorQuitado: number; // NOVO: Já Pago
    saldoAPagar: number;
    quitado: boolean;
    dataQuitacao?: string;
}
