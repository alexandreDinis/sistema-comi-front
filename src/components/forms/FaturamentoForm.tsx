import React, { useState, useEffect } from 'react';
import { useFaturamento } from '../../hooks/useFaturamento';
import { useForm } from '../../hooks/useForm';
import { formatInputCurrency, parseCurrencyString } from '../../utils/formatters';

export const FaturamentoForm: React.FC = () => {
    const { registrar, isLoading, error, isSuccess } = useFaturamento();

    // Usando memo para estabilizar initialValues e evitar loop no reset
    const initialValues = React.useMemo(() => ({
        dataFaturamento: new Date().toISOString().split('T')[0],
        valor: '', // Usamos string para o mask
    }), []);

    const { values, reset, setValues, handleChange } = useForm<any>(initialValues);
    const [successMessage, setSuccessMessage] = useState(false);

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const maskedValue = formatInputCurrency(e.target.value);
        setValues((prev: any) => ({ ...prev, valor: maskedValue }));
    };

    // ✅ Limpar mensagem de sucesso após 3 segundos
    useEffect(() => {
        if (isSuccess) {
            setSuccessMessage(true);
            reset();
            const timer = setTimeout(() => {
                setSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const valorNumerico = parseCurrencyString(values.valor);

        if (!values.dataFaturamento || valorNumerico <= 0) {
            alert('Por favor, preencha todos os campos corretamente com um valor maior que zero');
            return;
        }

        registrar({
            dataFaturamento: values.dataFaturamento,
            valor: valorNumerico,
        });
    };

    return (
        <div className="hud-card top-brackets bottom-brackets p-8 max-w-md mx-auto relative overflow-hidden bg-black/60">
            <div className="static-overlay opacity-10"></div>

            <div className="flex justify-between items-center mb-10 pb-4 border-b border-cyber-gold/20">
                <h2 className="text-xl font-black text-cyber-gold tracking-widest uppercase italic italic-shadow">
                    [CONSOLE_FATURAMENTO]
                </h2>
                <span className="text-[8px] font-mono text-cyber-gold/40">NÍVEL_AUT: 04</span>
            </div>

            {error && (
                <div className="border border-cyber-error bg-cyber-error/5 p-4 text-cyber-error text-[10px] font-mono mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-error animate-pulse"></div>
                    <span className="font-black uppercase block mb-1">STDOUT_ERRO:</span>
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="border border-cyber-gold bg-cyber-gold/5 p-4 text-cyber-gold text-[10px] font-mono mb-6 relative overflow-hidden animate-pulse">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-gold"></div>
                    <span className="font-black uppercase block mb-1">SUCESSO_STDOUT:</span>
                    SEQUÊNCIA_ESTÁVEL. SINCRONIZANDO_NÚCLEOS_DADOS...
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="relative group/field">
                    <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors">
                        MARCA_TEMPO
                    </label>
                    <div className="relative">
                        <input
                            type="date"
                            name="dataFaturamento"
                            value={values.dataFaturamento}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-sm font-mono p-3 outline-none focus:border-cyber-gold focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all"
                            required
                            id="faturamento-date"
                        />
                        <div className="absolute bottom-0 left-0 w-0 h-px bg-cyber-gold group-focus-within/field:w-full transition-all duration-500"></div>
                    </div>
                </div>

                <div className="relative group/field">
                    <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors">
                        FORÇA_MOEDA (BRL)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-gold/40 font-black font-mono text-xs">
                            VAL_
                        </span>
                        <input
                            type="text"
                            name="valor"
                            value={values.valor}
                            onChange={handleValorChange}
                            className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-lg font-black italic p-3 pl-14 outline-none focus:border-cyber-gold focus:shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all"
                            placeholder="0,00"
                            required
                            id="faturamento-valor"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full hud-button"
                        id="faturamento-submit"
                    >
                        {isLoading ? '>>> ENVIANDO...' : 'INICIALIZAR_SEQUÊNCIA'}
                    </button>
                </div>

                <div className="flex justify-between items-center pt-2 text-[7px] text-cyber-gold/20 font-mono tracking-widest uppercase">
                    <span>OBOOS_SECURITY_ACTIVE</span>
                    <span>PKT_SIZE: 128KB</span>
                </div>
            </form>
        </div>
    );

};
