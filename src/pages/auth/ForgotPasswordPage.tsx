import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { Mail, Send, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const forgotPasswordMutation = useMutation({
        mutationFn: async (email: string) => {
            await api.post('/auth/forgot-password', { email });
        },
        onSuccess: () => {
            setSuccess(true);
            setError('');
        },
        onError: () => {
            setError('Erro ao processar solicitação. Tente novamente.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.includes('@')) {
            setError('Digite um email válido.');
            return;
        }

        forgotPasswordMutation.mutate(email);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4 cyberpunk-grid">
                <div className="w-full max-w-md bg-slate-900/90 border border-cyber-gold/30 p-8 rounded-lg shadow-[0_0_30px_rgba(212,175,55,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-green-500 to-transparent"></div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                            <CheckCircle size={32} className="text-green-500" />
                        </div>
                        <h1 className="text-xl font-black text-green-500 uppercase tracking-widest text-center mb-4">
                            Email Enviado!
                        </h1>
                        <p className="text-cyber-gold/60 text-sm font-mono text-center mb-6">
                            Se o email estiver cadastrado em nossa plataforma, você receberá um link para redefinir sua senha.
                        </p>
                        <Link
                            to="/login"
                            className="text-cyber-gold hover:text-cyber-gold/80 text-sm font-mono flex items-center gap-2"
                        >
                            <ArrowLeft size={14} /> Voltar ao Login
                        </Link>
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
                        <Mail size={32} className="text-cyber-gold" />
                    </div>
                    <h1 className="text-2xl font-black text-cyber-gold uppercase tracking-widest text-center">
                        Recuperar Senha
                    </h1>
                    <p className="text-cyber-gold/60 text-sm font-mono mt-2 text-center">
                        Digite seu email para receber o link de recuperação.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-900/20 border border-red-500/50 p-3 rounded flex items-center gap-2 text-red-400 text-xs">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}

                    <div>
                        <label className="text-cyber-gold/50 text-xs font-bold uppercase tracking-wider block mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full bg-black/60 border border-cyber-gold/30 text-cyber-gold p-3 rounded hover:border-cyber-gold/60 focus:border-cyber-gold outline-none transition-colors"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={forgotPasswordMutation.isPending}
                        className="w-full bg-cyber-gold hover:bg-yellow-400 text-black font-bold py-3 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-2 font-oxanium"
                    >
                        {forgotPasswordMutation.isPending ? 'ENVIANDO...' : (
                            <>
                                <Send size={18} /> ENVIAR LINK
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
