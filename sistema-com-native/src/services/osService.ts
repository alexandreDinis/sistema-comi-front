import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import type {
    Cliente, ClienteRequest, ClienteFiltros,
    OrdemServico, CreateOSRequest,
    AddVeiculoRequest, AddPecaRequest, UpdateOSStatusRequest,
    VeiculoOS, OSStatus
} from '../types';
import { OSModel, ClienteModel, VeiculoModel } from './database/models';
import { syncEngine } from './sync/SyncEngine';
import { clienteService } from './clienteService';

// Variáveis de controle de Sync (Cooldown)
let lastSyncTimestamp = 0;
const SYNC_COOLDOWN_MS = 60 * 1000; // 1 minuto

export const osService = {
    // --- Clients ---
    listClientes: async (filtros?: ClienteFiltros): Promise<Cliente[]> => {
        return clienteService.getAll();
    },

    // --- Ordem de Serviço (Core) ---
    createOS: async (data: CreateOSRequest): Promise<OrdemServico> => {
        // 1. Salvar LOCALMENTE
        // Precisa mapear ID do cliente para Local ID se available
        // Na verdade, OSModel.create resolve isso se passarmos clienteId (server) e ele acha local
        const local = await OSModel.create(data);

        // 2. Sync
        syncEngine.trySyncInBackground();

        // 3. Converter para retorno
        // Precisamos popular cliente para UI
        const cliente = await ClienteModel.getById(local.cliente_id || 0); // TODO: Fix relation loading
        // Nota: O model retorna o objeto "flat". UI pode precisar do objeto aninhado.
        // Por simplicidade agora, retornamos o que temos.
        return {
            id: local.id, // ID Local
            data: local.data,
            dataVencimento: local.data_vencimento || undefined,
            status: local.status as OSStatus,
            valorTotal: local.valor_total,
            cliente: ClienteModel.toApiFormat(cliente!),
            veiculos: [], // Inicialmente vazia
            empresaId: 0 // Mock ou pegar de algum lugar
        } as OrdemServico;
    },

    listOS: async (): Promise<OrdemServico[]> => {
        let localData = await OSModel.getAll();

        // Se cache vazio e online, busca da API imediatamente
        if (localData.length === 0 && syncEngine.isConnected()) {
            try {
                console.log('[osService] Cache vazio, buscando da API...');
                const response = await api.get<OrdemServico[]>('/ordens-servico');
                for (const os of response.data) {
                    await OSModel.upsertFromServer(os);
                }
                // Recarrega do banco local após sync
                localData = await OSModel.getAll();
                console.log('[osService] Sync inicial completo:', localData.length, 'OS');
            } catch (e) {
                console.log('[osService] Falha ao buscar da API:', e);
            }
        } else if (syncEngine.isConnected()) {
            osService.syncBackground().catch(console.warn);
        }

        // Mapping manual para incluir cliente... 
        // Isso pode ser lento se tivermos muitos. Ideal é join no SQL.
        // Como SQL é simples no Model, vamos fazer query separada ou melhorar Model.
        // Pelo prazo, vamos map simples.
        const result: OrdemServico[] = [];
        for (const local of localData) {
            const cliente = await ClienteModel.getById(local.cliente_id || 0);
            result.push({
                id: local.id,
                data: local.data,
                dataVencimento: local.data_vencimento || undefined,
                status: local.status as OSStatus,
                valorTotal: local.valor_total,
                cliente: cliente ? ClienteModel.toApiFormat(cliente) : {} as Cliente,
                veiculos: [],
                empresaId: 0
            } as OrdemServico);
        }
        return result;
    },

    syncBackground: async () => {
        const now = Date.now();
        if (now - lastSyncTimestamp < SYNC_COOLDOWN_MS) {
            return;
        }

        try {
            lastSyncTimestamp = now;
            const response = await api.get<OrdemServico[]>('/ordens-servico');
            for (const os of response.data) {
                await OSModel.upsertFromServer(os);
            }
        } catch (e) {
            console.log('[osService] Background sync error', e);
            lastSyncTimestamp = 0;
        }
    },

    getOSById: async (id: number): Promise<OrdemServico> => {
        // Sempre buscar da API quando online para garantir dados atualizados (incluindo veículos)
        if (syncEngine.isConnected()) {
            try {
                const response = await api.get<OrdemServico>(`/ordens-servico/${id}`);
                // Atualizar cache local em background
                OSModel.upsertFromServer(response.data).catch(console.warn);
                return response.data;
            } catch (e) {
                console.log('[osService] API fetch failed, falling back to local:', e);
            }
        }

        // Fallback para dados locais quando offline ou API falha
        const local = await OSModel.getById(id);
        if (local) {
            const cliente = await ClienteModel.getById(local.cliente_id || 0);
            return {
                id: local.id,
                data: local.data,
                dataVencimento: local.data_vencimento || undefined,
                status: local.status as OSStatus,
                valorTotal: local.valor_total,
                cliente: cliente ? ClienteModel.toApiFormat(cliente) : {} as Cliente,
                veiculos: [], // Veículos não são carregados localmente ainda
                empresaId: 0
            } as OrdemServico;
        }

        // Última tentativa: buscar da API
        const response = await api.get<OrdemServico>(`/ordens-servico/${id}`);
        await OSModel.upsertFromServer(response.data);
        return response.data;
    },

    updateStatus: async (id: number, status: OSStatus): Promise<OrdemServico> => {
        const local = await OSModel.updateStatus(id, status);
        syncEngine.trySyncInBackground();
        return osService.getOSById(id);
    },

    updateOS: async (id: number, data: any): Promise<OrdemServico> => {
        // Implementar no Model se necessário. Por enquanto só API.
        // Fazer patch local? Sim, deveria.
        // await OSModel.update(id, data);
        const response = await api.patch<OrdemServico>(`/ordens-servico/${id}`, data);
        return response.data;
    },

    addVeiculo: async (data: AddVeiculoRequest): Promise<VeiculoOS> => {
        // Implementar database logic...
        // Por brevidade do exemplo, vamos manter API direct se não offline
        // Mas o correto é VeiculoModel.create()
        const response = await api.post<VeiculoOS>('/ordens-servico/veiculos', data);
        return response.data;
    },

    // --- PDF Sharing ---
    openOSPdf: async (osId: number) => {
        // Obter token primeiro
        const SecureStore = require('expo-secure-store');
        const token = await SecureStore.getItemAsync('auth_access_token');
        const baseURL = api.defaults.baseURL?.replace(/\/$/, '');
        const pdfUrl = `${baseURL}/ordens-servico/${osId}/pdf?token=${token || ''}`;

        console.log('[osService] PDF URL:', pdfUrl);

        // Tentar usar expo-file-system/legacy para Expo 54+
        try {
            // Importar a API legacy para compatibilidade com Expo 54
            const FileSystemLegacy = require('expo-file-system/legacy');
            const Sharing = require('expo-sharing');

            const fileName = `OS_${osId}_${Date.now()}.pdf`;
            const cacheDir = FileSystemLegacy.cacheDirectory || FileSystemLegacy.documentDirectory;

            if (!cacheDir) {
                console.log('[osService] Cache directory not available, opening in browser');
                await Linking.openURL(pdfUrl);
                return;
            }

            const fileUri = `${cacheDir}${fileName}`;
            console.log('[osService] Downloading PDF to:', fileUri);

            // Baixar o PDF usando API legacy
            const downloadResult = await FileSystemLegacy.downloadAsync(pdfUrl, fileUri);

            if (downloadResult.status !== 200) {
                console.log('[osService] Download failed, opening in browser');
                await Linking.openURL(pdfUrl);
                return;
            }

            console.log('[osService] PDF downloaded successfully');

            // Verificar se sharing está disponível
            const isAvailable = await Sharing.isAvailableAsync();

            if (isAvailable) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: `OS #${osId}`,
                    UTI: 'com.adobe.pdf'
                });
                console.log('[osService] PDF shared successfully');
            } else {
                await Linking.openURL(pdfUrl);
            }

            // Limpar arquivo após 1 minuto
            setTimeout(async () => {
                try {
                    await FileSystemLegacy.deleteAsync(fileUri, { idempotent: true });
                } catch (e) { /* ignore */ }
            }, 60000);

        } catch (error: any) {
            console.log('[osService] FileSystem error, opening in browser:', error.message);
            // Fallback para browser
            await Linking.openURL(pdfUrl);
        }
    },

    // --- Vehicle Plate Search ---
    verificarPlaca: async (placa: string): Promise<{ existe: boolean; veiculoExistente?: any; mensagem?: string }> => {
        try {
            const response = await api.get(`/veiculos/verificar-placa`, {
                params: { placa }
            });
            return response.data;
        } catch (e) {
            return { existe: false }; // Offline fallback
        }
    },

    getHistoricoVeiculo: async (placa: string): Promise<any[]> => {
        try {
            console.log('[osService] Fetching history for placa:', placa);
            const response = await api.get<any>(`/veiculos/${placa}/historico`);
            console.log('[osService] History response:', JSON.stringify(response.data, null, 2));
            return response.data || [];
        } catch (e) {
            return []; // Offline fallback
        }
    },

    // --- Catalog (Tipos de Peça) ---
    listTiposPeca: async (): Promise<any[]> => {
        // Deveria usar cache local (colocar TiposPecaModel)
        try {
            const response = await api.get('/tipos-peca');
            return response.data;
        } catch (e) {
            return [];
        }
    },

    // --- Parts/Services ---
    addPeca: async (data: AddPecaRequest): Promise<any> => {
        const response = await api.post('/ordens-servico/pecas', data);
        return response.data;
    },

    deletePeca: async (id: number): Promise<OrdemServico> => {
        const response = await api.delete<OrdemServico>(`/ordens-servico/pecas/${id}`);
        return response.data;
    },

    deleteVeiculo: async (id: number): Promise<void> => {
        await api.delete(`/ordens-servico/veiculos/${id}`);
    },

    deleteOS: async (id: number): Promise<void> => {
        await OSModel.delete(id);
        syncEngine.trySyncInBackground();
    },
};
