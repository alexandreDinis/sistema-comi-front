import React from 'react';
import { ComissaoDashboard } from '../components/dashboard/ComissaoDashboard';
import { OperationalDashboard } from '../components/dashboard/OperationalDashboard';
import { authService } from '../services/authService';

export const HomePage: React.FC = () => {
    const user = authService.getCurrentUser();

    // Check if user is admin (Generic Admin or Company Admin)
    const isAdmin = React.useMemo(() => {
        if (!user) return false;
        const singleRole = user.role ? user.role.toUpperCase() : '';
        const rolesList = user.roles ? user.roles.map((r: string) => r.toUpperCase()) : [];
        const validRoles = ['ADMIN', 'ROLE_ADMIN', 'ADMIN_EMPRESA', 'ROLE_ADMIN_EMPRESA', 'SUPER_ADMIN'];

        return validRoles.includes(singleRole) || rolesList.some(r => validRoles.includes(r));
    }, [user]);

    // If user is NOT admin/manager, show only their Commission Dashboard (Old Panel)
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

    // Operational Dashboard (Admin View)
    return (
        <div className="min-h-[calc(100vh-64px)] py-4 sm:py-8 space-y-8">
            <section className="animate-slideUp delay-100">
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-2 h-8 bg-cyber-gold"></span>
                    <h2 className="text-2xl font-black italic text-cyber-gold tracking-widest uppercase">
                        Visão Operacional
                    </h2>
                </div>
                <OperationalDashboard />
            </section>
        </div>
    );
};
