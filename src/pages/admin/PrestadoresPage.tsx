import { useState, useEffect } from 'react';
import { prestadorService } from '../../services/prestadorService';
import type { Prestador, PrestadorRequest } from '../../types';
import { Users, Plus, Phone, QrCode, Trash2, Edit, X, Save } from 'lucide-react';

export default function PrestadoresPage() {
    const [prestadores, setPrestadores] = useState<Prestador[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState<Prestador | null>(null);
    const [mostrarInativos, setMostrarInativos] = useState(false);

    // Form state
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [chavePix, setChavePix] = useState('');

    useEffect(() => {
        carregarPrestadores();
    }, [mostrarInativos]);

    const carregarPrestadores = async () => {
        try {
            setLoading(true);
            const data = await prestadorService.listar(!mostrarInativos);
            setPrestadores(data);
        } catch (error) {
            console.error('Erro ao carregar prestadores:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (prestador?: Prestador) => {
        if (prestador) {
            setEditando(prestador);
            setNome(prestador.nome);
            setTelefone(prestador.telefone || '');
            setChavePix(prestador.chavePix || '');
        } else {
            setEditando(null);
            setNome('');
            setTelefone('');
            setChavePix('');
        }
        setShowModal(true);
    };

    const fecharModal = () => {
        setShowModal(false);
        setEditando(null);
        setNome('');
        setTelefone('');
        setChavePix('');
    };

    const salvar = async () => {
        if (!nome.trim()) return;

        const data: PrestadorRequest = {
            nome: nome.trim(),
            telefone: telefone.trim() || undefined,
            chavePix: chavePix.trim() || undefined,
        };

        try {
            if (editando) {
                await prestadorService.atualizar(editando.id, data);
            } else {
                await prestadorService.criar(data);
            }
            fecharModal();
            carregarPrestadores();
        } catch (error) {
            console.error('Erro ao salvar prestador:', error);
        }
    };

    const desativar = async (id: number) => {
        if (!confirm('Deseja desativar este prestador?')) return;
        try {
            await prestadorService.desativar(id);
            carregarPrestadores();
        } catch (error) {
            console.error('Erro ao desativar prestador:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-cyber-gold" />
                    <div>
                        <h1 className="text-2xl font-bold text-cyber-gold">Prestadores de Serviço</h1>
                        <p className="text-sm text-gray-400">Cadastre seus prestadores terceirizados</p>
                    </div>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="flex items-center gap-2 bg-cyber-gold text-black px-4 py-2 rounded font-bold hover:bg-yellow-400 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Novo Prestador
                </button>
            </div>

            {/* Filtro */}
            <label className="flex items-center gap-2 text-gray-400">
                <input
                    type="checkbox"
                    checked={mostrarInativos}
                    onChange={(e) => setMostrarInativos(e.target.checked)}
                    className="accent-cyber-gold"
                />
                Mostrar inativos
            </label>

            {/* Lista */}
            {loading ? (
                <div className="text-cyber-gold animate-pulse">Carregando...</div>
            ) : prestadores.length === 0 ? (
                <div className="text-gray-500 text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum prestador cadastrado</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {prestadores.map((p) => (
                        <div
                            key={p.id}
                            className={`bg-black/40 border rounded-lg p-4 ${p.ativo ? 'border-cyber-gold/20' : 'border-gray-700 opacity-60'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-cyber-gold">{p.nome}</h3>
                                    {p.telefone && (
                                        <p className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                            <Phone className="w-4 h-4" />
                                            {p.telefone}
                                        </p>
                                    )}
                                    {p.chavePix && (
                                        <p className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                            <QrCode className="w-4 h-4" />
                                            {p.chavePix}
                                        </p>
                                    )}
                                </div>
                                {p.ativo && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => abrirModal(p)}
                                            className="text-gray-400 hover:text-cyber-gold"
                                            title="Editar"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => desativar(p.id)}
                                            className="text-gray-400 hover:text-red-500"
                                            title="Desativar"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {!p.ativo && (
                                <span className="text-xs text-red-400 mt-2 block">Inativo</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-cyber-gold/30 rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-cyber-gold">
                                {editando ? 'Editar Prestador' : 'Novo Prestador'}
                            </h2>
                            <button onClick={fecharModal} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Nome *</label>
                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full bg-black border border-cyber-gold/30 text-cyber-gold p-2 rounded"
                                    placeholder="João Funileiro"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Telefone</label>
                                <input
                                    type="text"
                                    value={telefone}
                                    onChange={(e) => setTelefone(e.target.value)}
                                    className="w-full bg-black border border-cyber-gold/30 text-cyber-gold p-2 rounded"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Chave PIX</label>
                                <input
                                    type="text"
                                    value={chavePix}
                                    onChange={(e) => setChavePix(e.target.value)}
                                    className="w-full bg-black border border-cyber-gold/30 text-cyber-gold p-2 rounded"
                                    placeholder="CPF, e-mail ou telefone"
                                />
                            </div>

                            <button
                                onClick={salvar}
                                disabled={!nome.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-cyber-gold text-black font-bold py-2 rounded hover:bg-yellow-400 disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" />
                                {editando ? 'Salvar Alterações' : 'Cadastrar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
