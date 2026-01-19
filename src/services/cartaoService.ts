import api from './api';
import type { CartaoCredito, CartaoCreditoRequest } from '../types';

const BASE_URL = '/cartoes';

export const cartaoService = {
    listar: async (): Promise<CartaoCredito[]> => {
        const response = await api.get(BASE_URL);
        return response.data;
    },

    criar: async (cartao: CartaoCreditoRequest): Promise<CartaoCredito> => {
        const response = await api.post(BASE_URL, cartao);
        return response.data;
    },

    desativar: async (id: number): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    }
};
