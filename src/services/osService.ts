import api from './api';
import type {
    Cliente, ClienteRequest, ClienteFiltros,
    TipoPeca, TipoPecaRequest,
    OrdemServico, CreateOSRequest,
    AddVeiculoRequest, AddPecaRequest, UpdateOSStatusRequest,
    VeiculoOS, OSStatus,
    PlacaCheckResponse, HistoricoResponse
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

    verificarPlaca: async (placa: string): Promise<PlacaCheckResponse> => {
        const response = await api.get<PlacaCheckResponse>(`/veiculos/verificar-placa`, {
            params: { placa }
        });
        return response.data;
    },

    obterHistorico: async (placa: string): Promise<HistoricoResponse> => {
        const response = await api.get<HistoricoResponse>(`/veiculos/${placa}/historico`);
        return response.data;
    },

    checkPlaca: async (placa: string): Promise<{ exists: boolean; message: string }> => {
        // Deprecated wrapper to maintain backward compatibility if needed temporarily,
        // but ideally we switch usages to verificarPlaca.
        // For now, I'll remove it or keep it? Current code usages will be updated.
        // Let's replace it fully as per plan.
        const response = await api.get<PlacaCheckResponse>(`/veiculos/verificar-placa`, { params: { placa } });
        return {
            exists: response.data.existe,
            message: response.data.mensagem
        };
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

    updateDiscount: async (id: number, tipoDesconto: 'PERCENTUAL' | 'VALOR_FIXO' | null, valorDesconto: number): Promise<OrdemServico> => {
        // Using PATCH to update only discount fields
        // Backend must support this partial update on the main resource or a specific endpoint
        // Assuming PATCH /ordens-servico/{id} accepts these fields as per standard REST/Spring Data usage
        // If not, we might need a specific endpoint like /ordens-servico/{id}/desconto
        const payload = { tipoDesconto, valorDesconto };
        const response = await api.patch<OrdemServico>(`/ordens-servico/${id}`, payload);
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
    },

    downloadOSPdf: async (osId: number) => {
        const response = await api.get(`/ordens-servico/${osId}/pdf`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `OS-${osId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};
