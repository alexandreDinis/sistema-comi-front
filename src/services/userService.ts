import api from './api';
import type { User } from '../types';

export const userService = {
    getUsers: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/users');
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await api.get<User>('/users/me');
        return response.data;
    },

    approveUser: async (id: number): Promise<User> => {
        const response = await api.patch<User>(`/users/${id}/approve`);
        return response.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    createUser: async (userData: { email: string; password: string; role?: string }): Promise<User> => {
        const response = await api.post<User>('/users', userData);
        return response.data;
    },

    updateUserRole: async (id: number, role: string): Promise<User> => {
        // Envia a string "ADMIN" ou "USER" diretamente como body, JSON encoded, conforme guia
        const response = await api.patch<User>(`/users/${id}/role`, JSON.stringify(role), {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    }
};
