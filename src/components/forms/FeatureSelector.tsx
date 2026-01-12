import React from 'react';
import { AVAILABLE_FEATURES } from '../../types/features';
import { Shield } from 'lucide-react';

interface FeatureSelectorProps {
    selectedFeatures: string[];
    onChange: (features: string[]) => void;
}

export const FeatureSelector: React.FC<FeatureSelectorProps> = ({
    selectedFeatures,
    onChange
}) => {
    const toggleFeature = (code: string) => {
        if (selectedFeatures.includes(code)) {
            onChange(selectedFeatures.filter(f => f !== code));
        } else {
            onChange([...selectedFeatures, code]);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-mono text-cyber-gold/60 mb-2 flex items-center gap-2">
                <Shield className="w-3 h-3" />
                PERMISSÕES_ACESSO
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-cyber-gold/20 bg-black/40">
                {AVAILABLE_FEATURES.map(feature => (
                    <label
                        key={feature.code}
                        className="flex items-center gap-2 cursor-pointer hover:bg-cyber-gold/10 p-1 transition-colors"
                    >
                        <input
                            type="checkbox"
                            checked={selectedFeatures.includes(feature.code)}
                            onChange={() => toggleFeature(feature.code)}
                            className="accent-cyber-gold"
                        />
                        <span className="text-[10px] text-cyber-gold/80 font-mono">
                            {feature.label}
                        </span>
                    </label>
                ))}
            </div>
            {selectedFeatures.length === 0 && (
                <p className="text-[9px] text-cyber-error font-mono">
                    ⚠ Usuário SEM permissões ficará BLOQUEADO!
                </p>
            )}
        </div>
    );
};
