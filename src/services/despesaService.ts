import api from './api';
import type { Despesa, DespesaRequest } from '../types';

export const despesaService = {
    create: async (despesa: DespesaRequest): Promise<Despesa> => {
        const response = await api.post<Despesa>('despesas', despesa);
        return response.data;
    },
};
