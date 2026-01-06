import api from './api';
import type { PagamentoAdiantado, AdiantamentoRequest } from '../types';

export const adiantamentoService = {
    async registrarAdiantamento(data: AdiantamentoRequest): Promise<PagamentoAdiantado> {
        const response = await api.post<PagamentoAdiantado>('/adiantamento', data);
        return response.data;
    },

    async listarAdiantamentos(): Promise<PagamentoAdiantado[]> {
        const response = await api.get<PagamentoAdiantado[]>('/adiantamento');
        return response.data;
    },
};
