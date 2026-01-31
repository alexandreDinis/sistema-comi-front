import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { platformService } from '../../services/platformService';
import { ShieldAlert, ArrowRight, Building2, Ticket } from 'lucide-react';
import { PlatformMigrationModal } from './components/PlatformMigrationModal';
import { ContactModal } from './components/ContactModal';

export const PlatformRiskPage: React.FC = () => {
    const [selectedTenant, setSelectedTenant] = useState<{ id: number; name: string; licencaName?: string } | null>(null);


    const [contactTenant, setContactTenant] = useState<any>(null);

    const { data: riskyTenants, isLoading } = useQuery({
        queryKey: ['risky-tenants'],
        queryFn: platformService.getRiskyTenants
    });

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                        <ShieldAlert className="text-red-500" />
                        Gestão de Risco
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Inquilinos (Tenants) vinculados a revendedores bloqueados ou cancelados.
                        <br />
                        <span className="text-red-400 font-medium">Ação Requerida:</span> Migrar estes clientes urgentemente para evitar interrupção de serviço.
                    </p>
                </div>
                {riskyTenants && (
                    <div className="bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-lg">
                        <span className="text-red-200 text-sm font-medium">Total em Risco</span>
                        <div className="text-2xl font-bold text-red-400">{riskyTenants.length}</div>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Carregando análise de risco...</div>
            ) : !riskyTenants?.length ? (
                <div className="bg-green-900/10 border border-green-500/20 rounded-lg p-12 text-center">
                    <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="text-green-500 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium text-green-400 mb-2">Nenhum Risco Detectado</h3>
                    <p className="text-slate-400">Todos os tenants estão vinculados a licenças ativas.</p>
                </div>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden ring-1 ring-red-500/30">
                    <table className="w-full text-sm">
                        <thead className="bg-red-900/20 text-red-200 uppercase text-xs">
                            <tr>
                                <th className="text-left p-4">Tenant em Risco</th>
                                <th className="text-left p-4">Revendedor Atual (Status)</th>
                                <th className="text-left p-4">Plano</th>
                                <th className="text-right p-4">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {riskyTenants.map((empresa: any) => (
                                <tr key={empresa.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-slate-100 flex items-center gap-2">
                                            <Building2 size={16} className="text-slate-500" />
                                            {empresa.nome}
                                        </div>
                                        <div className="text-slate-500 text-xs ml-6">{empresa.cnpj}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-red-400 font-medium">
                                            <Ticket size={14} />
                                            {empresa.licenca?.nomeFantasia || 'Licença Suspensa'}
                                        </div>
                                        <div className="text-red-500/60 text-xs uppercase font-bold ml-6">
                                            {empresa.licenca?.status}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">{empresa.plano}</td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => setContactTenant(empresa)}
                                            className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 px-3 py-1.5 rounded transition-all flex items-center gap-2 text-xs font-medium"
                                        >
                                            Contato
                                        </button>
                                        <button
                                            onClick={() => setSelectedTenant({
                                                id: empresa.id,
                                                name: empresa.nome,
                                                licencaName: empresa.licenca?.nomeFantasia
                                            })}
                                            className="bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-600/30 px-3 py-1.5 rounded transition-all flex items-center gap-2 text-xs font-medium uppercase tracking-wide"
                                        >
                                            <ArrowRight size={14} />
                                            Migrar Tenant
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Migration Modal */}
            {selectedTenant && (
                <PlatformMigrationModal
                    isOpen={!!selectedTenant}
                    onClose={() => setSelectedTenant(null)}
                    tenantId={selectedTenant.id}
                    tenantName={selectedTenant.name}
                    currentLicencaName={selectedTenant.licencaName}
                />
            )}

            {/* Contact Modal */}
            {contactTenant && (
                <ContactModal
                    isOpen={!!contactTenant}
                    onClose={() => setContactTenant(null)}
                    tenant={contactTenant}
                />
            )}
        </div>
    );
};
