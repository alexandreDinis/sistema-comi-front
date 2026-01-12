import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { platformService } from '../../services/platformService';
import { X, Building2, User, Loader2 } from 'lucide-react';

interface TenantOnboardingProps {
    onClose: () => void;
}

export const TenantOnboarding: React.FC<TenantOnboardingProps> = ({ onClose }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        nome: '',
        cnpj: '',
        adminEmail: '',
        adminPassword: '', // Field name matches backend spec
        plano: 'BRONZE' as 'BRONZE' | 'PRATA' | 'OURO'
    });

    const createMutation = useMutation({
        mutationFn: platformService.createTenant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-tenants'] });
            queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
            alert('Inquilino criado com sucesso! O administrador pode logar com o email e senha fornecidos.');
            onClose();
        },
        onError: (error: any) => {
            alert(`Erro ao criar inquilino: ${error.response?.data?.message || error.message}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-lg shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Building2 className="text-blue-500" /> Novo Inquilino (Onboarding)
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Empresa Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 pb-2 mb-2">
                            Dados da Empresa
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-xs mb-1">Nome Fantasia</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-slate-200 outline-none focus:border-blue-500"
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    placeholder="Ex: Auto Center X"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs mb-1">CNPJ</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-slate-200 outline-none focus:border-blue-500 font-mono"
                                    value={formData.cnpj}
                                    onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Admin Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 pb-2 mb-2">
                            Administrador Inicial
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-slate-400 text-xs mb-1 flex items-center gap-1"><User size={12} /> Email do Admin</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-slate-200 outline-none focus:border-blue-500"
                                    value={formData.adminEmail}
                                    onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                                    placeholder="admin@empresa.com"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-xs mb-1">Senha Provisória</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-slate-200 outline-none focus:border-blue-500 font-mono"
                                    value={formData.adminPassword}
                                    onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Plano */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700 pb-2 mb-2">
                            Plano de Assinatura
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {['BRONZE', 'PRATA', 'OURO'].map((plano) => (
                                <button
                                    type="button"
                                    key={plano}
                                    onClick={() => setFormData({ ...formData, plano: plano as any })}
                                    className={`p-3 rounded border text-sm font-bold transition-all ${formData.plano === plano
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {plano}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-700 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors flex items-center gap-2"
                        >
                            {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : 'Criar Inquilino'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
