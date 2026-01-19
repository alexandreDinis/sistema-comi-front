import { useState, useEffect } from 'react';
import { empresaService } from '../../services/empresaService';
import type { EmpresaConfig, RegimeTributario, UF } from '../../types';
import { Settings, Save, Percent, Building2, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

const REGIMES: { value: RegimeTributario; label: string; descricao: string }[] = [
    { value: 'SIMPLES_NACIONAL', label: 'Simples Nacional', descricao: 'Micro e pequenas empresas - alíquota varia por faixa' },
    { value: 'LUCRO_PRESUMIDO', label: 'Lucro Presumido', descricao: 'Empresas com receita até R$ 78 milhões/ano' },
    { value: 'LUCRO_REAL', label: 'Lucro Real', descricao: 'Empresas com receita acima de R$ 78 milhões/ano' },
    { value: 'MEI', label: 'MEI', descricao: 'Microempreendedor Individual - valor fixo mensal' },
];

const ESTADOS: { value: UF; label: string }[] = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
];

export default function TributacaoPage() {
    const [config, setConfig] = useState<EmpresaConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [aliquotaPercent, setAliquotaPercent] = useState<string>('6.00');
    const [regime, setRegime] = useState<RegimeTributario>('SIMPLES_NACIONAL');
    const [uf, setUf] = useState<UF | ''>('');

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await empresaService.getConfig();
            setConfig(data);

            // Populate form
            if (data.aliquotaImposto !== undefined) {
                setAliquotaPercent((data.aliquotaImposto * 100).toFixed(2));
            }
            if (data.regimeTributario) {
                setRegime(data.regimeTributario);
            }
            if (data.uf) {
                setUf(data.uf);
            }
        } catch (err) {
            setError('Erro ao carregar configurações');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            const aliquotaDecimal = parseFloat(aliquotaPercent) / 100;

            if (isNaN(aliquotaDecimal) || aliquotaDecimal < 0 || aliquotaDecimal > 1) {
                setError('Alíquota inválida. Use valor entre 0% e 100%.');
                return;
            }

            await empresaService.updateConfig({
                aliquotaImposto: aliquotaDecimal,
                regimeTributario: regime,
                uf: uf || undefined,
            });

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Erro ao salvar configurações');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-cyber-gold animate-pulse">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-cyber-gold" />
                <div>
                    <h1 className="text-2xl font-bold text-cyber-gold">Configuração Tributária</h1>
                    <p className="text-sm text-gray-400">Configure a alíquota de imposto para cálculo de DRE</p>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-2 bg-red-900/30 border border-red-500 text-red-400 p-4 rounded">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 bg-green-900/30 border border-green-500 text-green-400 p-4 rounded">
                    <CheckCircle className="w-5 h-5" />
                    Configurações salvas com sucesso!
                </div>
            )}

            {/* Form Card */}
            <div className="bg-black/40 border border-cyber-gold/20 rounded-lg p-6 space-y-6">
                {/* Empresa Info */}
                <div className="pb-4 border-b border-cyber-gold/10">
                    <p className="text-gray-400 text-sm">Empresa</p>
                    <p className="text-cyber-gold text-lg font-semibold">{config?.nome}</p>
                </div>

                {/* Regime Tributário */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-cyber-gold font-medium">
                        <Building2 className="w-4 h-4" />
                        Regime Tributário
                    </label>
                    <select
                        value={regime}
                        onChange={(e) => setRegime(e.target.value as RegimeTributario)}
                        className="w-full bg-black border border-cyber-gold/30 text-cyber-gold p-3 rounded outline-none focus:border-cyber-gold"
                        style={{ colorScheme: 'dark' }}
                    >
                        {REGIMES.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                    <p className="text-gray-500 text-xs">
                        {REGIMES.find((r) => r.value === regime)?.descricao}
                    </p>
                </div>

                {/* Alíquota de Imposto */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-cyber-gold font-medium">
                        <Percent className="w-4 h-4" />
                        Alíquota de Imposto (%)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={aliquotaPercent}
                            onChange={(e) => setAliquotaPercent(e.target.value)}
                            className="w-full bg-black border border-cyber-gold/30 text-cyber-gold p-3 rounded outline-none focus:border-cyber-gold"
                            placeholder="6.00"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    <p className="text-gray-500 text-xs">
                        Este valor será usado no cálculo de imposto do relatório financeiro (DRE).
                        <br />
                        Consulte seu contador para obter a alíquota correta.
                    </p>
                </div>

                {/* UF */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-cyber-gold font-medium">
                        <MapPin className="w-4 h-4" />
                        Estado (UF)
                    </label>
                    <select
                        value={uf}
                        onChange={(e) => setUf(e.target.value as UF)}
                        className="w-full bg-black border border-cyber-gold/30 text-cyber-gold p-3 rounded outline-none focus:border-cyber-gold"
                        style={{ colorScheme: 'dark' }}
                    >
                        <option value="">Selecione o estado</option>
                        {ESTADOS.map((e) => (
                            <option key={e.value} value={e.value}>
                                {e.label} ({e.value})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Alíquotas de Referência */}
                <div className="bg-gray-900/50 border border-gray-700 rounded p-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">📊 Alíquotas de Referência (Simples Nacional - Anexo III)</h3>
                    <table className="w-full text-xs text-gray-400">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-1">Faixa de Receita Bruta (12 meses)</th>
                                <th className="text-right py-1">Alíquota</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Até R$ 180.000</td><td className="text-right text-cyber-gold">6,00%</td></tr>
                            <tr><td>R$ 180.000 a R$ 360.000</td><td className="text-right">11,20%</td></tr>
                            <tr><td>R$ 360.000 a R$ 720.000</td><td className="text-right">13,50%</td></tr>
                            <tr><td>R$ 720.000 a R$ 1.800.000</td><td className="text-right">16,00%</td></tr>
                            <tr><td>R$ 1.800.000 a R$ 3.600.000</td><td className="text-right">21,00%</td></tr>
                            <tr><td>R$ 3.600.000 a R$ 4.800.000</td><td className="text-right">33,00%</td></tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-gray-500 mt-2 italic">
                        ⚠️ Valores de referência. Consulte seu contador para a alíquota efetiva.
                    </p>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-cyber-gold text-black font-bold py-3 rounded hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {saving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
            </div>
        </div>
    );
}
