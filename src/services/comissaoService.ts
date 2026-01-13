import api from './api';
import type { ComissaoCalculada, ComparacaoFaturamentoDTO } from '../types';

export const comissaoService = {
    async obterComissaoMensal(ano: number, mes: number): Promise<ComissaoCalculada> {
        const response = await api.get<ComissaoCalculada>(`comissao/${ano}/${mes}`);
        return response.data;
    },

    async obterComparacaoYoY(ano: number, mes: number): Promise<ComparacaoFaturamentoDTO> {
        const response = await api.get<ComparacaoFaturamentoDTO>(`dashboard/yoy/${ano}/${mes}`);
        return response.data;
    },
};

