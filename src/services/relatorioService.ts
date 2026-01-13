import api from './api';
import type { RelatorioFinanceiro, RelatorioAnualDTO } from '../types';

export const relatorioService = {
    getRelatorio: async (ano: number, mes: number): Promise<RelatorioFinanceiro> => {
        const response = await api.get<RelatorioFinanceiro>(`relatorios/${ano}/${mes}`);
        return response.data;
    },

    getRelatorioAnual: async (ano: number): Promise<RelatorioAnualDTO> => {
        const response = await api.get<RelatorioAnualDTO>(`relatorios/anual/${ano}`);
        return response.data;
    },

    downloadRelatorioAnualPdf: async (ano: number): Promise<void> => {
        const response = await api.get(`relatorios/anual/${ano}/pdf`, {
            responseType: 'blob',
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio-anual-${ano}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};

