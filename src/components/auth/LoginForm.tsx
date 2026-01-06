import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useForm } from '../../hooks/useForm';
import { AlertCircle, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { values, handleChange } = useForm({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await authService.login(values);
            // Redireciona para a página inicial (dashboard) após login
            navigate('/');
        } catch (err: any) {
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Credenciais inválidas. ACESSO NEGADO.');
                } else if (err.response.status === 429) {
                    setError('Muitas tentativas. SISTEMA BLOQUEADO TEMPORARIAMENTE. Tente novamente em 15min.');
                } else {
                    setError('Erro de conexão com o servidor de autenticação.');
                }
            } else {
                setError('Falha na comunicação com o NÚCLEO.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="hud-card top-brackets bottom-brackets p-8 max-w-sm w-full relative overflow-hidden bg-black/80 backdrop-blur-sm border border-cyber-gold/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="static-overlay opacity-10"></div>

            <div className="text-center mb-10">
                <div className="inline-block relative">
                    <h2 className="text-3xl font-black text-cyber-gold tracking-widest uppercase italic italic-shadow glitch">
                        SISTEMA COMI
                    </h2>
                    <span className="absolute -bottom-2 right-0 text-[8px] font-mono text-cyber-gold/40">V2.4.0 // SECURE_ACCESS</span>
                </div>
            </div>

            {error && (
                <div className="border border-cyber-error bg-cyber-error/10 p-4 mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-error animate-pulse"></div>
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-cyber-error shrink-0" />
                        <div>
                            <span className="font-black text-cyber-error uppercase block text-[9px] mb-1">ERRO_CRÍTICO_0x99:</span>
                            <span className="text-cyber-error/80 text-xs font-mono">{error}</span>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group/field">
                    <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        ID_USUÁRIO
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-sm font-mono p-3 pl-4 outline-none focus:border-cyber-gold focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all"
                            placeholder="usuario@sistema.com"
                            required
                        />
                        <div className="absolute bottom-0 left-0 w-0 h-px bg-cyber-gold group-focus-within/field:w-full transition-all duration-500"></div>
                    </div>
                </div>

                <div className="relative group/field">
                    <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        CHAVE_ACESSO
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-sm font-mono p-3 pl-4 pr-10 outline-none focus:border-cyber-gold focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-gold/50 hover:text-cyber-gold transition-colors z-10"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <div className="absolute bottom-0 left-0 w-0 h-px bg-cyber-gold group-focus-within/field:w-full transition-all duration-500"></div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full hud-button group relative overflow-hidden"
                    >
                        {isLoading ? (
                            <span className="animate-pulse">{`>>>`} AUTENTICANDO...</span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                INICIAR_SESSÃO <span className="text-[9px] opacity-50 group-hover:translate-x-1 transition-transform">{`>>`}</span>
                            </span>
                        )}
                    </button>

                    <div className="text-center pt-4">
                        <Link to="/register" className="text-[10px] text-cyber-gold/60 hover:text-cyber-gold font-mono hover:underline tracking-wider transition-colors">
                            REGISTRAR NOVO ACESSO {`>>`}
                        </Link>
                    </div>

                    <p className="text-center mt-4 text-[9px] text-cyber-gold/20 font-mono">
                        ACESSO RESTRITO A PESSOAL AUTORIZADO
                        <br />
                        IP LOGGED: {window.location.hostname}
                    </p>
                </div>
            </form>
        </div>
    );
};
