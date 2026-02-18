import { useEffect, useState } from 'react';
import { financeiroService } from '../../services/financeiroService';
import type { ContaReceber, MeioPagamento, Recebimento } from '../../types';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
};

const MEIOS_PAGAMENTO: { value: MeioPagamento; label: string }[] = [
    { value: 'DINHEIRO', label: 'DINHEIRO' },
    { value: 'PIX', label: 'PIX' },
    { value: 'CARTAO_CREDITO', label: 'CRÉDITO' },
    { value: 'CARTAO_DEBITO', label: 'DÉBITO' },
    { value: 'BOLETO', label: 'BOLETO' },
    { value: 'TRANSFERENCIA', label: 'TED/DOC' },
    { value: 'CHEQUE', label: 'CHEQUE' },
];

const STATUS_COLORS: Record<string, string> = {
    PENDENTE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    PARCIAL: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    PAGO: 'bg-green-500/20 text-green-400 border-green-500/30',
    CANCELADO: 'bg-red-500/20 text-red-400 border-red-500/30',
    BAIXADO: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const STATUS_LABELS: Record<string, string> = {
    PENDENTE: 'PENDENTE',
    PARCIAL: 'PARCIAL',
    PAGO: 'RECEBIDO',
    CANCELADO: 'CANCELADO',
    BAIXADO: 'BAIXADO',
};

const ContasReceberPage = () => {
    const [contas, setContas] = useState<ContaReceber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtroStatus, setFiltroStatus] = useState<string>('PENDENTE');

    // Modal de Recebimento
    const [modalReceber, setModalReceber] = useState<ContaReceber | null>(null);
    const [valorRecebimento, setValorRecebimento] = useState<string>('');
    const [meioPagamento, setMeioPagamento] = useState<MeioPagamento>('PIX');
    const [observacaoRecebimento, setObservacaoRecebimento] = useState<string>('');
    const [processando, setProcessando] = useState(false);

    // Modal de Histórico
    const [modalHistorico, setModalHistorico] = useState<ContaReceber | null>(null);
    const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
    const [loadingHistorico, setLoadingHistorico] = useState(false);

    // Modal de Baixa
    const [modalBaixa, setModalBaixa] = useState<ContaReceber | null>(null);
    const [motivoBaixa, setMotivoBaixa] = useState<string>('');

    // Modal de Renegociação
    const [modalRenegociar, setModalRenegociar] = useState<ContaReceber | null>(null);
    const [novaDataVencimento, setNovaDataVencimento] = useState<string>('');

    useEffect(() => {
        loadContas();
    }, [filtroStatus]);

    const loadContas = async () => {
        try {
            setLoading(true);
            const data = await financeiroService.listarContasReceber(filtroStatus === 'TODOS' ? undefined : filtroStatus);
            setContas(data);
        } catch (err) {
            console.error('Erro ao carregar contas:', err);
            setError('Erro ao carregar contas a receber');
        } finally {
            setLoading(false);
        }
    };

    // Abrir modal de recebimento
    const openModalReceber = (conta: ContaReceber) => {
        setModalReceber(conta);
        setValorRecebimento(String(conta.saldoRestante ?? conta.valor));
        setMeioPagamento('PIX');
        setObservacaoRecebimento('');
    };

    // Registrar recebimento parcial
    const handleReceber = async () => {
        if (!modalReceber) return;
        const valor = parseFloat(valorRecebimento);
        if (isNaN(valor) || valor <= 0) {
            alert('Informe um valor válido');
            return;
        }
        const saldo = modalReceber.saldoRestante ?? modalReceber.valor;
        if (valor < saldo && !observacaoRecebimento.trim()) {
            alert('Observação é obrigatória para recebimento parcial');
            return;
        }

        try {
            setProcessando(true);
            await financeiroService.registrarRecebimentoParcial(modalReceber.id, {
                valor,
                meioPagamento,
                dataRecebimento: new Date().toISOString().split('T')[0],
                observacao: observacaoRecebimento || undefined,
            });
            setModalReceber(null);
            loadContas();
        } catch (err: any) {
            console.error('Erro ao registrar recebimento:', err);
            alert(err?.response?.data?.message || 'Erro ao registrar recebimento');
        } finally {
            setProcessando(false);
        }
    };

    // Carregar histórico
    const openHistorico = async (conta: ContaReceber) => {
        setModalHistorico(conta);
        setLoadingHistorico(true);
        try {
            const data = await financeiroService.listarRecebimentos(conta.id);
            setRecebimentos(data);
        } catch (err) {
            console.error('Erro ao carregar histórico:', err);
        } finally {
            setLoadingHistorico(false);
        }
    };

    // Estornar recebimento
    const handleEstorno = async (recebimentoId: number) => {
        if (!confirm('Tem certeza que deseja estornar este recebimento?')) return;
        try {
            await financeiroService.estornarRecebimento(recebimentoId);
            if (modalHistorico) {
                const data = await financeiroService.listarRecebimentos(modalHistorico.id);
                setRecebimentos(data);
            }
            loadContas();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Erro ao estornar');
        }
    };

    // Baixar saldo
    const handleBaixar = async () => {
        if (!modalBaixa) return;
        if (!motivoBaixa.trim()) {
            alert('Informe o motivo da baixa');
            return;
        }
        try {
            setProcessando(true);
            await financeiroService.baixarSaldo(modalBaixa.id, { motivo: motivoBaixa });
            setModalBaixa(null);
            setMotivoBaixa('');
            loadContas();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Erro ao baixar saldo');
        } finally {
            setProcessando(false);
        }
    };

    // Renegociar prazo
    const handleRenegociar = async () => {
        if (!modalRenegociar || !novaDataVencimento) return;
        try {
            setProcessando(true);
            await financeiroService.atualizarVencimento(modalRenegociar.id, novaDataVencimento);
            setModalRenegociar(null);
            setNovaDataVencimento('');
            loadContas();
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Erro ao atualizar vencimento');
        } finally {
            setProcessando(false);
        }
    };

    const isVencido = (conta: ContaReceber) => {
        return (conta.status === 'PENDENTE' || conta.status === 'PARCIAL')
            && new Date(conta.dataVencimento) < new Date();
    };

    const getProgressPercent = (conta: ContaReceber) => {
        if (!conta.valor || conta.valor === 0) return 0;
        return Math.round(((conta.valorPagoAcumulado ?? 0) / conta.valor) * 100);
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
                    <span className="w-2 h-10 bg-green-400"></span>
                    <div>
                        <h1 className="text-2xl font-black italic text-cyber-gold tracking-widest uppercase">
                            Contas a Receber
                        </h1>
                        <p className="text-cyber-gold/50 font-mono text-xs tracking-[0.3em]">
                            // GESTÃO DE ENTRADAS
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="hud-label">FILTRO:</span>
                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="bg-black/80 border border-cyber-gold/50 text-cyber-gold px-4 py-2 font-mono text-sm focus:outline-none focus:border-cyber-gold transition-colors"
                    >
                        <option value="PENDENTE">PENDENTES</option>
                        <option value="PARCIAL">PARCIAIS</option>
                        <option value="PAGO">RECEBIDAS</option>
                        <option value="BAIXADO">BAIXADAS</option>
                        <option value="TODOS">TODOS</option>
                    </select>
                </div>
            </header>

            {/* Info Box */}
            <div className="hud-card p-4 border-cyber-accent/30">
                <div className="flex items-center gap-3">
                    <span className="w-1 h-6 bg-cyber-accent"></span>
                    <p className="text-cyber-accent font-mono text-sm">
                        <strong>IMPORTANTE:</strong> Comissões são calculadas sobre valores <span className="text-cyber-gold font-bold">RECEBIDOS</span>, não apenas faturados. Valor BAIXADO não entra na comissão.
                    </p>
                </div>
            </div>

            {error && (
                <div className="hud-card p-4 border-cyber-error/50 text-cyber-error font-mono text-sm">
                    ⚠ {error}
                </div>
            )}

            {contas.length === 0 ? (
                <div className="hud-card top-brackets p-12 text-center">
                    <div className="static-overlay"></div>
                    <p className="text-cyber-gold/50 font-mono text-lg">[ NENHUMA CONTA ENCONTRADA ]</p>
                    <p className="text-cyber-gold/30 font-mono text-sm mt-2">Finalize ordens de serviço para gerar contas a receber</p>
                </div>
            ) : (
                <div className="hud-card bottom-brackets overflow-hidden">
                    <div className="static-overlay"></div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/60">
                                <tr>
                                    <th className="text-left p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">DESCRIÇÃO</th>
                                    <th className="text-left p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">VENCIMENTO</th>
                                    <th className="text-right p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">VALOR</th>
                                    <th className="text-center p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">PROGRESSO</th>
                                    <th className="text-center p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">STATUS</th>
                                    <th className="text-center p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contas.map((conta, index) => (
                                    <tr
                                        key={conta.id}
                                        className={`border-b border-cyber-gold/10 hover:bg-cyber-gold/5 transition-colors ${isVencido(conta) ? 'bg-cyber-error/10' : ''}`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="p-4">
                                            <div className="text-cyber-text">{conta.descricao}</div>
                                            <div className="text-cyber-gold/40 font-mono text-xs mt-1">
                                                {conta.tipo.replace(/_/g, ' ')}
                                            </div>
                                        </td>
                                        <td className={`p-4 font-mono text-sm ${isVencido(conta) ? 'text-cyber-error' : 'text-cyber-gold/60'}`}>
                                            {formatDate(conta.dataVencimento)}
                                            {isVencido(conta) && (
                                                <span className="ml-2 text-xs text-cyber-error">⚠ VENCIDO</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="text-green-400 font-bold font-mono text-lg">
                                                {formatCurrency(conta.valor)}
                                            </div>
                                            {(conta.valorPagoAcumulado > 0) && conta.status !== 'PAGO' && (
                                                <div className="text-cyber-gold/50 font-mono text-xs mt-1">
                                                    Pago: {formatCurrency(conta.valorPagoAcumulado)} | Saldo: {formatCurrency(conta.saldoRestante)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 justify-center">
                                                <div className="w-24 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${conta.status === 'BAIXADO' ? 'bg-gray-500' :
                                                            getProgressPercent(conta) === 100 ? 'bg-green-500' : 'bg-orange-500'
                                                            }`}
                                                        style={{ width: `${getProgressPercent(conta)}%` }}
                                                    />
                                                </div>
                                                <span className="text-cyber-gold/60 font-mono text-xs min-w-[35px]">
                                                    {getProgressPercent(conta)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 font-mono text-xs font-bold border ${STATUS_COLORS[conta.status] || ''}`}>
                                                {STATUS_LABELS[conta.status] || conta.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 justify-center flex-wrap">
                                                {/* Receber */}
                                                {(conta.status === 'PENDENTE' || conta.status === 'PARCIAL') && (
                                                    <button
                                                        onClick={() => openModalReceber(conta)}
                                                        className="px-3 py-1.5 bg-green-500/10 border border-green-500/50 text-green-400 font-mono text-xs font-bold hover:bg-green-500 hover:text-black transition-all"
                                                    >
                                                        RECEBER
                                                    </button>
                                                )}
                                                {/* Histórico */}
                                                {(conta.valorPagoAcumulado > 0) && (
                                                    <button
                                                        onClick={() => openHistorico(conta)}
                                                        className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/50 text-blue-400 font-mono text-xs font-bold hover:bg-blue-500 hover:text-black transition-all"
                                                    >
                                                        HIST
                                                    </button>
                                                )}
                                                {/* Baixar */}
                                                {(conta.status === 'PENDENTE' || conta.status === 'PARCIAL') && (
                                                    <button
                                                        onClick={() => { setModalBaixa(conta); setMotivoBaixa(''); }}
                                                        className="px-3 py-1.5 bg-gray-500/10 border border-gray-500/50 text-gray-400 font-mono text-xs font-bold hover:bg-gray-500 hover:text-black transition-all"
                                                    >
                                                        BAIXAR
                                                    </button>
                                                )}
                                                {/* Renegociar */}
                                                {(conta.status === 'PARCIAL') && (
                                                    <button
                                                        onClick={() => { setModalRenegociar(conta); setNovaDataVencimento(''); }}
                                                        className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/50 text-purple-400 font-mono text-xs font-bold hover:bg-purple-500 hover:text-black transition-all"
                                                    >
                                                        PRAZO
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ======== MODAL: RECEBIMENTO PARCIAL ======== */}
            {modalReceber && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setModalReceber(null)}>
                    <div className="hud-card top-brackets bottom-brackets p-8 min-w-[400px] max-w-[90%]" onClick={(e) => e.stopPropagation()}>
                        <div className="static-overlay"></div>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-1 h-8 bg-green-400"></span>
                            <h2 className="text-xl font-black text-cyber-gold tracking-wider">REGISTRAR RECEBIMENTO</h2>
                        </div>

                        <p className="text-cyber-text text-lg mb-2">{modalReceber.descricao}</p>

                        {/* Info badges */}
                        <div className="flex gap-4 mb-4 font-mono text-sm">
                            <div className="bg-black/50 border border-cyber-gold/20 px-3 py-1">
                                <span className="text-cyber-gold/50">Total: </span>
                                <span className="text-cyber-gold">{formatCurrency(modalReceber.valor)}</span>
                            </div>
                            {modalReceber.valorPagoAcumulado > 0 && (
                                <div className="bg-black/50 border border-green-500/20 px-3 py-1">
                                    <span className="text-green-400/50">Já pago: </span>
                                    <span className="text-green-400">{formatCurrency(modalReceber.valorPagoAcumulado)}</span>
                                </div>
                            )}
                        </div>

                        <p className="text-3xl font-black text-green-400 font-mono mb-6">
                            Saldo: {formatCurrency(modalReceber.saldoRestante ?? modalReceber.valor)}
                        </p>

                        {/* Valor */}
                        <div className="mb-4">
                            <span className="hud-label mb-2 block">VALOR A RECEBER</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={modalReceber.saldoRestante ?? modalReceber.valor}
                                value={valorRecebimento}
                                onChange={(e) => setValorRecebimento(e.target.value)}
                                className="w-full bg-black/80 border border-cyber-gold/50 text-cyber-gold px-4 py-3 font-mono text-lg focus:outline-none focus:border-cyber-gold transition-colors"
                            />
                        </div>

                        {/* Meio de Pagamento */}
                        <div className="mb-4">
                            <span className="hud-label mb-2 block">MEIO DE PAGAMENTO</span>
                            <select
                                value={meioPagamento}
                                onChange={(e) => setMeioPagamento(e.target.value as MeioPagamento)}
                                className="w-full bg-black/80 border border-cyber-gold/50 text-cyber-gold px-4 py-3 font-mono focus:outline-none focus:border-cyber-gold transition-colors"
                            >
                                {MEIOS_PAGAMENTO.map(mp => (
                                    <option key={mp.value} value={mp.value}>{mp.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Observação */}
                        <div className="mb-6">
                            <span className="hud-label mb-2 block">
                                OBSERVAÇÃO {parseFloat(valorRecebimento) < (modalReceber.saldoRestante ?? modalReceber.valor) && (
                                    <span className="text-orange-400">(OBRIGATÓRIA para parcial)</span>
                                )}
                            </span>
                            <textarea
                                value={observacaoRecebimento}
                                onChange={(e) => setObservacaoRecebimento(e.target.value)}
                                placeholder="Ex: Faltou o carro placa ABC-1234"
                                className="w-full bg-black/80 border border-cyber-gold/50 text-cyber-gold px-4 py-3 font-mono text-sm focus:outline-none focus:border-cyber-gold transition-colors resize-none h-20"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setModalReceber(null)}
                                className="flex-1 px-6 py-3 bg-black/50 border border-cyber-gold/30 text-cyber-gold/60 font-mono font-bold hover:border-cyber-gold/60 transition-colors"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleReceber}
                                disabled={processando}
                                className="flex-1 px-6 py-3 bg-green-500/20 border border-green-500/50 text-green-400 font-mono font-bold hover:bg-green-500 hover:text-black transition-all disabled:opacity-50"
                            >
                                {processando ? 'PROCESSANDO...' : 'CONFIRMAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======== MODAL: HISTÓRICO DE RECEBIMENTOS ======== */}
            {modalHistorico && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setModalHistorico(null)}>
                    <div className="hud-card top-brackets bottom-brackets p-8 min-w-[450px] max-w-[90%]" onClick={(e) => e.stopPropagation()}>
                        <div className="static-overlay"></div>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-1 h-8 bg-blue-400"></span>
                            <h2 className="text-xl font-black text-cyber-gold tracking-wider">HISTÓRICO DE RECEBIMENTOS</h2>
                        </div>

                        <p className="text-cyber-text mb-4">{modalHistorico.descricao}</p>

                        {loadingHistorico ? (
                            <p className="text-cyber-gold/50 font-mono text-sm animate-pulse">Carregando...</p>
                        ) : recebimentos.length === 0 ? (
                            <p className="text-cyber-gold/30 font-mono text-sm text-center py-8">Nenhum recebimento registrado</p>
                        ) : (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {recebimentos.map((r) => (
                                    <div key={r.id} className="flex items-center justify-between bg-black/40 border border-cyber-gold/10 px-4 py-3">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-green-400 font-bold font-mono">{formatCurrency(r.valorPago)}</span>
                                                <span className="text-cyber-gold/40 font-mono text-xs">{formatDate(r.dataPagamento)}</span>
                                                {r.meioPagamento && (
                                                    <span className="px-2 py-0.5 bg-cyber-gold/10 text-cyber-gold/60 font-mono text-xs border border-cyber-gold/20">
                                                        {r.meioPagamento}
                                                    </span>
                                                )}
                                            </div>
                                            {r.observacao && (
                                                <p className="text-cyber-gold/40 font-mono text-xs mt-1">{r.observacao}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleEstorno(r.id)}
                                            className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs hover:bg-red-500 hover:text-black transition-all"
                                            title="Estornar recebimento"
                                        >
                                            ↩ ESTORNAR
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setModalHistorico(null)}
                            className="w-full mt-6 px-6 py-3 bg-black/50 border border-cyber-gold/30 text-cyber-gold/60 font-mono font-bold hover:border-cyber-gold/60 transition-colors"
                        >
                            FECHAR
                        </button>
                    </div>
                </div>
            )}

            {/* ======== MODAL: BAIXAR SALDO (CALOTE/PERDÃO) ======== */}
            {modalBaixa && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setModalBaixa(null)}>
                    <div className="hud-card top-brackets bottom-brackets p-8 min-w-[400px] max-w-[90%]" onClick={(e) => e.stopPropagation()}>
                        <div className="static-overlay"></div>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-1 h-8 bg-gray-400"></span>
                            <h2 className="text-xl font-black text-cyber-gold tracking-wider">BAIXAR SALDO</h2>
                        </div>

                        <p className="text-cyber-text mb-2">{modalBaixa.descricao}</p>
                        <p className="text-2xl font-black text-gray-400 font-mono mb-4">
                            Saldo a baixar: {formatCurrency(modalBaixa.saldoRestante)}
                        </p>

                        <div className="bg-orange-500/10 border border-orange-500/30 p-3 mb-6">
                            <p className="text-orange-400 font-mono text-xs">
                                ⚠ O valor baixado <strong>NÃO</strong> entra no cálculo de comissão. Essa ação é irreversível.
                            </p>
                        </div>

                        <div className="mb-6">
                            <span className="hud-label mb-2 block">MOTIVO DA BAIXA (OBRIGATÓRIO)</span>
                            <textarea
                                value={motivoBaixa}
                                onChange={(e) => setMotivoBaixa(e.target.value)}
                                placeholder="Ex: Calote - Cliente não retornou / Desconto comercial / Acordo"
                                className="w-full bg-black/80 border border-cyber-gold/50 text-cyber-gold px-4 py-3 font-mono text-sm focus:outline-none focus:border-cyber-gold transition-colors resize-none h-20"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setModalBaixa(null)}
                                className="flex-1 px-6 py-3 bg-black/50 border border-cyber-gold/30 text-cyber-gold/60 font-mono font-bold hover:border-cyber-gold/60 transition-colors"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleBaixar}
                                disabled={processando || !motivoBaixa.trim()}
                                className="flex-1 px-6 py-3 bg-gray-500/20 border border-gray-500/50 text-gray-300 font-mono font-bold hover:bg-gray-500 hover:text-black transition-all disabled:opacity-50"
                            >
                                {processando ? 'PROCESSANDO...' : 'CONFIRMAR BAIXA'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======== MODAL: RENEGOCIAR PRAZO ======== */}
            {modalRenegociar && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setModalRenegociar(null)}>
                    <div className="hud-card top-brackets bottom-brackets p-8 min-w-[400px] max-w-[90%]" onClick={(e) => e.stopPropagation()}>
                        <div className="static-overlay"></div>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-1 h-8 bg-purple-400"></span>
                            <h2 className="text-xl font-black text-cyber-gold tracking-wider">RENEGOCIAR PRAZO</h2>
                        </div>

                        <p className="text-cyber-text mb-2">{modalRenegociar.descricao}</p>
                        <p className="text-cyber-gold/50 font-mono text-sm mb-6">
                            Vencimento atual: {formatDate(modalRenegociar.dataVencimento)}
                        </p>

                        <div className="mb-6">
                            <span className="hud-label mb-2 block">NOVA DATA DE VENCIMENTO</span>
                            <input
                                type="date"
                                value={novaDataVencimento}
                                onChange={(e) => setNovaDataVencimento(e.target.value)}
                                className="w-full bg-black/80 border border-cyber-gold/50 text-cyber-gold px-4 py-3 font-mono focus:outline-none focus:border-cyber-gold transition-colors"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setModalRenegociar(null)}
                                className="flex-1 px-6 py-3 bg-black/50 border border-cyber-gold/30 text-cyber-gold/60 font-mono font-bold hover:border-cyber-gold/60 transition-colors"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleRenegociar}
                                disabled={processando || !novaDataVencimento}
                                className="flex-1 px-6 py-3 bg-purple-500/20 border border-purple-500/50 text-purple-400 font-mono font-bold hover:bg-purple-500 hover:text-black transition-all disabled:opacity-50"
                            >
                                {processando ? 'PROCESSANDO...' : 'ATUALIZAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContasReceberPage;
