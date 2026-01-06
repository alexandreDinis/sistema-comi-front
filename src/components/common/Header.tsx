import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
    const location = useLocation();

    // Função para verificar se o link está ativo
    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <Link
                        to="/"
                        className="text-2xl font-bold hover:text-blue-100 transition"
                    >
                        💰 Controle de Comissão
                    </Link>

                    <nav className="flex gap-6">
                        <Link
                            to="/"
                            className={`transition ${isActive('/')
                                    ? 'text-white font-bold border-b-2 border-white'
                                    : 'hover:text-blue-100'
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/faturamento"
                            className={`transition ${isActive('/faturamento')
                                    ? 'text-white font-bold border-b-2 border-white'
                                    : 'hover:text-blue-100'
                                }`}
                        >
                            Faturamento
                        </Link>
                        <Link
                            to="/adiantamento"
                            className={`transition ${isActive('/adiantamento')
                                    ? 'text-white font-bold border-b-2 border-white'
                                    : 'hover:text-blue-100'
                                }`}
                        >
                            Adiantamentos
                        </Link>
                        <Link
                            to="/comissao"
                            className={`transition ${isActive('/comissao')
                                    ? 'text-white font-bold border-b-2 border-white'
                                    : 'hover:text-blue-100'
                                }`}
                        >
                            Comissão
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};
