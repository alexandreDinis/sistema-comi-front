// src/services/sync/SyncEngine.ts
// Motor de sincronização offline-online com Retry e Resolução de Conflitos

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { databaseService } from '../database/DatabaseService';
import { SyncQueueModel, ClienteModel, OSModel, VeiculoModel, DespesaModel } from '../database/models';
import type { SyncQueueItem } from '../database/models/types';
import api from '../api';

export interface SyncStatus {
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    errorCount: number;
    lastSyncTime: Date | null;
    currentOperation?: string;
}

export interface SyncResult {
    success: number;
    failed: number;
    errors: string[];
}

const MAX_RETRIES_DEFAULT = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 segundo

class SyncEngine {
    private isOnline: boolean = false;
    private isSyncing: boolean = false;
    private lastSyncTime: Date | null = null;
    private listeners: Set<(status: SyncStatus) => void> = new Set();
    private unsubscribeNetInfo: (() => void) | null = null;

    async initialize(): Promise<void> {
        console.log('[SyncEngine] Initializing...');
        await databaseService.initialize();

        const state = await NetInfo.fetch();
        this.isOnline = state.isConnected === true && state.isInternetReachable === true;

        this.unsubscribeNetInfo = NetInfo.addEventListener(this.handleNetworkChange.bind(this));
        console.log(`[SyncEngine] Initialized. Online: ${this.isOnline}`);

        if (this.isOnline) {
            this.trySyncInBackground();
        }
    }

    private handleNetworkChange(state: NetInfoState): void {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected === true && state.isInternetReachable === true;

        console.log(`[SyncEngine] Network changed: ${wasOnline} -> ${this.isOnline}`);

        if (!wasOnline && this.isOnline) {
            console.log('[SyncEngine] Back online! Starting sync...');
            this.trySyncInBackground();
        }

        this.notifyListeners();
    }

    subscribe(listener: (status: SyncStatus) => void): () => void {
        this.listeners.add(listener);
        listener(this.getStatus());
        return () => this.listeners.delete(listener);
    }

    private async notifyListeners(): Promise<void> {
        const status = await this.getStatusAsync();
        this.listeners.forEach(listener => listener(status));
    }

    getStatus(): SyncStatus {
        return {
            isOnline: this.isOnline,
            isSyncing: this.isSyncing,
            pendingCount: 0,
            errorCount: 0,
            lastSyncTime: this.lastSyncTime
        };
    }

    async getStatusAsync(): Promise<SyncStatus> {
        const counts = await SyncQueueModel.getCounts();
        return {
            isOnline: this.isOnline,
            isSyncing: this.isSyncing,
            pendingCount: counts.total,
            errorCount: counts.errors,
            lastSyncTime: this.lastSyncTime
        };
    }

    isConnected(): boolean {
        return this.isOnline;
    }

    trySyncInBackground(): void {
        if (this.isSyncing) return;
        this.syncAll().catch(err => {
            console.error('[SyncEngine] Background sync failed:', err);
        });
    }

    async syncAll(): Promise<SyncResult> {
        if (this.isSyncing) {
            return { success: 0, failed: 0, errors: ['Already syncing'] };
        }

        if (!this.isOnline) {
            return { success: 0, failed: 0, errors: ['Offline'] };
        }

        this.isSyncing = true;
        this.notifyListeners();

        const result: SyncResult = { success: 0, failed: 0, errors: [] };

        try {
            console.log('[SyncEngine] Starting sync...');
            // Fetch ALL pending items, but filter by readiness (backoff)
            const items = await SyncQueueModel.getPending();
            const now = Date.now();

            // Filter items that are ready for retry
            const readyItems = items.filter(item => {
                if (item.attempts === 0) return true;
                const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, item.attempts - 1);
                return (item.last_attempt || 0) + delay <= now;
            });

            console.log(`[SyncEngine] Found ${items.length} items, ${readyItems.length} ready to sync`);

            for (const item of readyItems) {
                try {
                    await this.syncItem(item);
                    result.success++;
                } catch (err: any) {
                    result.failed++;
                    result.errors.push(`${item.entity_type}/${item.entity_local_id}: ${err.message}`);

                    // Update retry info
                    const newAttempts = item.attempts + 1;
                    const maxRetries = item.max_retries || MAX_RETRIES_DEFAULT;
                    const isFinalFailure = newAttempts >= maxRetries;

                    await SyncQueueModel.markAttempt(item.id, false, err.message);

                    if (isFinalFailure) {
                        console.error(`[SyncEngine] Item ${item.id} failed permanently after ${newAttempts} attempts.`);
                        // Here we could update the Entity sync_status to ERROR if logic permits
                        if (item.entity_type === 'cliente') await ClienteModel.markAsSyncError(item.entity_local_id, err.message);
                        // Add other models error marking as needed
                    }
                }
            }

            this.lastSyncTime = new Date();
            await databaseService.setMetadata('last_sync', this.lastSyncTime.toISOString());

            // Daily Cleanup
            await this.tryCleanup();

        } catch (err: any) {
            console.error('[SyncEngine] Sync error:', err);
            result.errors.push(err.message);
        } finally {
            this.isSyncing = false;
            this.notifyListeners();
        }

