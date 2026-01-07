import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1/').replace(/\/?$/, '/');

const api = axios.create({
    baseURL: API_BASE_URL,
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
                config.headers['Authorization'] = 'Bearer ' + user.token;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 (Unauthorized), 429 (Rate Limit) and 403 (Forbidden)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // Auto logout if token is invalid or expired
                localStorage.removeItem('user'); // Inline logout
                window.location.reload();
            } else if (error.response.status === 429) {
                // Rate Limiting
                console.error("Muitas tentativas de login. Por favor, aguarde 15 minutos e tente novamente.");
            } else if (error.response.status === 403) {
                // Access Denied
                // alert("Acesso Negado: Você não tem permissão para acessar este recurso.");
                console.warn("Acesso Negado (403):", error.config.url);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
