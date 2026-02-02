
import { syncEngine } from '../SyncEngine';
import { SyncQueueModel, ClienteModel, OSModel } from '../../database/models';
import api from '../../api';
import { databaseService } from '../../database/DatabaseService';

// Mocks
jest.mock('@react-native-community/netinfo', () => ({
    fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
    addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock('../../database/DatabaseService', () => ({
    databaseService: {
        initialize: jest.fn(),
        setMetadata: jest.fn(),
        getMetadata: jest.fn(),
        runDelete: jest.fn(),
        getFirst: jest.fn(), // Helper used in syncVeiculo etc
    }
}));

jest.mock('../../api', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
    }
}));

const mockGetPending = jest.fn();
const mockMarkAttempt = jest.fn();
const mockRemove = jest.fn();

jest.mock('../../database/models', () => ({
    SyncQueueModel: {
        getPending: jest.fn(),  // Will be assigned to mockGetPending in beforeAll/Each if cleaner
        markAttempt: jest.fn(),
        remove: jest.fn(),
        getCounts: jest.fn().mockResolvedValue({ total: 0, errors: 0 }),
    },
    ClienteModel: {
        getByLocalId: jest.fn(),
        markAsSynced: jest.fn(),
        markAsSyncError: jest.fn(),
    },
    OSModel: {
        getByLocalId: jest.fn(),
        markAsSynced: jest.fn(),
    },
    VeiculoModel: {
        getById: jest.fn(),
        markAsSynced: jest.fn(),
    },
    DespesaModel: {
        getById: jest.fn(),
        markAsSynced: jest.fn(),
    }
}));

// Re-assign mocks to access them
(SyncQueueModel.getPending as jest.Mock) = mockGetPending;
(SyncQueueModel.markAttempt as jest.Mock) = mockMarkAttempt;
(SyncQueueModel.remove as jest.Mock) = mockRemove;

describe('SyncEngine Verification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default: Online
        require('@react-native-community/netinfo').fetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    });

    test('[Offline Creation & Sync] Should sync pending items when online', async () => {
        // Setup state: 1 Pending Item
        mockGetPending.mockResolvedValue([
            {
                id: 1,
                entity_type: 'cliente',
                entity_local_id: 'local-uuid-1',
                operation: 'CREATE',
                payload: JSON.stringify({ razaoSocial: 'Test Client' }),
                attempts: 0,
                created_at: Date.now()
            }
        ]);

        // Mock Local Data Existence
        (ClienteModel.getByLocalId as jest.Mock).mockResolvedValue({ id: 1, local_id: 'local-uuid-1', razao_social: 'Test Client' });

        // Mock API Success
        (api.post as jest.Mock).mockResolvedValue({ data: { id: 100 } }); // Server ID 100

        // Run Sync
        await syncEngine.syncAll();

        // Verification
        expect(api.post).toHaveBeenCalledWith('/clientes', expect.objectContaining({
            razaoSocial: 'Test Client',
            localId: 'local-uuid-1'
        }));
        expect(ClienteModel.markAsSynced).toHaveBeenCalledWith('local-uuid-1', 100);
        expect(mockRemove).toHaveBeenCalledWith(1);
    });

    test('[Retry Logic] Should invoke retry logic on failure', async () => {
        // Setup state: 1 Pending Item
        mockGetPending.mockResolvedValue([
            {
                id: 2,
                entity_type: 'cliente',
                entity_local_id: 'local-uuid-fail',
                operation: 'CREATE',
                payload: '{"name": "Fail"}',
                attempts: 0,
                max_retries: 3,
                created_at: Date.now()
            }
        ]);

        (ClienteModel.getByLocalId as jest.Mock).mockResolvedValue({ id: 2 });

        // Mock API Failure
        (api.post as jest.Mock).mockRejectedValue(new Error('Network Timeout'));

        // Run Sync
        await syncEngine.syncAll();

        // Verification
        expect(api.post).toHaveBeenCalled();
        expect(mockMarkAttempt).toHaveBeenCalledWith(2, false, 'Network Timeout');
        expect(mockRemove).not.toHaveBeenCalled(); // Should NOT remove
    });

    test('[Retry Logic] Should NOT sync items within backoff window', async () => {
        const now = Date.now();
        mockGetPending.mockResolvedValue([
            {
                id: 3,
                entity_type: 'cliente',
                entity_local_id: 'backoff-uuid',
                operation: 'CREATE',
                payload: '{}',
                attempts: 1, // 1st attempt failed
                last_attempt: now - 100, // Only 100ms ago (Backoff is 1s)
                created_at: now - 1000
            }
        ]);

        await syncEngine.syncAll();

        // Should skip this item
        expect(api.post).not.toHaveBeenCalled();
        expect(mockMarkAttempt).not.toHaveBeenCalled();
    });

    test('[Conflict Resolution] Updates should respect pending local changes', async () => {
        // This logic is mostly in upsertFromServer (Models), but SyncEngine handles the PUSH side.
        // SyncEngine "Last Write Wins" on PUSH: it blindly pushes what it has locally to server.

        mockGetPending.mockResolvedValue([
            {
                id: 4,
                entity_type: 'cliente',
                entity_local_id: 'uuid-update',
                operation: 'UPDATE',
                payload: JSON.stringify({ razaoSocial: 'Updated Name Local' }),
                attempts: 0,
                created_at: Date.now()
            }
        ]);

        (ClienteModel.getByLocalId as jest.Mock).mockResolvedValue({
            id: 10, server_id: 500, local_id: 'uuid-update'
        });

        // Mock API
        (api.put as jest.Mock).mockResolvedValue({ data: {} });

        await syncEngine.syncAll();

        // It should overwrite server with 'Updated Name Local'
        expect(api.put).toHaveBeenCalledWith('/clientes/500', expect.objectContaining({ razaoSocial: 'Updated Name Local' }));
        expect(ClienteModel.markAsSynced).toHaveBeenCalledWith('uuid-update', 500);
    });

    test('[Cleanup] Should run cleanup logic daily', async () => {
        // Mock Last Cleanup: 2 days ago
        (databaseService.getMetadata as jest.Mock).mockResolvedValue(new Date(Date.now() - 172800000).toISOString());

        await syncEngine.syncAll();

        expect(databaseService.runDelete).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM sync_queue WHERE status = 'SUCCESS'"),
            expect.any(Array)
        );
        expect(databaseService.setMetadata).toHaveBeenCalledWith('last_cleanup', expect.any(String));
    });
});
