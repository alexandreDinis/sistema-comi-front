import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
    throw new Error('VITE_API_URL não definida no build');
}

const api = axios.create({
    baseURL: API_BASE_URL.replace(/\/?$/, '/'),
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        // Break circular dependency: Read localStorage directly
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                console.log("[API] Attaching Token:", user.token.substring(0, 10) + "...");
                config.headers['Authorization'] = 'Bearer ' + user.token;
            } else {
                console.warn("[API] No token found in localStorage user object");
            }
        } else {
            console.warn("[API] No user found in localStorage");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Queue for refreshing 401s
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token as string);
        }
    });
    failedQueue = [];
};

// Response Interceptor: Handle 401 (Unauthorized), 429 (Rate Limit) and 403 (Forbidden)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response) {
            // Check for specific Auth Version Mismatch
            if (error.response.status === 401 && !originalRequest._retry && !originalRequest.url?.endsWith('/auth/login') && !originalRequest.url?.endsWith('/auth/refresh')) {
                const errorMsg = error.response.data?.error || "";

                // Backend sends: "Plano/status alterado. Faça login novamente." or "Permissões alteradas. Faça login novamente."
                if (errorMsg.includes("Plano/status alterado") || errorMsg.includes("Permissões alteradas")) {

                    if (isRefreshing) {
                        return new Promise(function (resolve, reject) {
                            failedQueue.push({ resolve, reject });
                        }).then(token => {
                            originalRequest.headers['Authorization'] = 'Bearer ' + token;
                            // Ensure retry request uses the same method as original request
                            originalRequest.headers['Authorization'] = 'Bearer ' + token;
                            return api(originalRequest);
                        }).catch(err => {
                            return Promise.reject(err);
                        });
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    try {
                        console.log("[API] Auth Version Mismatch detected. Attempting Auto-Refresh...");

                        // Use api instance to include stale token in headers (validated by signature only at /refresh endpoint)
                        const refreshResponse = await api.post('/auth/refresh');
                        const newUserFields = refreshResponse.data;

                        const userStr = localStorage.getItem('user');
                        const oldUser = userStr ? JSON.parse(userStr) : {};

                        // Merge updated fields (token, roles, features, etc.)
                        const updatedUser = { ...oldUser, ...newUserFields };

                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        console.log("[API] Token refreshed successfully!");

                        // Update defaults and queue
                        api.defaults.headers.common['Authorization'] = 'Bearer ' + updatedUser.token;
                        originalRequest.headers['Authorization'] = 'Bearer ' + updatedUser.token;

                        processQueue(null, updatedUser.token);

                        return api(originalRequest);
                    } catch (refreshError) {
                        processQueue(refreshError, null);
                        console.error("[API] Failed to refresh token", refreshError);
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }
                }
            }

            if (error.response.status === 401) {
                // If not handled by refresh logic above (e.g. normal expiration or login failure)
                if (!originalRequest._retry && !originalRequest.url?.endsWith('/auth/refresh')) {
                    console.warn("[API] 401 Unauthorized - Token inválido ou expirado.");
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            } else if (error.response.status === 429) {
                console.error("Muitas tentativas de login. Por favor, aguarde 15 minutos e tente novamente.");
            } else if (error.response.status === 403) {
                console.warn("Acesso Negado (403):", error.config.url);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
