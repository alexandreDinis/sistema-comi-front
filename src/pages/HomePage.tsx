import React from 'react';
import { ComissaoDashboard } from '../components/dashboard/ComissaoDashboard';

export const HomePage: React.FC = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] py-4 sm:py-8">
            <ComissaoDashboard />
        </div>
    );
};
