import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useForm } from '../../hooks/useForm';
import { AlertCircle, Lock, Mail, UserPlus, Eye, EyeOff } from 'lucide-react';

export const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { values, handleChange } = useForm({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (values.password !== values.confirmPassword) {
            setError('Senhas não coincidem.');
            setIsLoading(false);
            return;
        }

        try {
            await authService.register({
                email: values.email,
                password: values.password
            });
            navigate('/');
        } catch (err: any) {
            if (err.response) {
                if (err.response.status === 400) {
                    // Caso o backend retorne erro de validação ou usuário já existente
                    setError(err.response.data?.message || 'Dados inválidos ou usuário já existe.');
                } else {
                    setError('Erro ao registrar. Tente novamente.');
                }
            } else {
                setError('Falha na comunicação com o servidor.');
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
                    <h2 className="text-2xl font-black text-cyber-gold tracking-widest uppercase italic italic-shadow">
                        NOVO USUÁRIO
                    </h2>
                    <span className="absolute -bottom-2 right-0 text-[8px] font-mono text-cyber-gold/40">INIT_SEQUENCE</span>
                </div>
            </div>

            {error && (
                <div className="border border-cyber-error bg-cyber-error/10 p-4 mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-error animate-pulse"></div>
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-cyber-error shrink-0" />
                        <div>
                            <span className="font-black text-cyber-error uppercase block text-[9px] mb-1">ERRO_REGISTRO:</span>
                            <span className="text-cyber-error/80 text-xs font-mono">{error}</span>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group/field">
                    <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        EMAIL
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-sm font-mono p-3 pl-4 outline-none focus:border-cyber-gold focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all"
                            placeholder="admin@empresa.com"
                            required
                        />
                        <div className="absolute bottom-0 left-0 w-0 h-px bg-cyber-gold group-focus-within/field:w-full transition-all duration-500"></div>
                    </div>
                </div>

                <div className="relative group/field">
                    <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        SENHA
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

                <div className="relative group/field">
                    <label className="hud-label group-focus-within/field:text-cyber-gold transition-colors flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        CONFIRMAR SENHA
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-cyber-gold/10 text-cyber-gold text-sm font-mono p-3 pl-4 pr-10 outline-none focus:border-cyber-gold focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-gold/50 hover:text-cyber-gold transition-colors z-10"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                            <span className="animate-pulse">{`>>>`} REGISTRANDO...</span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                CRIAR CONTA
                            </span>
                        )}
                    </button>
                </div>

                <div className="text-center pt-2">
                    <Link to="/login" className="text-[10px] text-cyber-gold/60 hover:text-cyber-gold font-mono hover:underline tracking-wider transition-colors">
                        {`<<`} VOLTAR PARA LOGIN
                    </Link>
                </div>
            </form>
        </div>
    );
};
