import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
    message: string;
    onClose?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
    return (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-4 rounded-xl mb-6 flex items-start gap-3 fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="grow">
                <p className="font-semibold text-sm">Ocorreu um erro</p>
                <p className="text-sm opacity-90">{message}</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                    aria-label="Fechar"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
