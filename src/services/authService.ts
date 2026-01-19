import axios from 'axios';
import type { LoginRequest, RegisterRequest, UserResponse } from '../types';
import { userService } from './userService';
import { queryClient } from '../lib/react-query';

// Usamos a URL base definida no api.ts mas acessamos o endpoint de auth especificamente
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1/').replace(/\/?$/, '/') + 'auth';

export const authService = {
    login: async (credentials: LoginRequest): Promise<UserResponse> => {
        const response = await axios.post<UserResponse>(`${API_URL}/login`, credentials);

        if (response.data.token) {
            // 1. Salva temporariamente apenas com token para o interceptor funcionar
            localStorage.setItem('user', JSON.stringify(response.data));

            try {
                // 2. Busca os dados completos do usuário (Role, Email, Active, etc)
                // O interceptor já vai usar o token salvo acima.
                const userProfile = await userService.getMe();

                // 3. Mescla o token com os dados do perfil
                const fullUser = {
                    ...response.data,
                    ...userProfile,
                    token: response.data.token // Garante que o token se mantenha
                };

                // 4. Salva o objeto completo
                localStorage.setItem('user', JSON.stringify(fullUser));
                return fullUser as UserResponse;
            } catch (error) {
                console.error("Erro ao buscar perfil do usuário", error);
                // Se falhar buscar o perfil, mantém o que veio do login (token apenas)
                return response.data;
            }
        }
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<UserResponse> => {
        const response = await axios.post<UserResponse>(`${API_URL}/register`, data);
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('user');
        queryClient.removeQueries();
        queryClient.invalidateQueries();
        queryClient.clear();
    },

    getCurrentUser: (): UserResponse | null => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    }
};
