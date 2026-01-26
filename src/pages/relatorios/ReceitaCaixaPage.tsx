import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { financeiroService } from '../../services/financeiroService';
import { ChevronLeft, ChevronRight, FileText, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReceitaCaixaDTO {
    dataRecebimento: string;
    valor: number;
    origem: string;
    cliente?: string;
    meioPagamento?: string;
}

interface ReceitaCaixaReportDTO {
    ano: number;
    mes: number;
    recebimentos: ReceitaCaixaDTO[];
    totalRecebido: number;
    quantidadeRecebimentos: number;
}

export const ReceitaCaixaPage: React.FC = () => {
    const today = new Date();
    const [ano, setAno] = useState(today.getFullYear());
    const [mes, setMes] = useState(today.getMonth() + 1);

    const { data, isLoading, error } = useQuery<ReceitaCaixaReportDTO>({
        queryKey: ['receita-caixa', ano, mes],
        queryFn: () => financeiroService.getReceitasCaixa(mes, ano)
    });

    const handlePreviousMonth = () => {
        if (mes === 1) { setMes(12); setAno(ano - 1); }
        else { setMes(mes - 1); }
    };

    const handleNextMonth = () => {
        if (mes === 12) { setMes(1); setAno(ano + 1); }
        else { setMes(mes + 1); }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const formatDate = (dateStr: string) =>
        new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');

    const nomeMes = new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'long' });

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Back Link */}
            <Link to="/relatorio" className="inline-flex items-center gap-2 text-cyber-gold/60 hover:text-cyber-gold transition-colors text-xs mb-6">
                ← Voltar para Central
            </Link>

            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-cyber-gold flex items-center gap-2">
                        <FileText className="w-7 h-7" />
                        Receita por Caixa (Base DAS)
                    </h1>
                    <p className="text-cyber-gold/60 text-sm mt-1">
                        Relatório de recebimentos para cálculo do Simples Nacional
                    </p>
                </div>
                <button
                    onClick={() => financeiroService.downloadReceitaCaixaPdf(mes, ano)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold transition-colors text-sm"
                >
                    <FileText className="w-4 h-4" />
                    EXPORTAR PDF (DAS)
                </button>
            </header>

            {/* Info Alert */}
            <div className="bg-blue-900/30 border border-blue-500/30 rounded-sm p-4 mb-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-200">
                    <p className="font-semibold mb-1">Base para o DAS</p>
                    <p className="text-blue-300/80">
                        Este relatório mostra o <strong>total recebido no mês</strong> (regime de caixa).
                        Use este valor como base para calcular o DAS no Simples Nacional.
                    </p>
                </div>
            </div>

            {/* Month Selector */}
            <div className="flex items-center justify-center gap-4 mb-8">
                <button onClick={handlePreviousMonth} className="p-2 border border-cyber-gold/30 hover:bg-cyber-gold/10 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-cyber-gold" />
                </button>
                <div className="text-center min-w-[150px]">
                    <p className="text-xs text-cyber-gold/50 uppercase">Período</p>
                    <p className="text-xl font-bold text-cyber-gold capitalize">{nomeMes} {ano}</p>
                </div>
                <button onClick={handleNextMonth} className="p-2 border border-cyber-gold/30 hover:bg-cyber-gold/10 transition-colors">
                    <ChevronRight className="w-5 h-5 text-cyber-gold" />
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-16 text-cyber-gold/60">Carregando...</div>
            ) : error ? (
                <div className="text-center py-16 text-red-400">Erro ao carregar dados</div>
            ) : data ? (
                <>
                    {/* Summary Card */}
                    <div className="bg-green-900/20 border border-green-500/30 rounded-sm p-6 mb-6 text-center">
                        <p className="text-xs text-green-400/70 uppercase mb-1">Total Recebido no Mês</p>
                        <p className="text-4xl font-black text-green-400">{formatCurrency(data.totalRecebido)}</p>
                        <p className="text-xs text-green-400/50 mt-2">{data.quantidadeRecebimentos} recebimentos</p>
                    </div>

                    {/* Table */}
                    {data.recebimentos.length > 0 ? (
                        <div className="bg-black/40 border border-cyber-gold/20 rounded-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-black/60">
                                    <tr>
                                        <th className="text-left p-4 text-cyber-gold/70 font-mono text-xs">DATA</th>
                                        <th className="text-left p-4 text-cyber-gold/70 font-mono text-xs">ORIGEM</th>
                                        <th className="text-left p-4 text-cyber-gold/70 font-mono text-xs">CLIENTE</th>
                                        <th className="text-left p-4 text-cyber-gold/70 font-mono text-xs">MEIO</th>
                                        <th className="text-right p-4 text-cyber-gold/70 font-mono text-xs">VALOR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recebimentos.map((r, idx) => (
                                        <tr key={idx} className="border-t border-cyber-gold/10 hover:bg-cyber-gold/5">
                                            <td className="p-4 text-cyber-gold font-mono text-sm">{formatDate(r.dataRecebimento)}</td>
                                            <td className="p-4 text-cyber-text text-sm">{r.origem}</td>
                                            <td className="p-4 text-cyber-text/70 text-sm">{r.cliente || '-'}</td>
                                            <td className="p-4 text-cyber-text/70 text-sm">{r.meioPagamento || '-'}</td>
                                            <td className="p-4 text-green-400 font-bold text-right">{formatCurrency(r.valor)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-cyber-gold/40">
                            Nenhum recebimento no período.
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
};

export default ReceitaCaixaPage;
