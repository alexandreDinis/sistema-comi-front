import React from 'react';
import { Card } from '../../components/common/Card';
import { Users, DollarSign, Wallet } from 'lucide-react';

export const PartnerDashboard: React.FC = () => {
    // Mock Data for now - will connect to API later
    const stats = {
        activeTenants: 12,
        monthlyRevenue: 3450.00,
        myCost: 500.00
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                Painel do Parceiro
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                    title="Clientes Ativos" 
                    value={stats.activeTenants.toString()} 
                    icon={<Users className="text-blue-500" />} 
                />
                <Card 
                    title="Minha Receita (MRR)" 
                    value={stats.monthlyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                    icon={<DollarSign className="text-green-500" />} 
                />
                <Card 
                    title="Custo da Licença" 
                    value={stats.myCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                    icon={<Wallet className="text-purple-500" />} 
                />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Meus Clientes</h2>
                <p className="text-slate-500">Listagem de Tenants virá aqui.</p>
            </div>
        </div>
    );
};
