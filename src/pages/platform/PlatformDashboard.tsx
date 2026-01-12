import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { platformService } from '../../services/platformService';
import { Users, DollarSign, Activity, ChevronRight } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Link } from 'react-router-dom';

export const PlatformDashboard: React.FC = () => {
    const { data: tenants, isLoading: isLoadingTenants } = useQuery({
        queryKey: ['platform-tenants'],
        queryFn: platformService.listTenants
    });

    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['platform-stats'],
        queryFn: platformService.getStats
    });

    // Fallbacks or calculations
    const activeCount = stats?.activeTenants || tenants?.filter(c => c.ativo).length || 0;
    const mrrValue = stats?.mrr || 0;
    const newInLast30Days = tenants?.filter(c => {
        if (!c.dataCriacao) return false;
        const d = new Date(c.dataCriacao);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        return diff < 30 * 24 * 60 * 60 * 1000;
    }).length || 0;

    const isLoading = isLoadingTenants || isLoadingStats;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-black text-slate-200 tracking-tight uppercase">Torre de Controle <span className="text-blue-500">SaaS</span></h1>

            {isLoading ? (
                <div className="text-slate-400 animate-pulse">Carregando dados...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card title="Empresas Ativas" value={activeCount.toString()} icon={<Users className="text-blue-400" />} />
                        <Card title="MRR (Receita)" value={mrrValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={<DollarSign className="text-green-400" />} />
                        <Card title="Novos Cadastros (30d)" value={`+${newInLast30Days}`} icon={<Activity className="text-purple-400" />} />
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-300">Últimas Empresas</h2>
                            <Link to="/platform/tenants" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1 font-medium">Ver Todas <ChevronRight size={14} /></Link>
                        </div>

                        <div className="space-y-2">
                            {tenants?.slice(0, 5).map(c => (
                                <div key={c.id} className="flex justify-between items-center p-3 bg-slate-800 rounded border border-slate-700/50 hover:bg-slate-700 transition-colors">
                                    <div>
                                        <div className="font-bold text-slate-200">{c.nome}</div>
                                        <div className="text-xs text-slate-500">{c.cnpj}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-mono text-slate-400">{c.dataCriacao ? new Date(c.dataCriacao).toLocaleDateString('pt-BR') : 'N/A'}</span>
                                        <span className={`w-2 h-2 rounded-full ${c.ativo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    </div>
                                </div>
                            ))}
                            {!tenants?.length && <div className="text-slate-500 text-sm italic">Nenhuma empresa cadastrada.</div>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
