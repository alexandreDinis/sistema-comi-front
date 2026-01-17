import api from './api';
import type { RegraComissao, RegraComissaoRequest } from '../types';

export const regraComissaoService = {
    /**
     * Lista todas as regras de comissão de uma empresa
     */
    async getRegras(empresaId: number): Promise<RegraComissao[]> {
        const response = await api.get<RegraComissao[]>(`/empresas/${empresaId}/regras-comissao`);
        return response.data;
    },

    /**
     * Busca a regra ativa de uma empresa
     */
    async getRegraAtiva(empresaId: number): Promise<RegraComissao | null> {
        try {
            const response = await api.get<RegraComissao>(`/empresas/${empresaId}/regras-comissao/ativa`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Busca uma regra por ID
     */
    async getRegraById(id: number): Promise<RegraComissao> {
        const response = await api.get<RegraComissao>(`/regras-comissao/${id}`);
        return response.data;
    },

    /**
     * Cria uma nova regra de comissão
     */
    async createRegra(empresaId: number, data: RegraComissaoRequest): Promise<RegraComissao> {
        const response = await api.post<RegraComissao>(`/empresas/${empresaId}/regras-comissao`, data);
        return response.data;
    },

    /**
     * Atualiza uma regra existente
     */
    async updateRegra(id: number, data: RegraComissaoRequest): Promise<RegraComissao> {
        const response = await api.put<RegraComissao>(`/regras-comissao/${id}`, data);
        return response.data;
    },

    /**
     * Ativa uma regra (desativa as outras automaticamente)
     */
    async ativarRegra(id: number): Promise<RegraComissao> {
        const response = await api.post<RegraComissao>(`/regras-comissao/${id}/ativar`);
        return response.data;
    },

    /**
     * Desativa uma regra
     */
    async desativarRegra(id: number): Promise<RegraComissao> {
        const response = await api.post<RegraComissao>(`/regras-comissao/${id}/desativar`);
        return response.data;
    },

    /**
     * Deleta uma regra (apenas se não estiver ativa)
     */
    async deleteRegra(id: number): Promise<void> {
        await api.delete(`/regras-comissao/${id}`);
    }
};
