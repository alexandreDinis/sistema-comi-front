import { useEffect, useState } from 'react';
import { cartaoService } from '../../services/cartaoService';
import type { CartaoCredito, LimiteDisponivelDTO } from '../../types';
import { CreditCard, Plus, Trash2, Calendar, Pencil, DollarSign } from 'lucide-react';

// Componente para exibir limite disponível
const LimiteInfo = ({ id }: { id: number }) => {
    const [info, setInfo] = useState<LimiteDisponivelDTO | null>(null);

    useEffect(() => {
        cartaoService.getLimiteDisponivel(id).then(setInfo).catch(console.error);
    }, [id]);

    if (!info) return <span className="text-gray-500 text-xs">Carregando limite...</span>;

    const percentual = info.limiteTotal ? ((info.limiteUtilizado || 0) / info.limiteTotal) * 100 : 0;

    return (
        <div className="space-y-1 mt-2">
            <div className="flex justify-between text-xs">
                <span className="text-gray-400">Disponível: R$ {info.limiteDisponivel?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span className="text-gray-400">Total: R$ {info.limiteTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${percentual > 90 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(percentual, 100)}%` }}
                ></div>
            </div>
        </div>
    );
};

const CartoesPage = () => {
    const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Form States
    const [editingId, setEditingId] = useState<number | null>(null);
    const [nome, setNome] = useState('');
    const [diaVencimento, setDiaVencimento] = useState<number>(5);
    const [diaFechamento, setDiaFechamento] = useState<number>(25);
    const [limite, setLimite] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadCartoes();
    }, []);

    const loadCartoes = async () => {
        try {
            setLoading(true);
            const data = await cartaoService.listar();
            setCartoes(data);
        } catch (err) {
            console.error('Erro ao carregar cartões:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cartao: CartaoCredito) => {
        setEditingId(cartao.id);
        setNome(cartao.nome);
        setDiaVencimento(cartao.diaVencimento);
        setDiaFechamento(cartao.diaFechamento);
        setLimite(cartao.limite ? cartao.limite.toString() : '');
        setModalOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setNome('');
        setDiaVencimento(5);
        setDiaFechamento(25);
        setLimite('');
        setModalOpen(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const data = {
                nome,
                diaVencimento,
                diaFechamento,
                limite: limite ? parseFloat(limite) : undefined
            };

            if (editingId) {
                await cartaoService.editar(editingId, data);
            } else {
                await cartaoService.criar(data);
            }

            resetForm();
            loadCartoes();
        } catch (err) {
            console.error('Erro ao salvar cartão:', err);
            alert('Erro ao salvar cartão');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeactivate = async (id: number) => {
        if (!confirm('Tem certeza que deseja desativar este cartão?')) return;
        try {
            await cartaoService.desativar(id);
            loadCartoes();
        } catch (err) {
            console.error('Erro ao desativar cartão:', err);
            alert('Erro ao desativar cartão');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                <p className="text-green-400 font-mono text-sm tracking-widest animate-pulse">CARREGANDO...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] py-6 space-y-6 animate-fadeIn">
            {/* Header */}
            <header className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-10 bg-purple-500"></span>
                    <div>
                        <h1 className="text-2xl font-black italic text-cyber-gold tracking-widest uppercase">
                            Cartões Corporativos
                        </h1>
                        <p className="text-cyber-gold/50 font-mono text-xs tracking-[0.3em]">
                            // GESTÃO DE CRÉDITO
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setModalOpen(true);
                    }}
                    className="hud-btn bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/50 flex items-center gap-2"
                >
                    <Plus size={20} />
                    NOVO CARTÃO
                </button>
            </header>

            {/* Grid de Cartões */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cartoes.map((cartao) => (
                    <div key={cartao.id} className="hud-card p-6 space-y-4 group hover:border-purple-500/50 transition-all">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">
                                        {cartao.nome}
                                    </h3>
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${cartao.ativo
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-red-500/10 text-red-400'
                                        }`}>
                                        {cartao.ativo ? 'ATIVO' : 'INATIVO'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(cartao)}
                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                    title="Editar Cartão"
                                >
                                    <Pencil size={18} />
                                </button>
                                {cartao.ativo && (
                                    <button
                                        onClick={() => handleDeactivate(cartao.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Desativar Cartão"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar size={16} />
                            <span>Fecha dia <strong className="text-purple-400">{cartao.diaFechamento || 25}</strong>, vence dia <strong className="text-white">{cartao.diaVencimento}</strong></span>
                        </div>

                        {/* Limite Section */}
                        {cartao.limite && (
                            <div className="pt-2 border-t border-white/5">
                                <LimiteInfo id={cartao.id} />
                            </div>
                        )}

                        {!cartao.limite && (
                            <div className="pt-2 border-t border-white/5 text-xs text-gray-500">
                                Sem limite definido
                            </div>
                        )}

                        <div className="pt-2">
                            <p className="text-[10px] text-gray-600 font-mono">
                                // Despesas após o fechamento vão para a fatura do próximo mês.
                            </p>
                        </div>
                    </div>
                ))}

                {cartoes.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 hud-card text-center gap-4">
                        <CreditCard size={48} className="text-gray-600" />
                        <h3 className="text-xl font-bold text-gray-400">Nenhum cartão cadastrado</h3>
                        <p className="text-gray-500">Cadastre cartões para gerenciar despesas de crédito e faturas.</p>
                    </div>
                )}
            </div>

            {/* Modal de Criação/Edição */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="hud-card w-full max-w-md p-6 space-y-6 animate-slideIn">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {editingId ? <Pencil className="text-blue-400" /> : <Plus className="text-purple-400" />}
                            {editingId ? 'Editar Cartão' : 'Novo Cartão'}
                        </h2>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-mono text-gray-400">NOME DO CARTÃO</label>
                                <input
                                    type="text"
                                    required
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="hud-input w-full"
                                    placeholder="Ex: Nubank PJ, XP Corporate..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-mono text-gray-400">FECHAMENTO (DIA)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="31"
                                        value={diaFechamento}
                                        onChange={(e) => setDiaFechamento(Number(e.target.value))}
                                        className="hud-input w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-mono text-gray-400">VENCIMENTO (DIA)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="31"
                                        value={diaVencimento}
                                        onChange={(e) => setDiaVencimento(Number(e.target.value))}
                                        className="hud-input w-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-mono text-gray-400 flex items-center gap-2">
                                    <DollarSign size={14} />
                                    LIMITE (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={limite}
                                    onChange={(e) => setLimite(e.target.value)}
                                    className="hud-input w-full font-mono"
                                    placeholder="Opcional"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 hud-btn bg-white/5 text-gray-400 hover:bg-white/10"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`flex-1 hud-btn ${editingId
                                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/50'
                                        : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/50'}`}
                                >
                                    {submitting ? 'SALVANDO...' : (editingId ? 'SALVAR ALTERAÇÕES' : 'CRIAR CARTÃO')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartoesPage;
