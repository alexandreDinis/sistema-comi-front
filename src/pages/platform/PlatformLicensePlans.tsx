import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { licencaService } from '../../services/licencaService';
import type { PlanoLicenca, PlanoLicencaCreateRequest } from '../../services/licencaService';
import { Plus, Edit2, Trash2, Users, DollarSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const PlatformLicensePlans: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanoLicenca | null>(null);

    const { data: plans, isLoading } = useQuery({
        queryKey: ['planos-licenca'],
        queryFn: licencaService.listPlanosLicenca
    });

    const createMutation = useMutation({
        mutationFn: licencaService.createPlanoLicenca,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planos-licenca'] });
            setIsModalOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<PlanoLicencaCreateRequest> }) =>
            licencaService.updatePlanoLicenca(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['planos-licenca'] });
            setIsModalOpen(false);
            setEditingPlan(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: licencaService.deletePlanoLicenca,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['planos-licenca'] })
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: PlanoLicencaCreateRequest = {
            nome: formData.get('nome') as string,
            descricao: formData.get('descricao') as string,
            valorMensalidade: parseFloat(formData.get('valorMensalidade') as string),
            valorPorTenant: parseFloat(formData.get('valorPorTenant') as string),
            limiteTenants: formData.get('limiteTenants') ? parseInt(formData.get('limiteTenants') as string) : undefined,
            limiteUsuariosPorTenant: formData.get('limiteUsuariosPorTenant') ? parseInt(formData.get('limiteUsuariosPorTenant') as string) : undefined,
            suportePrioritario: formData.get('suportePrioritario') === 'on',
            whiteLabel: formData.get('whiteLabel') === 'on',
            dominioCustomizado: formData.get('dominioCustomizado') === 'on'
        };

        if (editingPlan) {
            updateMutation.mutate({ id: editingPlan.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const openEditModal = (plan: PlanoLicenca) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">Planos de Licença</h1>
                    <p className="text-slate-400 text-sm">Gerencie os planos disponíveis para revendedores.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} /> Novo Plano
                </button>
            </div>

            {isLoading ? (
                <div className="text-center text-slate-500 py-10">Carregando planos...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans?.map(plan => (
                        <div key={plan.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col hover:border-purple-500/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-slate-100">{plan.nome}</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(plan)} className="text-slate-400 hover:text-blue-400 transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => deleteMutation.mutate(plan.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-slate-400 text-sm mb-4 flex-1">{plan.descricao || 'Sem descrição'}</p>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <DollarSign size={14} className="text-green-400" />
                                    <span>R$ {plan.valorMensalidade?.toFixed(2)} /mês</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Users size={14} className="text-blue-400" />
                                    <span>{plan.limiteTenants ?? '∞'} tenants máx.</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300">
                                    {plan.whiteLabel ? <CheckCircle size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}
                                    <span>White Label</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-slate-100 mb-4">
                            {editingPlan ? 'Editar Plano' : 'Novo Plano'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Nome</label>
                                <input
                                    name="nome"
                                    defaultValue={editingPlan?.nome}
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                                <textarea
                                    name="descricao"
                                    defaultValue={editingPlan?.descricao}
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Mensalidade (R$)</label>
                                    <input
                                        name="valorMensalidade"
                                        type="number"
                                        step="0.01"
                                        defaultValue={editingPlan?.valorMensalidade}
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Por Tenant (R$)</label>
                                    <input
                                        name="valorPorTenant"
                                        type="number"
                                        step="0.01"
                                        defaultValue={editingPlan?.valorPorTenant}
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Limite Tenants</label>
                                    <input
                                        name="limiteTenants"
                                        type="number"
                                        defaultValue={editingPlan?.limiteTenants}
                                        placeholder="Vazio = ilimitado"
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Limite Usuários/Tenant</label>
                                    <input
                                        name="limiteUsuariosPorTenant"
                                        type="number"
                                        defaultValue={editingPlan?.limiteUsuariosPorTenant}
                                        placeholder="Vazio = ilimitado"
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 text-slate-300">
                                    <input type="checkbox" name="whiteLabel" defaultChecked={editingPlan?.whiteLabel ?? true} />
                                    White Label
                                </label>
                                <label className="flex items-center gap-2 text-slate-300">
                                    <input type="checkbox" name="suportePrioritario" defaultChecked={editingPlan?.suportePrioritario} />
                                    Suporte Prioritário
                                </label>
                                <label className="flex items-center gap-2 text-slate-300">
                                    <input type="checkbox" name="dominioCustomizado" defaultChecked={editingPlan?.dominioCustomizado} />
                                    Domínio Custom
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); setEditingPlan(null); }}
                                    className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
                                    {editingPlan ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
