import React from 'react';
import { AdiantamentoForm } from '../components/forms/AdiantamentoForm';
import { ChevronRight, Home, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useComissao } from '../hooks/useComissao';
import { formatarMoeda } from '../utils/formatters';

export const AdiantamentoPage: React.FC = () => {
    const now = new Date();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();

    const { comissao, isLoading } = useComissao(ano, mes);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-xl mx-auto mb-10">
                <nav className="flex items-center gap-3 text-[9px] font-black text-cyber-gold/30 mb-8 uppercase tracking-[0.4em]">
                    <Link to="/" className="hover:text-cyber-gold transition-colors flex items-center gap-1.5 border border-cyber-gold/10 px-2 py-1 bg-black/40">
                        <Home className="w-2.5 h-2.5" />
                        RAIZ
                    </Link>
                    <ChevronRight className="w-2.5 h-2.5 opacity-20" />
                    <span className="text-cyber-gold/60">MOD_ALOC_0x09</span>
                </nav>

                <div className="relative mb-12">
                    <div className="absolute -left-4 top-0 bottom-0 w-px bg-cyber-gold/20"></div>
                    <h1 className="text-5xl font-black text-cyber-gold tracking-tighter italic italic-shadow uppercase glitch">
                        Alocação de Créditos
                    </h1>
                    <p className="text-cyber-gold/40 text-[10px] font-mono tracking-[0.2em] mt-3 uppercase max-w-lg">
                        GERENCIAR_VETORES_ADIANTAMENTO // INICIALIZAR_ALOCAÇÕES_DIRETAS_CRÉDITO_PARA_LIQUIDAÇÃO
                    </p>
                </div>

                {/* Resumo do Saldo Atual */}
                <div className="hud-card mb-12 p-6 border-cyber-gold/20 bg-black/40 relative overflow-hidden group">
                    <div className="static-overlay opacity-5"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="w-12 h-12 text-cyber-gold" />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <span className="hud-label text-cyber-gold/60">SALDO_ESTIMADO_A_RECEBER</span>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-xs font-mono text-cyber-gold/40">BRL_</span>
                                {isLoading ? (
                                    <div className="h-10 w-32 bg-cyber-gold/10 animate-pulse rounded"></div>
                                ) : (
                                    <h2 className="text-4xl font-black text-cyber-gold italic italic-shadow tracking-tighter">
                                        {formatarMoeda(comissao?.saldoAReceber || 0)}
                                    </h2>
                                )}
                            </div>
                            <p className="text-[8px] font-mono text-cyber-gold/30 mt-2 uppercase tracking-widest">
                                PERÍODO_REFERÊNCIA: {mes.toString().padStart(2, '0')}/{ano} // NÍVEL_ATUAL: {comissao?.faixaComissao || 'N/A'}
                            </p>
                        </div>

                        <div className="px-4 py-2 border-l border-cyber-gold/10">
                            <span className="hud-label text-[8px] block mb-1">RENDIMENTO_BRUTO</span>
                            <p className="font-mono text-cyber-gold/60 text-xs">
                                {isLoading ? '...' : formatarMoeda(comissao?.valorBrutoComissao || 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <AdiantamentoForm />
        </div>
    );
};
