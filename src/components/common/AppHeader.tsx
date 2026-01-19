import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Wrench, Settings, LayoutDashboard, FileText, Edit, DollarSign, BarChart2 } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';
import { Feature } from '../../types/features';
import { UserMenu } from './UserMenu';
import logo from '../../assets/log.png';

export const AppHeader: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();
    const { hasFeature } = usePermission();

    const isActive = (path: string) => location.pathname === path;
    const isSectionActive = (paths: string[]) => paths.some(path => location.pathname.startsWith(path));

    // Definição dos Grupos de Navegação com Features - Estrutura ERP
    const allNavGroups = [
        // OPERAÇÃO - mantém igual
        {
            label: 'OPERAÇÃO',
            icon: Wrench,
            requiredFeature: [Feature.CLIENTE_READ, Feature.OS_READ, Feature.PRODUTO_READ],
            items: [
                { label: 'CLIENTES', path: '/clientes', feature: Feature.CLIENTE_READ },
                { label: 'ORDENS DE SERVIÇO', path: '/os', feature: Feature.OS_READ },
                { label: 'CATÁLOGO', path: '/catalogo', feature: Feature.PRODUTO_READ },
            ]
        },
        // FINANCEIRO - Dashboard apenas
        {
            label: 'FINANCEIRO',
            icon: LayoutDashboard,
            requiredFeature: [Feature.RELATORIO_FINANCEIRO_VIEW],
            items: [
                { label: 'DASHBOARD', path: '/financeiro', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
            ]
        },
        // CONTAS - Fluxo de Recebíveis/Pagáveis
        {
            label: 'CONTAS',
            icon: FileText,
            requiredFeature: [Feature.RELATORIO_FINANCEIRO_VIEW],
            items: [
                { label: 'CONTAS A RECEBER', path: '/financeiro/contas-receber', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
                { label: 'CONTAS A PAGAR', path: '/financeiro/contas-pagar', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
                { label: 'CARTÕES CORPORATIVOS', path: '/financeiro/cartoes', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
                { label: 'FATURAS DE CARTÃO', path: '/financeiro/faturas', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
            ]
        },
        // LANÇAMENTOS - Entrada de dados
        {
            label: 'LANÇAMENTOS',
            icon: Edit,
            requiredFeature: [Feature.RELATORIO_FINANCEIRO_VIEW],
            items: [
                { label: 'DESPESAS', path: '/despesa', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
                { label: 'FATURAMENTO MANUAL', path: '/faturamento', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
                { label: 'ADIANTAMENTOS', path: '/adiantamento', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
            ]
        },
        // COMISSÕES - Gestão
        {
            label: 'COMISSÕES',
            icon: DollarSign,
            requiredFeature: [Feature.RELATORIO_COMISSAO_VIEW, Feature.ADMIN_CONFIG],
            items: [
                { label: 'MINHAS COMISSÕES', path: '/minha-comissao', feature: Feature.RELATORIO_COMISSAO_VIEW },
                { label: 'GESTÃO DE COMISSÕES', path: '/settings/comissao', feature: Feature.ADMIN_CONFIG },
            ]
        },
        // RELATÓRIOS - Análise
        {
            label: 'RELATÓRIOS',
            icon: BarChart2,
            requiredFeature: [Feature.RELATORIO_FINANCEIRO_VIEW],
            items: [
                { label: 'HUB DE RELATÓRIOS', path: '/relatorio', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
                { label: 'FLUXO DE CAIXA', path: '/relatorio/financeiro', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
                { label: 'DRE / VISÃO ANUAL', path: '/relatorio/anual', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
                { label: 'RANKING CLIENTES', path: '/relatorio/ranking', feature: Feature.RELATORIO_FINANCEIRO_VIEW },
            ]
        },
        // CONFIGURAÇÕES
        {
            label: 'CONFIGURAÇÕES',
            icon: Settings,
            requiredFeature: [Feature.ADMIN_CONFIG, Feature.ADMIN_USERS_READ],
            items: [
                { label: 'ADMINISTRAÇÃO', path: '/settings', feature: Feature.ADMIN_CONFIG },
                { label: 'TRIBUTAÇÃO', path: '/settings/tributacao', feature: Feature.ADMIN_CONFIG },
                { label: 'PRESTADORES', path: '/settings/prestadores', feature: Feature.ADMIN_CONFIG },
            ]
        }
    ];

    // Filtrar grupos e itens baseados nas permissões do usuário
    const navGroups = allNavGroups.map(group => ({
        ...group,
        items: group.items.filter(item => hasFeature(item.feature))
    })).filter(group => group.items.length > 0);

    return (
        <header className="bg-black/90 border-b border-cyber-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.1)] sticky top-0 z-50">
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-px bg-cyber-gold animate-[scanline_2s_infinite]"></div>
            </div>

            <div className="container mx-auto px-4 py-2">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-4 group transition-all">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full border-2 border-cyber-gold/50 flex items-center justify-center p-1 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-shadow">
                                <img src={logo} alt="OROBOROS Logo" className="w-full h-full object-cover scale-150 brightness-125 group-hover:scale-175 transition-transform" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-cyber-gold tracking-tighter italic italic-shadow glitch">OROBOROS</span>
                                <div className="px-1.5 py-0.5 bg-cyber-gold/10 border border-cyber-gold/30 text-[8px] text-cyber-gold/60 font-mono flex items-center gap-1">
                                    <span className="w-1 h-1 bg-cyber-gold rounded-full animate-pulse"></span>
                                    ONLINE
                                </div>
                            </div>
                            <span className="text-[10px] text-cyber-gold/40 font-mono uppercase tracking-[0.4em]">SERVICE_CORE_V3</span>
                        </div>
                    </Link>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-cyber-gold p-2 hover:bg-cyber-gold/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-6">
                        {hasFeature(Feature.DASHBOARD_VIEW) && (
                            <Link
                                to="/"
                                className={`px-3 py-2 text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 relative group ${isActive('/') ? 'text-cyber-gold' : 'text-cyber-gold/60 hover:text-cyber-gold'}`}
                            >
                                PAINEL
                                {isActive('/') && <div className="absolute -bottom-3 left-0 right-0 h-[2px] bg-cyber-gold shadow-[0_0_10px_var(--color-cyber-gold)]"></div>}
                            </Link>
                        )}

                        {navGroups.map((group) => (
                            <div key={group.label} className="relative group/menu">
                                <button className={`px-3 py-2 text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-1 relative ${isSectionActive(group.items.map(i => i.path)) ? 'text-cyber-gold' : 'text-cyber-gold/60 group-hover/menu:text-cyber-gold'}`}>
                                    {group.label}
                                    <ChevronDown size={10} className="ml-1 opacity-50" />
                                </button>

                                {/* Dropdown */}
                                <div className="absolute left-0 top-full pt-4 w-48 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 transform group-hover/menu:translate-y-0 translate-y-2">
                                    <div className="bg-black/95 border border-cyber-gold/40 p-2 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl relative hud-card bottom-brackets">
                                        <div className="static-overlay opacity-10"></div>
                                        {group.items.map((item) => (
                                            <Link
                                                key={item.label}
                                                to={item.path}
                                                className={`block px-4 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-cyber-gold/10 transition-colors ${isActive(item.path) ? 'text-cyber-gold border-l-2 border-cyber-gold bg-cyber-gold/5' : 'text-cyber-gold/60'}`}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Desktop User Menu */}
                    <div className="hidden md:block">
                        <UserMenu />
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 border-t border-cyber-gold/20 pt-4 space-y-4 animate-slideDown bg-black/95">
                        {hasFeature(Feature.DASHBOARD_VIEW) && (
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-xs font-black tracking-widest uppercase text-cyber-gold">PAINEL</Link>
                        )}
                        {navGroups.map(group => (
                            <div key={group.label} className="px-4">
                                <div className="text-[10px] text-cyber-gold/40 uppercase tracking-widest mb-2 font-mono flex items-center gap-2">
                                    <group.icon size={12} /> {group.label}
                                </div>
                                <div className="pl-4 border-l border-cyber-gold/10 space-y-2">
                                    {group.items.map(item => (
                                        <Link
                                            key={item.label}
                                            to={item.path}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`block text-xs font-bold uppercase ${isActive(item.path) ? 'text-cyber-gold' : 'text-gray-400'}`}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {/* Mobile User Menu */}
                        <div className="border-t border-cyber-gold/20 pt-4 px-4">
                            <UserMenu />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};
