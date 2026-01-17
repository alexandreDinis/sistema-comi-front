import api from './api';
import type { SalarioFuncionario, SalarioFuncionarioRequest } from '../types';

export const salarioFuncionarioService = {
    /**
     * Lista todas as configurações de salário de uma empresa
     */
    async getSalarios(empresaId: number): Promise<SalarioFuncionario[]> {
        const response = await api.get<SalarioFuncionario[]>(`/empresas/${empresaId}/salarios`);
        return response.data;
    },

    /**
     * Busca a configuração de salário de um usuário
     */
    async getSalarioByUsuario(usuarioId: number): Promise<SalarioFuncionario | null> {
        try {
            const response = await api.get<SalarioFuncionario>(`/usuarios/${usuarioId}/salario`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Busca uma configuração por ID
     */
    async getSalarioById(id: number): Promise<SalarioFuncionario> {
        const response = await api.get<SalarioFuncionario>(`/salarios/${id}`);
        return response.data;
    },

    /**
     * Cria ou define configuração de salário para um funcionário
     */
    async createSalario(empresaId: number, data: SalarioFuncionarioRequest): Promise<SalarioFuncionario> {
        const response = await api.post<SalarioFuncionario>(`/empresas/${empresaId}/salarios`, data);
        return response.data;
    },

    /**
     * Atualiza uma configuração de salário
     */
    async updateSalario(id: number, data: Partial<SalarioFuncionarioRequest>): Promise<SalarioFuncionario> {
        const response = await api.put<SalarioFuncionario>(`/salarios/${id}`, data);
        return response.data;
    },

    /**
     * Desativa uma configuração de salário
     */
    async deleteSalario(id: number): Promise<void> {
        await api.delete(`/salarios/${id}`);
    }
};
