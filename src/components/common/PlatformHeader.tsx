import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Building2, Layers, Lock, AlertTriangle } from 'lucide-react';
import { authService } from '../../services/authService';

export const PlatformHeader: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { user } = authService.getCurrentUser() ? { user: authService.getCurrentUser() } : { user: null };
    // Helper to check roles (quick implementation since we are outside ProtectedRoute context somewhat)
    const role = user?.role || '';
    const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ROLE_SUPER_ADMIN' || role === 'ADMIN_PLATAFORMA';

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    // ... (existing code)

    return (
        <header className="bg-slate-900 border-b border-slate-700 shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-3">
                <div className="flex justify-between items-center">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        {/* ... */}
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center gap-1">
                        <NavItem
                            to="/platform/dashboard"
                            label="Dashboard"
                            icon={LayoutDashboard}
                            active={isActive('/platform/dashboard')}
                        />
                        <NavItem
                            to="/platform/tenants"
                            label="Inquilinos"
                            icon={Building2}
                            active={isActive('/platform/tenants')}
                        />
                        <NavItem
                            to="/platform/plans"
                            label="Planos"
                            icon={Layers}
                            active={isActive('/platform/plans')}
                        />

                        {/* RESTRICTED: SUPER ADMIN ONLY */}
                        {isSuperAdmin && (
                            <>
                                <NavItem
                                    to="/platform/license-plans"
                                    label="Planos WL"
                                    icon={Layers}
                                    active={isActive('/platform/license-plans')}
                                />
                                <NavItem
                                    to="/platform/resellers"
                                    label="Revendedores"
                                    icon={Building2}
                                    active={isActive('/platform/resellers')}
                                />
                                <NavItem
                                    to="/platform/risk"
                                    label="Risco"
                                    icon={AlertTriangle}
                                    active={isActive('/platform/risk')}
                                />
                                <NavItem
                                    to="/platform/owner"
                                    label="Owner View"
                                    icon={LayoutDashboard}
                                    active={isActive('/platform/owner')}
                                />
                            </>
                        )}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-slate-400">Super Admin</div>
                            <div className="text-sm font-medium text-slate-200">root@oroboros.dev</div>
                        </div>
                        <div className="h-8 w-px bg-slate-700 mx-2"></div>
                        <Link
                            to="/platform/change-password"
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/10 rounded-full transition-colors"
                            title="Alterar Senha"
                        >
                            <Lock size={18} />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-full transition-colors"
                            title="Sair"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

interface NavItemProps {
    to: string;
    label: string;
    icon: React.ElementType;
    active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon: Icon, active }) => (
    <Link
        to={to}
        className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}
        `}
    >
        <Icon size={16} />
        {label}
    </Link>
);
