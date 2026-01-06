import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { despesaService } from '../../services/despesaService';
import type { DespesaRequest } from '../../types';

export const DespesaForm: React.FC = () => {
    const queryClient = useQueryClient();
    const [values, setValues] = useState<DespesaRequest>({
        dataDespesa: new Date().toISOString().split('T')[0],
        valor: '' as any,
        categoria: 'ALIMENTACAO',
        descricao: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState(false);

    const { mutate, isPending: isLoading } = useMutation({
        mutationFn: despesaService.create,
        onSuccess: () => {
            setSuccessMessage(true);
            setValues({
                dataDespesa: new Date().toISOString().split('T')[0],
                valor: '' as any,
                categoria: 'ALIMENTACAO',
                descricao: '',
            });
            queryClient.invalidateQueries({ queryKey: ['comissao'] });
            queryClient.invalidateQueries({ queryKey: ['relatorio'] });
            setTimeout(() => setSuccessMessage(false), 3000);
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Falha na sequência de registro de despesa.');
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        setError(null);
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
                            className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-xs font-mono p-3 outline-none focus:border-cyber-gold transition-all appearance-none cursor-pointer"
                            required
                        >
                            <option value="ALIMENTACAO">ALIMENTAÇÃO</option>
                            <option value="COMBUSTIVEL">COMBUSTÍVEL</option>
                            <option value="FERRAMENTAS">FERRAMENTAS</option>
                            <option value="MARKETING">MARKETING</option>
                            <option value="INFRAESTRUTURA">INFRAESTRUTURA</option>
                            <option value="PROLABORE">PROLABORE</option>
                            <option value="DIVERSOS">DIVERSOS</option>
                            <option value="OUTROS">OUTROS</option>
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
                        {isLoading ? '>>> SINCRONIZANDO...' : 'REGISTRAR_DESPESA'}
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
