import { useEffect, useState } from 'react';
import { financeiroService } from '../../services/financeiroService';
import type { ContaPagar } from '../../types';
import { CreditCard, Calendar, CheckCircle } from 'lucide-react';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

const FaturasPage = () => {
    const [faturas, setFaturas] = useState<ContaPagar[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFaturas();
    }, []);

    const loadFaturas = async () => {
        try {
            setLoading(true);
            const data = await financeiroService.listarContasPagar('PENDENTE');
            // Filter locally for FATURA_CARTAO since backend endpoint is generic
            // Ideally backend should support type filtering
            const faturasCartao = data.filter(c => c.tipo === 'FATURA_CARTAO');
            setFaturas(faturasCartao);
        } catch (err) {
            console.error('Erro ao carregar faturas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePagar = async (fatura: ContaPagar) => {
        if (!confirm(`Confirma o pagamento da fatura de ${formatCurrency(fatura.valor)}?`)) return;

        try {
            await financeiroService.pagarConta(fatura.id, {
                meioPagamento: 'TRANSFERENCIA', // Defaulting to Transferencia for invoice payment
                dataPagamento: new Date().toISOString().split('T')[0]
            });
            loadFaturas();
        } catch (err) {
            console.error('Erro ao pagar fatura:', err);
            alert('Erro ao processar pagamento');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                <p className="text-green-400 font-mono text-sm tracking-widest animate-pulse">CARREGANDO FATURAS...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] py-6 space-y-6 animate-fadeIn">
            {/* Header */}
            <header className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <span className="w-2 h-10 bg-cyan-500"></span>
                    <div>
                        <h1 className="text-2xl font-black italic text-cyber-gold tracking-widest uppercase">
                            Faturas de Cartão
                        </h1>
                        <p className="text-cyber-gold/50 font-mono text-xs tracking-[0.3em]">
                            // CONTAS A PAGAR CONSOLIDDAS
                        </p>
                    </div>
                </div>
            </header>

            {/* List */}
            <div className="grid gap-4">
                {faturas.length === 0 ? (
                    <div className="p-12 hud-card text-center text-gray-500">
                        Nenhuma fatura pendente encontrada.
                    </div>
                ) : (
                    faturas.map((fatura) => (
                        <div key={fatura.id} className="hud-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-cyan-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-full bg-cyan-500/10 text-cyan-400">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                                        {fatura.descricao}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            Vence: {new Date(fatura.dataVencimento).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500">
                                            PENDENTE
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 block font-mono">VALOR TOTAL</span>
                                    <span className="text-2xl font-black text-white tracking-tight">
                                        {formatCurrency(fatura.valor)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handlePagar(fatura)}
                                    className="hud-btn bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/50 flex items-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    REGISTRAR PAGAMENTO
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FaturasPage;
