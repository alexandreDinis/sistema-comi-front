import api from './api';
import type { RelatorioFinanceiro } from '../types';

export const relatorioService = {
    getRelatorio: async (ano: number, mes: number): Promise<RelatorioFinanceiro> => {
        const response = await api.get<RelatorioFinanceiro>(`relatorios/${ano}/${mes}`);
        return response.data;
    },
};
