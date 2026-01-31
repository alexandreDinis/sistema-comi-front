import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformService } from '../../../services/platformService';
import { AlertTriangle, ArrowRight, Building2, CheckCircle, Loader2, X } from 'lucide-react';

interface PlatformMigrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: number;
    tenantName: string;
    currentLicencaName?: string;
}

interface MigrationForm {
    novaLicencaId: number;
    motivo: string;
}

export const PlatformMigrationModal: React.FC<PlatformMigrationModalProps> = ({
    isOpen,
    onClose,
    tenantId,
    tenantName,
    currentLicencaName
}) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm<MigrationForm>();
    const [serverError, setServerError] = useState<string | null>(null);

    // List all licenses (resellers) to choose from
    const { data: licencas, isLoading: loadingLicencas } = useQuery({
        queryKey: ['admin-licencas'],
        queryFn: platformService.listLicencas,
        enabled: isOpen
    });

    const migrationMutation = useMutation({
        mutationFn: (data: MigrationForm) => platformService.migrateTenant({
            empresaId: tenantId,
            novaLicencaId: Number(data.novaLicencaId),
            motivo: data.motivo
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['owner-licencas'] });
            queryClient.invalidateQueries({ queryKey: ['orphan-tenants'] });
            queryClient.invalidateQueries({ queryKey: ['risky-tenants'] });
            alert('Migração realizada com sucesso!');
            onClose();
        },
        onError: (err: any) => {
            setServerError(err.response?.data?.message || 'Erro ao realizar migração.');
        }
    });

    const onSubmit = (data: MigrationForm) => {
        if (confirm(`ATENÇÃO: Você está prestes a transferir o tenant "${tenantName}" para um novo revendedor. Confirma?`)) {
            setServerError(null);
            migrationMutation.mutate(data);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg relative overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <ArrowRight className="text-purple-400" />
                        Migração de Tenant
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Context info */}
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700/50">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-slate-500 text-xs uppercase mb-1">Tenant (Origem)</span>
                                <div className="font-medium text-slate-200 flex items-center gap-2">
                                    <Building2 size={14} className="text-slate-400" />
                                    {tenantName}
                                </div>
                            </div>
                            <div>
                                <span className="block text-slate-500 text-xs uppercase mb-1">Revendedor Atual</span>
                                <div className="font-medium text-slate-200">
                                    {currentLicencaName || <span className="text-yellow-500 italic">Gestão Direta / Órfão</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {serverError && (
                        <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-3 rounded mb-4 text-sm flex items-center gap-2">
                            <AlertTriangle size={16} />
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Novo Revendedor (Destino)</label>
                            {loadingLicencas ? (
                                <div className="animate-pulse h-10 bg-slate-800 rounded"></div>
                            ) : (
                                <select
                                    {...register('novaLicencaId', { required: true })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-200 focus:ring-1 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Selecione o destino...</option>
                                    {licencas?.filter(l => l.status === 'ATIVA').map(licenca => (
                                        <option key={licenca.id} value={licenca.id}>
                                            {licenca.nomeFantasia || licenca.razaoSocial} ({licenca.status})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.novaLicencaId && <span className="text-red-400 text-xs">Selecione o destino.</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Motivo da Transferência / Justificativa</label>
                            <textarea
                                {...register('motivo', { required: true, minLength: 10 })}
                                rows={3}
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-slate-200 focus:ring-1 focus:ring-purple-500 outline-none placeholder:text-slate-600"
                                placeholder="Ex: Revendedor anterior inadimplente; Solicitação do cliente..."
                            ></textarea>
                            {errors.motivo && <span className="text-red-400 text-xs">Mínimo 10 caracteres.</span>}
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={migrationMutation.isPending || loadingLicencas}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {migrationMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                Confirmar Migração
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
