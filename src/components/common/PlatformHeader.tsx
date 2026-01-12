import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Building2, Layers } from 'lucide-react';
import { authService } from '../../services/authService';

export const PlatformHeader: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="bg-slate-900 border-b border-slate-700 shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-3">
                <div className="flex justify-between items-center">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <LayoutDashboard className="text-white" size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-100 tracking-tight">OROBOROS</span>
                            <span className="text-[10px] bg-blue-900/50 text-blue-200 px-1.5 rounded w-fit font-mono uppercase">Platform Admin</span>
                        </div>
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
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-slate-400">Super Admin</div>
                            <div className="text-sm font-medium text-slate-200">root@oroboros.dev</div>
                        </div>
                        <div className="h-8 w-px bg-slate-700 mx-2"></div>
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
