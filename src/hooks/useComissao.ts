import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { comissaoService } from '../services/comissaoService';

export const useComissao = (ano: number, mes: number, options?: { enabled?: boolean }) => {
    const queryClient = useQueryClient();
    const isEnabled = options?.enabled !== false; // Default to true

    const query = useQuery({
        queryKey: ['comissao', ano, mes],
        queryFn: () => comissaoService.obterComissaoMensal(ano, mes),
        staleTime: 0,
        gcTime: 1000 * 60 * 5,
        retry: (failureCount, error: any) => {
            // Don't retry if 400 (Bad Request - Rules Engine Business Exception)
            if (error?.response?.status === 400) return false;
            return failureCount < 2;
        },
        enabled: isEnabled, // Control execution
        refetchInterval: isEnabled ? 5000 : false,
    });

    const invalidateComissao = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: ['comissao', ano, mes],
        });
    }, [queryClient, ano, mes]);

    const refetchComissao = useCallback(() => {
        query.refetch();
    }, [query.refetch]);

    const forceSync = useCallback(async () => {
        try {
            await comissaoService.obterComissaoMensal(ano, mes, true);
            queryClient.invalidateQueries({
                queryKey: ['comissao', ano, mes],
            });
        } catch (error) {
            console.error('Erro ao forçar sincronização:', error);
        }
    }, [queryClient, ano, mes]);

    return {
        comissao: query.data,
        isLoading: query.isLoading,
        error: query.error,
        refetch: refetchComissao,
        invalidate: invalidateComissao,
        forceSync,
    };
};
