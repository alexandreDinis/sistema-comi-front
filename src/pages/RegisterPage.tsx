import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cyber-bg">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-cyber-gold/5 via-transparent to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-black via-black/80 to-transparent"></div>

                {/* Grid Lines */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            </div>

            <div className="relative z-10 w-full px-4 flex justify-center">
                <RegisterForm />
            </div>

            <div className="fixed bottom-4 text-[9px] text-cyber-gold/20 font-mono tracking-[0.5em] uppercase text-center w-full">
                MÓDULO DE REGISTRO // STRICT_PARAMS
            </div>
        </div>
    );
};
