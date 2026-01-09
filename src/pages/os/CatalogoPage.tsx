import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { osService } from '../../services/osService';
import type { TipoPecaRequest } from '../../types';
import { Wrench, Plus, Save, Tag, Trash2 } from 'lucide-react';

export const CatalogoPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<TipoPecaRequest>({
        nome: '',
        valorPadrao: 0
    });

    const { data: itens, isLoading } = useQuery({
        queryKey: ['catalogo'],
        queryFn: osService.listTiposPeca
    });

    const mutation = useMutation({
        mutationFn: osService.createTipoPeca,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalogo'] });
            setIsFormOpen(false);
            setFormData({ nome: '', valorPadrao: 0 });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: osService.deleteTipoPeca,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['catalogo'] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const handleDelete = async (id: number, nome: string) => {
        if (window.confirm(`Tem certeza que deseja excluir "${nome}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-orbitron text-cyber-gold font-bold tracking-wider flex items-center gap-3">
                    <Wrench className="w-8 h-8" />
                    CATÁLOGO DE SERVIÇOS/PEÇAS
                </h1>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="bg-cyber-gold/10 text-cyber-gold border border-cyber-gold px-4 py-2 rounded hover:bg-cyber-gold hover:text-black transition-all flex items-center gap-2 font-oxanium"
                >
                    <Plus className="w-4 h-4" />
                    {isFormOpen ? 'CANCELAR' : 'NOVO ITEM'}
                </button>
            </div>

            {isFormOpen && (
                <form onSubmit={handleSubmit} className="mb-8 bg-black/40 border border-cyber-gold/30 p-6 rounded-lg backdrop-blur-sm relative overflow-hidden w-full max-w-2xl mx-auto">
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyber-gold/40"></div>

                    <h2 className="text-xl font-orbitron text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-6 bg-cyber-gold inline-block"></span>
                        ADICIONAR ITEM AO CATÁLOGO
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">Nome do Serviço/Peça</label>
                            <input
                                type="text"
                                required
                                placeholder="Ex: Troca de Óleo"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none focus:shadow-[0_0_10px_rgba(255,184,0,0.3)] transition-all"
                                value={formData.nome}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">Valor Padrão (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.valorPadrao}
                                onChange={e => setFormData({ ...formData, valorPadrao: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="bg-cyber-gold text-black font-bold py-2 px-6 hover:bg-yellow-400 transition-colors flex items-center gap-2 font-oxanium"
                        >
                            {mutation.isPending ? 'SALVANDO...' : 'ADICIONAR CATALOGO'}
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            )}

            {isLoading ? (
                <div className="text-cyber-gold font-oxanium animate-pulse">Carregando catálogo...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {itens?.map((item) => (
                        <div key={item.id} className="bg-black/40 border border-cyber-gold/20 p-4 rounded hover:border-cyber-gold/50 transition-all cursor-default flex flex-col justify-between group relative">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDelete(item.id, item.nome)}
                                    className="p-1 text-cyber-error hover:bg-cyber-error/20 rounded"
                                    title="Excluir Item"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <Tag className="w-5 h-5 text-cyber-gold opacity-50" />
                                    <span className="text-xs text-gray-500 font-mono">#{item.id}</span>
                                </div>
                                <h3 className="text-lg font-orbitron text-white group-hover:text-cyber-gold transition-colors pr-6">{item.nome}</h3>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-oxanium">VALOR PADRÃO</span>
                                <span className="text-xl font-oxanium text-cyber-gold font-bold">
                                    {item.valorPadrao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    {itens?.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500 font-oxanium">
                            Nenhum item no catálogo.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
