import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, AlertCircle, DollarSign, Check, ReceiptText, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { comissaoService } from '../../services/comissaoService';
import type { ComissaoFuncionario } from '../../services/comissaoService';

const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

export const GestaoComissoesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const agora = new Date();
    const [ano, setAno] = useState(agora.getFullYear());
    const [mes, setMes] = useState(agora.getMonth() + 1);

    const { data: comissoes, isLoading, isError, refetch } = useQuery({
        queryKey: ['comissoes-empresa', ano, mes],
        queryFn: () => comissaoService.listarComissoesEmpresa(ano, mes)
    });

    const quitarMutation = useMutation({
        mutationFn: (id: number) => comissaoService.quitarComissao(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comissoes-empresa', ano, mes] });
        }
    });

    const pagarMutation = useMutation({
        mutationFn: (id: number) => comissaoService.gerarPagamentoComissao(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comissoes-empresa', ano, mes] });
            alert('Pagamento gerado no Financeiro (PENDENTE)');
        }
    });

    const recalcularMutation = useMutation({
        mutationFn: () => comissaoService.listarComissoesEmpresa(ano, mes, true),
        onSuccess: () => {
            console.log('✅ Recálculo forçado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['comissoes-empresa'] });
            queryClient.invalidateQueries({ queryKey: ['comissao'] });
            alert('Sistema recalculou todas as comissões deste mês.');
        },
        onError: (error) => {
            console.error(error);
            alert('Erro ao recalcular comissões');
        }
    });

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-cyber-gold/20 pb-4">
                <div>
                    <h1 className="text-3xl font-black text-cyber-gold tracking-tighter uppercase glitch flex items-center gap-3">
                        <DollarSign size={28} />
                        Gestão de Pagamentos
                    </h1>
                    <p className="text-cyber-gold/60 font-mono text-sm mt-2">
                        Visualize e pague comissões de todos os funcionários
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/settings/comissao"
                        className="text-cyber-gold/60 hover:text-cyber-gold px-4 py-2 font-oxanium text-sm uppercase transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={16} /> Voltar
                    </Link>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-4 items-center bg-black/40 border border-cyber-gold/20 p-4">
                <label className="text-cyber-gold/60 text-sm font-mono">PERÍODO:</label>
                <select
                    value={mes}
                    onChange={(e) => setMes(parseInt(e.target.value))}
                    className="bg-black border border-cyber-gold/30 text-cyber-gold px-4 py-2 text-sm font-mono"
                >
                    {meses.map((m, idx) => (
                        <option key={idx} value={idx + 1}>{m}</option>
                    ))}
                </select>
                <select
                    value={ano}
                    onChange={(e) => setAno(parseInt(e.target.value))}
                    className="bg-black border border-cyber-gold/30 text-cyber-gold px-4 py-2 text-sm font-mono"
                >
                    {[2024, 2025, 2026].map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-cyber-gold/10 border border-cyber-gold/30 text-cyber-gold hover:bg-cyber-gold/20 transition-colors flex items-center gap-2"
                >
                    <RefreshCw size={14} /> Atualizar
                </button>

                <button
                    onClick={() => recalcularMutation.mutate()}
                    disabled={recalcularMutation.isPending}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2 ml-auto disabled:opacity-50"
                    title="Força o recálculo de todas as comissões (exceto pagas)"
                >
                    {recalcularMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    Recalcular
                </button>
            </div>

            {/* Loading */}
            {
                isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-cyber-gold animate-spin" />
                        <span className="ml-3 text-cyber-gold/60 font-mono">Carregando comissões...</span>
                    </div>
                )
            }

            {/* Error */}
            {
                isError && (
                    <div className="bg-red-500/10 border border-red-500/30 p-6 text-center">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                        <p className="text-red-400 mb-4">Erro ao carregar comissões</p>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw size={14} /> Tentar Novamente
                        </button>
                    </div>
                )
            }

            {/* Empty */}
            {
                !isLoading && !isError && (!comissoes || comissoes.length === 0) && (
                    <div className="bg-black/40 border border-cyber-gold/20 p-10 text-center">
                        <DollarSign className="w-12 h-12 text-cyber-gold/30 mx-auto mb-4" />
                        <h3 className="text-cyber-gold font-bold text-lg mb-2">Nenhuma Comissão</h3>
                        <p className="text-cyber-gold/50 text-sm">
                            Nenhum funcionário tem comissão calculada para este período.
                        </p>
                    </div>
                )
            }

            {/* Table */}
            {
                !isLoading && !isError && comissoes && comissoes.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full border border-cyber-gold/20">
                            <thead className="bg-cyber-gold/10">
                                <tr className="text-left text-xs font-mono text-cyber-gold/80 uppercase tracking-wider">
                                    <th className="p-4 border-b border-cyber-gold/20">Funcionário</th>
                                    <th className="p-4 border-b border-cyber-gold/20 text-right">Faturamento</th>
                                    <th className="p-4 border-b border-cyber-gold/20 text-right">%</th>
                                    <th className="p-4 border-b border-cyber-gold/20 text-right">Bruto</th>
                                    <th className="p-4 border-b border-cyber-gold/20 text-right">Adiant.</th>
                                    <th className="p-4 border-b border-cyber-gold/20 text-right">A Pagar</th>
                                    <th className="p-4 border-b border-cyber-gold/20 text-center">Status</th>
                                    <th className="p-4 border-b border-cyber-gold/20 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comissoes.map((c: ComissaoFuncionario) => (
                                    <tr key={c.id} className="border-b border-cyber-gold/10 hover:bg-cyber-gold/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-cyber-gold">{c.funcionarioNome}</div>
                                            <div className="text-xs text-cyber-gold/50">{c.funcionarioEmail}</div>
                                        </td>
                                        <td className="p-4 text-right font-mono text-cyber-gold/80">{formatarMoeda(c.faturamento)}</td>
                                        <td className="p-4 text-right font-mono text-cyber-gold/60">{c.porcentagem}%</td>
                                        <td className="p-4 text-right font-mono text-cyber-gold/80">{formatarMoeda(c.valorBruto)}</td>
                                        <td className="p-4 text-right font-mono text-red-400/80">-{formatarMoeda(c.adiantamentos)}</td>
                                        <td className="p-4 text-right font-mono font-bold text-cyber-gold">{formatarMoeda(c.saldoAPagar)}</td>
                                        <td className="p-4 text-center">
                                            {c.quitado ? (
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">PAGO</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-mono rounded">PENDENTE</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {!c.quitado && c.saldoAPagar > 0 && (
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => pagarMutation.mutate(c.id)}
                                                        disabled={pagarMutation.isPending}
                                                        className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs hover:bg-blue-500/30 disabled:opacity-50 flex items-center gap-1"
                                                        title="Gerar conta a pagar no Financeiro"
                                                    >
                                                        <ReceiptText size={12} /> Financeiro
                                                    </button>
                                                    <button
                                                        onClick={() => quitarMutation.mutate(c.id)}
                                                        disabled={quitarMutation.isPending}
                                                        className="px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-400 text-xs hover:bg-green-500/30 disabled:opacity-50 flex items-center gap-1"
                                                        title="Marcar como pago manualmente"
                                                    >
                                                        <Check size={12} /> Quitar
                                                    </button>
                                                </div>
                                            )}
                                            {c.quitado && c.dataQuitacao && (
                                                <span className="text-xs text-cyber-gold/40">{new Date(c.dataQuitacao).toLocaleDateString('pt-BR')}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }
        </div >
    );
};
