import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Users, Plus, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { osService } from '../../services/osService';

export const OperationalDashboard: React.FC = () => {
    // Fetch stats via React Query
    // Assuming listOS gives us all, we can filter client-side for now or mock if large
    const { data: osList, isLoading } = useQuery({
        queryKey: ['os-list'],
        queryFn: osService.listOS
    });

    const activeOSCount = osList?.filter(os => os.status === 'ABERTA' || os.status === 'EM_EXECUCAO').length || 0;
    const completedMonthCount = osList?.filter(os => os.status === 'FINALIZADA' && new Date(os.data).getMonth() === new Date().getMonth()).length || 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Quick Actions Card */}
            <div className="md:col-span-1 hud-card p-6 flex flex-col justify-between group">
                <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Activity size={20} className="text-cyber-gold" />
                </div>
                <div>
                    <h3 className="text-lg font-black italic text-cyber-gold mb-1">AÇÕES RÁPIDAS</h3>
                    <p className="text-[10px] text-cyber-gold/60 font-mono mb-4 uppercase">Iniciar Fluxo Operacional</p>

                    <div className="space-y-3">
                        <Link to="/os" className="w-full text-left hud-button py-3 px-4 text-xs flex items-center gap-2">
                            <Plus size={14} /> NOVA ORDEM DE SERVIÇO
                        </Link>
                        <Link to="/clientes" className="w-full text-left hud-button py-3 px-4 text-xs flex items-center gap-2 border-cyber-gold/30 text-cyber-gold/70 hover:text-cyber-gold">
                            <Users size={14} /> CADASTRAR CLIENTE
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Card - Active OS */}
            <div className="md:col-span-1 hud-card p-6 relative overflow-hidden group">
                <div className="static-overlay opacity-5"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-black italic text-cyber-gold">EM EXECUÇÃO</h3>
                            <p className="text-[10px] text-cyber-gold/60 font-mono uppercase">Ordens de Serviço Ativas</p>
                        </div>
                        <Wrench className="text-cyber-gold animate-pulse" size={24} />
                    </div>

                    <div className="mt-4">
                        <span className="text-6xl font-black text-white italic tracking-tighter drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                            {isLoading ? '-' : activeOSCount}
                        </span>
                        <div className="w-full bg-cyber-gold/10 h-1 mt-2 mb-1">
                            <div className="bg-cyber-gold h-full" style={{ width: `${Math.min(activeOSCount * 10, 100)}%` }}></div>
                        </div>
                        <span className="text-[9px] font-mono text-cyber-gold/50">CAPACIDADE: INDEFINIDA</span>
                    </div>
                </div>
            </div>

            {/* Stats Card - Monthly Completed */}
            <div className="md:col-span-1 hud-card p-6 relative overflow-hidden">
                <div className="static-overlay opacity-5"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-black italic text-cyber-gold">FINALIZADAS</h3>
                            <p className="text-[10px] text-cyber-gold/60 font-mono uppercase">Este Mês</p>
                        </div>
                        <div className="text-cyber-gold/40 font-mono text-xs border border-cyber-gold/40 px-1">
                            {new Date().toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                        </div>
                    </div>

                    <div className="mt-4 text-right">
                        <span className="text-6xl font-black text-white italic tracking-tighter opacity-80">
                            {isLoading ? '-' : completedMonthCount}
                        </span>
                        <p className="text-[10px] text-cyber-gold/40 font-mono mt-1">
                            TAXA DE CONVERSÃO: N/A
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
