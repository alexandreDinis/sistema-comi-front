import React, { useState, useEffect } from 'react';
import { useAdiantamento } from '../../hooks/useAdiantamento';
import { useForm } from '../../hooks/useForm';
import { ErrorAlert } from '../common/ErrorAlert';
import { formatInputCurrency, parseCurrencyString } from '../../utils/formatters';

export const AdiantamentoForm: React.FC = () => {
    const { registrar, isLoading, error, isSuccess } = useAdiantamento();

    // Usando memo para estabilizar initialValues e evitar loop no reset
    const initialValues = React.useMemo(() => ({
        dataPagamento: new Date().toISOString().split('T')[0],
        valor: '', // Usamos string para o mask
        descricao: '',
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

        if (!values.dataPagamento || valorNumerico <= 0) {
            alert('Por favor, preencha todos os campos obrigatórios com um valor maior que zero');
            return;
        }

        registrar({
            dataPagamento: values.dataPagamento,
            valor: valorNumerico,
            descricao: values.descricao,
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Registrar Adiantamento</h2>

            {error && <ErrorAlert message={error} />}

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 animate-pulse">
                    ✓ Adiantamento registrado com sucesso! Dashboard será atualizado...
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data do Pagamento
                    </label>
                    <input
                        type="date"
                        name="dataPagamento"
                        value={values.dataPagamento}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        id="adiantamento-date"
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
                            id="adiantamento-valor"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição (Opcional)
                    </label>
                    <textarea
                        name="descricao"
                        value={values.descricao}
                        onChange={handleChange as any}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Adiantamento para despesas..."
                        rows={3}
                        id="adiantamento-descricao"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
                    id="adiantamento-submit"
                >
                    {isLoading ? '⏳ Registrando...' : '✓ Registrar Adiantamento'}
                </button>
            </form>
        </div>
    );
};
