import api from './api';
import { Cliente, ClienteRequest, ClienteFiltros } from '../types';
import { ClienteModel } from './database/models';
import { syncEngine } from './sync/SyncEngine';

// Variáveis de controle de Sync (Cooldown)
let lastSyncTimestamp = 0;
const SYNC_COOLDOWN_MS = 60 * 1000; // 1 minuto

export const clienteService = {
    getAll: async (): Promise<Cliente[]> => {
        // 1. LEITURA LOCAL (Cache-First)
        let localData = await ClienteModel.getAll();

        // 2. Se cache vazio e online, busca da API imediatamente
        if (localData.length === 0 && syncEngine.isConnected()) {
            try {
                console.log('[ClienteService] Cache vazio, buscando da API...');
                const response = await api.get<Cliente[]>('/clientes');
                for (const cliente of response.data) {
                    await ClienteModel.upsertFromServer(cliente);
                }
                // Recarrega do banco local após sync
                localData = await ClienteModel.getAll();
                console.log('[ClienteService] Sync inicial completo:', localData.length, 'clientes');
            } catch (e) {
                console.log('[ClienteService] Falha ao buscar da API:', e);
            }
        } else if (syncEngine.isConnected()) {
            // 3. BACKGROUND SYNC (Se online e fora do cooldown)
            clienteService.syncBackground().catch(console.warn);
        }

        // Converter formato local para API
        return localData.map(ClienteModel.toApiFormat);
    },

    syncBackground: async () => {
        const now = Date.now();
        if (now - lastSyncTimestamp < SYNC_COOLDOWN_MS) {
            // console.log('[ClienteService] Sync skipped - cooldown active');
            return;
        }

        try {
            lastSyncTimestamp = now;
            const response = await api.get<Cliente[]>('/clientes');
            for (const cliente of response.data) {
                await ClienteModel.upsertFromServer(cliente);
            }
        } catch (e) {
            console.log('[ClienteService] Background sync error', e);
            // Resetar timestamp em caso de erro para permitir nova tentativa
            lastSyncTimestamp = 0;
        }
    },

    getById: async (id: number): Promise<Cliente> => {
        // Tenta buscar localmente primeiro
        const local = await ClienteModel.getById(id);
        if (local) return ClienteModel.toApiFormat(local);

        // Se não achar (e tiver internet), tenta API e salva
        const response = await api.get<Cliente>(`/clientes/${id}`);
        const saved = await ClienteModel.upsertFromServer(response.data);
        return ClienteModel.toApiFormat(saved);
    },

    create: async (data: ClienteRequest): Promise<Cliente> => {
        // 1. Salvar LOCALMENTE (Fila de Sync é automática no Model)
        const local = await ClienteModel.create(data);

        // 2. Tentar Sync imediato em background
        syncEngine.trySyncInBackground();

        return ClienteModel.toApiFormat(local);
    },

    update: async (id: number, data: Partial<ClienteRequest>): Promise<Cliente> => {
        // 1. Atualizar LOCALMENTE
        const local = await ClienteModel.update(id, data);
        if (!local) throw new Error('Cliente não encontrado localmente');

        // 2. Sync background
        syncEngine.trySyncInBackground();

        return ClienteModel.toApiFormat(local);
    },

    search: async (filtros: ClienteFiltros): Promise<Cliente[]> => {
        // Busca local
        if (filtros.termo) {
            const localResults = await ClienteModel.search(filtros.termo);
            return localResults.map(ClienteModel.toApiFormat);
        }
        return clienteService.getAll();
    },

    delete: async (id: number): Promise<void> => {
        await ClienteModel.softDelete(id);
        syncEngine.trySyncInBackground();
    }
};
