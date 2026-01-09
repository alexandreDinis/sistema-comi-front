import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, ChevronDown, Wrench, Briefcase, Settings, Shield } from 'lucide-react';
import { authService } from '../../services/authService';
import logo from '../../assets/log.png';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const isAdmin = React.useMemo(() => {
        if (!user) return false;
        const singleRole = user.role ? user.role.toUpperCase() : '';
        const rolesList = user.roles ? user.roles.map((r: string) => r.toUpperCase()) : [];
        return singleRole === 'ADMIN' || singleRole === 'ROLE_ADMIN' || rolesList.includes('ADMIN') || rolesList.includes('ROLE_ADMIN');
    }, [user]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;
    const isSectionActive = (paths: string[]) => paths.some(path => location.pathname.startsWith(path));

    // Nav Groups
    const navGroups = [
        {
            label: 'OPERAÇÃO',
            icon: Wrench,
            path: null,
            items: [
                { label: 'CLIENTES', path: '/clientes' },
                { label: 'ORDENS DE SERVIÇO', path: '/os' },
                { label: 'CATÁLOGO', path: '/catalogo' },
            ]
        },
        {
            label: 'FINANCEIRO',
            icon: Briefcase,
            items: [
                { label: 'MINHA COMISSÃO', path: '/minha-comissao' },
                { label: 'FATURAMENTO', path: '/faturamento' },
                { label: 'ADIANTAMENTOS', path: '/adiantamento' },
                { label: 'DESPESAS', path: '/despesa' },
                { label: 'RELATÓRIOS', path: '/relatorio' }
            ]
        },
        {
            label: 'CONTROLE',
            icon: Shield,
            items: [
                { label: 'AUDITORIA', path: '/relatorio', duplicate: true }
            ]
        },
        {
            label: 'ADMIN',
            icon: Settings,
            restricted: true,
            items: [
                { label: 'CATÁLOGO', path: '/catalogo' },
                { label: 'PAINEL ADMIN', path: '/admin' },
            ]
        }
    ].filter(group => !group.restricted || isAdmin);

    // Cleanup: Remove Duplicate Auditoria/Relatorio if ambiguous. 
    // User: Financeiro -> Relatorios. Controle -> Auditoria.
    // I will keep Relatorios in Financeiro and Auditoria in Controle pointing to same for now, or just separate properly later.

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
                        <Link
                            to="/"
                            className={`px-3 py-2 text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 relative group ${isActive('/') ? 'text-cyber-gold' : 'text-cyber-gold/60 hover:text-cyber-gold'}`}
                        >
                            PAINEL
                            {isActive('/') && <div className="absolute -bottom-3 left-0 right-0 h-[2px] bg-cyber-gold shadow-[0_0_10px_var(--color-cyber-gold)]"></div>}
                        </Link>

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

                    {/* Desktop Logout */}
                    <div className="hidden md:block">
                        <button onClick={handleLogout} className="ml-4 p-2 text-cyber-error/60 hover:text-cyber-error transition-colors" title="SAIR">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 border-t border-cyber-gold/20 pt-4 space-y-4 animate-slideDown bg-black/95">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-xs font-black tracking-widest uppercase text-cyber-gold">PAINEL</Link>
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
                    </div>
                )}
            </div>
        </header>
    );
};
