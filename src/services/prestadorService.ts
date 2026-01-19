import api from './api';
import type { Prestador, PrestadorRequest } from '../types';

const API_URL = '/prestadores';

export const prestadorService = {
    /**
     * Lista prestadores da empresa.
     */
    async listar(apenasAtivos = true): Promise<Prestador[]> {
        const response = await api.get<Prestador[]>(`${API_URL}?apenasAtivos=${apenasAtivos}`);
        return response.data;
    },

    /**
     * Cadastra novo prestador.
     */
    async criar(data: PrestadorRequest): Promise<Prestador> {
        const response = await api.post<Prestador>(API_URL, data);
        return response.data;
    },

    /**
     * Atualiza prestador existente.
     */
    async atualizar(id: number, data: PrestadorRequest): Promise<Prestador> {
        const response = await api.put<Prestador>(`${API_URL}/${id}`, data);
        return response.data;
    },

    /**
     * Desativa prestador (soft delete).
     */
    async desativar(id: number): Promise<void> {
        await api.delete(`${API_URL}/${id}`);
    },
};
