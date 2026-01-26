import api from './api';
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

    downloadRelatorioAnualPdf: async (ano: number): Promise<void> => {
        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr).token : null;
        console.log('[RelatorioService] User string found:', !!userStr);
        console.log('[RelatorioService] Token parsed:', token ? token.substring(0, 10) + '...' : 'NULL');
        const url = `${api.defaults.baseURL}relatorios/anual/${ano}/pdf?token=${token}`;
        console.log('[RelatorioService] Opening URL:', url);
        window.open(url, '_blank');
    },

    getRankingClientes: async (ano: number, mes?: number): Promise<import('../types').RankingCliente[]> => {
        const params: any = { ano };
        if (mes) params.mes = mes;

        const response = await api.get<import('../types').RankingCliente[]>('relatorios/ranking-clientes', { params });
        return response.data;
    },
};

