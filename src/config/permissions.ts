export const AVAILABLE_FEATURES = [
    // Painel Inicial
    { key: 'DASHBOARD_VIEW', label: 'Acesso ao Painel Inicial' },

    // Ordens de Serviço
    { key: 'OS_READ', label: 'Ver Ordens de Serviço' },
    { key: 'OS_UPDATE', label: 'Editar Ordens de Serviço' },
    { key: 'OS_CREATE', label: 'Criar Nova OS' },

    // Clientes
    { key: 'CLIENTE_READ', label: 'Ver Clientes' },
    { key: 'CLIENTE_WRITE', label: 'Gerenciar Clientes' },

    // Financeiro & Comissões
    { key: 'RELATORIO_FINANCEIRO_VIEW', label: 'Ver Financeiro Geral' },
    { key: 'RELATORIO_COMISSAO_VIEW', label: 'Ver Minhas Comissões' },

    // Admin / Gestão
    { key: 'ADMIN_USERS_WRITE', label: 'Gerenciar Usuários' },
    { key: 'ADMIN_CONFIG', label: 'Acesso ao Painel Admin' }
] as const;

export type FeatureKey = typeof AVAILABLE_FEATURES[number]['key'];
