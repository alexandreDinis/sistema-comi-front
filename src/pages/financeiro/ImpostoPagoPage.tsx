import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeiroService } from '../../services/financeiroService';
import type { ContaPagar } from '../../types';
import { Info, Plus, Receipt, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ImpostoPagoPage: React.FC = () => {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        valor: '',
        dataCompetencia: new Date().toISOString().split('T')[0],
        dataVencimento: new Date().toISOString().split('T')[0],
        descricao: ''
    });
    const [showForm, setShowForm] = useState(false);

    const { data: impostos, isLoading } = useQuery({
        queryKey: ['imposto-pago'],
        queryFn: financeiroService.listarImpostosPagos
    });

    const createMutation = useMutation({
        mutationFn: financeiroService.criarImpostoPago,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['imposto-pago'] });
            queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
            setShowForm(false);
            setFormData({
                valor: '',
                dataCompetencia: new Date().toISOString().split('T')[0],
                dataVencimento: new Date().toISOString().split('T')[0],
                descricao: ''
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            valor: parseFloat(formData.valor),
            dataCompetencia: formData.dataCompetencia,
            dataVencimento: formData.dataVencimento,
            descricao: formData.descricao || undefined
        });
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const formatDate = (dateStr: string) =>
        new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Back Link */}
            <Link to="/relatorio" className="inline-flex items-center gap-2 text-cyber-gold/60 hover:text-cyber-gold transition-colors text-xs mb-6">
                ← Voltar para Central
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-cyber-gold flex items-center gap-2">
                        <Receipt className="w-7 h-7" />
                        Pagamento de DAS (Imposto)
                    </h1>
                    <p className="text-cyber-gold/60 text-sm mt-1">
                        Registre pagamentos de impostos (Simples Nacional)
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyber-gold text-black font-bold rounded-sm hover:bg-cyber-gold/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Registrar DAS
                </button>
            </div>

            {/* Info Alert */}
            <div className="bg-orange-900/30 border border-orange-500/30 rounded-sm p-4 mb-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-200">
                    <p className="font-semibold mb-1">Importante para Contabilidade</p>
                    <p className="text-orange-300/80">
                        O pagamento do DAS <strong>não aparece no DRE</strong> (que usa imposto calculado).
                        Ele aparece apenas como <strong>saída de caixa</strong> no Fluxo de Caixa.
                    </p>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-black/60 border border-cyber-gold/30 rounded-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-cyber-gold mb-4">Registrar Pagamento de DAS</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-cyber-gold/60 mb-1">Valor do DAS (R$) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    value={formData.valor}
                                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                    className="w-full bg-black/40 border border-cyber-gold/30 rounded-sm p-2 text-cyber-gold focus:border-cyber-gold focus:outline-none"
                                    placeholder="450.00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-cyber-gold/60 mb-1">Descrição (opcional)</label>
                                <input
                                    type="text"
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    className="w-full bg-black/40 border border-cyber-gold/30 rounded-sm p-2 text-cyber-gold focus:border-cyber-gold focus:outline-none"
                                    placeholder="DAS - Competência Janeiro/2026"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-cyber-gold/60 mb-1">Mês de Competência *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dataCompetencia}
                                    onChange={(e) => setFormData({ ...formData, dataCompetencia: e.target.value })}
                                    className="w-full bg-black/40 border border-cyber-gold/30 rounded-sm p-2 text-cyber-gold focus:border-cyber-gold focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-cyber-gold/60 mb-1">Data Vencimento *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dataVencimento}
                                    onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                                    className="w-full bg-black/40 border border-cyber-gold/30 rounded-sm p-2 text-cyber-gold focus:border-cyber-gold focus:outline-none"
                                />
                            </div>
                        </div>

                        {createMutation.isError && (
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                Erro ao registrar. Tente novamente.
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-cyber-gold/60 hover:text-cyber-gold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-cyber-gold text-black font-bold rounded-sm hover:bg-cyber-gold/90 transition-colors disabled:opacity-50"
                            >
                                {createMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                Registrar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-black/40 border border-cyber-gold/20 rounded-sm">
                <div className="p-4 border-b border-cyber-gold/20">
                    <h2 className="font-bold text-cyber-gold">Histórico de Pagamentos de DAS</h2>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-cyber-gold/60">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Carregando...
                    </div>
                ) : impostos && impostos.length > 0 ? (
                    <div className="divide-y divide-cyber-gold/10">
                        {impostos.map((imp: ContaPagar) => (
                            <div key={imp.id} className="p-4 flex items-center justify-between hover:bg-cyber-gold/5 transition-colors">
                                <div>
                                    <p className="text-cyber-gold font-medium">{imp.descricao}</p>
                                    <p className="text-xs text-cyber-gold/50">
                                        Competência: {formatDate(imp.dataCompetencia)} |
                                        Vencimento: {formatDate(imp.dataVencimento)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-orange-400">{formatCurrency(imp.valor)}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-sm ${imp.status === 'PAGO'
                                            ? 'bg-green-900/30 text-green-400'
                                            : 'bg-yellow-900/30 text-yellow-400'
                                        }`}>
                                        {imp.status === 'PAGO' ? 'Pago' : 'Pendente'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-cyber-gold/40">
                        Nenhum pagamento de DAS registrado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImpostoPagoPage;
