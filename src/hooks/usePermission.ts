import { useMemo } from 'react';
import { authService } from '../services/authService';
import { Feature } from '../types/features';

export const usePermission = () => {
    // Memoize user to prevent infinite re-renders from new object reference
    const user = useMemo(() => authService.getCurrentUser(), []);

    /**
     * Verifica se o usuário possui uma feature específica.
     * @param featureCode O código da feature (do enum Feature)
     * @returns true se o usuário tiver a feature ou for ADMIN/ADMIN_EMPRESA (retrocompatibilidade)
     */
    const hasFeature = (featureCode: Feature | string): boolean => {
        if (!user) return false;

        // Normalize role
        const role = user.role ? user.role.toUpperCase().replace('ROLE_', '') : '';

        // Fallback para ADMINs enquanto backend não retorna features completas
        // ADMIN_EMPRESA deve ter acesso a TODAS as features de sua empresa
        if (!user.features || user.features.length === 0) {
            const isAdmin = role === 'ADMIN' ||
                role === 'ADMIN_EMPRESA' ||
                user.roles?.some((r: string) => r.includes('ADMIN'));

            if (isAdmin) {
                console.log('[usePermission] Fallback: Admin without features list -> granting access');
                return true;
            }
        }

        if (!user.features) return false;

        return user.features.includes(featureCode);
    };

    /**
     * Verifica se o usuário possui PELO MENOS UMA das features listadas.
     */
    const hasAnyFeature = (features: (Feature | string)[]): boolean => {
        return features.some(f => hasFeature(f));
    };

    /**
     * Verifica se o usuário possui TODAS as features listadas.
     */
    const hasAllFeatures = (features: (Feature | string)[]): boolean => {
        return features.every(f => hasFeature(f));
    };

    return {
        user,
        hasFeature,
        hasAnyFeature,
        hasAllFeatures
    };
};
