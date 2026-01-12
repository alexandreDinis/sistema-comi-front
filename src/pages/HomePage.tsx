import React from 'react';
import { OperationalDashboard } from '../components/dashboard/OperationalDashboard';

export const HomePage: React.FC = () => {
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
