import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types';
import { CheckCircle, Trash2, UserCog, AlertTriangle } from 'lucide-react';

export const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await userService.getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
            setError('Falha ao carregar lista de usuários.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await userService.approveUser(id);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, active: true } : u));
        } catch (err) {
            console.error(err);
            alert('Erro ao aprovar usuário.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja remover este usuário? Esta ação é irreversível.')) {
            return;
        }

        try {
            await userService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir usuário.');
        }
    };

    // State for Create User Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'USER' });

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await userService.createUser(newUser);
            setUsers(prev => [...prev, created]);
            setIsCreateModalOpen(false);
            setNewUser({ email: '', password: '', role: 'USER' });
        } catch (err) {
            console.error(err);
            alert('Erro ao criar usuário.');
        }
    };

    const toggleRole = async (user: User) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        if (!window.confirm(`Alterar papel de ${user.email} para ${newRole}?`)) return;

        try {
            await userService.updateUserRole(user.id, newRole);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole as any } : u)); // Cast to handle strict type if needed
        } catch (err) {
            console.error(err);
            alert('Erro ao alterar papel do usuário.');
        }
    };

    return (
        <div className="view-transition space-y-8 relative">
            <div className="flex items-center justify-between mb-8 border-b border-cyber-gold/20 pb-4">
                <div className="flex items-center gap-3">
                    <UserCog className="w-6 h-6 text-cyber-gold" />
                    <h1 className="text-3xl font-black text-cyber-gold tracking-widest italic italic-shadow">
                        PAINEL_ADMINISTRATIVO // SEC_LEVEL_0
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-[10px] font-mono text-cyber-gold/40">
                        USUÁRIOS_REGISTRADOS: {users.length}
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 border border-cyber-gold bg-cyber-gold/10 hover:bg-cyber-gold hover:text-black text-cyber-gold transition-all text-[10px] font-black tracking-wider flex items-center gap-2"
                    >
                        <UserCog className="w-4 h-4" /> NOVO_USUÁRIO
                    </button>
                </div>
            </div>

            {/* ERROR DISPLAY */}
            {error && (
                <div className="border border-cyber-error bg-cyber-error/10 p-4 mb-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyber-error animate-pulse"></div>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-cyber-error shrink-0" />
                        <div>
                            <span className="font-black text-cyber-error uppercase block text-[9px] mb-1">ERRO_SISTEMA:</span>
                            <span className="text-cyber-error/80 text-xs font-mono">{error}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* USERS TABLE */}
            <div className="hud-card top-brackets bottom-brackets p-0 bg-black/60 relative overflow-hidden">
                <div className="static-overlay opacity-5"></div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-cyber-gold/20 bg-cyber-gold/5">
                                <th className="p-4 text-[10px] font-black text-cyber-gold tracking-wider uppercase font-mono">ID_REF</th>
                                <th className="p-4 text-[10px] font-black text-cyber-gold tracking-wider uppercase font-mono">EMAIL_USUÁRIO</th>
                                <th className="p-4 text-[10px] font-black text-cyber-gold tracking-wider uppercase font-mono">NÍVEL_ACESSO</th>
                                <th className="p-4 text-[10px] font-black text-cyber-gold tracking-wider uppercase font-mono">STATUS_NODE</th>
                                <th className="p-4 text-[10px] font-black text-cyber-gold tracking-wider uppercase font-mono text-right">PROTOCOLO_AÇÃO</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono text-xs">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-cyber-gold/40 animate-pulse">
                                        {`>>>`} BUSCANDO DADOS CRIPTOGRAFADOS...
                                    </td>
                                </tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="border-b border-cyber-gold/5 hover:bg-cyber-gold/5 transition-colors group">
                                    <td className="p-4 text-cyber-gold/60">#{user.id.toString().padStart(4, '0')}</td>
                                    <td className="p-4 text-cyber-gold/90">{user.email}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleRole(user)}
                                            className={`px-2 py-1 text-[9px] font-bold border transition-colors hover:bg-white/10 ${user.role === 'ADMIN'
                                                    ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                                                    : 'border-cyber-gold/30 text-cyber-gold/60'
                                                }`}
                                            title="Clique para alternar permissão"
                                        >
                                            {user.role}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        {user.active ? (
                                            <div className="flex items-center gap-2 text-green-500 text-[10px]">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                ATIVO
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-cyber-error text-[10px]">
                                                <div className="w-1.5 h-1.5 bg-cyber-error rounded-full"></div>
                                                PENDENTE_APROVAÇÃO
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {!user.active && (
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                className="px-3 py-1 border border-green-500/30 text-green-500 bg-green-500/5 hover:bg-green-500/20 text-[9px] uppercase transition-all hover:scale-105 active:scale-95"
                                                title="Aprovar Acesso"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> APROVAR
                                                </div>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="px-3 py-1 border border-cyber-error/30 text-cyber-error bg-cyber-error/5 hover:bg-cyber-error/20 text-[9px] uppercase transition-all hover:scale-105 active:scale-95"
                                            title="Revogar Acesso"
                                        >
                                            <div className="flex items-center gap-1">
                                                <Trash2 className="w-3 h-3" /> REMOVER
                                            </div>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-cyber-gold/40 italic">
                                        NENHUM REGISTRO ENCONTRADO NO BANCO DE DADOS.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE USER MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="hud-card w-full max-w-md bg-black/90 border border-cyber-gold/30 relative">
                        <div className="p-6">
                            <h2 className="text-xl font-black text-cyber-gold mb-6 border-b border-cyber-gold/20 pb-2">
                                NOVO_REGISTRO_USUÁRIO
                            </h2>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-mono text-cyber-gold/60 mb-1">EMAIL_CORPORATIVO</label>
                                    <input
                                        type="email"
                                        required
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full bg-black/40 border border-cyber-gold/20 p-2 text-cyber-gold text-sm focus:border-cyber-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono text-cyber-gold/60 mb-1">CHAVE_ACESSO</label>
                                    <input
                                        type="password"
                                        required
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full bg-black/40 border border-cyber-gold/20 p-2 text-cyber-gold text-sm focus:border-cyber-gold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono text-cyber-gold/60 mb-1">NÍVEL_PERMISSÃO</label>
                                    <select
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full bg-black/40 border border-cyber-gold/20 p-2 text-cyber-gold text-sm focus:border-cyber-gold outline-none"
                                    >
                                        <option value="USER">USUÁRIO_PADRÃO</option>
                                        <option value="ADMIN">ADMINISTRADOR</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2 text-[10px] text-cyber-gold/60 hover:text-cyber-gold"
                                    >
                                        CANCELAR
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-cyber-gold text-black text-[10px] font-bold hover:bg-white transition-colors"
                                    >
                                        CRIAR_REGISTRO
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
