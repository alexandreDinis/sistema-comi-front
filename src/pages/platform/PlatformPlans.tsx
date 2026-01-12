import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { platformService } from '../../services/platformService';
import { Check, Shield, Zap, Star } from 'lucide-react';

export const PlatformPlans: React.FC = () => {
    const { data: plans, isLoading } = useQuery({
        queryKey: ['platform-plans'],
        queryFn: platformService.listPlans
    });

    const getIcon = (name: string) => {
        switch (name) {
            case 'BRONZE': return <Shield className="text-bronze-400" />;
            case 'PRATA': return <Zap className="text-slate-400" />;
            case 'OURO': return <Star className="text-yellow-400" />;
            default: return <Shield />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">Planos & Recursos</h1>
                    <p className="text-slate-400 text-sm">Matriz de funcionalidades disponíveis.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center text-slate-500 py-10">Carregando planos...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans?.map(plan => (
                        <div key={plan.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                {getIcon(plan.name)}
                            </div>

                            <h3 className="text-xl font-black text-slate-100 uppercase mb-2">{plan.name}</h3>
                            <div className="text-3xl font-bold text-blue-400 mb-6">
                                {plan.price === 0 ? 'Gratuito / Custom' : `R$ ${plan.price}`}
                            </div>

                            <div className="space-y-3 flex-1">
                                <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-2">Recursos Incluídos</div>
                                {/* Mock features display if backend doesn't send detailed features yet */}
                                {['Dashboard', 'Gestão de Usuários'].map(feat => (
                                    <div key={feat} className="flex items-center gap-2 text-slate-300 text-sm">
                                        <Check size={14} className="text-green-500" /> {feat}
                                    </div>
                                ))}
                                {plan.name === 'OURO' && (
                                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                                        <Check size={14} className="text-green-500" /> Múltiplas Filiais
                                    </div>
                                )}
                            </div>

                            <button className="mt-6 w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm font-bold uppercase transition-colors">
                                Editar Plano
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
