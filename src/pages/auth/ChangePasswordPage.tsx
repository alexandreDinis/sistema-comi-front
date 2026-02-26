import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { Lock, Save, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const changePasswordMutation = useMutation({
        mutationFn: () => userService.changePassword(passwords.currentPassword, passwords.newPassword),
        onSuccess: () => {
            // Update local user state
            const user = authService.getCurrentUser();
            if (user) {
                user.mustChangePassword = false;
                localStorage.setItem('user', JSON.stringify(user));
            }
            // Show success message then redirect
            setSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        },
        onError: (err: any) => {
            const errorMessage = err.response?.data?.error || 'Erro ao alterar senha. Tente novamente.';
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

        changePasswordMutation.mutate();
    };

    // Success State
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
                        <p className="text-cyber-gold/60 text-sm font-mono text-center">
                            Sua senha foi alterada com sucesso. Redirecionando...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 cyberpunk-grid">
            <div className="w-full max-w-md bg-slate-900/90 border border-cyber-gold/30 p-8 rounded-lg shadow-[0_0_30px_rgba(212,175,55,0.1)] relative overflow-hidden">
                {/* Decorative */}
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-cyber-gold to-transparent"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-cyber-gold/10 rounded-full flex items-center justify-center mb-4 border border-cyber-gold/30 animate-pulse">
                        <Lock size={32} className="text-cyber-gold" />
                    </div>
                    <h1 className="text-2xl font-black text-cyber-gold uppercase tracking-widest text-center">
                        Alteração de Senha
                    </h1>
                    <p className="text-cyber-gold/60 text-sm font-mono mt-2 text-center">
                        Por segurança, você deve alterar sua senha.
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
                                Senha Atual
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    required
                                    className="w-full bg-black/60 border border-cyber-gold/30 text-cyber-gold p-3 pr-10 rounded hover:border-cyber-gold/60 focus:border-cyber-gold outline-none transition-colors"
                                    value={passwords.currentPassword}
                                    onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-gold/50 hover:text-cyber-gold transition-colors"
                                >
                                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
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
                                Confirme a Nova Senha
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
                        disabled={changePasswordMutation.isPending}
                        className="w-full bg-cyber-gold hover:bg-yellow-400 text-black font-bold py-3 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-2 font-oxanium"
                    >
                        {changePasswordMutation.isPending ? 'SALVANDO...' : (
                            <>
                                <Save size={18} /> CONFIRMAR ALTERAÇÃO
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

