import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { despesaService } from '../../services/despesaService';
import { cartaoService } from '../../services/cartaoService';
import type { DespesaRequest, CartaoCredito } from '../../types';

export const DespesaForm: React.FC = () => {
    const queryClient = useQueryClient();
    const [values, setValues] = useState<DespesaRequest>({
        dataDespesa: new Date().toISOString().split('T')[0],
        valor: '' as any,
        categoria: 'ALIMENTACAO',
        descricao: '',
        pagoAgora: false, // Default: A Prazo
        meioPagamento: '',
        dataVencimento: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState(false);

    // Credit Card State
    const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);

    React.useEffect(() => {
        cartaoService.listar().then(setCartoes).catch(console.error);
    }, []);

    const { mutate, isPending: isLoading } = useMutation({
        mutationFn: despesaService.create,
        onSuccess: () => {
            setSuccessMessage(true);
            setValues({
                dataDespesa: new Date().toISOString().split('T')[0],
                valor: '' as any,
                categoria: 'ALIMENTACAO',
                descricao: '',
                pagoAgora: false,
                meioPagamento: '',
                dataVencimento: ''
            });
            queryClient.invalidateQueries({ queryKey: ['comissao'] });
            queryClient.invalidateQueries({ queryKey: ['relatorio'] });
            queryClient.invalidateQueries({ queryKey: ['despesas'] });
            setTimeout(() => setSuccessMessage(false), 3000);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Falha na sequência de registro de despesa.');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setValues((prev) => {
            const newValues = { ...prev, [name]: value };

            // Logic: If Card selected (cartaoId), force 'A Prazo', hide Vencimento (backend handles), set MeioPagamento = CREDITO
            if (name === 'cartaoId') {
                if (value) {
                    return {
                        ...newValues,
                        cartaoId: Number(value),
                        pagoAgora: false,
                        dataVencimento: undefined, // Backend will calculate invoice due date
                        meioPagamento: 'CARTAO_CREDITO'
                    };
                } else {
                    return {
                        ...newValues,
                        cartaoId: undefined,
                        meioPagamento: ''
                    };
                }
            }
            return newValues;
        });
        setError(null);
    };

    const handleToggle = () => {
        setValues(prev => ({ ...prev, pagoAgora: !prev.pagoAgora }));
    };

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            setValues((prev) => ({ ...prev, valor: '' as any }));
            return;
        }
        const numericValue = parseInt(value) / 100;
        const formatted = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericValue);

        setValues((prev) => ({ ...prev, valor: formatted as any }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numericValor = typeof values.valor === 'string'
            ? parseFloat((values.valor as string).replace(/\./g, '').replace(',', '.'))
            : values.valor;

        if (isNaN(numericValor) || numericValor <= 0) {
            setError('VALORAÇÃO_VÁLIDA_NECESSÁRIA_PARA_ALOC_0x1');
            return;
        }

        if (values.pagoAgora && !values.meioPagamento) {
            setError('PARA_PAGAMENTO_A_VISTA_MEIO_OBRIGATORIO');
            return;
        }

        if (!values.pagoAgora && !values.cartaoId && !values.dataVencimento) {
            setError('PARA_A_PRAZO_VENCIMENTO_OBRIGATORIO');
            return;
        }

        mutate({
            ...values,
            valor: numericValor,
        });
    };

    return (
        <div className="hud-card top-brackets bottom-brackets p-8 max-w-md mx-auto relative overflow-hidden bg-black/60">
            <div className="static-overlay opacity-10"></div>

            <div className="flex justify-between items-center mb-10 pb-4 border-b border-cyber-gold/20">
                <h2 className="text-xl font-black text-cyber-gold tracking-widest uppercase italic italic-shadow">
                    [CONSOLE_DESPESAS_V1]
                </h2>
                <span className="text-[8px] font-mono text-cyber-gold/40">REGISTROS_OVR: ATIVADO</span>
            </div>

            {error && (
                <div className="border border-cyber-error bg-cyber-error/5 p-4 text-cyber-error text-[10px] font-mono mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-error animate-pulse"></div>
                    <span className="font-black uppercase block mb-1">FLUXO_ERRO_STDOUT:</span>
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="border border-cyber-gold bg-cyber-gold/5 p-4 text-cyber-gold text-[10px] font-mono mb-6 relative overflow-hidden animate-pulse">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-gold"></div>
                    <span className="font-black uppercase block mb-1">STDOUT_SUCCESS:</span>
                    ALLOC_STABLE. EXPENSE_NODE_SYNCED.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Credit Card Selector */}
                <div className="relative group/field">
                    <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors">
                        CARTÃO CORPORATIVO (Opcional)
                    </label>
                    <div className="relative">
                        <select
                            name="cartaoId"
                            value={values.cartaoId || ''}
                            onChange={handleChange}
                            className="w-full bg-black border border-cyber-gold/30 text-cyber-gold text-sm font-mono p-3 pr-10 outline-none focus:border-cyber-gold focus:shadow-[0_0_10px_rgba(212,175,55,0.2)] transition-all appearance-none cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                        >
                            <option value="" className="bg-black text-cyber-gold">— NENHUM (Despesa Comum) —</option>
                            {cartoes.map(c => (
                                <option key={c.id} value={c.id} className="bg-black text-cyber-gold">
                                    💳 {c.nome} (Vence dia {c.diaVencimento})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-cyber-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    {values.cartaoId && (
                        <p className="text-[9px] text-cyber-gold/50 font-mono mt-1 tracking-wide">
                            ⚡ Despesa será agrupada na fatura do cartão automaticamente
                        </p>
                    )}
                </div>

                {/* Toggle Pago Agora - Only show if NO card selected */}
                {!values.cartaoId && (
                    <div className="flex items-center justify-between bg-cyber-gold/5 p-4 border border-cyber-gold/10">
                        <div>
                            <span className="text-cyber-gold font-bold text-xs block">PAGO À VISTA?</span>
                            <span className="text-[9px] text-cyber-gold/50 block">Marque "Sim" se o dinheiro já saiu do caixa.</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleToggle}
                            className={`w-12 h-6 flex items-center rounded-none p-1 border transition-all ${values.pagoAgora
                                ? 'bg-cyber-gold/20 border-cyber-gold justify-end'
                                : 'bg-black/40 border-cyber-gold/30 justify-start'
                                }`}
                        >
                            <div className={`w-4 h-4 transition-all ${values.pagoAgora ? 'bg-cyber-gold' : 'bg-cyber-gold/30'
                                }`} />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="relative group/field">
                        <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors">
                            CARIMBO_DATA
                        </label>
                        <input
                            type="date"
                            name="dataDespesa"
                            value={values.dataDespesa}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-xs font-mono p-3 outline-none focus:border-cyber-gold transition-all"
                            required
                        />
                    </div>

                    <div className="relative group/field">
                        <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors">
                            ID_CATEGORIA
                        </label>
                        <select
                            name="categoria"
                            value={values.categoria}
                            onChange={handleChange}
                            className="w-full bg-black border border-cyber-gold/30 text-cyber-gold text-sm font-mono p-3 outline-none focus:border-cyber-gold transition-all appearance-none cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                            required
                        >
                            <optgroup label="── OPERACIONAL ──">
                                <option value="ALIMENTACAO">🍽️ ALIMENTAÇÃO</option>
                                <option value="COMBUSTIVEL">⛽ COMBUSTÍVEL</option>
                                <option value="FERRAMENTAS">🔧 FERRAMENTAS</option>
                                <option value="MATERIAL_ESCRITORIO">📎 MATERIAL DE ESCRITÓRIO</option>
                            </optgroup>
                            <optgroup label="── INFRAESTRUTURA ──">
                                <option value="ALUGUEL">🏠 ALUGUEL</option>
                                <option value="ENERGIA_AGUA">💡 ENERGIA/ÁGUA</option>
                                <option value="INTERNET_TELEFONE">📡 INTERNET/TELEFONE</option>
                                <option value="MANUTENCAO">🔩 MANUTENÇÃO</option>
                            </optgroup>
                            <optgroup label="── PESSOAL ──">
                                <option value="SALARIOS">💰 SALÁRIOS</option>
                                <option value="PROLABORE">👔 PRÓ-LABORE</option>
                                <option value="BENEFICIOS">🎁 BENEFÍCIOS</option>
                            </optgroup>
                            <optgroup label="── MARKETING/VENDAS ──">
                                <option value="MARKETING">📢 MARKETING</option>
                                <option value="TAXAS_BANCARIAS">🏦 TAXAS BANCÁRIAS</option>
                            </optgroup>
                            <optgroup label="── FISCAL ──">
                                <option value="IMPOSTOS">📋 IMPOSTOS</option>
                                <option value="CONTABILIDADE">📊 CONTABILIDADE</option>
                            </optgroup>
                            <optgroup label="── TERCEIROS ──">
                                <option value="SERVICOS_TERCEIROS">👥 SERVIÇOS DE TERCEIROS</option>
                            </optgroup>
                            <optgroup label="── GENÉRICO ──">
                                <option value="DIVERSOS">📦 DIVERSOS</option>
                                <option value="OUTROS">❓ OUTROS</option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                <div className="relative group/field">
                    <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors">
                        ALLOC_VALUE (BRL)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-gold/40 font-black font-mono text-xs">
                            EXP_
                        </span>
                        <input
                            type="text"
                            name="valor"
                            value={values.valor}
                            onChange={handleValorChange}
                            className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-lg font-black italic p-3 pl-14 outline-none focus:border-cyber-gold focus:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all"
                            placeholder="0,00"
                            required
                        />
                    </div>
                </div>

                {/* Conditional Fields */}
                <div className="grid grid-cols-2 gap-4">
                    {!values.pagoAgora && !values.cartaoId && (
                        <div className="relative group/field">
                            <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors">
                                VENCIMENTO
                            </label>
                            <input
                                type="date"
                                name="dataVencimento"
                                value={values.dataVencimento || ''}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-xs font-mono p-3 outline-none focus:border-cyber-gold transition-all"
                                required={!values.pagoAgora}
                            />
                        </div>
                    )}

                    <div className={`relative group/field ${values.pagoAgora ? 'col-span-2' : ''}`}>
                        <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors">
                            MEIO DE PAGAMENTO {values.pagoAgora ? '*' : '(Opcional)'}
                        </label>
                        <select
                            name="meioPagamento"
                            value={values.meioPagamento || ''}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-xs font-mono p-3 outline-none focus:border-cyber-gold transition-all appearance-none cursor-pointer"
                            required={values.pagoAgora}
                        >
                            <option value="">SELECIONE...</option>
                            <option value="DINHEIRO">DINHEIRO</option>
                            <option value="PIX">PIX</option>
                            <option value="CARTAO_CREDITO">CARTÃO DE CRÉDITO</option>
                            <option value="CARTAO_DEBITO">CARTÃO DE DÉBITO</option>
                            <option value="BOLETO">BOLETO</option>
                            <option value="TRANSFERENCIA">TRANSFERÊNCIA</option>
                        </select>
                    </div>
                </div>

                <div className="relative group/field">
                    <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors">
                        METADATA_DESCRIPTION
                    </label>
                    <textarea
                        name="descricao"
                        value={values.descricao}
                        onChange={handleChange as any}
                        className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-xs font-mono p-3 min-h-[80px] outline-none focus:border-cyber-gold transition-all resize-none"
                        placeholder="FLUXO_CONTEXTO..."
                        rows={2}
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full hud-button"
                    >
                        {isLoading ? '>>> SINCRONIZANDO...' : values.pagoAgora ? 'REGISTRAR PAGAMENTO (CAIXA)' : 'REGISTRAR CONTA (A PRAZO)'}
                    </button>
                </div>

                <div className="flex justify-between items-center pt-2 text-[7px] text-cyber-gold/20 font-mono tracking-widest uppercase">
                    <span>OBOOS_SEC_EXP_v4</span>
                    <span>TAG: OUTBOUND_STREAM</span>
                </div>
            </form>
        </div>
    );
};
