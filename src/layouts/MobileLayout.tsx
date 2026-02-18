import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Users, TrendingDown, DollarSign, LogOut } from 'lucide-react';
import { authService } from '../services/authService';

// Rotas permitidas no mobile (mesmo que no native app)
export const MOBILE_ALLOWED_ROUTES = [
    '/',
    '/os',
    '/clientes',
    '/despesa',
    '/minha-comissao',
];

// Verifica se uma rota é permitida no mobile
export const isMobileAllowedRoute = (path: string): boolean => {
    // Rotas exatas
    if (MOBILE_ALLOWED_ROUTES.includes(path)) return true;
    // Rotas com parâmetros (ex: /os/123)
    if (path.startsWith('/os/')) return true;
    // Login e autenticação sempre permitidos
    if (path.startsWith('/login') || path.startsWith('/change-password')) return true;
    return false;
};

interface TabItem {
    path: string;
    icon: React.ReactNode;
    label: string;
}

const TABS: TabItem[] = [
    { path: '/', icon: <Home size={20} />, label: 'Início' },
    { path: '/os', icon: <FileText size={20} />, label: 'OS' },
    { path: '/clientes', icon: <Users size={20} />, label: 'Clientes' },
    { path: '/despesa', icon: <TrendingDown size={20} />, label: 'Despesas' },
    { path: '/minha-comissao', icon: <DollarSign size={20} />, label: 'Comissões' },
];

export const MobileLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isTabActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-cyber-bg flex flex-col">
            {/* Header simples */}
            <header className="bg-cyber-card border-b border-cyber-border px-4 py-3 safe-area-top">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-cyber-gold font-black text-lg tracking-wider">
                            SISTEMA OS
                        </h1>
                        <span className="text-cyber-muted text-xs">MOBILE</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-full hover:bg-red-500/10"
                        aria-label="Sair"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Conteúdo */}
            <main className="flex-1 overflow-y-auto pb-20">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-cyber-card border-t border-cyber-border safe-area-bottom">
                <div className="flex justify-around items-center h-16">
                    {TABS.map((tab) => {
                        const isActive = isTabActive(tab.path);
                        return (
                            <button
                                key={tab.path}
                                onClick={() => navigate(tab.path)}
                                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                                    ? 'text-cyber-gold'
                                    : 'text-cyber-muted hover:text-cyber-text'
                                    }`}
                            >
                                {tab.icon}
                                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                                    {tab.label.toUpperCase()}
                                </span>
                                {isActive && (
                                    <div className="absolute bottom-0 w-12 h-0.5 bg-cyber-gold" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

// Componente para bloquear rotas não permitidas no mobile
export const MobileRouteBlocker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isMobileAllowedRoute(location.pathname)) {
            // Redirecionar para home se tentar acessar rota não permitida
            navigate('/', { replace: true });
        }
    }, [location.pathname, navigate]);

    if (!isMobileAllowedRoute(location.pathname)) {
        return (
            <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4">
                <div className="bg-cyber-card border border-cyber-border rounded-lg p-6 text-center max-w-sm">
                    <div className="text-cyber-gold text-4xl mb-4">📱</div>
                    <h2 className="text-cyber-gold font-bold text-lg mb-2">
                        Funcionalidade Desktop
                    </h2>
                    <p className="text-cyber-muted text-sm mb-4">
                        Esta funcionalidade está disponível apenas na versão desktop.
                        Por favor, acesse em um computador ou use o aplicativo nativo.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-cyber-gold text-black font-bold px-4 py-2 rounded hover:bg-cyber-gold/80 transition-colors"
                    >
                        VOLTAR AO INÍCIO
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default MobileLayout;
