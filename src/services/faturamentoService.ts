import api from './api';
import type { Faturamento, FaturamentoRequest } from '../types';

export const faturamentoService = {
    async registrarFaturamento(data: FaturamentoRequest): Promise<Faturamento> {
        const response = await api.post<Faturamento>('faturamento', data);
        return response.data;
    },

    async listarFaturamentos(): Promise<Faturamento[]> {
        const response = await api.get<Faturamento[]>('faturamento');
        return response.data;
    },

    async getFaturamentoDetalhado(id: number): Promise<Faturamento> {
        const response = await api.get<Faturamento>(`/faturamento/${id}`);
        return response.data;
    },
};
