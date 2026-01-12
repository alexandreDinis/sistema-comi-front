import React, { useEffect, useState } from 'react';
import { osService } from '../../services/osService';
import type { HistoricoResponse } from '../../types';
import { X, Calendar, Wrench, AlertCircle } from 'lucide-react';
import { formatarData, formatarMoeda } from '../../utils/formatters';

interface VehicleHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    placa: string;
    modelo: string;
}

export const VehicleHistoryModal: React.FC<VehicleHistoryModalProps> = ({ isOpen, onClose, placa, modelo }) => {
    const [history, setHistory] = useState<HistoricoResponse>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && placa) {
            setLoading(true);
            setError(null);
            osService.obterHistorico(placa)
                .then(data => setHistory(data))
                .catch(err => {
                    console.error("Failed to fetch history", err);
                    setError("Erro ao carregar histórico.");
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, placa]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 border border-cyber-gold/50 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col relative overflow-hidden">
                <div className="static-overlay opacity-5"></div>

                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <div>
                        <h3 className="text-xl font-orbitron text-white">Histórico do Veículo</h3>
                        <p className="text-sm text-cyber-gold font-mono mt-1">{modelo} • {placa}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {loading && (
                        <div className="text-center py-8 text-cyber-gold animate-pulse font-mono">
                            BUSCANDO_REGISTROS_ANTIGOS...
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8 text-red-500 font-mono flex flex-col items-center gap-2">
                            <AlertCircle className="w-8 h-8" />
                            {error}
                        </div>
                    )}

                    {!loading && !error && history.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-lg text-gray-500 font-oxanium">
                            Nenhum histórico encontrado para este veículo.
                        </div>
                    )}

                    {!loading && !error && history.map((item) => (
                        <div key={item.ordemServicoId} className="bg-white/5 border border-white/10 p-4 rounded hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-cyber-gold/10 p-2 rounded text-cyber-gold">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-400 font-mono">DATA_SERVIÇO</div>
                                        <div className="text-white font-bold">{formatarData(item.data)}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'FINALIZADA' ? 'bg-green-500/20 text-green-400' :
                                            item.status === 'CANCELADA' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                    <div className="text-cyber-gold font-bold mt-1 font-mono">
                                        {formatarMoeda(item.valorTotalServico)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-white/5">
                                <h4 className="text-xs text-gray-400 mb-2 flex items-center gap-1 font-oxanium">
                                    <Wrench className="w-3 h-3" /> ITENS E SERVIÇOS
                                </h4>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {item.pecasOuServicos.map((servico, idx) => (
                                        <li key={idx} className="text-xs text-gray-300 flex items-center gap-2 bg-black/40 px-2 py-1 rounded">
                                            <span className="w-1 h-1 bg-cyber-gold rounded-full"></span>
                                            {servico}
                                        </li>
                                    ))}
                                    {item.pecasOuServicos.length === 0 && (
                                        <li className="text-xs text-gray-600 italic">Sem itens registrados</li>
                                    )}
                                </ul>
                            </div>
                            <div className="mt-2 text-[10px] text-gray-600 font-mono text-right">
                                OS ID: #{item.ordemServicoId}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
