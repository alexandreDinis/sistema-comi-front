import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { relatorioService } from '../../services/relatorioService';
import { Users, Filter } from 'lucide-react';
import { formatarMoeda } from '../../utils/formatters';

interface ClientRankingWidgetProps {
    selectedAno?: number;
    selectedMes?: number;
}

export const ClientRankingWidget: React.FC<ClientRankingWidgetProps> = ({ selectedAno, selectedMes }) => {
    const [filterType, setFilterType] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');

    // Setup date defaults
    const currentDate = new Date();
    const targetYear = selectedAno || currentDate.getFullYear();
    const targetMonth = selectedMes || (currentDate.getMonth() + 1);

    const { data: rankingData, isLoading } = useQuery({
        queryKey: ['ranking-clientes', filterType, targetYear, targetMonth],
        queryFn: () => relatorioService.getRankingClientes(
            targetYear,
            filterType === 'MONTHLY' ? targetMonth : undefined
        ),
    });

    return (
        <div className="bg-black/40 border border-white/10 p-6 rounded-lg relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-1 h-full bg-cyber-gold"></div>

            {/* Header with Filter Toggle */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-gray-400 text-sm font-oxanium uppercase tracking-wide flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyber-gold" />
                        Ranking de Clientes
                    </h3>
                    <div className="text-2xl text-white font-bold font-orbitron mt-1">
                        TOP CLIENTES
                    </div>
                </div>

                <div className="flex bg-black/50 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setFilterType('MONTHLY')}
                        className={`px-3 py-1 rounded text-xs font-oxanium transition-all ${filterType === 'MONTHLY'
                            ? 'bg-cyber-gold text-black font-bold'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        MÊS
                    </button>
                    <button
                        onClick={() => setFilterType('ANNUAL')}
                        className={`px-3 py-1 rounded text-xs font-oxanium transition-all ${filterType === 'ANNUAL'
                            ? 'bg-cyber-gold text-black font-bold'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        ANO
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                {isLoading ? (
                    <div className="space-y-3 animate-pulse">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-12 bg-white/5 rounded border border-white/5 mx-1" />
                        ))}
                    </div>
                ) : !rankingData || rankingData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                        <Filter className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-sm font-oxanium">Nenhum dado encontrado</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs text-gray-400 font-oxanium border-b border-white/10">
                                <th className="py-2 pl-2">RANK</th>
                                <th className="py-2">CLIENTE</th>
                                <th className="py-2 text-center">OS</th>
                                <th className="py-2 text-right pr-2">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {rankingData.map((cliente, index) => (
                                <tr
                                    key={cliente.clienteId}
                                    className={`
                                        border-b border-white/5 hover:bg-white/5 transition-colors
                                        ${index === 0 ? 'bg-cyber-gold/10' : ''}
                                        ${index === 1 ? 'bg-white/5' : ''}
                                        ${index === 2 ? 'bg-white/5' : ''}
                                    `}
                                >
                                    <td className="py-3 pl-2 font-mono text-gray-500 w-12">
                                        {index + 1 < 4 ? (
                                            <span className={`
                                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                                ${index === 0 ? 'bg-yellow-500 text-black' : ''}
                                                ${index === 1 ? 'bg-gray-400 text-black' : ''}
                                                ${index === 2 ? 'bg-orange-700 text-white' : ''}
                                             `}>
                                                {index + 1}
                                            </span>
                                        ) : (
                                            <span className="pl-1">#{index + 1}</span>
                                        )}
                                    </td>
                                    <td className="py-3 font-medium text-white truncate max-w-[150px]" title={cliente.nomeFantasia}>
                                        {cliente.nomeFantasia}
                                        {index === 0 && <span className="ml-2 text-xs text-yellow-500 font-oxanium">👑 VIP</span>}
                                    </td>
                                    <td className="py-3 text-center text-gray-400 font-mono">
                                        {cliente.quantidadeOS}
                                    </td>
                                    <td className="py-3 text-right pr-2 font-orbitron text-cyber-gold">
                                        {formatarMoeda(cliente.valorTotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-2 border-t border-white/10 flex justify-between items-center text-xs text-gray-500 font-oxanium">
                <span>
                    {filterType === 'MONTHLY'
                        ? `Referência: ${targetMonth.toString().padStart(2, '0')}/${targetYear}`
                        : `Referência: Ano ${targetYear}`
                    }
                </span>
                <span>
                    {rankingData ? rankingData.length : 0} clientes
                </span>
            </div>
        </div>
    );
};
