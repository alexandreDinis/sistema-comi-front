import React, { useState, useEffect } from 'react';
import { useFaturamento } from '../../hooks/useFaturamento';
import { useForm } from '../../hooks/useForm';
import { ErrorAlert } from '../common/ErrorAlert';
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
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Registrar Faturamento</h2>

            {error && <ErrorAlert message={error} />}

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 animate-pulse">
                    ✓ Faturamento registrado com sucesso! Dashboard será atualizado...
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data do Faturamento
                    </label>
                    <input
                        type="date"
                        name="dataFaturamento"
                        value={values.dataFaturamento}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        id="faturamento-date"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium font-mono">
                            R$
                        </span>
                        <input
                            type="text"
                            name="valor"
                            value={values.valor}
                            onChange={handleValorChange}
                            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                            placeholder="0,00"
                            required
                            id="faturamento-valor"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                    id="faturamento-submit"
                >
                    {isLoading ? '⏳ Registrando...' : '✓ Registrar Faturamento'}
                </button>
            </form>
        </div>
    );
};
