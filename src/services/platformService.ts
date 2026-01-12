import api from './api';

const BASE_URL = '/platform';

export interface PlatformStats {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
    mrr: number;
}

export interface TenantSummary {
    id: number;
    nome: string;
    cnpj: string;
    plano: 'BRONZE' | 'PRATA' | 'OURO';
    ativo: boolean;
    dataCriacao: string;
    dataAtualizacao?: string;
    // Frontend convenience computed property
    status?: 'ACTIVE' | 'BLOCKED';
    adminEmail?: string;
    createdAt?: string;
}

export interface TenantCreateRequest {
    nome: string;
    cnpj: string;
    plano: string;
    adminEmail: string;
    adminPassword?: string;
}

export interface PlanSummary {
    id: string;
    name: string;
    price: number;
    features?: string[];
}

export const platformService = {
    // GET /api/v1/platform/stats
    getStats: async (): Promise<PlatformStats> => {
        const response = await api.get<PlatformStats>(`${BASE_URL}/stats`);
        return response.data;
    },

    // GET /api/v1/platform/tenants
    listTenants: async (): Promise<TenantSummary[]> => {
        const response = await api.get<TenantSummary[]>(`${BASE_URL}/tenants`);
        return response.data;
    },

    // POST /api/v1/platform/tenants
    createTenant: async (data: TenantCreateRequest): Promise<TenantSummary> => {
        const response = await api.post<TenantSummary>(`${BASE_URL}/tenants`, data);
        return response.data;
    },

    // GET /api/v1/platform/plans
    listPlans: async (): Promise<PlanSummary[]> => {
        const response = await api.get<PlanSummary[]>(`${BASE_URL}/plans`);
        return response.data;
    },

    // PUT /api/v1/platform/tenants/{id}/toggle-status
    toggleBlockTenant: async (id: number): Promise<TenantSummary> => {
        const response = await api.put<TenantSummary>(`${BASE_URL}/tenants/${id}/toggle-status`);
        return response.data;
    }
};
