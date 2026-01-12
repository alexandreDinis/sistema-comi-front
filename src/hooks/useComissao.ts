import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { comissaoService } from '../services/comissaoService';

export const useComissao = (ano: number, mes: number) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['comissao', ano, mes],
        queryFn: () => comissaoService.obterComissaoMensal(ano, mes),
        staleTime: 0, // ✅ IMPORTANTE: Dados sempre considerados "stale"
        gcTime: 1000 * 60 * 5, // Cache por 5 minutos, mas sempre refetch
        retry: 2,
        refetchInterval: 5000, // 🔁 Polling: Check for updates every 5 seconds
    });

    // Função para invalidar o cache manualmente
    const invalidateComissao = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: ['comissao', ano, mes],
        });
    }, [queryClient, ano, mes]);

    // Função para refetch imediato
    const refetchComissao = useCallback(() => {
        query.refetch();
    }, [query.refetch]);

    return {
        comissao: query.data,
        isLoading: query.isLoading,
        error: query.error ? 'Erro ao buscar comissão' : null,
        refetch: refetchComissao,
        invalidate: invalidateComissao,
    };
};
