import React from 'react';
import { AlertTriangle, CheckCircle, Info, X, Trash2 } from 'lucide-react';

export type ActionModalType = 'danger' | 'success' | 'warning' | 'info';

interface ActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    type?: ActionModalType;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
}

export const ActionModal: React.FC<ActionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'CONFIRMAR',
    cancelText = 'CANCELAR',
    showCancel = true
}) => {
    if (!isOpen) return null;

    const getColors = () => {
        switch (type) {
            case 'danger': return {
                border: 'border-red-500/50',
                shadow: 'shadow-[0_0_50px_rgba(239,68,68,0.1)]',
                iconBg: 'bg-red-500/10',
                iconBorder: 'border-red-500/20',
                text: 'text-red-500',
                button: 'bg-red-500 text-white hover:bg-red-600',
                hover: 'hover:bg-red-500/20'
            };
            case 'warning': return {
                border: 'border-yellow-500/50',
                shadow: 'shadow-[0_0_50px_rgba(234,179,8,0.1)]',
                iconBg: 'bg-yellow-500/10',
                iconBorder: 'border-yellow-500/20',
                text: 'text-yellow-500',
                button: 'bg-yellow-500 text-black hover:bg-yellow-400',
                hover: 'hover:bg-yellow-500/20'
            };
            case 'success': return {
                border: 'border-green-500/50',
                shadow: 'shadow-[0_0_50px_rgba(34,197,94,0.1)]',
                iconBg: 'bg-green-500/10',
                iconBorder: 'border-green-500/20',
                text: 'text-green-500',
                button: 'bg-green-500 text-white hover:bg-green-600',
                hover: 'hover:bg-green-500/20'
            };
            default: return {
                border: 'border-blue-500/50',
                shadow: 'shadow-[0_0_50px_rgba(59,130,246,0.1)]',
                iconBg: 'bg-blue-500/10',
                iconBorder: 'border-blue-500/20',
                text: 'text-blue-500',
                button: 'bg-blue-500 text-white hover:bg-blue-600',
                hover: 'hover:bg-blue-500/20'
            };
        }
    };

    const colors = getColors();

    const getIcon = () => {
        switch (type) {
            case 'danger': return <Trash2 className={`w-8 h-8 ${colors.text}`} />;
            case 'warning': return <AlertTriangle className={`w-8 h-8 ${colors.text}`} />;
            case 'success': return <CheckCircle className={`w-8 h-8 ${colors.text}`} />;
            default: return <Info className={`w-8 h-8 ${colors.text}`} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className={`bg-black/90 border p-6 rounded-lg max-w-sm w-full relative overflow-hidden ${colors.border} ${colors.shadow}`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${colors.text.replace('text-', 'bg-')} animate-pulse`}></div>

                <div className="flex flex-col items-center text-center mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border ${colors.iconBg} ${colors.iconBorder}`}>
                        {getIcon()}
                    </div>
                    <h3 className="text-xl font-orbitron text-white mb-2 uppercase tracking-wide">{title}</h3>
                    <p className="text-sm text-gray-400 whitespace-pre-line leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex gap-3 justify-center">
                    {showCancel && (
                        <button
                            onClick={onClose}
                            className={`flex-1 bg-gray-800/50 text-gray-300 border border-white/10 px-4 py-3 rounded font-oxanium text-sm font-semibold hover:bg-gray-700 hover:text-white transition-all duration-300 uppercase tracking-wider flex items-center justify-center gap-2`}
                        >
                            <X className="w-4 h-4" /> {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            else onClose();
                        }}
                        className={`flex-1 ${colors.button} px-4 py-3 rounded font-oxanium font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(0,0,0,0.5)] uppercase tracking-wider`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
