import api from './api';
import type { EmpresaConfig, UpdateEmpresaConfigRequest, UploadLogoResponse } from '../types';

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
    },

    /**
     * Upload company logo
     * Requires: ADMIN_EMPRESA permission
     * @param empresaId - Company ID
     * @param file - Image file (PNG, JPEG, WebP, max 2MB)
     */
    async uploadLogo(empresaId: number, file: File): Promise<UploadLogoResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<UploadLogoResponse>(
            `${API_URL}/${empresaId}/logo`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    /**
     * Get logo URL for a company
     * @param empresaId - Company ID
     * @returns Full URL to the company's logo
     */
    getLogoUrl(empresaId: number): string {
        const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/?$/, '');
        return `${baseUrl}${API_URL}/${empresaId}/logo`;
    },
};
