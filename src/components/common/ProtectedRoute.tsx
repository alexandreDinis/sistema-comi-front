import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import { Feature } from '../../types/features';

interface ProtectedRouteProps {
    children: React.ReactNode;
    role?: 'ADMIN' | 'USER' | 'ADMIN_PLATAFORMA' | 'ADMIN_EMPRESA' | string;
    allowedRoles?: string[]; // New: Allow multiple roles
    requiredFeature?: Feature | string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role, allowedRoles, requiredFeature }) => {
    const { user, hasFeature } = usePermission();
    const location = useLocation();

    if (!user || !user.token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredFeature) {
        if (!hasFeature(requiredFeature)) {
            return <AccessDenied />;
        }
    }

    // Role Checks (Legacy 'role' string OR new 'allowedRoles' array)
    if (role || allowedRoles) {
        // Normalize User Role
        let userRole = user.role ? user.role.toUpperCase() : '';
        if (userRole.startsWith('ROLE_')) userRole = userRole.replace('ROLE_', '');

        const userRoles = user.roles ? user.roles.map((r: string) => r.toUpperCase().replace('ROLE_', '')) : [];

        // Determine if user has access
        let hasAccess = false;

        // 1. Check 'role' (Legacy single role)
        if (role) {
            let requiredRole = role.toUpperCase();
            if (requiredRole.startsWith('ROLE_')) requiredRole = requiredRole.replace('ROLE_', '');

            hasAccess = userRole === requiredRole ||
                userRoles.includes(requiredRole) ||
                (requiredRole === 'ADMIN' && userRole === 'ADMIN') ||
                (requiredRole === 'ADMIN_PLATAFORMA' && userRole === 'SUPER_ADMIN');
        }

        // 2. Check 'allowedRoles' (New array support)
        if (allowedRoles && allowedRoles.length > 0) {
            const normalizedAllowed = allowedRoles.map(r => r.toUpperCase().replace('ROLE_', ''));
            // If user has ANY of the allowed roles
            const matchesAllowed = normalizedAllowed.includes(userRole) ||
                userRoles.some(ur => normalizedAllowed.includes(ur));

            // If role was also specified, treat as OR condition? Or override?
            // Let's treat allowedRoles as the primary check if present.
            if (matchesAllowed) hasAccess = true;
        }

        if (!hasAccess) {
            return <AccessDenied />;
        }
    }

    return <>{children}</>;
};

const AccessDenied = () => (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="border-2 border-cyber-error bg-black/90 p-8 max-w-md w-full relative overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.2)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyber-error animate-pulse"></div>
            <div className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-cyber-error blur-xl opacity-20 animate-pulse"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyber-error relative z-10 w-16 h-16">
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                    </svg>
                </div>

                <div>
                    <h2 className="text-2xl font-black text-cyber-error tracking-widest uppercase mb-2 glitch">ACESSO NEGADO</h2>
                    <p className="text-cyber-error/80 font-mono text-sm leading-relaxed mb-4">
                        ERRO_403: PERMISSÃO_INSUFICIENTE
                        <br />
                        Sua credencial ou plano não permite acessar este módulo.
                    </p>
                </div>

                <div className="w-full h-px bg-cyber-error/30 my-2"></div>

                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-cyber-error/10 border border-cyber-error text-cyber-error hover:bg-cyber-error hover:text-black transition-all font-bold tracking-wider text-xs uppercase"
                >
                    {`<<`} RETORNAR
                </button>
            </div>
        </div>
    </div>
);
