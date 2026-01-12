import React from 'react';
import type { ComissaoCalculada } from '../../types';
import { formatarMoeda, formatarPorcentagem } from '../../utils/formatters';
import { TrendingUp, Percent, Landmark, ReceiptText, ArrowUpRight } from 'lucide-react';

interface ComissaoCardProps {
    comissao: ComissaoCalculada;
}

export const ComissaoCard: React.FC<ComissaoCardProps> = ({ comissao }) => {
    const isPositivo = comissao.saldoAReceber >= 0;

    return (
        <div className="space-y-8 view-transition p-1">
            <div className="hud-card group top-brackets bottom-brackets">
                <div className="static-overlay opacity-5"></div>

                <div className="px-8 py-4 bg-cyber-gold/5 border-b border-cyber-gold/20 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-cyber-gold animate-pulse"></div>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="hud-tag">FEED_ESTÁVEL</span>
                            <span className="text-[10px] font-mono text-cyber-gold/40">ID_NÓ: 0x{comissao.anoMesReferencia}</span>
                        </div>
                        <h3 className="text-3xl font-black text-cyber-gold tracking-tighter italic mt-1">
                            CRYSTAL_{comissao.anoMesReferencia}
                        </h3>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right flex flex-col items-end">
                            <span className="hud-label">NÍVEL_CÁLCULO</span>
                            <p className="text-2xl font-black text-cyber-gold italic drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">{comissao.faixaComissao}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            { label: 'FATUR_GERAL', value: formatarMoeda(comissao.faturamentoMensal), icon: TrendingUp },
                            { label: 'TAXA_RENDIM', value: formatarPorcentagem(comissao.porcentagemComissao), icon: Percent },
                            { label: 'ALOC_BRUTA', value: formatarMoeda(comissao.valorBrutoComissao), icon: ReceiptText },
                            { label: 'SAQUE_PRÉVIO', value: formatarMoeda(comissao.valorAdiantado), icon: Landmark },
                        ].map((stat, idx) => (
                            <div key={idx} className="p-6 bg-black/60 border border-cyber-gold/10 hover:border-cyber-gold/40 transition-all relative overflow-hidden group/item">
                                <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyber-gold"></div>
                                <stat.icon className="w-4 h-4 text-cyber-gold/20 mb-4 group-hover/item:text-cyber-gold transition-colors" />
                                <span className="hud-label text-[7px]">{stat.label}</span>
                                <p className="text-xl font-black text-cyber-gold/80 italic tracking-tighter tabular-nums mt-1">
                                    {stat.value}
                                </p>
                                <div className="absolute bottom-0 right-0 w-8 h-8 opacity-[0.03] text-[6px] font-mono text-cyber-gold">
                                    [FLUXO_DADOS_{idx}]
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={`p-10 border ${isPositivo ? 'border-cyber-gold shadow-[inset_0_0_30px_rgba(212,175,55,0.1)]' : 'border-cyber-error shadow-[inset_0_0_30px_rgba(255,45,85,0.1)]'
                        } flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden bg-black/80`}>

                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-px bg-white/5"></div>
                            <div className="absolute bottom-0 left-0 w-full h-px bg-white/5"></div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${isPositivo ? 'bg-cyber-gold animate-pulse' : 'bg-cyber-error animate-ping'}`}></div>
                                <span className={`hud-label mb-0 ${isPositivo ? 'text-cyber-gold/60' : 'text-cyber-error/60'}`}>LIQUIDAÇÃO_LÍQUIDA_A_PAGAR</span>
                            </div>
                            <p className={`text-7xl font-black tracking-tighter italic ${isPositivo ? 'text-cyber-gold italic-shadow' : 'text-cyber-error'}`}>
                                {formatarMoeda(comissao.saldoAReceber)}
                            </p>
                        </div>

                        <div className={`p-6 border-2 ${isPositivo ? 'border-cyber-gold/40 text-cyber-gold' : 'border-cyber-error/40 text-cyber-error'} bg-black/40 relative z-10 overflow-hidden`}>
                            <ArrowUpRight className={`w-12 h-12 ${!isPositivo && 'rotate-90'}`} />
                            <div className="absolute -bottom-1 -right-1 text-[6px] font-mono opacity-40">MOVE_0x1</div>
                        </div>

                        <div className="absolute -bottom-6 -right-6 text-9xl font-black opacity-[0.02] select-none pointer-events-none italic">
                            OROBOROS
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
