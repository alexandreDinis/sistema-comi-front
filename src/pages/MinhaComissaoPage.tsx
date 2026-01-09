import React from 'react';
import { ComissaoDashboard } from '../components/dashboard/ComissaoDashboard';

export const MinhaComissaoPage: React.FC = () => {
    return (
        <div className="py-8">
            <h1 className="text-3xl font-orbitron text-cyber-gold font-bold tracking-wider mb-8 flex items-center gap-3 animate-slideDown">
                <span className="w-2 h-8 bg-cyber-gold"></span>
                MINHA COMISSÃO
            </h1>
            <ComissaoDashboard />
        </div>
    );
};
