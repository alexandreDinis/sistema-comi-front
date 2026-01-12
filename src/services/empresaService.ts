import api from './api';
import type { EmpresaConfig, UpdateEmpresaConfigRequest } from '../types';

const API_URL = '/empresa';

export const empresaService = {
    /**
     * Get current company configuration
     * Requires: ADMIN_EMPRESA permission
     */
    async getConfig(): Promise<EmpresaConfig> {
        const response = await api.get<EmpresaConfig>(`${API_URL}/config`);
        return response.data;
    },

    /**
     * Update company configuration (e.g., commission mode)
     * Requires: ADMIN_EMPRESA permission
     */
    async updateConfig(data: UpdateEmpresaConfigRequest): Promise<EmpresaConfig> {
        const response = await api.patch<EmpresaConfig>(`${API_URL}/config`, data);
        return response.data;
    }
};
