import api from './api';
import { ComissaoCalculada } from '../types';

export interface IComissaoService {
    obterComissaoMensal(ano: number, mes: number): Promise<ComissaoCalculada>;
    forceSync(ano: number, mes: number): Promise<ComissaoCalculada>;
    getMinhasComissoes(): Promise<ComissaoCalculada[]>;
}

export const comissaoService: IComissaoService = {
    async obterComissaoMensal(ano: number, mes: number): Promise<ComissaoCalculada> {
        console.log(`[comissaoService] obterComissaoMensal called for ${ano}/${mes}`);
        try {
            const response = await api.get<ComissaoCalculada>(`comissao/${ano}/${mes}`);
            console.log(`[comissaoService] obterComissaoMensal response status:`, response.status);
            return response.data;
        } catch (error) {
            console.error(`[comissaoService] obterComissaoMensal error:`, error);
            throw error;
        }
    },

    async forceSync(ano: number, mes: number): Promise<ComissaoCalculada> {
        console.log(`[comissaoService] forceSync called for ${ano}/${mes}`);
        try {
            const response = await api.post<ComissaoCalculada>(`comissao/${ano}/${mes}/sync`);
            console.log(`[comissaoService] forceSync response status:`, response.status);
            return response.data;
        } catch (error) {
            console.error(`[comissaoService] forceSync error:`, error);
            throw error;
        }
    },

    async getMinhasComissoes(): Promise<ComissaoCalculada[]> {
        console.log(`[comissaoService] getMinhasComissoes called`);
        try {
            const response = await api.get<ComissaoCalculada[]>('/comissao/minhas');
            console.log(`[comissaoService] getMinhasComissoes response status:`, response.status);
            return response.data;
        } catch (error) {
            console.error(`[comissaoService] getMinhasComissoes error:`, error);
            throw error;
        }
    },
};
