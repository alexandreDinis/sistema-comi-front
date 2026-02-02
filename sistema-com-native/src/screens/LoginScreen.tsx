import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Eye, EyeOff, ScanFace } from 'lucide-react-native';
import { Button, Input, Card } from '../components/ui';
import { theme } from '../theme';
import { BiometricService } from '../services/biometricService';

export const LoginScreen = () => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isBiometricReady, setIsBiometricReady] = useState(false);

    useEffect(() => {
        BiometricService.isReady().then(ready => {
            setIsBiometricReady(ready);
            if (ready) {
                // Optional: Auto-trigger biometric prompt if ready
                // handleBiometricLogin();
            }
        });
    }, []);

    const handleBiometricLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const credentials = await BiometricService.loginWithBiometrics();
            if (credentials) {
                await signIn({ email: credentials.email, password: credentials.pass });
            } else {
                setLoading(false); // Cancelled or failed
            }
        } catch (err: any) {
            console.error('Biometric login failed', err);
            if (err.response?.status === 401) {
                Alert.alert('Sessão Expirada', 'Por segurança, faça login com senha novamente.');
                await BiometricService.clearCredentials();
                setIsBiometricReady(false); // Force re-check or hide button
            } else {
                setError('Falha no login biométrico.');
            }
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await signIn({ email, password });

            await signIn({ email, password });

            // Check if device supports biometrics
            const canUseBiometrics = await BiometricService.hasHardware();

            if (canUseBiometrics) {
                // Ask user if they want to enable biometric login
                Alert.alert(
                    'Facilitar Acesso',
                    'Deseja ativar o login com Biometria para os próximos acessos?',
                    [
                        {
                            text: 'Não, obrigado',
                            style: 'cancel',
                            onPress: () => console.log('Biometria recusada pelo usuário')
                        },
                        {
                            text: 'Sim, ativar',
                            onPress: async () => {
                                try {
                                    await BiometricService.saveCredentials(email, password);
                                    Alert.alert('Sucesso', 'Biometria ativada!');
                                } catch (e) {
                                    console.error('Falha ao salvar biometria', e);
                                    Alert.alert('Erro', 'Não foi possível ativar a biometria.');
                                }
                            }
                        }
                    ]
                );
            }

        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                setError('Credenciais inválidas. ACESSO NEGADO.');
            } else if (err.response?.status === 429) {
                setError('Muitas tentativas. Tente novamente em 15min.');
            } else {
                setError('Falha na conexão com o servidor.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 24,
            }}
        >
            {/* Grid Background Effect */}
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.03,
                }}
            />

            {/* Logo */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
                <Image
                    source={require('../../assets/logo-final.png')}
                    style={{
                        width: 120,
                        height: 120,
                        resizeMode: 'contain',
                        marginBottom: 16,
                    }}
                />
                <Text
                    style={{
                        fontSize: 24,
                        fontWeight: '900',
                        color: theme.colors.primary,
                        letterSpacing: 3,
                        textTransform: 'uppercase',
                    }}
                >
                    GESTÃO DE SERVIÇOS
                </Text>
                <Text
                    style={{
                        fontSize: 9,
                        color: theme.colors.textMuted,
                        letterSpacing: 2,
                        marginTop: 4,
                    }}
                >
                    V2.4.0 // SECURE_ACCESS
                </Text>
            </View>

            {/* Login Card */}
            <Card style={{ width: '100%', maxWidth: 360 }}>
                {/* Error Message */}
                {error && (
                    <View
                        style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 1,
                            borderColor: theme.colors.error,
                            padding: 12,
                            marginBottom: 20,
                            borderRadius: 4,
                        }}
                    >
                        <Text style={{ color: theme.colors.error, fontSize: 10, fontWeight: '700', marginBottom: 2 }}>
                            ERRO_CRÍTICO:
                        </Text>
                        <Text style={{ color: theme.colors.error, fontSize: 12 }}>{error}</Text>
                    </View>
                )}

                {/* Email Input */}
                <Input
                    label="ID_USUÁRIO"
                    placeholder="usuario@gestao.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    icon={<Mail size={16} color={theme.colors.textSecondary} />}
                    containerStyle={{ marginBottom: 20 }}
                />

                {/* Password Input */}
                <View style={{ marginBottom: 24 }}>
                    <Input
                        label="CHAVE_ACESSO"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        icon={<Lock size={16} color={theme.colors.textSecondary} />}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: 12,
                            bottom: 14,
                            padding: 4,
                        }}
                    >
                        {showPassword ? (
                            <EyeOff size={18} color={theme.colors.textMuted} />
                        ) : (
                            <Eye size={18} color={theme.colors.textMuted} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <Button onPress={handleLogin} loading={loading} disabled={loading}>
                    {loading ? '>>> AUTENTICANDO...' : 'INICIAR_SESSÃO >>'}
                </Button>

                {/* Biometric Button */}
                {isBiometricReady && (
                    <TouchableOpacity
                        onPress={handleBiometricLogin}
                        disabled={loading}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 16,
                            paddingVertical: 12,
                            borderWidth: 1,
                            borderColor: theme.colors.primaryMuted,
                            borderRadius: 8,
                            backgroundColor: 'rgba(212, 175, 55, 0.05)'
                        }}
                    >
                        <ScanFace size={20} color={theme.colors.primary} />
                        <Text style={{ color: theme.colors.primary, fontWeight: '700', marginLeft: 8, fontSize: 12, letterSpacing: 1 }}>
                            ACESSAR COM BIOMETRIA
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Forgot Password */}
                <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 10, letterSpacing: 1 }}>
                        ESQUECI MINHA SENHA
                    </Text>
                </TouchableOpacity>

                {/* Footer */}
                <Text
                    style={{
                        textAlign: 'center',
                        marginTop: 24,
                        fontSize: 9,
                        color: theme.colors.textMuted,
                        opacity: 0.5,
                    }}
                >
                    ACESSO RESTRITO A PESSOAL AUTORIZADO
                </Text>
            </Card>
        </KeyboardAvoidingView>
    );
};
