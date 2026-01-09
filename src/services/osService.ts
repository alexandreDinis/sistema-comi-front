import api from './api';
import type {
    Cliente, ClienteRequest, ClienteFiltros,
    TipoPeca, TipoPecaRequest,
    OrdemServico, CreateOSRequest,
    AddVeiculoRequest, AddPecaRequest, UpdateOSStatusRequest,
    VeiculoOS, OSStatus
} from '../types';

export const osService = {
    // --- Clientes ---
    createCliente: async (data: ClienteRequest): Promise<Cliente> => {
        const response = await api.post<Cliente>('/clientes', data);
        return response.data;
    },

    listClientes: async (filtros?: ClienteFiltros): Promise<Cliente[]> => {
        const params = new URLSearchParams();
        if (filtros) {
            Object.entries(filtros).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
        }
        const response = await api.get<Cliente[]>(`/clientes?${params.toString()}`);
        return response.data;
    },

    updateCliente: async ({ id, data }: { id: number; data: ClienteRequest }): Promise<Cliente> => {
        const response = await api.put<Cliente>(`/clientes/${id}`, data);
        return response.data;
    },

    deleteCliente: async (id: number): Promise<void> => {
        await api.delete(`/clientes/${id}`);
    },

    // --- Catálogo (Tipos de Peça) ---
    createTipoPeca: async (data: TipoPecaRequest): Promise<TipoPeca> => {
        const response = await api.post<TipoPeca>('/tipos-peca', data);
        return response.data;
    },

    deleteTipoPeca: async (id: number): Promise<void> => {
        await api.delete(`/tipos-peca/${id}`);
    },

    listTiposPeca: async (): Promise<TipoPeca[]> => {
        const response = await api.get<TipoPeca[]>('/tipos-peca');
        return response.data;
    },

    // --- Ordem de Serviço (Core) ---
    createOS: async (data: CreateOSRequest): Promise<OrdemServico> => {
        const response = await api.post<OrdemServico>('/ordens-servico', data);
        return response.data;
    },

    listOS: async (): Promise<OrdemServico[]> => {
        const response = await api.get<OrdemServico[]>('/ordens-servico');
        return response.data;
    },

    deleteOS: async (id: number): Promise<void> => {
        await api.delete(`/ordens-servico/${id}`);
    },

    getOSById: async (id: number): Promise<OrdemServico> => {
        const response = await api.get<OrdemServico>(`/ordens-servico/${id}`);
        return response.data;
    },

    addVeiculo: async (data: AddVeiculoRequest): Promise<VeiculoOS> => {
        const response = await api.post<any>('/ordens-servico/veiculos', data);
        return response.data;
    },

    deleteVeiculo: async (id: number): Promise<void> => {
        // Trying the likely endpoint matching the POST
        await api.delete(`/ordens-servico/veiculos/${id}`);
    },

    checkPlaca: async (placa: string): Promise<{ exists: boolean; message: string }> => {
        const response = await api.get<{ exists: boolean; message: string }>(`/veiculos/check-placa?placa=${placa}`);
        return response.data;
    },

    addPeca: async (data: AddPecaRequest): Promise<any> => {
        const response = await api.post<any>('/ordens-servico/pecas', data);
        return response.data;
    },

    updateStatus: async (id: number, status: OSStatus): Promise<OrdemServico> => {
        const payload: UpdateOSStatusRequest = { status };
        const response = await api.patch<OrdemServico>(`/ordens-servico/${id}/status`, payload);
        return response.data;
    },

    // --- PDF ---
    downloadRelatorioPdf: async (ano: number, mes: number) => {
        const response = await api.get(`relatorios/${ano}/${mes}/pdf`, {
            responseType: 'blob'
        });
        // Create a blob URL and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `relatorio-${ano}-${mes}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
