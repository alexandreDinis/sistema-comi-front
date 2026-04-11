import React from 'react';
import { Outlet } from 'react-router-dom';
import { PlatformHeader } from '../components/common/PlatformHeader';
import { ExpirationBanner } from '../components/common/ExpirationBanner';

export const PlatformLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
            {/* Simple Corporate Overlay if needed, for now just clean slate */}
            <ExpirationBanner />
            <PlatformHeader />
            <main className="container mx-auto py-8 flex-1">
                <Outlet />
            </main>
        </div>
    );
};
