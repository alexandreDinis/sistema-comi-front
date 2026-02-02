import React, { createContext, useState, useEffect, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';
import { LoginRequest, UserResponse } from '../types';

interface AuthContextData {
    user: UserResponse | null;
    loading: boolean;
    signIn: (credentials: LoginRequest) => Promise<UserResponse>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStorageData = async () => {
            console.log('[AuthContext] loadStorageData started');
            try {
                const storedUser = await authService.getUserProfile();
                console.log('[AuthContext] storedUser retrieved:', !!storedUser);
                if (storedUser) {
                    setUser(storedUser);
                }
            } catch (error) {
                console.error('[AuthContext] loadStorageData error:', error);
            } finally {
                console.log('[AuthContext] Setting loading to false');
                setLoading(false);
            }
        };
        loadStorageData();
    }, []);

    const signIn = async (credentials: LoginRequest) => {
        const userData = await authService.login(credentials);
        setUser(userData);
        return userData;
    };

    const signOut = async () => {
        await authService.logout();
        setUser(null);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
