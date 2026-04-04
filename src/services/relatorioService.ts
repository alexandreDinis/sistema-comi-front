import api, { API_BASE_URL } from './api';
import type { RelatorioFinanceiro, RelatorioAnualDTO } from '../types';

export const relatorioService = {
    getRelatorio: async (ano: number, mes: number): Promise<RelatorioFinanceiro> => {
        const response = await api.get<RelatorioFinanceiro>(`relatorios/${ano}/${mes}`);
        return response.data;
    },

    getRelatorioAnual: async (ano: number): Promise<RelatorioAnualDTO> => {
        const response = await api.get<RelatorioAnualDTO>(`relatorios/anual/${ano}`);
        return response.data;
    },

    getRelatorioAnualPdfPath: (ano: number) => `relatorios/anual/${ano}/pdf`,
    getApiBaseUrl: () => API_BASE_URL,

    getRankingClientes: async (ano: number, mes?: number): Promise<import('../types').RankingCliente[]> => {
        const params: any = { ano };
        if (mes) params.mes = mes;

        const response = await api.get<import('../types').RankingCliente[]>('relatorios/ranking-clientes', { params });
        return response.data;
    },
};

