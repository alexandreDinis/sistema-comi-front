/**
 * Authentication Service
 * 
 * Gerencia autenticação do usuário com armazenamento seguro de tokens.
 * Usa SecureStore para dados sensíveis e AsyncStorage para dados não-sensíveis.
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import Logger from '../utils/logger';

// Chaves de armazenamento
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER_PROFILE: 'user_profile', // AsyncStorage - não sensível
};

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserProfile;
}

class AuthService {
    /**
     * Realiza login do usuário
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            Logger.auth('Iniciando login...', { email: credentials.email });

            const response = await api.post<any>('/auth/login', credentials);
            console.log('[AuthService] Login response data:', JSON.stringify(response.data, null, 2));

            // Map API response to internal structure
            const accessToken = response.data.token;
            const refreshToken = response.data.refreshToken || ''; // API might not return refresh token yet

            // Construct user profile from response data or token
            // TODO: Ideally we should decode the token to get user info if not provided in response
            const user: UserProfile = {
                id: response.data.empresa?.id?.toString() || '0', // Fallback
                email: credentials.email,
                name: response.data.empresa?.nome || 'Usuário',
                role: 'USER' // Default role
            };

            if (!accessToken) {
                console.error('[AuthService] Access token is missing!');
            }

            // Salvar tokens de forma segura
            await this.saveTokens(accessToken || '', refreshToken);

            // Salvar perfil do usuário (não sensível)
            await this.saveUserProfile(user);

            Logger.success('Login realizado com sucesso');
            return response.data;
        } catch (error: any) {
            Logger.error('Erro ao fazer login', error);
            throw this.handleAuthError(error);
        }
    }

    /**
     * Realiza logout do usuário
     */
    async logout(): Promise<void> {
        try {
            Logger.auth('Realizando logout...');

            // Chamar endpoint de logout na API (opcional)
            try {
                await api.post('/auth/logout');
            } catch (error) {
                // Ignora erros do servidor no logout
                Logger.warn('Erro ao notificar logout no servidor', error);
            }

            // Limpar todos os dados armazenados
            await this.clearAuthData();

            Logger.success('Logout realizado com sucesso');
        } catch (error) {
            Logger.error('Erro ao fazer logout', error);
            throw error;
        }
    }

    /**
     * Atualiza o token de acesso usando o refresh token
     */
    async refreshAccessToken(): Promise<string> {
        try {
            Logger.auth('Atualizando token de acesso...');

            const refreshToken = await this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('Refresh token não encontrado');
            }

            const response = await api.post<{ accessToken: string }>('/auth/refresh', {
                refreshToken,
            });

            const { accessToken } = response.data;
            await this.saveAccessToken(accessToken);

            Logger.success('Token atualizado com sucesso');
            return accessToken;
        } catch (error) {
            Logger.error('Erro ao atualizar token', error);
            // Se falhar, fazer logout
            await this.logout();
            throw error;
        }
    }

    /**
     * Verifica se o usuário está autenticado
     */
    async isAuthenticated(): Promise<boolean> {
        try {
            const token = await this.getAccessToken();
            return !!token;
        } catch (error) {
            Logger.error('Erro ao verificar autenticação', error);
            return false;
        }
    }

    /**
     * Obtém o perfil do usuário atual
     */
    async getUserProfile(): Promise<UserProfile | null> {
        try {
            const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
            if (!profileJson) return null;

            return JSON.parse(profileJson);
        } catch (error) {
            Logger.error('Erro ao obter perfil do usuário', error);
            return null;
        }
    }

    // ==========================================
    // Métodos privados - Gerenciamento de Tokens
    // ==========================================

    /**
     * Salva tokens de autenticação no SecureStore
     */
    private async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
        try {
            Logger.storage('SAVE', STORAGE_KEYS.ACCESS_TOKEN);
            await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

            Logger.storage('SAVE', STORAGE_KEYS.REFRESH_TOKEN);
            await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        } catch (error) {
            Logger.error('Erro ao salvar tokens', error);
            throw new Error('Falha ao salvar credenciais de forma segura');
        }
    }

    /**
     * Salva apenas o access token
     */
    private async saveAccessToken(accessToken: string): Promise<void> {
        try {
            Logger.storage('SAVE', STORAGE_KEYS.ACCESS_TOKEN);
            await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        } catch (error) {
            Logger.error('Erro ao salvar access token', error);
            throw error;
        }
    }

    /**
     * Obtém o access token do SecureStore
     */
    async getAccessToken(): Promise<string | null> {
        try {
            Logger.storage('GET', STORAGE_KEYS.ACCESS_TOKEN);
            return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        } catch (error) {
            Logger.error('Erro ao obter access token', error);
            return null;
        }
    }

    /**
     * Obtém o refresh token do SecureStore
     */
    private async getRefreshToken(): Promise<string | null> {
        try {
            Logger.storage('GET', STORAGE_KEYS.REFRESH_TOKEN);
            return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        } catch (error) {
            Logger.error('Erro ao obter refresh token', error);
            return null;
        }
    }

    /**
     * Salva perfil do usuário no AsyncStorage (dados não sensíveis)
     */
    private async saveUserProfile(user: UserProfile): Promise<void> {
        try {
            Logger.storage('SAVE', STORAGE_KEYS.USER_PROFILE);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
        } catch (error) {
            Logger.error('Erro ao salvar perfil do usuário', error);
        }
    }

    /**
     * Limpa todos os dados de autenticação
     */
    private async clearAuthData(): Promise<void> {
        try {
            Logger.storage('DELETE', 'All auth data');

            // Limpar SecureStore (tokens sensíveis)
            await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

            // Limpar AsyncStorage (dados não sensíveis)
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        } catch (error) {
            Logger.error('Erro ao limpar dados de autenticação', error);
        }
    }

    /**
     * Trata erros de autenticação
     */
    private handleAuthError(error: any): Error {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message;

            switch (status) {
                case 401:
                    return new Error(message || 'Credenciais inválidas');
                case 403:
                    return new Error(message || 'Acesso negado');
                case 404:
                    return new Error('Serviço de autenticação não encontrado');
                case 500:
                    return new Error('Erro no servidor. Tente novamente mais tarde.');
                default:
                    return new Error(message || 'Erro ao autenticar');
            }
        }

        if (error.request) {
            return new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
        }

        return new Error('Erro inesperado ao fazer login');
    }
}

export default new AuthService();
