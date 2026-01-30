import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermission } from '../hooks/usePermission';
import { OperationalDashboard } from '../components/dashboard/OperationalDashboard';

export const HomePage: React.FC = () => {
    const { user } = usePermission();
    const navigate = useNavigate();

    // 🛡️ SAAS PROTECTION: Redirect Platform Admins to their dashboard
    useEffect(() => {
        if (user) {
            const role = user.role?.toUpperCase() || '';
            const isPlatformAdmin = (role === 'SUPER_ADMIN' || role === 'ADMIN_PLATAFORMA') && !user.empresa;

            if (isPlatformAdmin) {
                console.log('[HomePage] 🔄 SaaS Admin detected on Root -> Redirecting to Platform Dashboard');
                navigate('/platform/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    // All users with DASHBOARD_VIEW feature see the full Operational Dashboard
    // (vehicle search, quick access to create client/OS, stats, etc.)
    return (
        <div className="min-h-[calc(100vh-64px)] py-4 sm:py-8 space-y-8">
            <section className="animate-slideUp delay-100">
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-2 h-8 bg-cyber-gold"></span>
                    <h2 className="text-2xl font-black italic text-cyber-gold tracking-widest uppercase">
                        Painel Operacional
                    </h2>
                </div>
                <OperationalDashboard />
            </section>
        </div>
    );
};
