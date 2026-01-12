export const AVAILABLE_FEATURES = [
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
    { key: 'ADMIN_USERS_WRITE', label: 'Gerenciar Usuários' }
] as const;

export type FeatureKey = typeof AVAILABLE_FEATURES[number]['key'];
