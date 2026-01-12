import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, AlertTriangle } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';

export const SubscriptionSettings: React.FC = () => {
    const navigate = useNavigate();
    const { user } = usePermission();
    const plano = user?.empresa?.plano || 'BRONZE';

    const getPlanDetails = (plan: string) => {
        switch (plan) {
            case 'OURO': return { limit: 'Ilimitado', color: 'text-yellow-400', border: 'border-yellow-500' };
            case 'PRATA': return { limit: '5 Usuários', color: 'text-gray-300', border: 'border-gray-400' };
            default: return { limit: '2 Usuários', color: 'text-orange-400', border: 'border-orange-500' };
        }
    };

    const details = getPlanDetails(plano);

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center border-b border-cyber-gold/20 pb-4">
                <div>
                    <h1 className="text-3xl font-black text-cyber-gold tracking-tighter uppercase glitch">Minha Assinatura</h1>
                    <p className="text-cyber-gold/60 font-mono text-sm mt-2">Detalhes do seu plano atual.</p>
                </div>
                <button onClick={() => navigate('/settings')} className="text-cyber-gold/60 hover:text-cyber-gold px-4 py-2 font-oxanium text-sm uppercase transition-colors">
                    Voltar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Card do Plano */}
                <div className="bg-linear-to-br from-black to-slate-900 border border-cyber-gold/40 p-1 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-cyber-gold/5 animate-pulse pointer-events-none"></div>
                    <div className="bg-black/90 p-8 relative h-full flex flex-col items-center justify-center text-center space-y-4">
                        <div className={`p-4 rounded-full border-2 ${details.border} bg-white/5`}>
                            <Shield className={`w-12 h-12 ${details.color}`} />
                        </div>
                        <div>
                            <div className="text-cyber-gold/50 text-xs font-mono uppercase tracking-widest mb-2">PLANO ATUAL</div>
                            <div className={`text-4xl font-black ${details.color} tracking-tight uppercase`}>{plano}</div>
                        </div>
                        <div className="py-4 w-full border-t border-cyber-gold/10 mt-4">
                            <div className="flex justify-between items-center text-sm font-mono text-gray-400 mb-2">
                                <span>Status</span>
                                <span className="text-green-400 font-bold flex items-center gap-1"><Check size={12} /> ATIVO</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-mono text-gray-400">
                                <span>Renovação</span>
                                <span className="text-white">Todo dia 10</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card de Uso */}
                <div className="space-y-6">
                    <div className="bg-black/60 border border-cyber-gold/20 p-6">
                        <h3 className="text-lg font-bold text-cyber-gold uppercase mb-4 flex items-center gap-2">
                            <AlertTriangle size={18} /> Limites de Uso
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-cyber-gold/60 mb-1 font-mono">
                                    <span>USUÁRIOS</span>
                                    <span>3 / {details.limit}</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyber-gold w-[60%]"></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs text-cyber-gold/60 mb-1 font-mono">
                                    <span>ORDENS DE SERVIÇO (MÊS)</span>
                                    <span>42 / 100</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[42%]"></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs text-cyber-gold/60 mb-1 font-mono">
                                    <span>ARMAZENAMENTO (Anexos)</span>
                                    <span>150MB / 1GB</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[15%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-cyber-gold/5 border border-cyber-gold/20 p-6 text-center">
                        <p className="text-cyber-gold mb-4 text-sm">Precisa de mais recursos?</p>
                        <button className="w-full bg-cyber-gold text-black font-bold py-3 uppercase tracking-wider hover:bg-white transition-colors">
                            Fazer Upgrade
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
