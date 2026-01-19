import { useEffect, useState } from 'react';
import { cartaoService } from '../../services/cartaoService';
import type { CartaoCredito } from '../../types';
import { CreditCard, Plus, Trash2, Calendar } from 'lucide-react';

const CartoesPage = () => {
    const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    // Form States
    const [nome, setNome] = useState('');
    const [diaVencimento, setDiaVencimento] = useState<number>(5);
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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await cartaoService.criar({ nome, diaVencimento });
            setModalOpen(false);
            setNome('');
            setDiaVencimento(5);
            loadCartoes();
        } catch (err) {
            console.error('Erro ao criar cartão:', err);
            alert('Erro ao criar cartão');
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
                    onClick={() => setModalOpen(true)}
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

                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar size={16} />
                            <span>Dia do Vencimento: <strong className="text-white">{cartao.diaVencimento}</strong></span>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <p className="text-xs text-gray-500 font-mono">
                                // Faturas são geradas automaticamente baseadas neste dia.
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

            {/* Modal de Criação */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="hud-card w-full max-w-md p-6 space-y-6 animate-slideIn">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Plus className="text-purple-400" />
                            Novo Cartão
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

                            <div className="space-y-2">
                                <label className="text-sm font-mono text-gray-400">DIA DE VENCIMENTO</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="28"
                                    value={diaVencimento}
                                    onChange={(e) => setDiaVencimento(Number(e.target.value))}
                                    className="hud-input w-full"
                                />
                                <p className="text-xs text-gray-500 font-mono">
                                    * Escolha um dia entre 1 e 28.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 hud-btn bg-white/5 text-gray-400 hover:bg-white/10"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 hud-btn bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border-purple-500/50"
                                >
                                    {submitting ? 'SALVANDO...' : 'CRIAR CARTÃO'}
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
