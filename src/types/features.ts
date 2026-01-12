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
} as const;

export type Feature = typeof Feature[keyof typeof Feature];
