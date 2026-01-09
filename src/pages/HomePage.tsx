import React from 'react';
import { ComissaoDashboard } from '../components/dashboard/ComissaoDashboard';
import { OperationalDashboard } from '../components/dashboard/OperationalDashboard';
import { authService } from '../services/authService';

export const HomePage: React.FC = () => {
    const user = authService.getCurrentUser();

    // Check if user is strictly non-admin (ROLE_USER only)
    const isAdmin = React.useMemo(() => {
        if (!user) return false;
        const singleRole = user.role ? user.role.toUpperCase() : '';
        const rolesList = user.roles ? user.roles.map((r: string) => r.toUpperCase()) : [];
        return singleRole === 'ADMIN' || singleRole === 'ROLE_ADMIN' || rolesList.includes('ADMIN') || rolesList.includes('ROLE_ADMIN');
    }, [user]);

    // If user is NOT admin, show only their Commission Dashboard (Old Panel)
    if (!isAdmin) {
        return (
            <div className="min-h-[calc(100vh-64px)] py-4 sm:py-8">
                <div className="flex items-center gap-2 mb-6 animate-slideDown">
                    <span className="w-2 h-8 bg-cyber-gold"></span>
                    <h2 className="text-2xl font-black italic text-cyber-gold tracking-widest uppercase">
                        Meu Painel
                    </h2>
                </div>
                <ComissaoDashboard />
            </div>
        );
    }

    // Default Unified View for Admins
    return (
        <div className="min-h-[calc(100vh-64px)] py-4 sm:py-8 space-y-12">
            <section className="animate-slideDown">
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-2 h-8 bg-cyber-gold"></span>
                    <h2 className="text-2xl font-black italic text-cyber-gold tracking-widest uppercase">
                        Visão Operacional
                    </h2>
                </div>
                <OperationalDashboard />
            </section>

            <section className="animate-slideUp delay-200 opacity-0 fill-mode-forwards" style={{ animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-2 h-8 bg-cyber-gold/50"></span>
                    <h2 className="text-2xl font-black italic text-cyber-gold/50 tracking-widest uppercase">
                        Controle Financeiro
                    </h2>
                </div>
                <ComissaoDashboard />
            </section>
        </div>
    );
};
