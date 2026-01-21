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

        // ✅ BYPASS: Administradores têm acesso total
        if (['ROLE_ADMIN_EMPRESA', 'ADMIN_EMPRESA', 'ROLE_SUPER_ADMIN', 'SUPER_ADMIN'].includes(user.role || '')) {
            return true;
        }

        // Warn if user has no features assigned - this indicates a configuration issue
        if (!user.features || user.features.length === 0) {
            // console.warn('[usePermission] User has no features assigned:', user.email);
            return false;
        }

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
