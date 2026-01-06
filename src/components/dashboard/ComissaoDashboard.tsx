import React, { useState } from 'react';
import { useComissao } from '../../hooks/useComissao';
import { ComissaoCard } from './ComissaoCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorAlert } from '../common/ErrorAlert';

export const ComissaoDashboard: React.FC = () => {
    const today = new Date();
    const [ano, setAno] = useState(today.getFullYear());
    const [mes, setMes] = useState(today.getMonth() + 1);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { comissao, isLoading, error, refetch, invalidate } = useComissao(ano, mes);

    const handlePreviousMonth = () => {
        if (mes === 1) {
            setMes(12);
            setAno(ano - 1);
        } else {
            setMes(mes - 1);
        }
    };

    const handleNextMonth = () => {
        if (mes === 12) {
            setMes(1);
            setAno(ano + 1);
        } else {
            setMes(mes + 1);
        }
    };

    const handleRefresh = () => {
        console.log('🔄 Atualizando dados...');
        invalidate(); // Invalida o cache
        setTimeout(() => refetch(), 100); // Refetch após invalidar
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard de Comissão</h1>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={handlePreviousMonth}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                    >
                        ← Anterior
                    </button>
                    <span className="text-lg font-semibold min-w-[100px] text-center" id="mes-ano-label">
                        {mes.toString().padStart(2, '0')}/{ano}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                    >
                        Próximo →
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
                    >
                        {isLoading ? '⏳ Atualizando...' : '🔄 Atualizar'}
                    </button>
                </div>
            </div>

            {error && (
                <ErrorAlert
                    message={error}
                    onClose={() => setErrorMessage(null)}
                />
            )}

            {errorMessage && (
                <ErrorAlert
                    message={errorMessage}
                    onClose={() => setErrorMessage(null)}
                />
            )}

            {isLoading ? (
                <LoadingSpinner message="Carregando dados de comissão..." />
            ) : comissao ? (
                <ComissaoCard comissao={comissao} />
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                    ⚠️ Nenhum dado de comissão disponível para este período.
                    <p className="text-sm mt-2">
                        Registre faturamentos e adiantamentos para gerar a comissão.
                    </p>
                </div>
            )}
        </div>
    );
};
