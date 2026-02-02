/**
 * API Service
 * 
 * Cliente HTTP configurado com Axios incluindo:
 * - Interceptors para adicionar token automaticamente
 * - Refresh automático de token
 * - Tratamento de erros
 * - Logging condicional
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import Logger from '../utils/logger';

// Importação tardia para evitar dependência circular
let authService: any;
const getAuthService = async () => {
    if (!authService) {
        authService = (await import('./authService')).default;
    }
    return authService;
};

// Configuração da API
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.15.46:8080/api/v1';

Logger.info('API Service inicializado com URL:', API_BASE_URL);

// Criar instância do Axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag para controlar múltiplas tentativas de refresh
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// ==========================================
// Request Interceptor
// ==========================================

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const method = config.method?.toUpperCase() || 'GET';
        const url = config.url || '';

        Logger.api(method, url);

        // Não adicionar token em rotas públicas
        const publicRoutes = ['/auth/login', '/auth/register', '/auth/refresh'];
        //    const isPublicRoute = publicRoutes.some(route => url.includes(route));
        const isPublicRoute = publicRoutes.some(route => url === route || url.endsWith(route));


        if (!isPublicRoute) {
            try {
                const auth = await getAuthService();
                const token = await auth.getAccessToken();

                if (token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                    Logger.auth('Token adicionado à requisição');
                }
            } catch (error) {
                Logger.error('Erro ao obter token para requisição', error);
            }
        }

        return config;
    },
    (error: AxiosError) => {
        Logger.error('Erro no interceptor de requisição', error);
        return Promise.reject(error);
    }
);

// ==========================================
// Response Interceptor
// ==========================================

api.interceptors.response.use(
    (response: AxiosResponse) => {
        const status = response.status;
        const url = response.config.url || '';

        Logger.success(`Resposta ${status} - ${url}`);

        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Log do erro
        if (error.response) {
            Logger.error(`Erro HTTP ${error.response.status}`, {
                url: originalRequest.url,
                status: error.response.status,
            });
        } else if (error.request) {
            Logger.error('Sem resposta do servidor', {
                url: originalRequest.url,
            });
        } else {
            Logger.error('Erro ao configurar requisição', error.message);
        }

        // Tratamento de erro 401 (Token expirado)
        // Ignorar 401 na rota de login (credenciais inválidas)
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.endsWith('/auth/login')) {
            if (isRefreshing) {
                // Se já está tentando refresh, adiciona à fila
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                Logger.auth('Token expirado, tentando atualizar...');
                const auth = await getAuthService();
                const newToken = await auth.refreshAccessToken();

                Logger.success('Token atualizado com sucesso');

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }

                processQueue(null, newToken);
                return api(originalRequest);
            } catch (refreshError) {
                Logger.error('Falha ao atualizar token', refreshError);
                processQueue(refreshError as Error, null);

                // Redirecionar para login
                // TODO: Implementar navegação para tela de login

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Tratamento de outros erros
        return Promise.reject(handleApiError(error));
    }
);

// ==========================================
// Tratamento de Erros
// ==========================================

interface ApiError {
    message: string;
    status?: number;
    code?: string;
    details?: any;
}

function handleApiError(error: AxiosError): ApiError {
    if (error.response) {
        // Erro retornado pelo servidor
        const status = error.response.status;
        const data = error.response.data as any;
        const message = data?.message || data?.error || 'Erro na requisição';

        switch (status) {
            case 400:
                return {
                    message: message || 'Requisição inválida',
                    status,
                    code: 'BAD_REQUEST',
                    details: data,
                };
            case 401:
                return {
                    message: 'Não autorizado. Faça login novamente.',
                    status,
                    code: 'UNAUTHORIZED',
                };
            case 403:
                return {
                    message: 'Acesso negado. Você não tem permissão.',
                    status,
                    code: 'FORBIDDEN',
                };
            case 404:
                return {
                    message: 'Recurso não encontrado',
                    status,
                    code: 'NOT_FOUND',
                };
            case 422:
                return {
                    message: message || 'Dados inválidos',
                    status,
                    code: 'VALIDATION_ERROR',
                    details: data,
                };
            case 500:
                return {
                    message: 'Erro interno do servidor',
                    status,
                    code: 'INTERNAL_SERVER_ERROR',
                };
            default:
                return {
                    message: message || 'Erro na requisição',
                    status,
                    code: 'API_ERROR',
                };
        }
    }

    if (error.request) {
        // Requisição foi feita mas não houve resposta
        return {
            message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
            code: 'NETWORK_ERROR',
        };
    }

    // Erro ao configurar a requisição
    return {
        message: error.message || 'Erro desconhecido',
        code: 'UNKNOWN_ERROR',
    };
}

// ==========================================
// Helpers
// ==========================================

/**
 * Verifica se a API está acessível
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        Logger.info('Verificando saúde da API...');
        await api.get('/health');
        Logger.success('API está acessível');
        return true;
    } catch (error) {
        Logger.error('API não está acessível', error);
        return false;
    }
}

/**
 * Obtém informações da configuração da API
 */
export function getApiConfig() {
    return {
        baseURL: API_BASE_URL,
        timeout: api.defaults.timeout,
        environment: Constants.expoConfig?.extra?.environment,
    };
}

export default api;
