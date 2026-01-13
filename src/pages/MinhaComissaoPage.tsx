import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ComissaoDashboard } from '../components/dashboard/ComissaoDashboard';

export const MinhaComissaoPage: React.FC = () => {
    return (
        <div className="py-8">
            <Link to="/relatorio" className="inline-flex items-center gap-2 text-cyber-gold/60 hover:text-cyber-gold transition-colors font-oxanium text-xs mb-6 uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Central
            </Link>
            <h1 className="text-3xl font-orbitron text-cyber-gold font-bold tracking-wider mb-8 flex items-center gap-3 animate-slideDown">
                <span className="w-2 h-8 bg-cyber-gold"></span>
                MINHA COMISSÃO
            </h1>
            <ComissaoDashboard />
        </div>
    );
};
