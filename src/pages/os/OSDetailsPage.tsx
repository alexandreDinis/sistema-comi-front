import React, { useState } from 'react';
import { formatarData } from '../../utils/formatters';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { osService } from '../../services/osService';
import { ArrowLeft, Car, Wrench, CheckCircle, Plus, Ban, History } from 'lucide-react';
import { VehicleHistoryModal } from '../../components/modals/VehicleHistoryModal';
import { DuplicatePlateModal } from '../../components/modals/DuplicatePlateModal';
import { ActionModal } from '../../components/modals/ActionModal';
import { limparPlaca, validarPlaca } from '../../utils/validators';
import { PlateInput } from '../../components/forms/PlateInput';
import type { ActionModalType } from '../../components/modals/ActionModal';
import type { OSStatus, VeiculoExistente } from '../../types';


export const OSDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const osId = parseInt(id || '0');

    // State for modals
    const [isVeiculoModalOpen, setVeiculoModalOpen] = useState(false);
    const [isPecaModalOpen, setPecaModalOpen] = useState<{ isOpen: boolean, veiculoId: number | null }>({ isOpen: false, veiculoId: null });
    const [historyModal, setHistoryModal] = useState<{ isOpen: boolean, placa: string, modelo: string }>({ isOpen: false, placa: '', modelo: '' });
    const [duplicateModal, setDuplicateModal] = useState<{ isOpen: boolean, data?: VeiculoExistente }>({ isOpen: false });
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: ActionModalType;
        confirmText?: string;
        cancelText?: string;
        onConfirm?: () => void;
        showCancel?: boolean;
    }>({ isOpen: false, title: '', message: '', type: 'info' });

    // Forms State
    const [veiculoForm, setVeiculoForm] = useState({ placa: '', modelo: '', cor: '' });
    const [pecaForm, setPecaForm] = useState({ tipoPecaId: '', valorCobrado: '' });

    const { data: os, isLoading } = useQuery({
        queryKey: ['ordem-servico', osId],
        queryFn: () => osService.getOSById(osId),
        enabled: !!osId
    });

    const { data: catalogo } = useQuery({
        queryKey: ['catalogo'],
        queryFn: osService.listTiposPeca
    });

    // Mutations
    const addVeiculoMutation = useMutation({
        mutationFn: osService.addVeiculo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ordem-servico', osId] });
            setVeiculoModalOpen(false);
            setVeiculoForm({ placa: '', modelo: '', cor: '' });
            setActionModal({
                isOpen: true,
                type: 'success',
                title: 'Veículo Adicionado',
                message: 'Veículo cadastrado com sucesso!',
                showCancel: false,
                confirmText: 'OK',
                onConfirm: () => setActionModal(prev => ({ ...prev, isOpen: false }))
            });
        },
        onError: (error: any) => {
            console.error('Erro ao adicionar veículo:', error);
            let title = 'Erro';
            let message = 'Não foi possível adicionar o veículo.';

            if (error.response?.status === 400) {
                title = 'Dados Inválidos';
                message = error.response.data?.mensagem || 'Verifique os dados informados e tente novamente. A placa pode estar em formato inválido.';
            } else if (error.response?.status === 500) {
                title = 'Erro no Servidor';
                message = 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.';
            }

            setActionModal({
                isOpen: true,
                type: 'danger',
                title,
                message,
                showCancel: false,
                confirmText: 'FECHAR',
                onConfirm: () => setActionModal(prev => ({ ...prev, isOpen: false }))
            });
        }
    });

    const addPecaMutation = useMutation({
        mutationFn: osService.addPeca,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ordem-servico', osId] });
            setPecaModalOpen({ isOpen: false, veiculoId: null });
            setPecaForm({ tipoPecaId: '', valorCobrado: '' });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: OSStatus) => osService.updateStatus(osId, status),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['ordem-servico', osId] });

            // ✅ Sync System: Update lists and financial data with delay to ensure backend commit
            // Using setTimeout to allow backend transaction propagation
            setTimeout(() => {
                console.log('🔄 [SYNC] Hard Resetting system caches...');

                // Resetting queries clears the cache and forces a hard loading state on next fetch
                // This is more aggressive than invalidate
                queryClient.resetQueries({ queryKey: ['os-list'] });

                queryClient.resetQueries({
                    queryKey: ['comissao'],
                    exact: false // Reset all commission related queries (any month/year)
                });
            }, 1500);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            // 1. Manual Cascade: Delete all vehicles first
            if (os && os.veiculos && os.veiculos.length > 0) {
                console.log(`Excluindo ${os.veiculos.length} veículos associados...`);
                // Using map to create array of promises
                const deleteVeiculosPromises = os.veiculos.map(v => osService.deleteVeiculo(v.id));
                await Promise.all(deleteVeiculosPromises);
            }
            // 2. Delete the OS
            await osService.deleteOS(id);
        },
        onSuccess: () => {
            console.log('OS e veículos excluídos com sucesso, redirecionando...');
            queryClient.invalidateQueries({ queryKey: ['ordens-servico'] });
            navigate('/os');
        },
        onError: (error) => {
            console.error('Erro ao excluir OS (Cascade Manual):', error);
            setActionModal({
                isOpen: true,
                title: 'Erro na Exclusão',
                message: 'Erro ao excluir a OS. Verifique se existem dependências ou consulte o log.',
                type: 'danger',
                onConfirm: () => setActionModal(prev => ({ ...prev, isOpen: false }))
            });
        }
    });

    if (isLoading || !os) return <div className="text-cyber-gold p-8">Carregando detalhes da OS...</div>;

    const handleAddVeiculo = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. LIMPAR
        const placaLimpa = limparPlaca(veiculoForm.placa);

        // 2. VALIDAR
        if (!validarPlaca(placaLimpa)) {
            setActionModal({
                isOpen: true,
                type: 'danger', // Fixed type
                title: 'Placa Inválida',
                message: `A placa "${veiculoForm.placa}" não atende aos formatos permitidos.`,
                confirmText: 'ENTENDI',
                onConfirm: () => setActionModal(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        // Check local duplicate
        const jaExiste = os.veiculos.some(v => limparPlaca(v.placa) === placaLimpa);
        if (jaExiste) {
            setActionModal({
                isOpen: true,
                type: 'warning',
                title: 'Veículo Duplicado',
                message: 'Este veículo já foi adicionado a esta Ordem de Serviço.',
                confirmText: 'OK',
                onConfirm: () => setActionModal(prev => ({ ...prev, isOpen: false }))
            });
            return;
        }

        // 3. ENVIAR (Clean)
        addVeiculoMutation.mutate({
            ordemServicoId: osId,
            ...veiculoForm,
            placa: placaLimpa
        });
    };

    const handleAddPeca = (e: React.FormEvent) => {
        e.preventDefault();
        // Removed unused tipoPeca
        let valorToSend: number | undefined = undefined;
        if (pecaForm.valorCobrado) {
            valorToSend = parseFloat(pecaForm.valorCobrado);
        }
        addPecaMutation.mutate({
            veiculoId: isPecaModalOpen.veiculoId!,
            tipoPecaId: parseInt(pecaForm.tipoPecaId),
            valorCobrado: valorToSend
        });
    };

    const onSelectPeca = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = parseInt(e.target.value);
        const item = catalogo?.find(t => t.id === id);
        setPecaForm({
            tipoPecaId: e.target.value,
            valorCobrado: item ? item.valorPadrao.toString() : ''
        });
    };

    const isFinalized = os.status === 'FINALIZADA';

    const handleCheckPlaca = async () => {
        const placaLimpa = limparPlaca(veiculoForm.placa);
        if (placaLimpa.length >= 7) {
            // Optional: validate strictly before checking API to save bandwidth
            if (!validarPlaca(placaLimpa)) return;

            try {
                const check = await osService.verificarPlaca(placaLimpa);
                if (check.existe) {
                    setDuplicateModal({
                        isOpen: true,
                        data: check.veiculoExistente
                    });
                }
            } catch (error) {
                console.error("Erro ao verificar placa", error);
            }
        }
    };

    const handleDuplicateContinue = () => {
        setDuplicateModal({ isOpen: false });
        // User continues with form filled
    };

    const handleDuplicateCancel = () => {
        setDuplicateModal({ isOpen: false });
        setVeiculoForm(prev => ({ ...prev, placa: '' })); // Clear plate
    };

    const handleDuplicateViewHistory = () => {
        const plate = veiculoForm.placa;
        setDuplicateModal({ isOpen: false });
        setVeiculoForm(prev => ({ ...prev, placa: '' })); // Clear add form if viewing history
        setVeiculoModalOpen(false); // Close add modal

        // Open history
        setHistoryModal({
            isOpen: true,
            placa: plate,
            modelo: duplicateModal.data?.modelo || 'Veículo'
        });
    };

    return (
        <div className="pb-20">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <button onClick={() => navigate('/os')} className="text-gray-400 hover:text-white flex items-center gap-2 font-oxanium">
                    <ArrowLeft className="w-4 h-4" /> VOLTAR
                </button>
                <div className="flex gap-3">
                    {os.status === 'ABERTA' && (
                        <>
                            <button
                                onClick={() => {
                                    setActionModal({
                                        isOpen: true,
                                        title: 'Cancelar OS?',
                                        message: 'Deseja cancelar esta OS? Ela será excluída permanentemente.',
                                        type: 'danger',
                                        confirmText: 'SIM, CANCELAR',
                                        onConfirm: () => deleteMutation.mutate(osId)
                                    });
                                }}
                                className="bg-red-600/20 text-red-400 border border-red-600/50 px-4 py-2 rounded hover:bg-red-600/40 transition-all font-oxanium flex items-center gap-2"
                            >
                                <Ban className="w-4 h-4" /> CANCELAR (EXCLUIR)
                            </button>
                            <button
                                onClick={() => updateStatusMutation.mutate('EM_EXECUCAO')}
                                className="bg-blue-600/20 text-blue-400 border border-blue-600/50 px-4 py-2 rounded hover:bg-blue-600/40 transition-all font-oxanium flex items-center gap-2"
                            >
                                <Wrench className="w-4 h-4" /> INICIAR SERVIÇO
                            </button>
                        </>
                    )}
                    {os.status === 'EM_EXECUCAO' && (
                        <button
                            onClick={() => {
                                setActionModal({
                                    isOpen: true,
                                    title: 'Finalizar OS',
                                    message: 'Finalizar esta OS irá gerar um Faturamento automaticamente. Confirma?',
                                    type: 'success',
                                    confirmText: 'FINALIZAR',
                                    onConfirm: () => updateStatusMutation.mutate('FINALIZADA')
                                });
                            }}
                            className="bg-green-600/20 text-green-400 border border-green-600/50 px-4 py-2 rounded hover:bg-green-600/40 transition-all font-oxanium flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> FINALIZAR OS
                        </button>
                    )}
                    {isFinalized && (
                        <div className="text-green-500 font-bold font-oxanium border border-green-500/50 bg-green-500/10 px-4 py-2 rounded flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> FINALIZADA
                        </div>
                    )}
                    {os.status === 'CANCELADA' && (
                        <div className="text-red-500 font-bold font-oxanium border border-red-500/50 bg-red-500/10 px-4 py-2 rounded flex items-center gap-2">
                            <Ban className="w-4 h-4" /> CANCELADA
                        </div>
                    )}
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Cliente */}
                <div className="bg-black/40 border border-white/10 p-6 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-gold"></div>
                    <h3 className="text-gray-400 text-sm font-oxanium mb-2 uppercase tracking-wide">Cliente</h3>
                    <div className="text-xl text-white font-bold font-orbitron">{os.cliente.nomeFantasia}</div>
                    <div className="text-sm text-gray-500">{os.cliente.razaoSocial}</div>
                    <div className="mt-4 text-sm text-gray-400 font-oxanium">
                        <p>{os.cliente.cnpj}</p>
                        <p>{os.cliente.contato}</p>
                    </div>
                </div>

                {/* Status Info */}
                <div className="bg-black/40 border border-white/10 p-6 rounded-lg flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-gray-400 text-sm font-oxanium uppercase tracking-wide">Status</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${os.status === 'ABERTA' ? 'bg-blue-500/20 text-blue-400' :
                            os.status === 'EM_EXECUCAO' ? 'bg-yellow-500/20 text-yellow-400' :
                                os.status === 'CANCELADA' ? 'bg-red-500/20 text-red-400' :
                                    'bg-green-500/20 text-green-400'
                            }`}>
                            {os.status}
                        </span>
                    </div>
                    <div className="text-3xl text-cyber-gold font-bold font-orbitron mt-2">
                        {os.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">VALOR TOTAL ACUMULADO</div>
                </div>

                {/* Data */}
                <div className="bg-black/40 border border-white/10 p-6 rounded-lg flex flex-col justify-center">
                    <h3 className="text-gray-400 text-sm font-oxanium uppercase tracking-wide">Data de Criação</h3>
                    <div className="text-2xl text-white font-bold font-orbitron mt-2">
                        {formatarData(os.data)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">ID: #{os.id}</div>
                </div>
            </div>

            {/* Vehicles & Parts */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-orbitron text-white flex items-center gap-2">
                        <Car className="text-cyber-gold" />
                        VEÍCULOS E SERVIÇOS
                    </h2>
                    {!isFinalized && (
                        <button
                            onClick={() => setVeiculoModalOpen(true)}
                            className="border border-cyber-gold/50 text-cyber-gold px-4 py-2 rounded hover:bg-cyber-gold hover:text-black transition-all flex items-center gap-2 font-oxanium text-sm"
                        >
                            <Plus className="w-4 h-4" /> ADICIONAR VEÍCULO
                        </button>
                    )}
                </div>

                {os.veiculos.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-lg text-gray-500 font-oxanium">
                        Nenhum veículo adicionado a esta Ordem de Serviço.
                    </div>
                ) : (
                    os.veiculos.map(v => (
                        <div key={v.id} className="bg-black/60 border border-white/10 rounded-lg overflow-hidden">
                            {/* Vehicle Header */}
                            <div className="bg-white/5 p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="bg-cyber-gold/10 p-2 rounded text-cyber-gold">
                                        <Car className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white font-oxanium">{v.modelo} &bull; {v.placa}</h3>
                                        <div className="text-sm text-gray-400">Cor: {v.cor}</div>
                                    </div>
                                </div>
                                <div className="mt-2 md:mt-0 text-right">
                                    <div className="text-xs text-gray-500">SUBTOTAL VEÍCULO</div>
                                    <div className="text-lg font-bold text-white">
                                        {v.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                    <button
                                        onClick={() => setHistoryModal({ isOpen: true, placa: v.placa, modelo: v.modelo })}
                                        className="text-[10px] text-cyber-gold hover:text-white underline mt-1 flex items-center justify-end gap-1"
                                    >
                                        <History className="w-3 h-3" /> VER HISTÓRICO
                                    </button>
                                </div>
                            </div>

                            {/* Parts List */}
                            <div className="p-4">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-xs text-gray-500 border-b border-white/5 font-oxanium">
                                            <th className="py-2 pl-2">DESCRIÇÃO</th>
                                            <th className="py-2 text-right pr-2">VALOR</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-300">
                                        {v.pecas.map(p => (
                                            <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                                                <td className="py-3 pl-2">{p.nomePeca}</td>
                                                <td className="py-3 text-right pr-2 font-mono">
                                                    {p.valorCobrado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </td>
                                            </tr>
                                        ))}
                                        {v.pecas.length === 0 && (
                                            <tr>
                                                <td colSpan={2} className="py-4 text-center text-gray-600 text-xs italic">
                                                    Nenhum serviço/peça lançado.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                {!isFinalized && (
                                    <button
                                        onClick={() => setPecaModalOpen({ isOpen: true, veiculoId: v.id })}
                                        className="mt-4 w-full py-2 border border-dashed border-white/20 text-gray-400 hover:text-cyber-gold hover:border-cyber-gold/50 rounded flex justify-center items-center gap-2 text-sm transition-all"
                                    >
                                        <Plus className="w-4 h-4" /> Adicionar Serviço/Peça
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal: Add Vehicle */}
            {isVeiculoModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-black/90 border border-cyber-gold/50 p-6 rounded-lg max-w-sm w-full">
                        <h3 className="text-xl font-orbitron text-white mb-4">Novo Veículo</h3>
                        <form onSubmit={handleAddVeiculo}>
                            <div className="space-y-3">
                                <PlateInput
                                    value={veiculoForm.placa}
                                    onChange={(val) => setVeiculoForm({ ...veiculoForm, placa: val })}
                                    className="mb-2"
                                    onBlur={handleCheckPlaca}
                                />
                                <input
                                    placeholder="Modelo"
                                    required
                                    className="w-full bg-black/60 border border-white/20 text-white p-2 text-sm"
                                    value={veiculoForm.modelo}
                                    onChange={e => setVeiculoForm({ ...veiculoForm, modelo: e.target.value })}
                                />
                                <input
                                    placeholder="Cor"
                                    required
                                    className="w-full bg-black/60 border border-white/20 text-white p-2 text-sm"
                                    value={veiculoForm.cor}
                                    onChange={e => setVeiculoForm({ ...veiculoForm, cor: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setVeiculoModalOpen(false)} className="text-gray-500 hover:text-white px-3 py-1 font-oxanium text-sm">Cancelar</button>
                                <button type="submit" className="bg-cyber-gold text-black px-4 py-1 rounded font-bold hover:bg-yellow-400 font-oxanium text-sm">Adicionar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add Peca */}
            {isPecaModalOpen.isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-black/90 border border-cyber-gold/50 p-6 rounded-lg max-w-sm w-full">
                        <h3 className="text-xl font-orbitron text-white mb-4">Adicionar Item</h3>
                        <form onSubmit={handleAddPeca}>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Item do Catálogo</label>
                                    <select
                                        className="w-full bg-black/60 border border-white/20 text-white p-2 text-sm"
                                        value={pecaForm.tipoPecaId}
                                        onChange={onSelectPeca}
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {catalogo?.map(c => (
                                            <option key={c.id} value={c.id}>{c.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Valor Cobrado (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-black/60 border border-white/20 text-white p-2 text-sm"
                                        value={pecaForm.valorCobrado}
                                        onChange={e => setPecaForm({ ...pecaForm, valorCobrado: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-500 italic">Deixe vazio para usar o valor padrão.</p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setPecaModalOpen({ isOpen: false, veiculoId: null })} className="text-gray-500 hover:text-white px-3 py-1 font-oxanium text-sm">Cancelar</button>
                                <button type="submit" className="bg-cyber-gold text-black px-4 py-1 rounded font-bold hover:bg-yellow-400 font-oxanium text-sm">Adicionar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Vehicle History */}
            <VehicleHistoryModal
                isOpen={historyModal.isOpen}
                onClose={() => setHistoryModal({ ...historyModal, isOpen: false })}
                placa={historyModal.placa}
                modelo={historyModal.modelo}
            />

            {/* Modal: Duplicate Plate Warning */}
            <DuplicatePlateModal
                isOpen={duplicateModal.isOpen}
                onClose={handleDuplicateCancel}
                onContinue={handleDuplicateContinue}
                onViewHistory={handleDuplicateViewHistory}
                veiculoData={duplicateModal.data}
            />

            {/* Modal: Generic Action */}
            <ActionModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal({ ...actionModal, isOpen: false })}
                onConfirm={() => {
                    if (actionModal.onConfirm) actionModal.onConfirm();
                    setActionModal({ ...actionModal, isOpen: false });
                }}
                title={actionModal.title}
                message={actionModal.message}
                type={actionModal.type}
            />

        </div>
    );
};
