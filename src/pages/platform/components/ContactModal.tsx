import React from 'react';
import { X, Building2, User, Mail, Ticket } from 'lucide-react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: any;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, tenant }) => {
    if (!isOpen || !tenant) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <User className="text-blue-400" />
                        Informações de Contato
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Tenant Info */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tenant (Cliente)</h3>
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                            <div className="flex items-center gap-3 mb-2">
                                <Building2 className="text-slate-400" size={18} />
                                <span className="font-medium text-slate-200">{tenant.nome}</span>
                            </div>
                            <div className="space-y-1 ml-8">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <span className="font-mono text-xs bg-slate-700 px-1 rounded">CNPJ</span>
                                    {tenant.cnpj}
                                </div>
                                {/* Assuming we might have email/phone in the future or reusing user email if available */}
                            </div>
                        </div>
                    </div>

                    {/* Reseller Info */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Revendedor (Licença)</h3>
                        <div className="bg-red-900/10 rounded-lg p-4 border border-red-500/20">
                            <div className="flex items-center gap-3 mb-2">
                                <Ticket className="text-red-400" size={18} />
                                <span className="font-medium text-red-100">{tenant.licenca?.nomeFantasia || tenant.licenca?.razaoSocial}</span>
                            </div>
                            <div className="space-y-1 ml-8 text-sm">
                                <div className="text-red-200/60 font-mono text-xs uppercase mb-1">{tenant.licenca?.status}</div>
                                <div className="flex items-center gap-2 text-red-200/80">
                                    <Mail size={14} />
                                    <span>{tenant.licenca?.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
