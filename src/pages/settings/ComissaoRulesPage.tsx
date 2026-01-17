import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calculator, Loader2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { regraComissaoService } from '../../services/regraComissaoService';
import { RegraComissaoCard } from '../../components/settings/RegraComissaoCard';
import { RegraComissaoForm } from '../../components/settings/RegraComissaoForm';
import type { RegraComissao, RegraComissaoRequest } from '../../types';

// Helper to get empresaId from localStorage/token
const getEmpresaId = (): number => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // Try to get from empresa object or default to 1
        return user.empresa?.id || 1;
    } catch {
        return 1;
    }
};

export const ComissaoRulesPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const empresaId = getEmpresaId();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRegra, setEditingRegra] = useState<RegraComissao | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ type: 'ativar' | 'desativar' | 'delete'; regra: RegraComissao } | null>(null);
    const [expandedRegraId, setExpandedRegraId] = useState<number | null>(null);

    // Fetch regras
    const { data: regras, isLoading, isError, refetch } = useQuery({
        queryKey: ['regras-comissao', empresaId],
        queryFn: () => regraComissaoService.getRegras(empresaId)
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: RegraComissaoRequest) => regraComissaoService.createRegra(empresaId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['regras-comissao', empresaId] });
            setIsFormOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: RegraComissaoRequest }) =>
            regraComissaoService.updateRegra(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['regras-comissao', empresaId] });
            setIsFormOpen(false);
            setEditingRegra(null);
        }
    });

    const ativarMutation = useMutation({
        mutationFn: (id: number) => regraComissaoService.ativarRegra(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['regras-comissao', empresaId] });
            setConfirmAction(null);
        }
    });

    const desativarMutation = useMutation({
        mutationFn: (id: number) => regraComissaoService.desativarRegra(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['regras-comissao', empresaId] });
            setConfirmAction(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => regraComissaoService.deleteRegra(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['regras-comissao', empresaId] });
            setConfirmAction(null);
        }
    });

    const handleSave = async (data: RegraComissaoRequest) => {
        if (editingRegra) {
            await updateMutation.mutateAsync({ id: editingRegra.id, data });
        } else {
            await createMutation.mutateAsync(data);
        }
    };

    const handleEdit = (regra: RegraComissao) => {
        setEditingRegra(regra);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingRegra(null);
    };

    // Separate active and inactive rules
    const regraAtiva = regras?.find(r => r.ativa);
    const regrasInativas = regras?.filter(r => !r.ativa) || [];

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-cyber-gold/20 pb-4">
                <div>
                    <h1 className="text-3xl font-black text-cyber-gold tracking-tighter uppercase glitch flex items-center gap-3">
                        <Calculator size={28} />
                        Regras de Comissão
                    </h1>
                    <p className="text-cyber-gold/60 font-mono text-sm mt-2">
                        Configure as faixas de comissão da empresa
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/settings')}
                        className="text-cyber-gold/60 hover:text-cyber-gold px-4 py-2 font-oxanium text-sm uppercase transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={16} /> Voltar
                    </button>
                    <button
                        onClick={() => { setEditingRegra(null); setIsFormOpen(true); }}
                        className="bg-cyber-gold text-black px-4 py-2 rounded-sm font-bold flex items-center gap-2 hover:bg-yellow-400 transition-all font-oxanium uppercase tracking-wider"
                    >
                        <Plus size={16} /> Nova Regra
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-cyber-gold animate-spin" />
                    <span className="ml-3 text-cyber-gold/60 font-mono">Carregando regras...</span>
                </div>
            )}

            {/* Error State */}
            {isError && (
                <div className="bg-red-500/10 border border-red-500/30 p-6 text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                    <p className="text-red-400 mb-4">Erro ao carregar regras de comissão</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw size={14} /> Tentar Novamente
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && (!regras || regras.length === 0) && (
                <div className="bg-black/40 border border-cyber-gold/20 p-10 text-center">
                    <Calculator className="w-12 h-12 text-cyber-gold/30 mx-auto mb-4" />
                    <h3 className="text-cyber-gold font-bold text-lg mb-2">Nenhuma Regra Configurada</h3>
                    <p className="text-cyber-gold/50 text-sm mb-6">
                        Crie sua primeira regra de comissão para começar.
                    </p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="px-6 py-2 bg-cyber-gold text-black font-bold uppercase tracking-wider hover:bg-yellow-400 transition-colors"
                    >
                        Criar Primeira Regra
                    </button>
                </div>
            )}

            {/* Active Rule */}
            {regraAtiva && (
                <div className="space-y-3">
                    <h2 className="text-xs font-bold text-green-400/70 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Regra Ativa
                    </h2>
                    <RegraComissaoCard
                        regra={regraAtiva}
                        onEdit={handleEdit}
                        onAtivar={() => { }}
                        onDesativar={() => setConfirmAction({ type: 'desativar', regra: regraAtiva })}
                        onDelete={() => { }}
                    />
                </div>
            )}

            {/* Inactive Rules */}
            {regrasInativas.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xs font-bold text-cyber-gold/50 uppercase tracking-widest">
                        Outras Regras ({regrasInativas.length})
                    </h2>
                    <div className="space-y-3">
                        {regrasInativas.map(regra => (
                            <RegraComissaoCard
                                key={regra.id}
                                regra={regra}
                                onEdit={handleEdit}
                                onAtivar={() => setConfirmAction({ type: 'ativar', regra })}
                                onDesativar={() => { }}
                                onDelete={() => setConfirmAction({ type: 'delete', regra })}
                                isExpanded={expandedRegraId === regra.id}
                                onToggleExpand={() => setExpandedRegraId(prev => prev === regra.id ? null : regra.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {isFormOpen && (
                <RegraComissaoForm
                    regra={editingRegra}
                    onSave={handleSave}
                    onClose={handleCloseForm}
                    isSaving={createMutation.isPending || updateMutation.isPending}
                />
            )}

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-black border border-cyber-gold/40 p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-cyber-gold mb-4">
                            {confirmAction.type === 'ativar' && '⚡ Ativar Regra'}
                            {confirmAction.type === 'desativar' && '⏸️ Desativar Regra'}
                            {confirmAction.type === 'delete' && '🗑️ Excluir Regra'}
                        </h3>
                        <p className="text-cyber-gold/70 mb-6">
                            {confirmAction.type === 'ativar' && (
                                <>
                                    Tem certeza que deseja ativar "<strong>{confirmAction.regra.nome}</strong>"?
                                    <br /><br />
                                    <span className="text-yellow-500">⚠️ Isso irá desativar a regra atual e aplicar esta regra para todas as comissões calculadas.</span>
                                </>
                            )}
                            {confirmAction.type === 'desativar' && (
                                <>
                                    Tem certeza que deseja desativar a regra "<strong>{confirmAction.regra.nome}</strong>"?
                                    <br /><br />
                                    <span className="text-yellow-500">⚠️ A empresa ficará sem regra de comissão ativa.</span>
                                </>
                            )}
                            {confirmAction.type === 'delete' && (
                                <>
                                    Tem certeza que deseja excluir permanentemente a regra "<strong>{confirmAction.regra.nome}</strong>"?
                                    <br /><br />
                                    <span className="text-red-400">⚠️ Esta ação não pode ser desfeita.</span>
                                </>
                            )}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="px-4 py-2 text-cyber-gold/60 hover:text-cyber-gold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmAction.type === 'ativar') {
                                        ativarMutation.mutate(confirmAction.regra.id);
                                    } else if (confirmAction.type === 'desativar') {
                                        desativarMutation.mutate(confirmAction.regra.id);
                                    } else if (confirmAction.type === 'delete') {
                                        deleteMutation.mutate(confirmAction.regra.id);
                                    }
                                }}
                                disabled={ativarMutation.isPending || desativarMutation.isPending || deleteMutation.isPending}
                                className={`px-4 py-2 font-bold uppercase tracking-wider disabled:opacity-50 ${confirmAction.type === 'delete'
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : confirmAction.type === 'ativar'
                                        ? 'bg-green-500 text-black hover:bg-green-400'
                                        : 'bg-orange-500 text-black hover:bg-orange-400'
                                    }`}
                            >
                                {(ativarMutation.isPending || desativarMutation.isPending || deleteMutation.isPending)
                                    ? 'Processando...'
                                    : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
