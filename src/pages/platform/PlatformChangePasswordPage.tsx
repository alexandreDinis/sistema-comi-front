import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { Lock, Save, AlertTriangle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';


export const PlatformChangePasswordPage: React.FC = () => {
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
                localStorage.setItem('user', JSON.stringify(user)); // Note: key might be 'user' or 'user_comi' depending on context, using 'user' as per authService
            }
            // Show success message then redirect
            setSuccess(true);
            setTimeout(() => navigate('/platform/dashboard'), 2000);
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
            <div className="max-w-md mx-auto mt-12">
                <div className="bg-slate-800 border border-green-500/50 p-8 rounded-lg shadow-lg relative overflow-hidden text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 mx-auto border border-green-500/30">
                        <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <h1 className="text-xl font-bold text-green-500 mb-2">
                        Senha Alterada!
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Sua senha foi alterada com sucesso. Redirecionando para o dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto mt-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-6 transition-colors text-sm"
            >
                <ArrowLeft size={16} /> Voltar
            </button>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">Alterar Senha</h1>
                        <p className="text-slate-400 text-sm">Atualize sua senha de acesso à plataforma admin.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-md flex items-center gap-3 text-red-300 text-sm">
                            <AlertTriangle size={18} className="shrink-0" /> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-1.5">
                                Senha Atual
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 pr-10 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600"
                                    value={passwords.currentPassword}
                                    onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    placeholder="Digite sua senha atual"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-1.5">
                                Nova Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 pr-10 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600"
                                    value={passwords.newPassword}
                                    onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-1.5">
                                Confirme a Nova Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    required
                                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-2.5 pr-10 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600"
                                    value={passwords.confirmPassword}
                                    onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    placeholder="Confirme sua nova senha"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={changePasswordMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {changePasswordMutation.isPending ? 'SALVANDO...' : (
                                <>
                                    <Save size={18} /> ATUALIZAR SENHA
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
