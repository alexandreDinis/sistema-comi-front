import { useEffect, useState } from 'react';
import { financeiroService } from '../../services/financeiroService';
import type { ContaPagar, MeioPagamento } from '../../types';
import { useQueryClient } from '@tanstack/react-query';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
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

const ContasPagarPage = () => {
    const queryClient = useQueryClient();
    const [contas, setContas] = useState<ContaPagar[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtroStatus, setFiltroStatus] = useState<string>('PENDENTE');
    const [modalPagar, setModalPagar] = useState<ContaPagar | null>(null);
    const [meioPagamento, setMeioPagamento] = useState<MeioPagamento>('PIX');
    const [processando, setProcessando] = useState(false);

    useEffect(() => {
        loadContas();
    }, [filtroStatus]);

    const loadContas = async () => {
        try {
            setLoading(true);
            const data = await financeiroService.listarContasPagar(filtroStatus);
            setContas(data);
        } catch (err) {
            console.error('Erro ao carregar contas:', err);
            setError('Erro ao carregar contas a pagar');
        } finally {
            setLoading(false);
        }
    };

    const handlePagar = async () => {
        if (!modalPagar) return;

        try {
            setProcessando(true);
            await financeiroService.pagarConta(modalPagar.id, {
                meioPagamento,
                dataPagamento: new Date().toISOString().split('T')[0]
            });

            // Invalidate Report Cache to update Cash Flow immediately
            queryClient.invalidateQueries({ queryKey: ['relatorio'] });
            queryClient.invalidateQueries({ queryKey: ['despesas'] });
            queryClient.invalidateQueries({ queryKey: ['financeiro'] });
            queryClient.invalidateQueries({ queryKey: ['faturas'] });

            setModalPagar(null);
            loadContas();
        } catch (err) {
            console.error('Erro ao pagar conta:', err);
            alert('Erro ao registrar pagamento');
        } finally {
            setProcessando(false);
        }
    };

    const isVencido = (dataVencimento: string) => {
        return new Date(dataVencimento + 'T12:00:00') < new Date();
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-cyber-gold/30 border-t-cyber-gold rounded-full animate-spin"></div>
                <p className="text-cyber-gold font-mono text-sm tracking-widest animate-pulse">CARREGANDO...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] py-6 space-y-6 animate-fadeIn">
            {/* Header */}
            <header className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-10 bg-cyber-error"></span>
                    <div>
                        <h1 className="text-2xl font-black italic text-cyber-gold tracking-widest uppercase">
                            Contas a Pagar
                        </h1>
                        <p className="text-cyber-gold/50 font-mono text-xs tracking-[0.3em]">
                            // GESTÃO DE SAÍDAS
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-black/80 border border-cyber-gold/50 px-2 py-1 rounded">
                        <select
                            value={new Date().getMonth() + 1}
                            onChange={(e) => {
                                const mes = parseInt(e.target.value);
                                const ano = new Date().getFullYear(); // Simplification: Current Year
                                financeiroService.downloadContasPagarPdf(mes, ano);
                            }}
                            className="bg-transparent text-cyber-gold font-mono text-xs focus:outline-none"
                        >
                            <option value="" disabled selected>PDF MENSAL</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(0, m - 1).toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <span className="hud-label">FILTRO:</span>
                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                        className="bg-black/80 border border-cyber-gold/50 text-cyber-gold px-4 py-2 font-mono text-sm focus:outline-none focus:border-cyber-gold transition-colors"
                    >
                        <option value="PENDENTE">PENDENTES</option>
                        <option value="PAGO">PAGAS</option>
                        <option value="VENCIDO">VENCIDAS</option>
                    </select>
                </div>
            </header>

            {error && (
                <div className="hud-card p-4 border-cyber-error/50 text-cyber-error font-mono text-sm">
                    ⚠ {error}
                </div>
            )}

            {contas.length === 0 ? (
                <div className="hud-card top-brackets p-12 text-center">
                    <div className="static-overlay"></div>
                    <p className="text-cyber-gold/50 font-mono text-lg">[ NENHUMA CONTA ENCONTRADA ]</p>
                    <p className="text-cyber-gold/30 font-mono text-sm mt-2">Altere os filtros ou aguarde novas despesas</p>
                </div>
            ) : (
                <div className="hud-card bottom-brackets overflow-hidden">
                    <div className="static-overlay"></div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/60">
                                <tr>
                                    <th className="text-left p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">DESCRIÇÃO</th>
                                    <th className="text-left p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">TIPO</th>
                                    <th className="text-left p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">COMPETÊNCIA</th>
                                    <th className="text-left p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">VENCIMENTO</th>
                                    <th className="text-right p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">VALOR</th>
                                    <th className="text-center p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">STATUS</th>
                                    <th className="text-center p-4 text-cyber-gold/70 font-mono text-xs tracking-wider">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contas.map((conta, index) => (
                                    <tr
                                        key={conta.id}
                                        className={`border-b border-cyber-gold/10 hover:bg-cyber-gold/5 transition-colors ${isVencido(conta.dataVencimento) && conta.status === 'PENDENTE' ? 'bg-cyber-error/10' : ''
                                            }`}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="p-4 text-cyber-text">{conta.descricao}</td>
                                        <td className="p-4">
                                            <span className="hud-tag">{conta.tipo.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="p-4 text-cyber-gold/60 font-mono text-sm">
                                            {new Date(conta.dataCompetencia + 'T12:00:00').toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className={`p-4 font-mono text-sm ${isVencido(conta.dataVencimento) && conta.status === 'PENDENTE'
                                            ? 'text-cyber-error'
                                            : 'text-cyber-gold/60'
                                            }`}>
                                            {new Date(conta.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="p-4 text-right text-cyber-error font-bold font-mono text-lg">
                                            {formatCurrency(conta.valor)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 font-mono text-xs font-bold ${conta.status === 'PENDENTE'
                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                : conta.status === 'PAGO'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                }`}>
                                                {conta.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {conta.status === 'PENDENTE' && (
                                                <button
                                                    onClick={() => setModalPagar(conta)}
                                                    className="px-4 py-2 bg-cyber-gold/10 border border-cyber-gold/50 text-cyber-gold font-mono text-xs font-bold hover:bg-cyber-gold hover:text-black transition-all"
                                                >
                                                    PAGAR
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Pagamento */}
            {modalPagar && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setModalPagar(null)}>
                    <div className="hud-card top-brackets bottom-brackets p-8 min-w-[400px] max-w-[90%]" onClick={(e) => e.stopPropagation()}>
                        <div className="static-overlay"></div>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-1 h-8 bg-cyber-gold"></span>
                            <h2 className="text-xl font-black text-cyber-gold tracking-wider">REGISTRAR PAGAMENTO</h2>
                        </div>

                        <p className="text-cyber-text text-lg mb-2">{modalPagar.descricao}</p>
                        <p className="text-4xl font-black text-cyber-error font-mono mb-6">
                            {formatCurrency(modalPagar.valor)}
                        </p>

                        <div className="mb-6">
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

                        <div className="flex gap-4">
                            <button
                                onClick={() => setModalPagar(null)}
                                className="flex-1 px-6 py-3 bg-black/50 border border-cyber-gold/30 text-cyber-gold/60 font-mono font-bold hover:border-cyber-gold/60 transition-colors"
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handlePagar}
                                disabled={processando}
                                className="flex-1 hud-button disabled:opacity-50"
                            >
                                {processando ? 'PROCESSANDO...' : 'CONFIRMAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContasPagarPage;
