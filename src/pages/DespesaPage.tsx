import React from 'react';
import { DespesaForm } from '../components/forms/DespesaForm';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DespesaPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-xl mx-auto mb-10">
                <nav className="flex items-center gap-3 text-[9px] font-black text-cyber-gold/30 mb-8 uppercase tracking-[0.4em]">
                    <Link to="/" className="hover:text-cyber-gold transition-colors flex items-center gap-1.5 border border-cyber-gold/10 px-2 py-1 bg-black/40">
                        <Home className="w-2.5 h-2.5" />
                        RAIZ
                    </Link>
                    <ChevronRight className="w-2.5 h-2.5 opacity-20" />
                    <span className="text-cyber-gold/60">MÓDULO_DESPESAS_SAÍDA</span>
                </nav>

                <div className="relative mb-12">
                    <div className="absolute -left-4 top-0 bottom-0 w-px bg-cyber-gold/20"></div>
                    <h1 className="text-5xl font-black text-cyber-gold tracking-tighter italic italic-shadow uppercase glitch">
                        Console de Despesas
                    </h1>
                    <p className="text-cyber-gold/40 text-[10px] font-mono tracking-[0.2em] mt-3 uppercase max-w-lg">
                        ALOCAR_CUSTOS_OPERACIONAIS // SINCR_FLUXOS_PARA_AUDITORIA_V2.5
                    </p>
                </div>
            </div>

            <DespesaForm />
        </div>
    );
};
