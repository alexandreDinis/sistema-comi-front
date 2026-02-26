import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeiroService } from '../../services/financeiroService';
import type { ContaPagar } from '../../types';
import { Info, Plus, DollarSign, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { PdfQueueModal } from '../../components/modals/PdfQueueModal';
import { usePdfDownload } from '../../hooks/usePdfDownload';

export const DistribuicaoLucrosPage: React.FC = () => {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        valor: '',
        dataCompetencia: new Date().toISOString().split('T')[0],
        dataVencimento: new Date().toISOString().split('T')[0],
        descricao: ''
    });
    const [showForm, setShowForm] = useState(false);
    const { pdfState, startPdfDownload, retryPdfDownload, closePdfModal } = usePdfDownload(financeiroService.getApiBaseUrl());

    const { data: distribuicoes, isLoading } = useQuery({
        queryKey: ['distribuicoes-lucro'],
        queryFn: financeiroService.listarDistribuicoesLucro
    });

    const createMutation = useMutation({
        mutationFn: financeiroService.criarDistribuicaoLucros,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['distribuicoes-lucro'] });
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

    const payMutation = useMutation({
        mutationFn: (id: number) => financeiroService.pagarConta(id, {
            dataPagamento: new Date().toISOString().split('T')[0],
            meioPagamento: 'PIX' // Default to PIX for distributions
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['distribuicoes-lucro'] });
            queryClient.invalidateQueries({ queryKey: ['contas-pagar'] });
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
    };

    return (
        <>
            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-cyber-gold flex items-center gap-2">
                            <DollarSign className="w-7 h-7" />
                            Distribuição de Lucros
                        </h1>
                        <p className="text-cyber-gold/60 text-sm mt-1">
                            Registre retiradas de lucros (dividendos) pelos sócios
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-black/80 border border-cyber-gold/50 px-2 py-1 rounded">
                            <select
                                value={new Date().getMonth() + 1}
                                onChange={(e) => {
                                    const mes = parseInt(e.target.value);
                                    const ano = new Date().getFullYear();
                                    startPdfDownload(financeiroService.getDistribuicaoLucrosPdfPath(mes, ano), `distribuicao-lucros-${ano}-${mes}.pdf`);
                                }}
                                className="bg-transparent text-cyber-gold font-mono text-xs focus:outline-none"
                            >
                                <option value="" disabled selected>PDF MENSAL</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{new Date(0, m - 1).toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-cyber-gold text-black font-bold rounded-sm hover:bg-cyber-gold/90 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Retirada
                        </button>
                    </div>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-sm p-4 mb-6 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-200">
                        <p className="font-semibold mb-1">Importante</p>
                        <p className="text-blue-300/80">
                            Distribuição de lucros <strong>não afeta o resultado do DRE</strong>.
                            Trata-se apenas de retirada de caixa pelos sócios.
                        </p>
                    </div>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-black/60 border border-cyber-gold/30 rounded-sm p-6 mb-6">
                        <h2 className="text-lg font-bold text-cyber-gold mb-4">Registrar Retirada</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-cyber-gold/60 mb-1">Valor (R$) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        value={formData.valor}
                                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                        className="w-full bg-black/40 border border-cyber-gold/30 rounded-sm p-2 text-cyber-gold focus:border-cyber-gold focus:outline-none"
                                        placeholder="10000.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-cyber-gold/60 mb-1">Descrição (opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.descricao}
                                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                        className="w-full bg-black/40 border border-cyber-gold/30 rounded-sm p-2 text-cyber-gold focus:border-cyber-gold focus:outline-none"
                                        placeholder="Retirada Sócio - Janeiro/2026"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-cyber-gold/60 mb-1">Data Competência *</label>
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
                        <h2 className="font-bold text-cyber-gold">Histórico de Retiradas</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center text-cyber-gold/60">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Carregando...
                        </div>
                    ) : distribuicoes && distribuicoes.length > 0 ? (
                        <div className="divide-y divide-cyber-gold/10">
                            {distribuicoes.map((dist: ContaPagar) => (
                                <div key={dist.id} className="p-4 flex items-center justify-between hover:bg-cyber-gold/5 transition-colors">
                                    <div>
                                        <p className="text-cyber-gold font-medium">{dist.descricao}</p>
                                        <p className="text-xs text-cyber-gold/50">
                                            Competência: {formatDate(dist.dataCompetencia)} |
                                            Vencimento: {formatDate(dist.dataVencimento)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-cyber-gold">{formatCurrency(dist.valor)}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-sm ${dist.status === 'PAGO'
                                            ? 'bg-green-900/30 text-green-400'
                                            : 'bg-yellow-900/30 text-yellow-400'
                                            }`}>
                                            {dist.status === 'PAGO' ? 'Pago' : 'Pendente'}
                                        </span>
                                        {dist.status !== 'PAGO' && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Confirmar pagamento desta distribuição?')) {
                                                        payMutation.mutate(dist.id);
                                                    }
                                                }}
                                                disabled={payMutation.isPending}
                                                className="ml-2 p-1 bg-green-900/40 text-green-400 rounded hover:bg-green-900/60"
                                                title="Marcar como Pago"
                                            >
                                                <DollarSign className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-cyber-gold/40">
                            Nenhuma distribuição de lucros registrada.
                        </div>
                    )}
                </div>
            </div>

            <PdfQueueModal state={pdfState} onRetry={retryPdfDownload} onClose={closePdfModal} />
        </>
    );
};

export default DistribuicaoLucrosPage;
