import React, { useState, useMemo } from 'react';
import { formatarData } from '../../utils/formatters';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { osService } from '../../services/osService';
import type { CreateOSRequest } from '../../types';
import { ClipboardList, Plus, Calendar, User, ChevronRight, Search, Ban, CheckCircle, Clock } from 'lucide-react';

export const OrdemServicoListPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'iniciadas' | 'finalizadas' | 'canceladas'>('iniciadas');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const [newOSData, setNewOSData] = useState<CreateOSRequest>({
        clienteId: 0,
        data: new Date().toISOString().split('T')[0]
    });

    const { data: osList, isLoading } = useQuery({
        queryKey: ['ordens-servico'],
        queryFn: () => osService.listOS()
    });

    const { data: clientes } = useQuery({
        queryKey: ['clientes'],
        queryFn: () => osService.listClientes()
    });

    const mutation = useMutation({
        mutationFn: osService.createOS,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['ordens-servico'] });
            setIsCreateModalOpen(false);
            navigate(`/os/${data.id}`);
        }
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newOSData.clienteId === 0) {
            alert("Selecione um cliente");
            return;
        }
        mutation.mutate(newOSData);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ABERTA': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
            case 'EM_EXECUCAO': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
            case 'FINALIZADA': return 'text-green-400 border-green-400/30 bg-green-400/10';
            case 'CANCELADA': return 'text-red-400 border-red-400/30 bg-red-400/10';
            default: return 'text-gray-400';
        }
    };

    const filteredList = useMemo(() => {
        if (!osList) return [];
        return osList.filter(os => {
            // 1. Status Filter (Tab)
            let statusMatch = false;
            if (activeTab === 'iniciadas') statusMatch = (os.status === 'ABERTA' || os.status === 'EM_EXECUCAO');
            else if (activeTab === 'finalizadas') statusMatch = (os.status === 'FINALIZADA');
            else if (activeTab === 'canceladas') statusMatch = (os.status === 'CANCELADA');

            // 2. Client Name Filter
            const clientMatch =
                os.cliente.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                os.cliente.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase());

            // 3. Date Filter
            const dateMatch = dateFilter ? os.data === dateFilter : true;

            return statusMatch && clientMatch && dateMatch;
        });
    }, [osList, activeTab, searchTerm, dateFilter]);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-orbitron text-cyber-gold font-bold tracking-wider flex items-center gap-3">
                    <ClipboardList className="w-8 h-8" />
                    ORDENS DE SERVIÇO
                </h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-cyber-gold text-black font-bold px-6 py-2 rounded hover:bg-yellow-400 transition-all flex items-center gap-2 font-oxanium"
                >
                    <Plus className="w-5 h-5" />
                    NOVA O.S.
                </button>
            </div>

            {/* Tabs for Status */}
            <div className="flex gap-4 mb-6 border-b border-cyber-gold/20 pb-1">
                <button
                    onClick={() => setActiveTab('iniciadas')}
                    className={`flex items-center gap-2 px-4 py-2 font-oxanium transition-all ${activeTab === 'iniciadas' ? 'text-cyber-gold border-b-2 border-cyber-gold' : 'text-gray-500 hover:text-white'}`}
                >
                    <Clock size={16} /> INICIADAS
                </button>
                <button
                    onClick={() => setActiveTab('finalizadas')}
                    className={`flex items-center gap-2 px-4 py-2 font-oxanium transition-all ${activeTab === 'finalizadas' ? 'text-cyber-gold border-b-2 border-cyber-gold' : 'text-gray-500 hover:text-white'}`}
                >
                    <CheckCircle size={16} /> FINALIZADAS
                </button>
                <button
                    onClick={() => setActiveTab('canceladas')}
                    className={`flex items-center gap-2 px-4 py-2 font-oxanium transition-all ${activeTab === 'canceladas' ? 'text-cyber-gold border-b-2 border-cyber-gold' : 'text-gray-500 hover:text-white'}`}
                >
                    <Ban size={16} /> CANCELADAS
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-black/40 p-4 rounded border border-white/5">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente..."
                        className="w-full bg-black/60 border border-cyber-gold/20 text-white pl-10 p-2 rounded focus:border-cyber-gold outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                        type="date"
                        className="w-full bg-black/60 border border-cyber-gold/20 text-white pl-10 p-2 rounded focus:border-cyber-gold outline-none"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            </div>

            {/* Modal de Criação Rápida */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-black/90 border border-cyber-gold/50 p-8 rounded-lg max-w-md w-full relative">
                        <h2 className="text-2xl font-orbitron text-white mb-6 border-l-4 border-cyber-gold pl-3">INICIAR NOVA OS</h2>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="text-cyber-gold font-oxanium text-sm">Cliente</label>
                                <select
                                    className="w-full bg-black/60 border border-cyber-gold/30 text-white p-3 focus:border-cyber-gold outline-none"
                                    value={newOSData.clienteId}
                                    onChange={e => setNewOSData({ ...newOSData, clienteId: parseInt(e.target.value) })}
                                    required
                                >
                                    <option value={0}>Selecione um cliente...</option>
                                    {clientes?.map(c => (
                                        <option key={c.id} value={c.id}>{c.nomeFantasia} ({c.razaoSocial})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-cyber-gold font-oxanium text-sm">Data</label>
                                <input
                                    type="date"
                                    className="w-full bg-black/60 border border-cyber-gold/30 text-white p-3 focus:border-cyber-gold outline-none"
                                    value={newOSData.data}
                                    onChange={e => setNewOSData({ ...newOSData, data: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="text-gray-400 px-4 py-2 hover:text-white font-oxanium"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="bg-cyber-gold text-black font-bold px-6 py-2 rounded hover:bg-yellow-400 transition-colors font-oxanium"
                                >
                                    {mutation.isPending ? 'CRIANDO...' : 'CRIAR OS'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="text-cyber-gold font-oxanium animate-pulse">Carregando Ordens de Serviço...</div>
            ) : (
                <div className="space-y-4">
                    {filteredList.map((os) => (
                        <div
                            key={os.id}
                            onClick={() => navigate(`/os/${os.id}`)}
                            className="bg-black/40 border border-white/10 p-4 rounded-lg hover:border-cyber-gold/50 cursor-pointer transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-center justify-center p-3 bg-white/5 rounded min-w-[80px]">
                                    <span className="text-xs text-gray-500 font-mono">ID</span>
                                    <span className="text-2xl font-bold text-white font-orbitron">#{os.id}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <User className="w-4 h-4 text-cyber-gold" />
                                        {os.cliente.nomeFantasia}
                                        <span className="text-sm font-normal text-gray-400 ml-2">({os.cliente.razaoSocial})</span>
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400 font-oxanium">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {formatarData(os.data)}
                                        </span>
                                        <span>•</span>
                                        <span className="text-white">
                                            {os.veiculos.length} Veículo(s)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className={`px-3 py-1 rounded border text-xs font-bold font-oxanium tracking-wide ${getStatusColor(os.status)}`}>
                                    {os.status}
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 font-oxanium">VALOR TOTAL</div>
                                    <div className="text-xl font-bold text-cyber-gold font-orbitron">
                                        {os.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </div>
                                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-cyber-gold transition-colors" />
                            </div>
                        </div>
                    ))}
                    {filteredList.length === 0 && (
                        <div className="text-center py-10 text-gray-500 font-oxanium">
                            Nenhuma Ordem de Serviço encontrada para o filtro atual.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
