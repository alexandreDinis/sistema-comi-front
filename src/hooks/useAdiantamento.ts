import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adiantamentoService } from '../services/adiantamentoService';
import type { AdiantamentoRequest } from '../types';

export const useAdiantamento = () => {
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const registrarMutation = useMutation({
        mutationFn: (data: AdiantamentoRequest) => adiantamentoService.registrarAdiantamento(data),
        onSuccess: () => {
            setError(null);
            // ✅ IMPORTANTE: Invalidar todas as comissões após novo adiantamento
            queryClient.invalidateQueries({
                queryKey: ['comissao'],
            });
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Erro ao registrar adiantamento');
        },
    });

    const registrar = useCallback(
        (data: AdiantamentoRequest) => {
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
