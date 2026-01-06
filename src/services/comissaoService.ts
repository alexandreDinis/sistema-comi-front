import api from './api';
import type { ComissaoCalculada } from '../types';

export const comissaoService = {
    async obterComissaoMensal(ano: number, mes: number): Promise<ComissaoCalculada> {
        const response = await api.get<ComissaoCalculada>(`/comissao/${ano}/${mes}`);
        return response.data;
    },
};
