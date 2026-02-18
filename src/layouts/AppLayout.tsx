import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '../components/common/AppHeader';
import { MobileBottomNav } from '../components/common/MobileBottomNav';

export const AppLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-cyber-bg relative selection:bg-cyber-gold/30 selection:text-white">
            {/* Experimental Global HUD Overlay - hidden on mobile */}
            <div className="hidden md:block fixed inset-0 pointer-events-none z-60 border-20 border-black/5">
                <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyber-gold/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-cyber-gold/10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-cyber-gold/10"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyber-gold/10"></div>
            </div>

            <AppHeader />
            <main className="container mx-auto px-4 md:px-0 py-4 md:py-8 pb-24 md:pb-8 relative">
                <Outlet />
            </main>
            <MobileBottomNav />
        </div>
    );
};
