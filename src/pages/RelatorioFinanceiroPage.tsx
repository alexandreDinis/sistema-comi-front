import React, { useState } from 'react';
import { RelatorioConsolidado } from '../components/reports/RelatorioConsolidado';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export const RelatorioFinanceiroPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const today = new Date();

    // Initialize from URL params if present
    const initialAno = searchParams.get('ano') ? parseInt(searchParams.get('ano')!) : today.getFullYear();
    const initialMes = searchParams.get('mes') ? parseInt(searchParams.get('mes')!) : today.getMonth() + 1;

    const [mes, setMes] = useState(initialMes);
    const [ano, setAno] = useState(initialAno);

    const handlePreviousMonth = () => {
        if (mes === 1) {
            setMes(12);
            setAno((prev: number) => prev - 1);
        } else {
            setMes((prev: number) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (mes === 12) {
            setMes(1);
            setAno((prev: number) => prev + 1);
        } else {
            setMes((prev: number) => prev + 1);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-12">
                <nav className="flex items-center gap-3 text-[9px] font-black text-cyber-gold/30 mb-8 uppercase tracking-[0.4em]">
                    <Link to="/relatorio" className="hover:text-cyber-gold transition-colors flex items-center gap-1.5 border border-cyber-gold/10 px-2 py-1 bg-black/40">
                        <Home className="w-2.5 h-2.5" />
                        RELATÓRIOS
                    </Link>
                    <ChevronRight className="w-2.5 h-2.5 opacity-20" />
                    <span className="text-cyber-gold/60">CONSOLIDAÇÃO_LOG_AUDITORIA</span>
                </nav>

                <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative">
                    <div className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-px bg-cyber-gold/20"></div>
                        <h1 className="text-5xl font-black text-cyber-gold tracking-tighter italic italic-shadow uppercase glitch">
                            Auditoria Financeira
                        </h1>
                        <p className="text-cyber-gold/40 text-[10px] font-mono tracking-[0.2em] mt-3 uppercase">
                            FLUXO_CONSOLIDAÇÃO_SISTEMA // VERIFICANDO_SYMLINKS_COMISSÃO_E_IMPOSTO
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-black/40 border border-cyber-gold/20 p-1 relative">
                        <button
                            onClick={() => import('../services/osService').then(m => m.osService.downloadRelatorioPdf(ano, mes))}
                            className="px-4 h-12 flex items-center justify-center hover:bg-cyber-gold hover:text-black transition-all font-bold text-xs tracking-wider border-r border-cyber-gold/10 font-oxanium text-cyber-gold"
                            title="Exportar Relatório em PDF"
                        >
                            <span className="mr-2">PDF</span>
                            EXPORT
                        </button>
                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyber-gold/40"></div>
                        <button
                            onClick={handlePreviousMonth}
                            className="w-12 h-12 flex items-center justify-center hover:bg-cyber-gold hover:text-black transition-all font-black text-xl italic"
                        >
                            {'<'}
                        </button>
                        <div className="px-8 flex flex-col items-center">
                            <span className="text-[8px] font-mono text-cyber-gold/40 tracking-[0.3em]">PERÍODO_AUDITORIA</span>
                            <span className="text-lg font-black italic tracking-widest text-cyber-gold">
                                {mes.toString().padStart(2, '0')}.{ano}
                            </span>
                        </div>
                        <button
                            onClick={handleNextMonth}
                            className="w-12 h-12 flex items-center justify-center hover:bg-cyber-gold hover:text-black transition-all font-black text-xl italic"
                        >
                            {'>'}
                        </button>
                    </div>
                </div>
            </div>

            <RelatorioConsolidado ano={ano} mes={mes} />
        </div>
    );
};
