export const Feature = {
    // A. Dashboard & Relatórios
    DASHBOARD_VIEW: 'DASHBOARD_VIEW',
    RELATORIO_COMISSAO_VIEW: 'RELATORIO_COMISSAO_VIEW',
    RELATORIO_FINANCEIRO_VIEW: 'RELATORIO_FINANCEIRO_VIEW',

    // B. Operacional (OS)
    OS_READ: 'OS_READ',
    OS_CREATE: 'OS_CREATE',
    OS_UPDATE: 'OS_UPDATE',
    OS_FINALIZE: 'OS_FINALIZE',
    OS_CANCEL: 'OS_CANCEL',

    // C. Cadastros Básicos
    CLIENTE_READ: 'CLIENTE_READ',
    CLIENTE_WRITE: 'CLIENTE_WRITE',
    PRODUTO_READ: 'PRODUTO_READ',
    PRODUTO_WRITE: 'PRODUTO_WRITE',

    // D. Administração (Apenas Gestores)
    ADMIN_USERS_READ: 'ADMIN_USERS_READ',
    ADMIN_USERS_WRITE: 'ADMIN_USERS_WRITE',
    ADMIN_CONFIG: 'ADMIN_CONFIG',

    // E. Plataforma (Super Admin)
    PLATFORM_MANAGE: 'PLATFORM_MANAGE',
} as const;

export type Feature = typeof Feature[keyof typeof Feature];

// UI-friendly list for feature selection components
export const AVAILABLE_FEATURES = [
    { code: 'OS_READ', label: 'Visualizar O.S.' },
    { code: 'OS_CREATE', label: 'Criar O.S.' },
    { code: 'OS_UPDATE', label: 'Editar O.S.' },
    { code: 'OS_FINALIZE', label: 'Finalizar O.S.' },
    { code: 'OS_CANCEL', label: 'Cancelar O.S.' },
    { code: 'CLIENTE_READ', label: 'Visualizar Clientes' },
    { code: 'CLIENTE_WRITE', label: 'Gerenciar Clientes' },
    { code: 'PRODUTO_READ', label: 'Visualizar Produtos' },
    { code: 'PRODUTO_WRITE', label: 'Gerenciar Produtos' },
    { code: 'RELATORIO_COMISSAO_VIEW', label: 'Ver Comissões' },
    { code: 'RELATORIO_FINANCEIRO_VIEW', label: 'Ver Relatório Financeiro' },
    { code: 'DASHBOARD_VIEW', label: 'Visualizar Dashboard' },
] as const;
