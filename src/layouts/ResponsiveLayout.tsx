import React from 'react';
import { AppLayout } from './AppLayout';
import { MobileLayout, MobileRouteBlocker } from './MobileLayout';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * ResponsiveLayout
 * 
 * Escolhe automaticamente entre AppLayout (desktop) e MobileLayout (mobile)
 * baseado no tamanho da tela.
 * 
 * Em dispositivos móveis (<768px):
 * - Usa MobileLayout com bottom tabs
 * - Bloqueia rotas não disponíveis no app nativo
 * 
 * Em dispositivos desktop (>=768px):
 * - Usa AppLayout normal com todas as funcionalidades
 */
export const ResponsiveLayout: React.FC = () => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <MobileRouteBlocker>
                <MobileLayout />
            </MobileRouteBlocker>
        );
    }

    return <AppLayout />;
};

export default ResponsiveLayout;
