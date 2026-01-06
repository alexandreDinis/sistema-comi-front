import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { faturamentoService } from '../services/faturamentoService';
import type { FaturamentoRequest } from '../types';

export const useFaturamento = () => {
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const registrarMutation = useMutation({
        mutationFn: (data: FaturamentoRequest) => faturamentoService.registrarFaturamento(data),
        onSuccess: () => {
            setError(null);
            // ✅ IMPORTANTE: Invalidar todas as comissões após novo faturamento
            queryClient.invalidateQueries({
                queryKey: ['comissao'],
            });
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Erro ao registrar faturamento');
        },
    });

    const registrar = useCallback(
        (data: FaturamentoRequest) => {
            registrarMutation.mutate(data);
        },
        [registrarMutation]
    );

    return {
        registrar,
        isLoading: registrarMutation.isPending,
        isSuccess: registrarMutation.isSuccess,
        error,
    };
};
