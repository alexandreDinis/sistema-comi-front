import { useEffect, useState } from 'react';
import { financeiroService } from '../../services/financeiroService';
import type { ResumoFinanceiro, FluxoCaixa, ContaPagar, ContaReceber } from '../../types';
import { AlertTriangle, Wallet, PiggyBank } from 'lucide-react';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const FinanceiroDashboard = () => {
    const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
    const [fluxoCaixa, setFluxoCaixa] = useState<FluxoCaixa | null>(null);
    const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
    const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mesAtual] = useState(new Date().getMonth() + 1);
    const [anoAtual] = useState(new Date().getFullYear());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [resumoData, fluxoData, contasPagarData, contasReceberData] = await Promise.all([
                financeiroService.getResumo(),
                financeiroService.getFluxoCaixa(mesAtual, anoAtual),
                financeiroService.listarContasPagar('PENDENTE'),
                financeiroService.listarContasReceber('PENDENTE')
            ]);

            setResumo(resumoData);
            setFluxoCaixa(fluxoData);
            setContasPagar(contasPagarData);
            setContasReceber(contasReceberData);
        } catch (err) {
            console.error('Erro ao carregar dados financeiros:', err);
            setError('Erro ao carregar dados financeiros');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-cyber-gold/30 border-t-cyber-gold rounded-full animate-spin"></div>
                <p className="text-cyber-gold font-mono text-sm tracking-widest animate-pulse">CARREGANDO DADOS...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="text-cyber-error">
                    <AlertTriangle size={64} />
                </div>
                <p className="text-cyber-error font-mono">{error}</p>
                <button onClick={loadData} className="hud-button mt-4">
                    TENTAR NOVAMENTE
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] py-6 space-y-8 animate-fadeIn">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-10 bg-cyber-gold"></span>
                    <div>
                        <h1 className="text-3xl font-black italic text-cyber-gold tracking-widest uppercase">
                            Central Financeira
                        </h1>
                        <p className="text-cyber-gold/50 font-mono text-xs tracking-[0.3em] uppercase">
                            // CONTROLE TOTAL DO CAIXA
                        </p>
                    </div>
                </div>
                <a
                    href="/financeiro/distribuicao-lucros"
                    className="hud-button flex items-center gap-2"
                >
                    💰 Distribuição de Lucros
                </a>
            </header>

            {/* Resumo Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total a Pagar */}
                <div className="hud-card top-brackets p-6 group hover:border-cyber-error/50 transition-all">
                    <div className="static-overlay"></div>
                    <span className="hud-label">// CONTAS A PAGAR</span>
                    <p className="text-4xl font-black text-cyber-error mt-2">
                        {formatCurrency(resumo?.totalAPagar || 0)}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="w-2 h-2 bg-cyber-error rounded-full animate-pulse"></span>
                        <span className="text-cyber-gold/60 text-xs font-mono">
                            {resumo?.contasVencendoProximos7Dias || 0} vencem em 7 dias
                        </span>
                    </div>
                </div>

                {/* Total a Receber */}
                <div className="hud-card top-brackets p-6 group hover:border-green-500/50 transition-all">
                    <div className="static-overlay"></div>
                    <span className="hud-label">// CONTAS A RECEBER</span>
                    <p className="text-4xl font-black text-green-400 mt-2">
                        {formatCurrency(resumo?.totalAReceber || 0)}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-cyber-gold/60 text-xs font-mono">
                            {resumo?.recebimentosVencendoProximos7Dias || 0} vencem em 7 dias
                        </span>
                    </div>
                </div>

                {/* Saldo Projetado */}
                <div className={`hud-card top-brackets p-6 group transition-all ${(resumo?.saldoProjetado || 0) >= 0 ? 'hover:border-cyber-gold/70' : 'hover:border-cyber-error/50'
                    }`}>
                    <div className="static-overlay"></div>
                    <span className="hud-label">// SALDO PROJETADO</span>
                    <p className={`text-4xl font-black mt-2 ${(resumo?.saldoProjetado || 0) >= 0 ? 'text-cyber-gold' : 'text-cyber-error'
                        }`}>
                        {formatCurrency(resumo?.saldoProjetado || 0)}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${(resumo?.saldoProjetado || 0) >= 0 ? 'bg-cyber-gold' : 'bg-cyber-error'
                            }`}></span>
                        <span className="text-cyber-gold/60 text-xs font-mono">RECEBER - PAGAR</span>
                    </div>
                </div>
            </section>

            {/* Fluxo de Caixa */}
            {fluxoCaixa && (
                <section className="hud-card bottom-brackets p-6">
                    <div className="static-overlay"></div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="w-1 h-6 bg-cyber-gold"></span>
                            <h2 className="text-xl font-black text-cyber-gold tracking-wider">
                                FLUXO DE CAIXA
                            </h2>
                        </div>
                        <span className="hud-tag">{fluxoCaixa.periodo}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                        <div className="text-center">
                            <span className="hud-label block text-center">ENTRADAS</span>
                            <p className="text-3xl font-black text-green-400 mt-2">
                                {formatCurrency(fluxoCaixa.entradas)}
                            </p>
                        </div>
                        <div className="text-center border-x border-cyber-gold/20">
                            <span className="hud-label block text-center">SAÍDAS</span>
                            <p className="text-3xl font-black text-cyber-error mt-2">
                                {formatCurrency(fluxoCaixa.saidas)}
                            </p>
                        </div>
                        <div className="text-center">
                            <span className="hud-label block text-center">SALDO</span>
                            <p className={`text-3xl font-black mt-2 ${fluxoCaixa.saldo >= 0 ? 'text-cyber-gold' : 'text-cyber-error'
                                }`}>
                                {formatCurrency(fluxoCaixa.saldo)}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Grid de Listas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contas a Pagar */}
                <section className="hud-card top-brackets p-6">
                    <div className="static-overlay"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Wallet className="text-cyber-gold w-6 h-6" />
                            <h3 className="text-lg font-black text-cyber-gold tracking-wide">A PAGAR</h3>
                        </div>
                        <a href="/financeiro/contas-pagar" className="text-cyber-gold/60 text-xs font-mono hover:text-cyber-gold transition-colors">
                            VER TODAS →
                        </a>
                    </div>

                    {contasPagar.length === 0 ? (
                        <div className="text-center py-8 text-cyber-gold/40 font-mono">
                            <p>[ NENHUMA CONTA PENDENTE ]</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {(contasPagar || []).slice(0, 5).map(conta => (
                                <div key={conta.id} className={`flex justify-between items-center p-3 bg-black/50 border-l-4 ${new Date(conta.dataVencimento) < new Date() ? 'border-cyber-error' : 'border-cyber-gold/30'
                                    }`}>
                                    <div>
                                        <p className="text-sm text-cyber-text">{conta.descricao}</p>
                                        <p className="text-xs text-cyber-gold/50 font-mono">
                                            {new Date(conta.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <span className="text-cyber-error font-bold font-mono">
                                        {formatCurrency(conta.valor)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Contas a Receber */}
                <section className="hud-card top-brackets p-6">
                    <div className="static-overlay"></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <PiggyBank className="text-cyber-gold w-6 h-6" />
                            <h3 className="text-lg font-black text-cyber-gold tracking-wide">A RECEBER</h3>
                        </div>
                        <a href="/financeiro/contas-receber" className="text-cyber-gold/60 text-xs font-mono hover:text-cyber-gold transition-colors">
                            VER TODAS →
                        </a>
                    </div>

                    {contasReceber.length === 0 ? (
                        <div className="text-center py-8 text-cyber-gold/40 font-mono">
                            <p>[ NENHUMA CONTA PENDENTE ]</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {(contasReceber || []).slice(0, 5).map(conta => (
                                <div key={conta.id} className={`flex justify-between items-center p-3 bg-black/50 border-l-4 ${new Date(conta.dataVencimento) < new Date() ? 'border-cyber-error' : 'border-green-500/50'
                                    }`}>
                                    <div>
                                        <p className="text-sm text-cyber-text">{conta.descricao}</p>
                                        <p className="text-xs text-cyber-gold/50 font-mono">
                                            {new Date(conta.dataVencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <span className="text-green-400 font-bold font-mono">
                                        {formatCurrency(conta.valor)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default FinanceiroDashboard;
