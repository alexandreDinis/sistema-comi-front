import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { osService } from '../../services/osService';
import type { ClienteRequest, StatusCliente, ClienteFiltros } from '../../types';
import { Users, Plus, Save, MapPin, Phone, Mail, Building2, Trash2, Search, Filter } from 'lucide-react';
import { formatCNPJ, formatCPF, formatTelefone, formatCEP } from '../../utils/formatters';
import { usePermission } from '../../hooks/usePermission';
import { Feature } from '../../types/features';

import { ActionModal } from '../../components/modals/ActionModal';
import type { ActionModalType } from '../../components/modals/ActionModal';

export const ClientesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { hasFeature } = usePermission();
    const canWrite = hasFeature(Feature.CLIENTE_WRITE);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: ActionModalType;
        confirmText?: string;
        cancelText?: string;
        onConfirm?: () => void;
        showCancel?: boolean;
    }>({ isOpen: false, title: '', message: '', type: 'info' });

    // Filters State
    const [filters, setFilters] = useState<ClienteFiltros>({
        termo: '',
        cidade: '',
        bairro: '',
        status: undefined
    });

    // Debounce for filters
    const [debouncedFilters, setDebouncedFilters] = useState<ClienteFiltros>(filters);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500);
        return () => clearTimeout(handler);
    }, [filters]);

    const initialFormState: ClienteRequest = {
        razaoSocial: '',
        nomeFantasia: '',
        cnpj: '',
        contato: '',
        endereco: '', // Explicit init
        email: '',
        status: 'ATIVO',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        tipoPessoa: 'JURIDICA',
        cpf: ''
    };

    const [formData, setFormData] = useState<ClienteRequest>(initialFormState);

    const { data: clientes, isLoading } = useQuery({
        queryKey: ['clientes', debouncedFilters],
        queryFn: () => osService.listClientes(debouncedFilters)
    });

    const handleError = (error: any) => {
        let title = 'Erro';
        let message = 'Ocorreu um erro ao processar sua solicitação.';

        if (error.response?.status === 400) {
            title = 'Dados Inválidos';
            const apiErrors = error.response.data.errors;
            if (apiErrors) {
                // Format list of errors
                const errorList = Object.keys(apiErrors).map(key => `• ${apiErrors[key]}`).join('\n');
                message = `Verifique os seguintes campos:\n\n${errorList}`;
            } else {
                message = error.response.data.message || 'Verifique os dados informados.';
            }
        } else if (error.response?.status === 500) {
            title = 'Erro no Servidor';
            message = 'Ocorreu um erro interno. Tente novamente mais tarde.';
        }

        setActionModal({
            isOpen: true,
            title,
            message,
            type: 'danger',
            confirmText: 'FECHAR',
            showCancel: false,
            onConfirm: () => setActionModal(prev => ({ ...prev, isOpen: false }))
        });
    };

    const createMutation = useMutation({
        mutationFn: osService.createCliente,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            resetForm();
            setActionModal({
                isOpen: true,
                title: 'Sucesso',
                message: 'Cliente cadastrado com sucesso!',
                type: 'success',
                confirmText: 'OK',
                showCancel: false,
                onConfirm: () => setActionModal(prev => ({ ...prev, isOpen: false }))
            });
        },
        onError: handleError
    });

    const updateMutation = useMutation({
        mutationFn: osService.updateCliente,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            resetForm();
            setActionModal({
                isOpen: true,
                title: 'Sucesso',
                message: 'Cliente atualizado com sucesso!',
                type: 'success',
                confirmText: 'OK',
                showCancel: false,
                onConfirm: () => setActionModal(prev => ({ ...prev, isOpen: false }))
            });
        },
        onError: handleError
    });

    const deleteMutation = useMutation({
        mutationFn: osService.deleteCliente,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            resetForm();
            setActionModal({
                isOpen: true,
                title: 'Sucesso',
                message: 'Cliente excluído com sucesso!',
                type: 'success',
                confirmText: 'OK',
                showCancel: false,
                onConfirm: () => setActionModal(prev => ({ ...prev, isOpen: false }))
            });
        },
        onError: handleError
    });

    const resetForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData(initialFormState);
    };

    const handleEdit = (cliente: any) => {
        setEditingId(cliente.id);
        setFormData({
            razaoSocial: cliente.razaoSocial,
            nomeFantasia: cliente.nomeFantasia,
            cnpj: cliente.cnpj,
            contato: cliente.contato,
            email: cliente.email,
            status: cliente.status as StatusCliente,
            logradouro: cliente.logradouro || '',
            numero: cliente.numero || '',
            complemento: cliente.complemento || '',
            bairro: cliente.bairro || '',
            cidade: cliente.cidade || '',
            estado: cliente.estado || '',
            cep: cliente.cep || '',
            tipoPessoa: cliente.tipoPessoa || 'JURIDICA',
            cpf: cliente.cpf ? formatCPF(cliente.cpf) : ''
        });
        setIsFormOpen(true);
    };

    const handleDelete = () => {
        if (editingId && window.confirm('Tem certeza que deseja excluir este cliente?')) {
            deleteMutation.mutate(editingId);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clean data before sending
        // FIX: Mapping logradouro to endereco to satisfy backend requirement
        const cleanData = {
            ...formData,
            contato: formData.contato.replace(/\D/g, ''),
            cep: formData.cep.replace(/\D/g, ''),
            endereco: formData.logradouro,
            tipoPessoa: formData.tipoPessoa || 'JURIDICA',
            cpf: formData.tipoPessoa === 'FISICA' ? (formData.cpf || '').replace(/\D/g, '') : undefined,
            cnpj: formData.tipoPessoa === 'JURIDICA' ? (formData.cnpj || '').replace(/\D/g, '') : undefined
        };

        if (editingId) {
            updateMutation.mutate({ id: editingId, data: cleanData });
        } else {
            createMutation.mutate(cleanData);
        }
    };

    const getStatusColor = (status: StatusCliente) => {
        switch (status) {
            case 'ATIVO': return 'text-green-400 border-green-400/30 bg-green-400/10';
            case 'INATIVO': return 'text-red-400 border-red-400/30 bg-red-400/10';
            case 'EM_PROSPECCAO': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
            default: return 'text-gray-400';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-orbitron text-cyber-gold font-bold tracking-wider flex items-center gap-3">
                    <Users className="w-8 h-8" />
                    GESTÃO DE CLIENTES
                </h1>
                <button
                    onClick={() => {
                        if (isFormOpen) resetForm();
                        else setIsFormOpen(true);
                    }}
                    disabled={!canWrite}
                    className={`bg-cyber-gold/10 text-cyber-gold border border-cyber-gold px-4 py-2 rounded hover:bg-cyber-gold hover:text-black transition-all flex items-center gap-2 font-oxanium ${!canWrite ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={!canWrite ? 'Sem permissão para gerenciar clientes' : undefined}
                >
                    <Plus className="w-4 h-4" />
                    {isFormOpen ? 'CANCELAR' : 'NOVO CLIENTE'}
                </button>
            </div>

            {/* BARRA DE FILTROS */}
            {!isFormOpen && (
                <div className="bg-black/40 border border-cyber-gold/20 p-4 rounded-lg mb-6 backdrop-blur-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar (Nome, CNPJ)..."
                            className="w-full bg-black/60 border border-white/10 text-white pl-9 p-2 text-sm focus:border-cyber-gold/50 focus:outline-none rounded"
                            value={filters.termo || ''}
                            onChange={(e) => setFilters({ ...filters, termo: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filtrar por Cidade"
                            className="w-full bg-black/60 border border-white/10 text-white pl-9 p-2 text-sm focus:border-cyber-gold/50 focus:outline-none rounded"
                            value={filters.cidade || ''}
                            onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filtrar por Bairro"
                            className="w-full bg-black/60 border border-white/10 text-white pl-9 p-2 text-sm focus:border-cyber-gold/50 focus:outline-none rounded"
                            value={filters.bairro || ''}
                            onChange={(e) => setFilters({ ...filters, bairro: e.target.value })}
                        />
                    </div>
                    <div>
                        <select
                            className="w-full bg-black/60 border border-white/10 text-white p-2 text-sm focus:border-cyber-gold/50 focus:outline-none rounded"
                            value={filters.status || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFilters({ ...filters, status: val === '' ? undefined : (val as StatusCliente) })
                            }}
                        >
                            <option value="">Todos os Status</option>
                            <option value="ATIVO">Ativo</option>
                            <option value="INATIVO">Inativo</option>
                            <option value="EM_PROSPECCAO">Em Prospecção</option>
                        </select>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <form onSubmit={handleSubmit} className="mb-8 bg-black/40 border border-cyber-gold/30 p-6 rounded-lg backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyber-gold/20 -mt-2 -mr-2 transition-all group-hover:border-cyber-gold/50"></div>

                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
                        <h2 className="text-xl font-orbitron text-white flex items-center gap-2">
                            <span className="w-2 h-6 bg-cyber-gold inline-block"></span>
                            {editingId ? 'EDITAR CLIENTE' : 'NOVO CLIENTE'}
                        </h2>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm font-oxanium"
                            >
                                <Trash2 className="w-4 h-4" /> EXCLUIR CLIENTE
                            </button>
                        )}
                    </div>

                    <div className="md:col-span-3 mb-4 flex gap-6 bg-black/60 p-3 rounded border border-cyber-gold/20">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="tipoPessoa"
                                checked={formData.tipoPessoa !== 'FISICA'} // Default JURIDICA
                                onChange={() => setFormData({ ...formData, tipoPessoa: 'JURIDICA' })}
                                className="text-cyber-gold focus:ring-cyber-gold"
                            />
                            <span className="text-white font-oxanium text-sm">Pessoa Jurídica (PJ)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="tipoPessoa"
                                checked={formData.tipoPessoa === 'FISICA'}
                                onChange={() => setFormData({ ...formData, tipoPessoa: 'FISICA' })}
                                className="text-cyber-gold focus:ring-cyber-gold"
                            />
                            <span className="text-white font-oxanium text-sm">Pessoa Física (PF)</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">
                                {formData.tipoPessoa === 'FISICA' ? 'Nome Completo' : 'Razão Social'}
                            </label>
                            <input
                                type="text"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.razaoSocial}
                                onChange={e => setFormData({ ...formData, razaoSocial: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">
                                {formData.tipoPessoa === 'FISICA' ? 'Apelido (Opcional)' : 'Nome Fantasia'}
                            </label>
                            <input
                                type="text"
                                required={formData.tipoPessoa !== 'FISICA'}
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.nomeFantasia}
                                onChange={e => setFormData({ ...formData, nomeFantasia: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">
                                {formData.tipoPessoa === 'FISICA' ? 'CPF' : 'CNPJ'}
                            </label>
                            <input
                                type="text"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.tipoPessoa === 'FISICA' ? (formData.cpf || '') : formData.cnpj}
                                onChange={e => {
                                    if (formData.tipoPessoa === 'FISICA') {
                                        setFormData({ ...formData, cpf: formatCPF(e.target.value) })
                                    } else {
                                        setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })
                                    }
                                }}
                                placeholder={formData.tipoPessoa === 'FISICA' ? '000.000.000-00' : '00.000.000/0000-00'}
                                maxLength={18}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">Contato</label>
                            <input
                                type="text"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.contato}
                                onChange={e => setFormData({ ...formData, contato: formatTelefone(e.target.value) })}
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">Email</label>
                            <input
                                type="email"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">Status</label>
                            <select
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as StatusCliente })}
                            >
                                <option value="ATIVO">ATIVO</option>
                                <option value="INATIVO">INATIVO</option>
                                <option value="EM_PROSPECCAO">EM PROSPECÇÃO</option>
                            </select>
                        </div>
                    </div>

                    <h2 className="text-xl font-orbitron text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-2">
                        <span className="w-2 h-6 bg-cyber-gold inline-block"></span>
                        ENDEREÇO
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">CEP</label>
                            <input
                                type="text"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.cep}
                                onChange={e => setFormData({ ...formData, cep: formatCEP(e.target.value) })}
                                placeholder="00000-000"
                                maxLength={9}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-cyber-gold font-oxanium text-sm">Logradouro</label>
                            <input
                                type="text"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.logradouro}
                                onChange={e => setFormData({ ...formData, logradouro: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">Número</label>
                            <input
                                type="text"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.numero}
                                onChange={e => setFormData({ ...formData, numero: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">Bairro</label>
                            <input
                                type="text"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.bairro}
                                onChange={e => setFormData({ ...formData, bairro: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">Cidade</label>
                            <input
                                type="text"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.cidade}
                                onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">Estado</label>
                            <input
                                type="text"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.estado}
                                onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                placeholder="UF"
                                maxLength={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-cyber-gold font-oxanium text-sm">Complemento</label>
                            <input
                                type="text"
                                className="w-full bg-black/60 border border-cyber-gold/30 text-white p-2 focus:border-cyber-gold focus:outline-none transition-all"
                                value={formData.complemento || ''}
                                onChange={e => setFormData({ ...formData, complemento: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-white hover:text-gray-300 font-oxanium px-4"
                        >
                            CANCELAR
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="bg-cyber-gold text-black font-bold py-2 px-8 rounded hover:bg-yellow-400 transition-colors flex items-center gap-2 font-oxanium shadow-[0_0_15px_rgba(255,184,0,0.3)] hover:shadow-[0_0_25px_rgba(255,184,0,0.5)]"
                        >
                            {createMutation.isPending || updateMutation.isPending ? 'SALVANDO...' : 'SALVAR CLIENTE'}
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            )}

            {isLoading ? (
                <div className="text-cyber-gold font-oxanium animate-pulse">Carregando dados...</div>
            ) : (
                <div className="bg-black/40 border border-cyber-gold/20 rounded-lg overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-cyber-gold/5 border-b border-cyber-gold/20 text-cyber-gold font-oxanium text-sm uppercase tracking-wider">
                                <th className="p-4 w-16">ID</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Contato</th>
                                <th className="p-4">Endereço</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {clientes?.map((cliente) => (
                                <tr
                                    key={cliente.id}
                                    className={`hover:bg-white/5 transition-colors group ${canWrite ? 'cursor-pointer' : 'cursor-default'}`}
                                    onClick={() => canWrite && handleEdit(cliente)}
                                    title={!canWrite ? 'Sem permissão para editar' : 'Clique para editar'}
                                >
                                    <td className="p-4 font-mono text-gray-500 text-xs">#{cliente.id}</td>

                                    <td className="p-4">
                                        <div className="font-orbitron text-white text-lg group-hover:text-cyber-gold transition-colors">{cliente.nomeFantasia}</div>
                                        <div className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                                            <Building2 className="w-3 h-3" />
                                            {cliente.razaoSocial}
                                        </div>
                                        <div className="text-gray-500 text-[10px] mt-0.5 font-mono">
                                            {cliente.tipoPessoa === 'FISICA' ? (cliente.cpf || 'SEM CPF') : (cliente.cnpj || 'SEM CNPJ')}
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded border inline-block ${getStatusColor(cliente.status)}`}>
                                            {cliente.status}
                                        </span>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 text-sm text-gray-300 font-oxanium">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-gray-500" />
                                                {cliente.contato}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-gray-500" />
                                                <span className="truncate max-w-[200px]" title={cliente.email}>{cliente.email}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        <div className="flex items-start gap-2 text-xs text-gray-400 max-w-xs leading-snug">
                                            <MapPin className="w-3 h-3 text-cyber-gold shrink-0 mt-0.5" />
                                            <span>
                                                {cliente.logradouro ? (
                                                    <>
                                                        {cliente.logradouro}, {cliente.numero} {cliente.complemento && ` - ${cliente.complemento}`}
                                                        <br />
                                                        {cliente.bairro} - {cliente.cidade}/{cliente.estado}
                                                        <br />
                                                        <span className="text-gray-600 font-mono">{cliente.cep}</span>
                                                    </>
                                                ) : (
                                                    <span className="italic opacity-50">{cliente.endereco}</span>
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {clientes?.length === 0 && (
                        <div className="p-10 text-center text-gray-500 font-oxanium">
                            Nenhum cliente cadastrado.
                        </div>
                    )}
                </div>
            )}

            <ActionModal
                isOpen={actionModal.isOpen}
                title={actionModal.title}
                message={actionModal.message}
                type={actionModal.type}
                confirmText={actionModal.confirmText}
                cancelText={actionModal.cancelText}
                onConfirm={actionModal.onConfirm}
                onClose={() => setActionModal(prev => ({ ...prev, isOpen: false }))}
                showCancel={actionModal.showCancel}
            />
        </div>
    );
};
