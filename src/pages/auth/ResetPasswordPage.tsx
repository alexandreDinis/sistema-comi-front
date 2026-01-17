import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Lock, Save, AlertTriangle, CheckCircle, ArrowLeft, XCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });

    // Validate token on mount
    const { data: tokenValidation, isLoading: isValidating } = useQuery({
        queryKey: ['validate-reset-token', token],
        queryFn: async () => {
            if (!token) return { valid: false };
            const response = await api.get(`/auth/validate-reset-token?token=${token}`);
            return response.data as { valid: boolean };
        },
        enabled: !!token
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async () => {
            await api.post('/auth/reset-password', {
                token,
                newPassword: passwords.newPassword
            });
        },
        onSuccess: () => {
            setSuccess(true);
            setError('');
            // Redirect to login after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
        },
        onError: (err: any) => {
            const errorMessage = err.response?.data?.error || 'Erro ao redefinir senha. Tente novamente.';
            setError(errorMessage);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (passwords.newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        resetPasswordMutation.mutate();
    };

    // Invalid or missing token
    if (!token || (tokenValidation && !tokenValidation.valid)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4 cyberpunk-grid">
                <div className="w-full max-w-md bg-slate-900/90 border border-red-500/30 p-8 rounded-lg shadow-[0_0_30px_rgba(255,0,0,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-red-500 to-transparent"></div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
                            <XCircle size={32} className="text-red-500" />
                        </div>
                        <h1 className="text-xl font-black text-red-500 uppercase tracking-widest text-center mb-4">
                            Link Inválido
                        </h1>
                        <p className="text-cyber-gold/60 text-sm font-mono text-center mb-6">
                            Este link de recuperação é inválido ou já expirou. Solicite um novo link.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="bg-cyber-gold hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded uppercase tracking-wider text-sm"
                        >
                            Solicitar Novo Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Loading validation
    if (isValidating) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4 cyberpunk-grid">
                <div className="text-cyber-gold animate-pulse">Verificando link...</div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4 cyberpunk-grid">
                <div className="w-full max-w-md bg-slate-900/90 border border-green-500/30 p-8 rounded-lg shadow-[0_0_30px_rgba(0,255,0,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-green-500 to-transparent"></div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <h1 className="text-xl font-black text-green-500 uppercase tracking-widest text-center mb-4">
                            Senha Alterada!
                        </h1>
                        <p className="text-cyber-gold/60 text-sm font-mono text-center mb-6">
                            Sua senha foi redefinida com sucesso. Redirecionando para o login...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 cyberpunk-grid">
            <div className="w-full max-w-md bg-slate-900/90 border border-cyber-gold/30 p-8 rounded-lg shadow-[0_0_30px_rgba(212,175,55,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-cyber-gold to-transparent"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-cyber-gold/10 rounded-full flex items-center justify-center mb-4 border border-cyber-gold/30">
                        <Lock size={32} className="text-cyber-gold" />
                    </div>
                    <h1 className="text-2xl font-black text-cyber-gold uppercase tracking-widest text-center">
                        Nova Senha
                    </h1>
                    <p className="text-cyber-gold/60 text-sm font-mono mt-2 text-center">
                        Digite sua nova senha.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-900/20 border border-red-500/50 p-3 rounded flex items-center gap-2 text-red-400 text-xs">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-cyber-gold/50 text-xs font-bold uppercase tracking-wider block mb-1">
                                Nova Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    required
                                    className="w-full bg-black/60 border border-cyber-gold/30 text-cyber-gold p-3 pr-10 rounded hover:border-cyber-gold/60 focus:border-cyber-gold outline-none transition-colors"
                                    value={passwords.newPassword}
                                    onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-gold/50 hover:text-cyber-gold transition-colors"
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-cyber-gold/50 text-xs font-bold uppercase tracking-wider block mb-1">
                                Confirmar Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    required
                                    className="w-full bg-black/60 border border-cyber-gold/30 text-cyber-gold p-3 pr-10 rounded hover:border-cyber-gold/60 focus:border-cyber-gold outline-none transition-colors"
                                    value={passwords.confirmPassword}
                                    onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-gold/50 hover:text-cyber-gold transition-colors"
                                >
                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={resetPasswordMutation.isPending}
                        className="w-full bg-cyber-gold hover:bg-yellow-400 text-black font-bold py-3 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-2 font-oxanium"
                    >
                        {resetPasswordMutation.isPending ? 'SALVANDO...' : (
                            <>
                                <Save size={18} /> SALVAR NOVA SENHA
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-cyber-gold/60 hover:text-cyber-gold text-sm font-mono flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={14} /> Voltar ao Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};
