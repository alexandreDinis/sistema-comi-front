import React from 'react';
import { AdiantamentoForm } from '../components/forms/AdiantamentoForm';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdiantamentoPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-xl mx-auto mb-10">
                <nav className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-6">
                    <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        Dashboard
                    </Link>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                    <span className="text-slate-900">Novo Adiantamento</span>
                </nav>

                <h1 className="text-4xl font-black text-slate-900 tracking-tight text-emerald-950">
                    Controle de Adiantamentos
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Registre pagamentos antecipados para manter seu saldo sempre atualizado.
                </p>
            </div>

            <AdiantamentoForm />
        </div>
    );
};