        return result;
    }

    private async tryCleanup(): Promise<void> {
        try {
            const lastCleanupStr = await databaseService.getMetadata('last_cleanup');
            const lastCleanup = lastCleanupStr ? new Date(lastCleanupStr).getTime() : 0;
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;

            if (now - lastCleanup > oneDay) {
                console.log('[SyncEngine] Running daily cleanup...');
                const sevenDaysAgo = now - (7 * oneDay); // Keep 7 days history

                // Remove old SUCCESS items from pending queue (if we kept them there)
                await databaseService.runDelete(
                    `DELETE FROM sync_queue WHERE status = 'SUCCESS' AND updated_at < ?`,
                    [sevenDaysAgo]
                );

                await databaseService.setMetadata('last_cleanup', new Date().toISOString());
                console.log('[SyncEngine] Cleanup completed');
            }
        } catch (err) {
            console.warn('[SyncEngine] Cleanup failed:', err);
        }
    }

    private async syncItem(item: SyncQueueItem): Promise<void> {
        console.log(`[SyncEngine] Syncing ${item.entity_type}/${item.operation} (Attempt ${item.attempts + 1})...`);
        const payload = item.payload ? JSON.parse(item.payload) : null;

        switch (item.entity_type) {
            case 'cliente':
                await this.syncCliente(item, payload);
                break;
            case 'os':
                await this.syncOS(item, payload);
                break;
            case 'veiculo':
                await this.syncVeiculo(item, payload);
                break;
            case 'despesa':
                await this.syncDespesa(item, payload);
                break;
            default:
                throw new Error(`Unknown entity type: ${item.entity_type}`);
        }

        await SyncQueueModel.remove(item.id);
    }

    // --- Specific Sync Handlers ---

    private async syncCliente(item: SyncQueueItem, payload: any): Promise<void> {
        const local = await ClienteModel.getByLocalId(item.entity_local_id);
        if (!local && item.operation !== 'DELETE') throw new Error('Local cliente not found');

        switch (item.operation) {
            case 'CREATE': {
                // Idempotency check handled by backend with localId if implemented, 
                // or we rely on the fact that if it fails it stays in queue
                const response = await api.post('/clientes', {
                    ...payload,
                    localId: item.entity_local_id
                });
                await ClienteModel.markAsSynced(item.entity_local_id, response.data.id);
                break;
            }
            case 'UPDATE': {
                if (!local || !local.server_id) throw new Error('No server ID for update');
                // Conflict resolution: Server Wins if newer? 
                // For now, simple Last-Write-Wins (Blindly overwrite server with our newer data)
                await api.put(`/clientes/${local.server_id}`, payload);
                await ClienteModel.markAsSynced(item.entity_local_id, local.server_id);
                break;
            }
            case 'DELETE': {
                if (local && local.server_id) {
                    await api.delete(`/clientes/${local.server_id}`);
                }
                await databaseService.runDelete('DELETE FROM clientes WHERE local_id = ?', [item.entity_local_id]);
                break;
            }
        }
    }

    private async syncOS(item: SyncQueueItem, payload: any): Promise<void> {
        const local = await OSModel.getByLocalId(item.entity_local_id);
        if (!local && item.operation !== 'DELETE') throw new Error('Local OS not found');

        switch (item.operation) {
            case 'CREATE': {
                let clienteServerId: number | null = null;
                if (local?.cliente_local_id) {
                    const cliente = await ClienteModel.getByLocalId(local.cliente_local_id);
                    clienteServerId = cliente?.server_id || null;
                }

                // If client is not synced, we can't sync OS yet unless we support dependency resolution.
                // For now, throw and retry later (hopefully client syncs first).
                if (!clienteServerId) throw new Error('Cliente not synced yet');

                const response = await api.post('/ordens-servico', {
                    clienteId: clienteServerId,
                    data: local?.data,
                    dataVencimento: local?.data_vencimento,
                    status: local?.status,
                    tipoDesconto: local?.tipo_desconto,
                    valorDesconto: local?.valor_desconto,
                    localId: item.entity_local_id // For Idempotency
                });
                await OSModel.markAsSynced(item.entity_local_id, response.data.id);
                break;
            }
            case 'UPDATE': {
                if (!local || !local.server_id) throw new Error('No server ID for update');
                // Update specific fields or status
                if (payload?.status) {
                    await api.patch(`/ordens-servico/${local.server_id}/status`, { status: payload.status });
                } else {
                    // Full update patch
                    await api.patch(`/ordens-servico/${local.server_id}`, payload);
                }
                await OSModel.markAsSynced(item.entity_local_id, local.server_id);
                break;
            }
            case 'DELETE': {
                if (local && local.server_id) {
                    await api.delete(`/ordens-servico/${local.server_id}`);
                }
                await databaseService.runDelete('DELETE FROM ordens_servico WHERE local_id = ?', [item.entity_local_id]);
                break;
            }
        }
    }

    private async syncVeiculo(item: SyncQueueItem, payload: any): Promise<void> {
        const local = await VeiculoModel.getById(
            (await databaseService.getFirst<{ id: number }>('SELECT id FROM veiculos_os WHERE local_id = ?', [item.entity_local_id]))?.id || 0
        );

        switch (item.operation) {
            case 'CREATE': {
                if (!local) throw new Error('Local veiculo not found');
                let osServerId: number | null = null;
                if (local.os_local_id) {
                    const os = await OSModel.getByLocalId(local.os_local_id);
                    osServerId = os?.server_id || null;
                }
                if (!osServerId) throw new Error('OS not synced yet');

                const response = await api.post('/ordens-servico/veiculos', {
                    ordemServicoId: osServerId,
                    placa: local.placa,
                    modelo: local.modelo,
                    cor: local.cor,
                    localId: item.entity_local_id
                });
                await VeiculoModel.markAsSynced(item.entity_local_id, response.data.id);
                break;
            }
            case 'DELETE': {
                // Check if it exists locally or just proceed to kill on server
                // Implementation implies if we have server_id we delete
                // Ideally we track server_id in payload for DELETE ops if local is gone
                // But current logic requires local record to get server_id. 
                // If local is hard deleted, we might lose server_id. Soft delete fixes this!
                const serverId = local?.server_id;
                if (serverId) {
                    await api.delete(`/ordens-servico/veiculos/${serverId}`);
                }
                await databaseService.runDelete('DELETE FROM veiculos_os WHERE local_id = ?', [item.entity_local_id]);
                break;
            }
        }
    }

    private async syncDespesa(item: SyncQueueItem, payload: any): Promise<void> {
        const local = await DespesaModel.getById(
            (await databaseService.getFirst<{ id: number }>('SELECT id FROM despesas WHERE local_id = ?', [item.entity_local_id]))?.id || 0
        );

        switch (item.operation) {
            case 'CREATE': {
                if (!local) throw new Error('Local despesa not found');
                const response = await api.post('/despesas', {
                    ...payload,
                    localId: item.entity_local_id
                });
                await DespesaModel.markAsSynced(item.entity_local_id, response.data.id);
                break;
            }
            case 'DELETE': {
                if (local && local.server_id) {
                    await api.delete(`/despesas/${local.server_id}`);
                }
                await databaseService.runDelete('DELETE FROM despesas WHERE local_id = ?', [item.entity_local_id]);
                break;
            }
        }
    }

    destroy(): void {
        if (this.unsubscribeNetInfo) {
            this.unsubscribeNetInfo();
            this.unsubscribeNetInfo = null;
        }
        this.listeners.clear();
    }
}

export const syncEngine = new SyncEngine();
