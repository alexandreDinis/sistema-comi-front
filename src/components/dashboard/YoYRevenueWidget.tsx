import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { comissaoService } from '../../services/comissaoService';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const YoYRevenueWidget: React.FC = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    console.log('[YoYRevenueWidget] Rendering with:', { currentYear, currentMonth });

    const { data: yoyData, isLoading, isError } = useQuery({
        queryKey: ['yoy-comparison', currentYear, currentMonth],
        queryFn: () => comissaoService.obterComparacaoYoY(currentYear, currentMonth),
    });

    console.log('[YoYRevenueWidget] Query state:', { isLoading, isError, hasData: !!yoyData });

    if (yoyData) {
        console.log('[YoYRevenueWidget] Data received:', yoyData);
    }

    if (isLoading) {
        console.log('[YoYRevenueWidget] Showing loading state');
        return (
            <div className="bg-black/40 border border-white/10 p-6 rounded-lg animate-pulse">
                <div className="h-6 bg-white/10 rounded w-48 mb-4"></div>
                <div className="h-20 bg-white/10 rounded"></div>
            </div>
        );
    }

    if (isError || !yoyData) {
        console.error('[YoYRevenueWidget] Error state:', { isError, hasData: !!yoyData });
        return (
            <div className="bg-black/40 border border-red-500/20 p-6 rounded-lg">
                <div className="text-red-400 text-sm">Erro ao carregar comparação YoY</div>
            </div>
        );
    }

    const chartData = [
        {
            name: `${currentYear - 1}`,
            valor: yoyData.temDadosAnoAnterior ? yoyData.faturamentoAnoAnterior : 0,
            ano: currentYear - 1,
        },
        {
            name: `${currentYear}`,
            valor: yoyData.faturamentoAtual,
            ano: currentYear,
        },
    ];

    const isPositive = yoyData.diferencaPercentual > 0;
    const isNeutral = yoyData.diferencaPercentual === 0;

    return (
        <div className="bg-black/40 border border-white/10 p-6 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-cyber-gold"></div>

            {/* Header */}
            <h3 className="text-gray-400 text-sm font-oxanium mb-2 uppercase tracking-wide">
                Faturamento do Mês vs Ano Anterior
            </h3>

            {/* Main Value */}
            <div className="mb-4">
                <div className="text-3xl text-cyber-gold font-bold font-orbitron">
                    {yoyData.faturamentoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    Mês {currentMonth.toString().padStart(2, '0')}/{currentYear}
                </div>
            </div>

            {/* YoY Comparison */}
            {yoyData.temDadosAnoAnterior ? (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        {isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : isNeutral ? (
                            <Minus className="w-4 h-4 text-gray-400" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm font-bold ${isPositive ? 'text-green-400' : isNeutral ? 'text-gray-400' : 'text-red-400'
                            }`}>
                            {isPositive ? '+' : ''}{yoyData.diferencaPercentual.toFixed(2)}%
                        </span>
                        <span className="text-xs text-gray-500">vs {currentYear - 1}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        Diferença: {yoyData.diferencaAbsoluta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                    <div className="text-xs text-gray-500">
                        Ano anterior: {yoyData.faturamentoAnoAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                </div>
            ) : (
                <div className="mb-4 text-xs text-gray-500 italic">
                    Sem dados do ano anterior para comparação
                </div>
            )}

            {/* Bar Chart */}
            {yoyData.temDadosAnoAnterior && (
                <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                axisLine={{ stroke: '#374151' }}
                            />
                            <YAxis
                                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                axisLine={{ stroke: '#374151' }}
                                tickFormatter={(value: any) => value != null ? `R$ ${(value / 1000).toFixed(0)}k` : ''}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#000',
                                    border: '1px solid #FFD700',
                                    borderRadius: '4px',
                                }}
                                labelStyle={{ color: '#FFD700' }}
                                itemStyle={{ color: '#FFF' }}
                                formatter={(value: number | undefined) => [
                                    value !== undefined ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A',
                                    'Faturamento',
                                ]}
                            />
                            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.ano === currentYear ? '#FFD700' : '#4B5563'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};
