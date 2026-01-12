import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformService } from '../../services/platformService';
import type { TenantSummary } from '../../services/platformService';
import { Ban, CheckCircle, Search, Plus, Building2, Calendar } from 'lucide-react';
import { TenantOnboarding } from '../../components/platform/TenantOnboarding';

export const PlatformTenants: React.FC = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnboarding, setShowOnboarding] = useState(false);

    const { data: tenants, isLoading } = useQuery({
        queryKey: ['platform-tenants'],
        queryFn: platformService.listTenants
    });

    const toggleBlockMutation = useMutation({
        mutationFn: platformService.toggleBlockTenant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
        }
    });

    const filteredTenants = tenants?.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cnpj.includes(searchTerm)
    );

    const handleToggleBlock = (tenant: TenantSummary) => {
        if (confirm(`Tem certeza que deseja ${!tenant.ativo ? 'DESBLOQUEAR' : 'BLOQUEAR'} o acesso da empresa ${tenant.nome}?`)) {
            toggleBlockMutation.mutate(tenant.id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">Gestão de Inquilinos (Tenants)</h1>
                    <p className="text-slate-400 text-sm">Gerencie as empresas e acessos da plataforma.</p>
                </div>
                <button
                    onClick={() => setShowOnboarding(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> Novo Inquilino
                </button>
            </div>

            {/* Filters */}
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por Nome, CNPJ ou Email..."
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded focus:outline-none focus:border-blue-500 transition-colors"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="text-slate-400 py-10 text-center animate-pulse">Carregando inquilinos...</div>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 border-b border-slate-700">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Empresa / Admin</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Plano</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Criado em</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {filteredTenants?.map(tenant => (
                                <tr key={tenant.id} className={`group hover:bg-slate-700/30 transition-colors ${!tenant.ativo ? 'bg-red-900/10' : ''}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${!tenant.ativo ? 'bg-red-900/20 text-red-400' : 'bg-blue-900/20 text-blue-400'}`}>
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <div className={`font-bold ${!tenant.ativo ? 'text-red-300' : 'text-slate-200'}`}>{tenant.nome}</div>
                                                <div className="text-xs text-slate-500 font-mono">{tenant.cnpj}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getPillStyle(tenant.plano)}`}>
                                            {tenant.plano}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {!tenant.ativo ? (
                                            <div className="flex items-center gap-2 text-red-400 bg-red-950/30 border border-red-900/50 px-2 py-1 rounded w-fit">
                                                <Ban size={14} />
                                                <span className="text-xs font-bold">BLOQUEADO</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-green-400 bg-green-950/30 border border-green-900/50 px-2 py-1 rounded w-fit">
                                                <CheckCircle size={14} />
                                                <span className="text-xs font-bold">ATIVO</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 font-mono text-slate-300 text-sm">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Calendar size={14} /> {tenant.dataCriacao ? new Date(tenant.dataCriacao).toLocaleDateString('pt-BR') : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleBlock(tenant)}
                                                disabled={toggleBlockMutation.isPending}
                                                className={`p-2 rounded transition-colors ${!tenant.ativo
                                                    ? 'text-green-400 hover:bg-green-900/30 hover:text-green-300'
                                                    : 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                                                    }`}
                                                title={!tenant.ativo ? "Desbloquear Acesso" : "Kill Switch (Bloquear Acesso)"}
                                            >
                                                {!tenant.ativo ? <CheckCircle size={18} /> : <Ban size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredTenants?.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            Nenhum inquilino encontrado.
                        </div>
                    )}
                </div>
            )}

            {showOnboarding && <TenantOnboarding onClose={() => setShowOnboarding(false)} />}
        </div>
    );
};

const getPillStyle = (plan: string) => {
    switch (plan?.toUpperCase()) {
        case 'OURO': return 'bg-yellow-900/20 text-yellow-500 border-yellow-700/50';
        case 'PRATA': return 'bg-slate-700/50 text-slate-300 border-slate-600';
        case 'BRONZE': return 'bg-orange-900/20 text-orange-500 border-orange-800/50';
        default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
};
