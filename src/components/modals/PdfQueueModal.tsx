import React, { useEffect, useRef } from 'react';
import { FileText, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';

export type PdfModalState =
    | { status: 'idle' }
    | { status: 'downloading' }
    | { status: 'queued'; secondsLeft: number; attempt: number; maxAttempts: number }
    | { status: 'success' }
    | { status: 'error'; message: string };

interface PdfQueueModalProps {
    state: PdfModalState;
    onRetry?: () => void;
    onClose: () => void;
}

export const PdfQueueModal: React.FC<PdfQueueModalProps> = ({ state, onRetry, onClose }) => {
    const successTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Auto-close on success after 2 seconds
    useEffect(() => {
        if (state.status === 'success') {
            successTimerRef.current = setTimeout(() => onClose(), 2000);
        }
        return () => {
            if (successTimerRef.current) clearTimeout(successTimerRef.current);
        };
    }, [state.status, onClose]);

    if (state.status === 'idle') return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-sm bg-cyber-bg border border-cyber-gold/30 shadow-[0_0_40px_rgba(212,175,55,0.15)] overflow-hidden">
                {/* Top accent line */}
                <div className={`h-1 w-full ${state.status === 'error' ? 'bg-cyber-error' :
                    state.status === 'success' ? 'bg-green-500' :
                        'bg-cyber-gold'
                    }`} />

                {/* Close button */}
                {(state.status === 'error' || state.status === 'success') && (
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-cyber-gold/40 hover:text-cyber-gold transition-colors z-10"
                    >
                        <X size={18} />
                    </button>
                )}

                <div className="p-6 flex flex-col items-center text-center gap-4">
                    {/* Downloading State */}
                    {state.status === 'downloading' && (
                        <>
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-cyber-gold/10 flex items-center justify-center border border-cyber-gold/20">
                                    <Loader2 size={28} className="text-cyber-gold animate-spin" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-cyber-gold tracking-wider">
                                    GERANDO DOCUMENTO
                                </h3>
                                <p className="text-cyber-gold/50 text-xs font-mono mt-1">
                                    Preparando seu PDF...
                                </p>
                            </div>
                            {/* Progress bar animation */}
                            <div className="w-full h-1 bg-cyber-gold/10 overflow-hidden">
                                <div className="h-full bg-cyber-gold/60 animate-pulse" style={{ width: '60%' }} />
                            </div>
                        </>
                    )}

                    {/* Queued State — countdown */}
                    {state.status === 'queued' && (
                        <>
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-cyber-gold/5 flex items-center justify-center border-2 border-cyber-gold/30">
                                    <span className="text-3xl font-black text-cyber-gold tabular-nums">
                                        {state.secondsLeft}
                                    </span>
                                </div>
                                {/* Rotating ring */}
                                <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                    <circle
                                        cx="40" cy="40" r="36"
                                        fill="none"
                                        stroke="rgba(212,175,55,0.15)"
                                        strokeWidth="3"
                                    />
                                    <circle
                                        cx="40" cy="40" r="36"
                                        fill="none"
                                        stroke="#D4AF37"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 36}`}
                                        strokeDashoffset={`${2 * Math.PI * 36 * (1 - state.secondsLeft / 10)}`}
                                        className="transition-all duration-1000 ease-linear"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-cyber-gold tracking-wider">
                                    PREPARANDO DOCUMENTO
                                </h3>
                                <p className="text-cyber-gold/50 text-xs font-mono mt-1">
                                    Servidor processando • Pronto em ~{state.secondsLeft}s
                                </p>
                                <p className="text-cyber-gold/30 text-[10px] font-mono mt-2">
                                    TENTATIVA {state.attempt}/{state.maxAttempts}
                                </p>
                            </div>
                            {/* Subtle progress */}
                            <div className="w-full h-0.5 bg-cyber-gold/10 overflow-hidden">
                                <div
                                    className="h-full bg-cyber-gold transition-all duration-1000 ease-linear"
                                    style={{ width: `${((state.attempt - 1) / state.maxAttempts) * 100}%` }}
                                />
                            </div>
                        </>
                    )}

                    {/* Success State */}
                    {state.status === 'success' && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                                <CheckCircle size={28} className="text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-green-500 tracking-wider">
                                    PDF GERADO!
                                </h3>
                                <p className="text-green-500/60 text-xs font-mono mt-1">
                                    Download iniciado automaticamente
                                </p>
                            </div>
                        </>
                    )}

                    {/* Error State */}
                    {state.status === 'error' && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-cyber-error/10 flex items-center justify-center border border-cyber-error/30">
                                <AlertTriangle size={28} className="text-cyber-error" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-cyber-error tracking-wider">
                                    INDISPONÍVEL
                                </h3>
                                <p className="text-cyber-error/70 text-xs font-mono mt-1 max-w-xs">
                                    {state.message}
                                </p>
                            </div>
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="mt-2 px-6 py-2 border border-cyber-gold text-cyber-gold text-xs font-bold tracking-wider uppercase hover:bg-cyber-gold hover:text-black transition-all"
                                >
                                    <FileText size={14} className="inline mr-2" />
                                    TENTAR NOVAMENTE
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
