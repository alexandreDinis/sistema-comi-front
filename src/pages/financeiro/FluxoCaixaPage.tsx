import { useEffect, useState } from 'react';
import { financeiroService } from '../../services/financeiroService';
import type { FluxoCaixa } from '../../types';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const FluxoCaixaPage = () => {
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [ano, setAno] = useState(new Date().getFullYear());
    const [dados, setDados] = useState<FluxoCaixa | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [mes, ano]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await financeiroService.getFluxoCaixa(mes, ano);
            setDados(response);
            setError(null);
        } catch (err) {
            console.error('Erro ao carregar fluxo de caixa:', err);
            setError('Erro ao carregar dados do período.');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setLoadingPdf(true);
            await financeiroService.downloadFluxoCaixaPdf(mes, ano);
        } catch (err) {
            console.error('Erro ao exportar PDF:', err);
            // alert('Erro ao gerar PDF. Tente novamente.'); // Optional: using console for now as per design preference
        } finally {
            setLoadingPdf(false);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto animate-fadeIn space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Link to="/relatorio" className="inline-flex items-center gap-2 text-cyber-gold/60 hover:text-cyber-gold transition-colors font-oxanium text-xs mb-2 uppercase tracking-wider">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Relatórios
                    </Link>
                    <h1 className="text-3xl font-black italic text-cyber-gold tracking-widest uppercase flex items-center gap-3">
                        <TrendingUp className="w-8 h-8" />
                        Fluxo de Caixa
                    </h1>
                    <p className="text-cyber-gold/50 font-mono text-sm tracking-wider mt-1">
                        // ANÁLISE DE ENTRADAS E SAÍDAS
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-black/60 p-2 rounded border border-cyber-gold/20">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyber-gold" />
                        <select
                            value={mes}
                            onChange={(e) => setMes(Number(e.target.value))}
                            className="bg-transparent text-cyber-gold font-mono text-sm focus:outline-none cursor-pointer"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                <option key={m} value={m} className="bg-black text-cyber-gold">
                                    {new Date(0, m - 1).toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-px h-6 bg-cyber-gold/20"></div>
                    <select
                        value={ano}
                        onChange={(e) => setAno(Number(e.target.value))}
                        className="bg-transparent text-cyber-gold font-mono text-sm focus:outline-none cursor-pointer"
                    >
                        {[2024, 2025, 2026, 2027].map((y) => (
                            <option key={y} value={y} className="bg-black text-cyber-gold">{y}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleExport}
                        disabled={loadingPdf || loading}
                        className="ml-4 hud-button flex items-center gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingPdf ? (
                            <>
                                <div className="animate-spin h-3 w-3 border-2 border-cyber-gold border-t-transparent rounded-full" />
                                GERANDO PDF...
                            </>
                        ) : (
                            <>
                                EXPORTAR PDF
                                <TrendingUp className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 border-4 border-cyber-gold/30 border-t-cyber-gold rounded-full animate-spin"></div>
                    <p className="text-cyber-gold font-mono text-sm tracking-widest animate-pulse">PROCESSANDO...</p>
                </div>
            ) : error ? (
                <div className="hud-card p-8 border-cyber-error/50 text-cyber-error text-center font-mono">
                    ⚠️ {error}
                </div>
            ) : dados ? (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Entradas */}
                        <div className="hud-card top-brackets p-6 group hover:border-green-500/50 transition-all">
                            <div className="static-overlay"></div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="hud-label text-green-400">// ENTRADAS</span>
                                <TrendingUp className="text-green-400 opacity-50 w-6 h-6" />
                            </div>
                            <p className="text-4xl font-black text-green-400">
                                {formatCurrency(dados.entradas)}
                            </p>
                        </div>

                        {/* Saídas */}
                        <div className="hud-card top-brackets p-6 group hover:border-cyber-error/50 transition-all">
                            <div className="static-overlay"></div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="hud-label text-cyber-error">// SAÍDAS</span>
                                <TrendingDown className="text-cyber-error opacity-50 w-6 h-6" />
                            </div>
                            <p className="text-4xl font-black text-cyber-error">
                                {formatCurrency(dados.saidas)}
                            </p>
                        </div>

                        {/* Saldo Operacional */}
                        <div className={`hud-card top-brackets p-6 group transition-all ${dados.saldo >= 0 ? 'hover:border-cyber-gold/70' : 'hover:border-cyber-error/50'}`}>
                            <div className="static-overlay"></div>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`hud-label ${dados.saldo >= 0 ? 'text-cyber-gold' : 'text-cyber-error'}`}>// SALDO (MÊS)</span>
                                <DollarSign className={`${dados.saldo >= 0 ? 'text-cyber-gold' : 'text-cyber-error'} opacity-50 w-6 h-6`} />
                            </div>
                            <p className={`text-4xl font-black ${dados.saldo >= 0 ? 'text-cyber-gold' : 'text-cyber-error'}`}>
                                {formatCurrency(dados.saldo)}
                            </p>
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="bg-black/40 border border-cyber-gold/20 p-4 rounded text-center">
                        <p className="text-cyber-gold/60 text-sm font-mono">
                            ℹ️ O Relatório PDF inclui o <strong>Saldo Inicial</strong> e o detalhamento completo de todas as transações.
                        </p>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default FluxoCaixaPage;
