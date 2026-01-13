import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { relatorioService } from '../services/relatorioService';
import type { MesFaturamentoDTO } from '../types';
import { Download, TrendingUp, TrendingDown, Minus, Activity, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const RelatorioAnualPage: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isDownloading, setIsDownloading] = useState(false);

    const { data: relatorio, isLoading, isError } = useQuery({
        queryKey: ['relatorio-anual', selectedYear],
        queryFn: () => relatorioService.getRelatorioAnual(selectedYear),
    });

    const handleDownloadPdf = async () => {
        setIsDownloading(true);
        try {
            await relatorioService.downloadRelatorioAnualPdf(selectedYear);
        } catch (error) {
            console.error('Erro ao baixar PDF:', error);
            alert('Erro ao baixar o relatório PDF. Tente novamente.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Generate year options (current year and past 5 years)
    const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-white/10 rounded w-64"></div>
                    <div className="h-64 bg-white/10 rounded"></div>
                    <div className="h-96 bg-white/10 rounded"></div>
                </div>
            </div>
        );
    }

    if (isError || !relatorio) {
        return (
            <div className="p-8 space-y-6">
                <Link to="/relatorio" className="inline-flex items-center gap-2 text-cyber-gold/60 hover:text-cyber-gold transition-colors font-oxanium text-xs uppercase tracking-wider">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Central
                </Link>
                <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-lg">
                    <h3 className="text-red-400 font-bold mb-2">Erro ao Carregar Relatório</h3>
                    <p className="text-red-300 text-sm">
                        Não foi possível carregar o relatório anual. Verifique sua conexão e tente novamente.
                    </p>
                    <p className="text-xs text-red-500/50 mt-2 font-mono">
                        {isError ? 'Erro de comunicação com o servidor.' : 'Dados não encontrados.'}
                    </p>
                </div>
            </div>
        );
    }

    // Prepare chart data - Now safe to access relatorio
    const chartData = relatorio.meses?.map((mes: MesFaturamentoDTO) => ({
        mes: mes.nomeMes,
        atual: mes.faturamentoAtual,
        anterior: mes.faturamentoAnoAnterior,
    })) || [];

    const isGrowth = relatorio.crescimentoAnual > 0;
    const isFlat = relatorio.crescimentoAnual === 0;

    return (
        <div className="p-8 space-y-6">
            <Link to="/relatorio" className="inline-flex items-center gap-2 text-cyber-gold/60 hover:text-cyber-gold transition-colors font-oxanium text-xs uppercase tracking-wider">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Central
            </Link>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-orbitron text-white font-bold mb-2">
                        Relatório Anual
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Comparação Year-over-Year de Faturamento
                    </p>
                </div>

                <div className="flex gap-3 items-center">
                    {/* Year Selector */}
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-black/60 border border-white/20 text-white px-4 py-2 rounded font-oxanium"
                    >
                        {yearOptions.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    {/* Download PDF Button */}
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="bg-cyber-gold text-black px-4 py-2 rounded font-oxanium font-bold hover:bg-yellow-400 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        {isDownloading ? 'Baixando...' : 'Baixar PDF'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Year Total */}
                <div className="bg-black/40 border border-white/10 p-6 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-gold"></div>
                    <h3 className="text-gray-400 text-sm font-oxanium mb-2 uppercase tracking-wide">
                        Faturamento Total {selectedYear}
                    </h3>
                    <div className="text-3xl text-cyber-gold font-bold font-orbitron">
                        {relatorio.faturamentoTotalAno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                </div>

                {/* Previous Year Total */}
                <div className="bg-black/40 border border-white/10 p-6 rounded-lg">
                    <h3 className="text-gray-400 text-sm font-oxanium mb-2 uppercase tracking-wide">
                        Faturamento Total {selectedYear - 1}
                    </h3>
                    <div className="text-3xl text-gray-300 font-bold font-orbitron">
                        {relatorio.faturamentoTotalAnoAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                </div>

                {/* Growth */}
                <div className="bg-black/40 border border-white/10 p-6 rounded-lg">
                    <h3 className="text-gray-400 text-sm font-oxanium mb-2 uppercase tracking-wide">
                        Crescimento Anual
                    </h3>
                    <div className="flex items-center gap-2">
                        {isGrowth ? (
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        ) : isFlat ? (
                            <Minus className="w-6 h-6 text-gray-400" />
                        ) : (
                            <TrendingDown className="w-6 h-6 text-red-400" />
                        )}
                        <span className={`text-3xl font-bold font-orbitron ${isGrowth ? 'text-green-400' : isFlat ? 'text-gray-400' : 'text-red-400'
                            }`}>
                            {isGrowth ? '+' : ''}{(relatorio.crescimentoAnual || 0).toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-black/40 border border-white/10 p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-cyber-gold" />
                    <h2 className="text-xl font-orbitron text-white font-bold">
                        Comparação Mensal
                    </h2>
                </div>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="mes"
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                axisLine={{ stroke: '#4B5563' }}
                            />
                            <YAxis
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                axisLine={{ stroke: '#4B5563' }}
                                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#000',
                                    border: '1px solid #FFD700',
                                    borderRadius: '4px',
                                }}
                                labelStyle={{ color: '#FFD700' }}
                                formatter={(value: number | undefined) =>
                                    value !== undefined
                                        ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                        : 'N/A'
                                }
                            />
                            <Legend
                                wrapperStyle={{ color: '#FFF', fontSize: 12 }}
                                iconType="line"
                            />
                            <Line
                                type="monotone"
                                dataKey="atual"
                                name={`${selectedYear}`}
                                stroke="#FFD700"
                                strokeWidth={3}
                                dot={{ fill: '#FFD700', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="anterior"
                                name={`${selectedYear - 1}`}
                                stroke="#6B7280"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ fill: '#6B7280', r: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Table */}
            <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-orbitron text-white font-bold">
                        Detalhamento Mensal
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr className="text-xs text-gray-400 font-oxanium uppercase">
                                <th className="py-3 px-4 text-left">Mês</th>
                                <th className="py-3 px-4 text-right">{selectedYear}</th>
                                <th className="py-3 px-4 text-right">{selectedYear - 1}</th>
                                <th className="py-3 px-4 text-right">Variação (R$)</th>
                                <th className="py-3 px-4 text-right">Variação (%)</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-white">
                            {(relatorio.meses || []).map((mes: MesFaturamentoDTO) => {
                                const isPositive = mes.diferencaPercentual > 0;
                                const isNeutral = mes.diferencaPercentual === 0;

                                return (
                                    <tr key={mes.mes} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 px-4 font-oxanium">{mes.nomeMes}</td>
                                        <td className="py-3 px-4 text-right font-mono text-cyber-gold">
                                            {mes.faturamentoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-gray-400">
                                            {mes.faturamentoAnoAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className={`py-3 px-4 text-right font-mono ${isPositive ? 'text-green-400' : isNeutral ? 'text-gray-400' : 'text-red-400'
                                            }`}>
                                            {isPositive ? '+' : ''}
                                            {mes.diferencaAbsoluta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${isPositive ? 'bg-green-500/20 text-green-400' :
                                                isNeutral ? 'bg-gray-500/20 text-gray-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {isPositive ? (
                                                    <TrendingUp className="w-3 h-3" />
                                                ) : isNeutral ? (
                                                    <Minus className="w-3 h-3" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3" />
                                                )}
                                                <span className="text-xs font-bold">
                                                    {isPositive ? '+' : ''}{mes.diferencaPercentual.toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="bg-white/5 border-t-2 border-cyber-gold/50">
                            <tr className="text-white font-bold">
                                <td className="py-4 px-4 font-oxanium">TOTAL ANUAL</td>
                                <td className="py-4 px-4 text-right font-mono text-cyber-gold text-lg">
                                    {relatorio.faturamentoTotalAno.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="py-4 px-4 text-right font-mono text-gray-400">
                                    {relatorio.faturamentoTotalAnoAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className={`py-4 px-4 text-right font-mono ${isGrowth ? 'text-green-400' : isFlat ? 'text-gray-400' : 'text-red-400'
                                    }`}>
                                    {isGrowth ? '+' : ''}
                                    {(relatorio.faturamentoTotalAno - relatorio.faturamentoTotalAnoAnterior)
                                        .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded ${isGrowth ? 'bg-green-500/20 text-green-400' :
                                        isFlat ? 'bg-gray-500/20 text-gray-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {isGrowth ? (
                                            <TrendingUp className="w-4 h-4" />
                                        ) : isFlat ? (
                                            <Minus className="w-4 h-4" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4" />
                                        )}
                                        <span className="text-sm font-bold">
                                            {isGrowth ? '+' : ''}{(relatorio.crescimentoAnual || 0).toFixed(2)}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};
