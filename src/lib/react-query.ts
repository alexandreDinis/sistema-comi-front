import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // Cache por 5 minutos (evita fetch excessivo)
            gcTime: 1000 * 60 * 10,
            retry: 0, // Não retry em dev/erro 500 para evitar loops
            refetchOnWindowFocus: false,
        },
    },
});
