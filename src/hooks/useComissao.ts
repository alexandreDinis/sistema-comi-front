import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { comissaoService } from '../services/comissaoService';

export const useComissao = (ano: number, mes: number) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['comissao', ano, mes],
        queryFn: () => comissaoService.obterComissaoMensal(ano, mes),
        staleTime: 0,
        gcTime: 1000 * 60 * 5,
        retry: 2,
        refetchInterval: 5000,
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
        error: query.error ? 'Erro ao buscar comissão' : null,
        refetch: refetchComissao,
        invalidate: invalidateComissao,
        forceSync,
    };
};
