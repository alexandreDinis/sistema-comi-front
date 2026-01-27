import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformService } from '../../services/platformService';
import type { LicencaSummary } from '../../services/platformService';
import { Building2, Users, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Ban, XCircle, Eye, Loader2 } from 'lucide-react';

export const PlatformOwnerDashboard: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedLicenca, setSelectedLicenca] = useState<number | null>(null);

    const { data: licencas, isLoading: loadingLicencas } = useQuery({
        queryKey: ['owner-licencas'],
        queryFn: platformService.listLicencas
    });

    const { data: stats, isLoading: loadingStats } = useQuery({
        queryKey: ['licenca-stats', selectedLicenca],
        queryFn: () => platformService.getLicencaStats(selectedLicenca!),
        enabled: !!selectedLicenca
    });

    const { data: orphans } = useQuery({
        queryKey: ['orphan-tenants'],
        queryFn: platformService.listOrphanTenants
    });

    const rescindirMutation = useMutation({
        mutationFn: platformService.rescindirLicenca,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['owner-licencas'] });
            queryClient.invalidateQueries({ queryKey: ['orphan-tenants'] });
            setSelectedLicenca(null);
            alert('Licença rescindida com sucesso. Tenants migrados para gestão direta.');
        }
    });

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ATIVA':
                return <span className="flex items-center gap-1 text-green-400 text-xs font-medium"><CheckCircle size={12} /> Ativa</span>;
            case 'SUSPENSA':
                return <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium"><Ban size={12} /> Suspensa</span>;
            case 'CANCELADA':
                return <span className="flex items-center gap-1 text-red-400 text-xs font-medium"><XCircle size={12} /> Cancelada</span>;
            default:
                return <span className="text-slate-400 text-xs">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">Owner Dashboard</h1>
                <p className="text-slate-400 text-sm">Visão consolidada de todos os revendedores e suas métricas.</p>
            </div>

            {/* Orphan Tenants Alert */}
            {orphans && orphans.length > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="text-yellow-400 shrink-0" size={20} />
                    <div>
                        <h3 className="font-semibold text-yellow-300">Atenção: {orphans.length} Tenant(s) Órfão(s)</h3>
                        <p className="text-yellow-200/80 text-sm">Estes tenants não estão vinculados a nenhum revendedor e estão sob sua gestão direta.</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {orphans.slice(0, 5).map(t => (
                                <span key={t.id} className="bg-yellow-900/50 text-yellow-200 px-2 py-1 rounded text-xs">{t.nome}</span>
                            ))}
                            {orphans.length > 5 && <span className="text-yellow-400 text-xs">+{orphans.length - 5} mais</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* Resellers Table */}
            {loadingLicencas ? (
                <div className="text-center text-slate-500 py-10">Carregando revendedores...</div>
            ) : !licencas?.length ? (
                <div className="text-center text-slate-500 py-10 bg-slate-800 rounded-lg border border-slate-700">
                    <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhum revendedor cadastrado.</p>
                </div>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="text-left p-4">Revendedor</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Plano</th>
                                <th className="text-right p-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {licencas.map((licenca: LicencaSummary) => (
                                <tr key={licenca.id} className={`hover:bg-slate-700/30 transition-colors ${selectedLicenca === licenca.id ? 'bg-purple-900/20' : ''}`}>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-100">{licenca.nomeFantasia || licenca.razaoSocial}</div>
                                        <div className="text-slate-400 text-xs">{licenca.email}</div>
                                    </td>
                                    <td className="p-4">{getStatusBadge(licenca.status)}</td>
                                    <td className="p-4 text-slate-300">{licenca.planoTipo || '-'}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => setSelectedLicenca(licenca.id)}
                                            className="text-purple-400 hover:text-purple-300 font-medium text-xs inline-flex items-center gap-1"
                                        >
                                            <Eye size={14} /> Ver Stats
                                        </button>
                                        {licenca.status === 'ATIVA' && (
                                            <button
                                                onClick={() => {
                                                    if (confirm(`ATENÇÃO: Rescindir "${licenca.razaoSocial}"? Todos os tenants serão migrados para sua gestão direta.`)) {
                                                        rescindirMutation.mutate(licenca.id);
                                                    }
                                                }}
                                                disabled={rescindirMutation.isPending}
                                                className="text-red-400 hover:text-red-300 font-medium text-xs inline-flex items-center gap-1"
                                            >
                                                <XCircle size={14} /> Rescindir
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Stats Panel */}
            {selectedLicenca && (
                <div className="bg-gradient-to-br from-purple-900/30 to-slate-800 border border-purple-700/50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                            <TrendingUp size={20} className="text-purple-400" />
                            Métricas do Revendedor
                        </h2>
                        <button onClick={() => setSelectedLicenca(null)} className="text-slate-400 hover:text-slate-200 text-sm">
                            Fechar
                        </button>
                    </div>

                    {loadingStats ? (
                        <div className="text-center py-6"><Loader2 className="animate-spin mx-auto text-purple-400" /></div>
                    ) : stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={Users} label="Total Tenants" value={stats.totalTenants} />
                            <StatCard icon={CheckCircle} label="Ativos" value={stats.tenantsAtivos} color="green" />
                            <StatCard icon={Ban} label="Bloqueados" value={stats.tenantsBloqueados} color="red" />
                            <StatCard icon={DollarSign} label="Receita Total" value={formatCurrency(stats.receitaTotalTenants)} color="blue" />
                            <StatCard icon={DollarSign} label="Receita Revendedor" value={formatCurrency(stats.receitaRevendedor)} color="yellow" />
                            <StatCard icon={DollarSign} label="Seu Royalty" value={formatCurrency(stats.receitaOwner)} color="purple" />
                            <StatCard icon={TrendingUp} label="Crescimento MoM" value={`${stats.crescimentoMensal}%`} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color?: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
    const colors = {
        green: 'text-green-400',
        red: 'text-red-400',
        blue: 'text-blue-400',
        yellow: 'text-yellow-400',
        purple: 'text-purple-400',
    };
    const textColor = color ? colors[color] : 'text-slate-300';

    return (
        <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={textColor} />
                <span className="text-slate-400 text-xs uppercase">{label}</span>
            </div>
            <div className={`text-xl font-bold ${textColor}`}>{value}</div>
        </div>
    );
};
