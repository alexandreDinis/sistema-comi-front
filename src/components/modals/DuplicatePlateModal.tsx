import React from 'react';
import { AlertTriangle, History, ArrowRight, X } from 'lucide-react';
import type { VeiculoExistente } from '../../types';

interface DuplicatePlateModalProps {
    isOpen: boolean;
    onClose: () => void; // Cancelar
    onContinue: () => void; // Continuar
    onViewHistory: () => void; // Ver Histórico
    veiculoData?: VeiculoExistente;
}

export const DuplicatePlateModal: React.FC<DuplicatePlateModalProps> = ({
    isOpen,
    onClose,
    onContinue,
    onViewHistory,
    veiculoData
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="bg-black/90 border border-yellow-500/50 p-6 rounded-lg max-w-md w-full relative overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 animate-pulse"></div>

                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 border border-yellow-500/20">
                        <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-orbitron text-white">Veículo Já Cadastrado</h3>
                    <p className="text-sm text-gray-400 mt-2">
                        Esta placa já está registrada no sistema.
                    </p>
                </div>

                {veiculoData && (
                    <div className="bg-white/5 border border-white/10 rounded p-4 mb-8 text-left">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] text-gray-500 font-mono uppercase">Modelo</div>
                                <div className="text-white font-bold">{veiculoData.modelo}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 font-mono uppercase">Cor</div>
                                <div className="text-white font-bold">{veiculoData.cor}</div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-[10px] text-gray-500 font-mono uppercase">Cliente Proprietário</div>
                                <div className="text-cyber-gold font-bold">{veiculoData.cliente}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onViewHistory}
                        className="w-full bg-blue-600/10 border border-blue-600/30 text-blue-400 py-3 rounded font-oxanium font-bold hover:bg-blue-600/20 flex items-center justify-center gap-2 transition-all"
                    >
                        <History className="w-4 h-4" /> VER HISTÓRICO COMPLETO
                    </button>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <button
                            onClick={onClose}
                            className="bg-red-500/10 border border-red-500/30 text-red-400 py-2 rounded font-oxanium hover:bg-red-500/20 flex items-center justify-center gap-2 transition-all"
                        >
                            <X className="w-4 h-4" /> CANCELAR
                        </button>
                        <button
                            onClick={onContinue}
                            className="bg-cyber-gold/10 border border-cyber-gold/30 text-cyber-gold py-2 rounded font-oxanium hover:bg-cyber-gold/20 flex items-center justify-center gap-2 transition-all"
                        >
                            CONTINUAR <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
