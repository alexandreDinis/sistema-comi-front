import React from 'react';

interface CardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    description?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    title,
    value,
    icon,
    description,
    trend,
    trendValue,
    className = ''
}) => {
    return (
        <div className={`bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col justify-between hover:border-blue-500/30 transition-colors shadow-lg ${className}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
                    {description && <p className="text-slate-500 text-xs mt-1">{description}</p>}
                </div>
                {icon && <div className="p-2 bg-slate-900 rounded-lg text-slate-300">{icon}</div>}
            </div>

            <div className="flex items-end justify-between">
                <div className="text-3xl font-black text-slate-100">{value}</div>

                {trend && trendValue && (
                    <div className={`flex items-center text-xs font-bold px-2 py-1 rounded ${trend === 'up' ? 'bg-green-900/30 text-green-400' :
                            trend === 'down' ? 'bg-red-900/30 text-red-400' : 'bg-slate-700 text-slate-300'
                        }`}>
                        {trend === 'up' ? '▲' : '▼'} {trendValue}
                    </div>
                )}
            </div>
        </div>
    );
};
