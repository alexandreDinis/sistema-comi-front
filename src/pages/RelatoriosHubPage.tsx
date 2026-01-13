import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, DollarSign, Calendar, BarChart3, PieChart, ArrowLeft } from 'lucide-react';
import { usePermission } from '../hooks/usePermission';
import { Feature } from '../types/features';

export const RelatoriosHubPage: React.FC = () => {
    const { hasFeature } = usePermission();

    const reports = [
        {
            id: 'financeiro',
            title: 'Relatório Financeiro Mensal',
            description: 'Visão consolidada do mês: faturamento, despesas, comissões e lucro líquido',
            icon: DollarSign,
            path: '/relatorio/financeiro',
            color: 'cyan',
            feature: Feature.RELATORIO_FINANCEIRO_VIEW,
        },
        {
            id: 'anual',
            title: 'Relatório Anual YoY',
            description: 'Comparação Year-over-Year com 12 meses de faturamento e crescimento anual',
            icon: TrendingUp,
            path: '/relatorio/anual',
            color: 'gold',
            feature: Feature.RELATORIO_FINANCEIRO_VIEW,
        },
        {
            id: 'comissoes',
            title: 'Relatório de Comissões',
            description: 'Análise detalhada de comissões por período e usuário',
            icon: BarChart3,
            path: '/relatorio/comissoes',
            color: 'green',
            feature: Feature.RELATORIO_COMISSAO_VIEW,
            comingSoon: true,
        },
        {
            id: 'desempenho',
            title: 'Relatório de Desempenho',
            description: 'Métricas operacionais: OS finalizadas, veículos atendidos, produtividade',
            icon: Calendar,
            path: '/relatorio/desempenho',
            color: 'purple',
            feature: Feature.DASHBOARD_VIEW,
            comingSoon: true,
        },
    ];

    const availableReports = reports.filter(report => hasFeature(report.feature));

    const getColorClasses = (color: string, isComingSoon: boolean) => {
        if (isComingSoon) {
            return {
                border: 'border-gray-500/30',
                bg: 'bg-gray-500/5',
                icon: 'text-gray-500',
                title: 'text-gray-400',
                hover: 'hover:bg-gray-500/10',
            };
        }

        const colors: Record<string, any> = {
            cyan: {
                border: 'border-cyan-500/30',
                bg: 'bg-cyan-500/5',
                icon: 'text-cyan-400',
                title: 'text-cyan-300',
                hover: 'hover:bg-cyan-500/10 hover:border-cyan-500/50',
            },
            gold: {
                border: 'border-cyber-gold/30',
                bg: 'bg-cyber-gold/5',
                icon: 'text-cyber-gold',
                title: 'text-cyber-gold',
                hover: 'hover:bg-cyber-gold/10 hover:border-cyber-gold/50',
            },
            green: {
                border: 'border-green-500/30',
                bg: 'bg-green-500/5',
                icon: 'text-green-400',
                title: 'text-green-300',
                hover: 'hover:bg-green-500/10 hover:border-green-500/50',
            },
            purple: {
                border: 'border-purple-500/30',
                bg: 'bg-purple-500/5',
                icon: 'text-purple-400',
                title: 'text-purple-300',
                hover: 'hover:bg-purple-500/10 hover:border-purple-500/50',
            },
        };
        return colors[color] || colors.cyan;
    };

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div>
                <Link to="/" className="inline-flex items-center gap-2 text-cyber-gold/60 hover:text-cyber-gold transition-colors font-oxanium text-xs mb-4 uppercase tracking-wider">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para Dashboard
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-8 h-8 text-cyber-gold" />
                    <h1 className="text-3xl font-orbitron text-white font-bold">
                        Central de Relatórios v2.0
                    </h1>
                </div>
                <p className="text-gray-400 text-sm ml-11">
                    Acesse análises detalhadas e relatórios consolidados do sistema
                </p>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableReports.map((report) => {
                    const colors = getColorClasses(report.color, report.comingSoon || false);
                    const Icon = report.icon;
                    const isClickable = !report.comingSoon;

                    const CardContent = (
                        <>
                            <div className={`p-6 rounded-lg border ${colors.border} ${colors.bg} ${isClickable ? colors.hover : ''} transition-all relative overflow-hidden ${!isClickable ? 'opacity-60' : ''}`}>
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                </div>

                                {/* Coming Soon Badge */}
                                {report.comingSoon && (
                                    <div className="absolute top-3 right-3 bg-gray-600/50 text-gray-300 text-[10px] font-bold px-2 py-1 rounded font-oxanium">
                                        EM BREVE
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`${colors.icon} mb-4 relative z-10`}>
                                    <Icon className="w-12 h-12" />
                                </div>

                                {/* Title */}
                                <h3 className={`text-lg font-bold font-oxanium ${colors.title} mb-2 relative z-10`}>
                                    {report.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-400 relative z-10">
                                    {report.description}
                                </p>

                                {/* Action Indicator */}
                                {!report.comingSoon && (
                                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 font-oxanium relative z-10">
                                        <span>ACESSAR</span>
                                        <span>→</span>
                                    </div>
                                )}
                            </div>
                        </>
                    );

                    return isClickable ? (
                        <Link key={report.id} to={report.path} className="block">
                            {CardContent}
                        </Link>
                    ) : (
                        <div key={report.id} className="cursor-not-allowed">
                            {CardContent}
                        </div>
                    );
                })}
            </div>

            {/* Stats Footer */}
            <div className="mt-12 p-6 bg-black/40 border border-white/10 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                    <PieChart className="w-5 h-5 text-cyber-gold" />
                    <h3 className="text-sm font-bold text-cyber-gold font-oxanium uppercase tracking-wide">
                        Recursos Disponíveis
                    </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white font-orbitron">{availableReports.length}</div>
                        <div className="text-xs text-gray-500 uppercase">Total de Relatórios</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-cyan-400 font-orbitron">
                            {availableReports.filter(r => !r.comingSoon).length}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">Disponíveis Agora</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-500 font-orbitron">
                            {availableReports.filter(r => r.comingSoon).length}
                        </div>
                        <div className="text-xs text-gray-500 uppercase">Em Desenvolvimento</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-cyber-gold font-orbitron">PDF</div>
                        <div className="text-xs text-gray-500 uppercase">Formato de Export</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
