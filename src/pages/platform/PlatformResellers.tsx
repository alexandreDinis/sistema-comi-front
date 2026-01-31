import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { licencaService } from '../../services/licencaService';
import type { Licenca, LicencaCreateRequest, PlanoLicenca } from '../../services/licencaService';
import { Plus, Building2, Mail, Phone, AlertTriangle, CheckCircle, Ban, Loader2, Edit2 } from 'lucide-react';

export const PlatformResellers: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLicenca, setEditingLicenca] = useState<Licenca | null>(null);

    const { data: licencasResponse, isLoading } = useQuery({
        queryKey: ['licencas'],
        queryFn: () => licencaService.listLicencas()
    });

    const { data: plans } = useQuery({
        queryKey: ['planos-licenca'],
        queryFn: licencaService.listPlanosLicenca
    });

    const createMutation = useMutation({
        mutationFn: licencaService.createLicenca,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licencas'] });
            setIsModalOpen(false);
            setEditingLicenca(null);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<LicencaCreateRequest> }) => licencaService.updateLicenca(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licencas'] });
            setIsModalOpen(false);
            setEditingLicenca(null);
        }
    });

    const suspendMutation = useMutation({
        mutationFn: ({ id, motivo }: { id: number; motivo: string }) => licencaService.suspendLicenca(id, motivo),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['licencas'] })
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: any = {
            razaoSocial: formData.get('razaoSocial') as string,
            nomeFantasia: formData.get('nomeFantasia') as string,
            cnpj: formData.get('cnpj') as string,
            email: formData.get('email') as string,
            telefone: formData.get('telefone') as string,
        };

        if (editingLicenca) {
            updateMutation.mutate({ id: editingLicenca.id, data });
        } else {
            data.planoId = parseInt(formData.get('planoId') as string);
            data.senhaAdmin = formData.get('senhaAdmin') as string;
            createMutation.mutate(data);
        }
    };

    const handleSuspend = (licenca: Licenca) => {
        const motivo = prompt('Motivo da suspensão:');
        if (motivo) {
            suspendMutation.mutate({ id: licenca.id, motivo });
        }
    };

    const handleEdit = (licenca: Licenca) => {
        setEditingLicenca(licenca);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingLicenca(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ATIVA':
                return <span className="flex items-center gap-1 text-green-400 text-xs font-medium"><CheckCircle size={12} /> Ativa</span>;
            case 'SUSPENSA':
                return <span className="flex items-center gap-1 text-red-400 text-xs font-medium"><Ban size={12} /> Suspensa</span>;
            default:
                return <span className="flex items-center gap-1 text-slate-400 text-xs font-medium"><AlertTriangle size={12} /> {status}</span>;
        }
    };

    const licencas = licencasResponse?.content || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">Revendedores</h1>
                    <p className="text-slate-400 text-sm">Gerencie os parceiros White Label.</p>
                </div>
                <button
                    onClick={() => { setEditingLicenca(null); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus size={18} /> Novo Revendedor
                </button>
            </div>

            {isLoading ? (
                <div className="text-center text-slate-500 py-10">Carregando revendedores...</div>
            ) : licencas.length === 0 ? (
                <div className="text-center text-slate-500 py-10 bg-slate-800 rounded-lg border border-slate-700">
                    <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhum revendedor cadastrado ainda.</p>
                </div>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs">
                            <tr>
                                <th className="text-left p-4">Empresa</th>
                                <th className="text-left p-4">Contato</th>
                                <th className="text-left p-4">Plano</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {licencas.map((licenca: Licenca) => (
                                <tr key={licenca.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-slate-100">{licenca.nomeFantasia || licenca.razaoSocial}</div>
                                        <div className="text-slate-400 text-xs">{licenca.cnpj}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-slate-300"><Mail size={12} /> {licenca.email}</div>
                                        {licenca.telefone && <div className="flex items-center gap-1 text-slate-400 text-xs mt-1"><Phone size={12} /> {licenca.telefone}</div>}
                                    </td>
                                    <td className="p-4 text-slate-300">{licenca.planoTipo}</td>
                                    <td className="p-4">{getStatusBadge(licenca.status)}</td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => handleEdit(licenca)} className="text-blue-400 hover:text-blue-300 p-1" title="Editar">
                                            <Edit2 size={16} />
                                        </button>
                                        {licenca.status === 'ATIVA' && (
                                            <button
                                                onClick={() => handleSuspend(licenca)}
                                                className="text-red-400 hover:text-red-300 p-1"
                                                title="Suspender"
                                            >
                                                <Ban size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-slate-100 mb-4">{editingLicenca ? 'Editar Revendedor' : 'Novo Revendedor'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Razão Social *</label>
                                <input name="razaoSocial" defaultValue={editingLicenca?.razaoSocial} required className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100" />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Nome Fantasia</label>
                                <input name="nomeFantasia" defaultValue={editingLicenca?.nomeFantasia} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">CNPJ *</label>
                                    <input name="cnpj" defaultValue={editingLicenca?.cnpj} required className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Telefone</label>
                                    <input name="telefone" defaultValue={editingLicenca?.telefone} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">E-mail *</label>
                                <input name="email" type="email" defaultValue={editingLicenca?.email} required className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100" />
                            </div>
                            {!editingLicenca && (
                                <>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Plano *</label>
                                        <select name="planoId" required className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100">
                                            <option value="">Selecione um plano</option>
                                            {plans?.map((plan: PlanoLicenca) => (
                                                <option key={plan.id} value={plan.id}>{plan.nome} - R$ {plan.valorMensalidade?.toFixed(2)}/mês</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Senha de Acesso *</label>
                                        <input name="senhaAdmin" type="password" required minLength={6} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100" placeholder="Mínimo 6 caracteres" />
                                        <p className="text-xs text-slate-500 mt-1">Senha para o revendedor acessar o painel. Será solicitado trocar no primeiro login.</p>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={16} className="animate-spin" />}
                                    {editingLicenca ? 'Salvar Alterações' : 'Criar Revendedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
