import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Shield } from 'lucide-react';
import { authService } from '../services/authService';

export const PartnerLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <Shield className="text-purple-600" size={28} />
                    <span className="font-bold text-lg tracking-tight">Partner Portal</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem to="/partner/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavItem to="/partner/tenants" icon={<Users size={20} />} label="Meus Clientes" />
                    <NavItem to="/partner/financial" icon={<CreditCard size={20} />} label="Financeiro" />
                    <NavItem to="/partner/settings" icon={<Settings size={20} />} label="Configurações" />
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                     <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded w-full transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8">
                    <h2 className="font-semibold text-slate-500">Área do Revendedor</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                            P
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
    <Link 
        to={to} 
        className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition-colors"
    >
        {icon}
        <span className="font-medium">{label}</span>
    </Link>
);
