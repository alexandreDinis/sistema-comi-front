import React from 'react';
import type { ComissaoCalculada } from '../../types';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TrendingUp, Percent, Landmark, ReceiptText, ArrowUpRight } from 'lucide-react';

interface ComissaoCardProps {
    comissao: ComissaoCalculada;
}

export const ComissaoCard: React.FC<ComissaoCardProps> = ({ comissao }) => {
    const isPositivo = comissao.saldoAReceber >= 0;

    return (
        <div className="space-y-6 fade-in">
            <div className="bg-white rounded-4xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <div>
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                            Resumo Mensal
                        </span>
                        <h3 className="text-xl font-bold text-slate-900">
                            Referência: {comissao.anoMesReferencia}
                        </h3>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-slate-500">Faixa de Comissão</p>
                        <p className="text-lg font-bold text-blue-600">{comissao.faixaComissao}</p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-blue-200 transition-colors">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">Faturamento</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">
                                {formatCurrency(comissao.faturamentoMensal)}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-purple-200 transition-colors">
                            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                                <Percent className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">Percentual</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">
                                {formatPercentage(comissao.porcentagemComissao)}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-emerald-200 transition-colors">
                            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                                <ReceiptText className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">Comissão Bruta</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">
                                {formatCurrency(comissao.valorBrutoComissao)}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-orange-200 transition-colors">
                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                                <Landmark className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">Adiantado</p>
                            <p className="text-2xl font-black text-slate-900 mt-1">
                                {formatCurrency(comissao.valorAdiantado)}
                            </p>
                        </div>
                    </div>

                    <div className={`p-8 rounded-4xl flex flex-col sm:flex-row items-center justify-between gap-6 ${isPositivo ? 'bg-emerald-600' : 'bg-rose-600'
                        } text-white shadow-xl shadow-opacity-20`}>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-widest opacity-80">Saldo Líquido a Receber</p>
                            <p className="text-5xl font-black mt-2">
                                {formatCurrency(comissao.saldoAReceber)}
                            </p>
                        </div>
                        <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                            <ArrowUpRight className={`w-8 h-8 ${!isPositivo && 'rotate-90'}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
