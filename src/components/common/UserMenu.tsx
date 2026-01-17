import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Key, LogOut, ChevronDown, Shield } from 'lucide-react';
import { authService } from '../../services/authService';

export const UserMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const user = authService.getCurrentUser();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    const getRoleBadge = (role?: string) => {
        switch (role?.toUpperCase().replace('ROLE_', '')) {
            case 'SUPER_ADMIN':
            case 'ADMIN_PLATAFORMA':
                return { label: 'ADMIN PLATAFORMA', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
            case 'ADMIN_EMPRESA':
                return { label: 'ADMINISTRADOR', color: 'text-cyber-gold bg-cyber-gold/10 border-cyber-gold/30' };
            case 'FUNCIONARIO':
                return { label: 'FUNCIONÁRIO', color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' };
            default:
                return { label: 'USUÁRIO', color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' };
        }
    };

    if (!user) return null;

    const roleBadge = getRoleBadge(user.role);

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-cyber-gold/10 transition-colors group"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-cyber-gold/20 border border-cyber-gold/40 flex items-center justify-center text-cyber-gold text-xs font-bold group-hover:border-cyber-gold transition-colors">
                    {getInitials(user.email)}
                </div>

                {/* Email (hidden on mobile) */}
                <div className="hidden lg:flex flex-col items-start">
                    <span className="text-[10px] text-cyber-gold/80 font-mono truncate max-w-[120px]">
                        {user.email}
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${roleBadge.color.split(' ')[0]}`}>
                        {roleBadge.label}
                    </span>
                </div>

                <ChevronDown size={12} className={`text-cyber-gold/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-black/95 border border-cyber-gold/40 rounded shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl z-50 overflow-hidden animate-fadeIn">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-cyber-gold/20 bg-cyber-gold/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyber-gold/20 border-2 border-cyber-gold/40 flex items-center justify-center text-cyber-gold font-bold">
                                {getInitials(user.email)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-cyber-gold text-sm font-medium truncate">{user.email}</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border rounded ${roleBadge.color}`}>
                                    <Shield size={8} />
                                    {roleBadge.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <Link
                            to="/change-password"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-cyber-gold/70 hover:text-cyber-gold hover:bg-cyber-gold/10 transition-colors"
                        >
                            <Key size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Alterar Senha</span>
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-cyber-gold/20 py-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Sair</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
