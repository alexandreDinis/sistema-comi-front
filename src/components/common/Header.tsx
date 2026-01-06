import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { authService } from '../../services/authService';
import logo from '../../assets/log.png';

export const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    // Verificação robusta: string ou array
    // Verificação robusta: string ou array
    const isAdmin = React.useMemo(() => {
        if (!user) return false;

        const singleRole = user.role ? user.role.toUpperCase() : '';
        const rolesList = user.roles ? user.roles.map((r: string) => r.toUpperCase()) : [];

        return singleRole === 'ADMIN' ||
            singleRole === 'ROLE_ADMIN' ||
            rolesList.includes('ADMIN') ||
            rolesList.includes('ROLE_ADMIN');
    }, [user]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Função para verificar se o link está ativo
    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="bg-black/90 border-b border-cyber-gold/40 shadow-[0_0_20px_rgba(212,175,55,0.1)] sticky top-0 z-50 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-px bg-cyber-gold animate-[scanline_2s_infinite]"></div>
            </div>

            <div className="container mx-auto px-4 py-2">
                <div className="flex justify-between items-center">
                    <Link
                        to="/"
                        className="flex items-center gap-4 group transition-all"
                    >
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full border-2 border-cyber-gold/50 flex items-center justify-center p-1 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-shadow">
                                <img src={logo} alt="OROBOROS Logo" className="w-full h-full object-cover scale-150 brightness-125 group-hover:scale-175 transition-transform" />
                            </div>
                            {/* Hologram lines */}
                            <div className="absolute -bottom-1 left-1.5 right-1.5 h-1 bg-cyber-gold/20 blur-[1px]"></div>
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-cyber-gold tracking-tighter italic italic-shadow glitch">
                                    OROBOROS
                                </span>
                                <div className="px-1.5 py-0.5 bg-cyber-gold/10 border border-cyber-gold/30 text-[8px] text-cyber-gold/60 font-mono flex items-center gap-1">
                                    <span className="w-1 h-1 bg-cyber-gold rounded-full animate-pulse"></span>
                                    NÚCLEO_ESTÁVEL
                                </div>
                            </div>
                            <span className="text-[10px] text-cyber-gold/40 font-mono uppercase tracking-[0.4em]">
                                DIAGNÓSTICO_EXP_V2.4.0
                            </span>
                        </div>
                    </Link>

                    <nav className="flex gap-1">
                        {[
                            { path: '/', label: 'PAINEL', restrict: false },
                            { path: '/faturamento', label: 'FATURAMENTO', restrict: false },
                            { path: '/adiantamento', label: 'ADIANTAMENTOS', restrict: false },
                            { path: '/despesa', label: 'DESPESAS', restrict: false },
                            { path: '/relatorio', label: 'AUDITORIA', restrict: false },
                            { path: '/admin', label: 'PAINEL_ADMIN', restrict: false },
                        ].filter(link => !link.restrict || isAdmin).map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-5 py-3 text-[10px] font-black tracking-widest uppercase transition-all relative group ${isActive(link.path)
                                    ? 'text-cyber-gold'
                                    : 'text-cyber-gold/40 hover:text-cyber-gold'
                                    }`}
                            >
                                <span className="relative z-10">{link.label}</span>
                                {isActive(link.path) && (
                                    <>
                                        <div className="absolute inset-0 bg-cyber-gold/5 border-t border-cyber-gold shadow-[inset_0_0_15px_rgba(212,175,55,0.1)]"></div>
                                        <div className="absolute -bottom-px left-0 right-0 h-[2px] bg-cyber-gold shadow-[0_0_10px_var(--color-cyber-gold)]"></div>
                                    </>
                                )}
                                <div className="absolute inset-0 bg-cyber-gold/0 group-hover:bg-cyber-gold/5 transition-colors pointer-events-none"></div>
                            </Link>
                        ))}
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="ml-4 px-4 py-3 bg-cyber-error/10 border border-cyber-error/30 text-cyber-error hover:bg-cyber-error/20 hover:text-white transition-all text-[10px] font-mono tracking-widest uppercase flex items-center gap-2 group"
                        title="ENCERRAR_CONEXÃO"
                    >
                        <LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="hidden sm:inline">SAIR</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
