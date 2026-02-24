import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { empresaService } from '../../services/empresaService';
import { Loader2, Check, AlertCircle, Save, CreditCard, Building2, QrCode } from 'lucide-react';

const PIX_TIPOS = [
    { value: '', label: 'Selecione...' },
    { value: 'CPF', label: 'CPF' },
    { value: 'CNPJ', label: 'CNPJ' },
    { value: 'EMAIL', label: 'E-mail' },
    { value: 'TELEFONE', label: 'Telefone' },
    { value: 'ALEATORIA', label: 'Chave Aleatória' },
];

const TIPO_CONTA_OPTIONS = [
    { value: '', label: 'Selecione...' },
    { value: 'CORRENTE', label: 'Corrente' },
    { value: 'POUPANCA', label: 'Poupança' },
];

// Mask helpers
const maskCNPJ = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
};

const maskPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.replace(/(\d{0,2})/, '($1');
    if (digits.length <= 7) return digits.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
};

export const BillingConfig: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: config, isLoading } = useQuery({
        queryKey: ['empresa-config'],
        queryFn: empresaService.getConfig,
    });

    // Company info
    const [razaoSocial, setRazaoSocial] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [endereco, setEndereco] = useState('');

    // PIX
    const [pixTipo, setPixTipo] = useState('');
    const [pixChave, setPixChave] = useState('');

    // Bank
    const [banco, setBanco] = useState('');
    const [agencia, setAgencia] = useState('');
    const [conta, setConta] = useState('');
    const [tipoConta, setTipoConta] = useState('');

    useEffect(() => {
        if (config) {
            setRazaoSocial(config.razaoSocial || '');
            setCnpj(config.cnpj || '');
            setTelefone(config.telefone || '');
            setEmail(config.email || '');
            setEndereco(config.endereco || '');
            setPixTipo(config.pixTipo || '');
            setPixChave(config.pixChave || '');
            setBanco(config.banco || '');
            setAgencia(config.agencia || '');
            setConta(config.conta || '');
            setTipoConta(config.tipoConta || '');
        }
    }, [config]);

    const updateMutation = useMutation({
        mutationFn: () =>
            empresaService.updateConfig({
                razaoSocial,
                cnpj,
                telefone,
                email,
                endereco,
                pixTipo: pixTipo || undefined,
                pixChave: pixChave || undefined,
                banco: banco || undefined,
                agencia: agencia || undefined,
                conta: conta || undefined,
                tipoConta: tipoConta || undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['empresa-config'] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-cyber-gold animate-spin" />
            </div>
        );
    }

    const inputClass =
        'w-full bg-black/60 border border-cyber-gold/30 text-cyber-gold px-3 py-2 text-sm font-mono focus:border-cyber-gold focus:outline-none placeholder-cyber-gold/30';
    const labelClass = 'block text-cyber-gold/70 text-xs font-bold uppercase mb-1 tracking-wider';
    const selectClass =
        'w-full bg-black/60 border border-cyber-gold/30 text-cyber-gold px-3 py-2 text-sm font-mono focus:border-cyber-gold focus:outline-none';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados da Empresa */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Building2 size={16} className="text-cyber-gold" />
                    <h3 className="text-cyber-gold font-bold uppercase text-sm">Dados da Empresa</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Razão Social</label>
                        <input
                            type="text"
                            value={razaoSocial}
                            onChange={(e) => setRazaoSocial(e.target.value)}
                            className={inputClass}
                            placeholder="Empresa LTDA"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>CNPJ</label>
                        <input
                            type="text"
                            value={cnpj}
                            onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                            className={inputClass}
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Telefone</label>
                        <input
                            type="text"
                            value={telefone}
                            onChange={(e) => setTelefone(maskPhone(e.target.value))}
                            className={inputClass}
                            placeholder="(11) 99999-9999"
                            maxLength={15}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                            placeholder="contato@empresa.com"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClass}>Endereço</label>
                        <input
                            type="text"
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                            className={inputClass}
                            placeholder="Rua Exemplo, 123 - Bairro, Cidade/UF"
                        />
                    </div>
                </div>
            </div>

            {/* Separador */}
            <div className="border-t border-cyber-gold/20" />

            {/* PIX */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <QrCode size={16} className="text-cyber-gold" />
                    <h3 className="text-cyber-gold font-bold uppercase text-sm">Chave PIX</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Tipo da Chave</label>
                        <select
                            value={pixTipo}
                            onChange={(e) => setPixTipo(e.target.value)}
                            className={selectClass}
                        >
                            {PIX_TIPOS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Chave PIX</label>
                        <input
                            type="text"
                            value={pixChave}
                            onChange={(e) => setPixChave(e.target.value)}
                            className={inputClass}
                            placeholder="Sua chave PIX"
                        />
                    </div>
                </div>
            </div>

            {/* Separador */}
            <div className="border-t border-cyber-gold/20" />

            {/* Dados Bancários */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={16} className="text-cyber-gold" />
                    <h3 className="text-cyber-gold font-bold uppercase text-sm">Dados Bancários</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Banco</label>
                        <input
                            type="text"
                            value={banco}
                            onChange={(e) => setBanco(e.target.value)}
                            className={inputClass}
                            placeholder="Ex: Banco do Brasil"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Tipo de Conta</label>
                        <select
                            value={tipoConta}
                            onChange={(e) => setTipoConta(e.target.value)}
                            className={selectClass}
                        >
                            {TIPO_CONTA_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Agência</label>
                        <input
                            type="text"
                            value={agencia}
                            onChange={(e) => setAgencia(e.target.value)}
                            className={inputClass}
                            placeholder="1234-5"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Conta</label>
                        <input
                            type="text"
                            value={conta}
                            onChange={(e) => setConta(e.target.value)}
                            className={inputClass}
                            placeholder="12345-6"
                        />
                    </div>
                </div>
            </div>

            {/* Feedback Messages */}
            {updateMutation.isError && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-400/10 border border-red-400/30 p-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Erro ao salvar. Tente novamente.</span>
                </div>
            )}
            {updateMutation.isSuccess && (
                <div className="flex items-center gap-2 text-green-400 text-xs font-mono bg-green-400/10 border border-green-400/30 p-3">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Dados salvos com sucesso!</span>
                </div>
            )}

            {/* Save Button */}
            <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyber-gold/10 border border-cyber-gold text-cyber-gold hover:bg-cyber-gold hover:text-black transition-all font-bold uppercase text-xs tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Save className="w-4 h-4" />
                )}
                Salvar Dados
            </button>
        </form>
    );
};
