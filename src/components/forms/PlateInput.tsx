
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

type PlateFormat = 'mercosul' | 'legacy';

interface PlateInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    onBlur?: () => void;
    autoFocus?: boolean;
}

export const PlateInput: React.FC<PlateInputProps> = ({
    value,
    onChange,
    placeholder,
    className = '',
    autoFocus = false,
    onBlur
}) => {
    const [format, setFormat] = useState<PlateFormat>('mercosul');

    useEffect(() => {
        if (value) {
            if (value.includes('-')) {
                setFormat('legacy');
            } else if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(value)) {
                setFormat('mercosul');
            }
        }
    }, [value]);

    // Validation patterns
    // Mercosul: LLLNLNN
    // Legacy: LLL-NNNN
    const isLetter = (char: string) => /^[A-Z]$/.test(char.toUpperCase());
    const isNumber = (char: string) => /^[0-9]$/.test(char);

    const applyMask = (rawValue: string, fmt: PlateFormat): string => {
        const chars = rawValue.toUpperCase().replace(/[^A-Z0-9]/g, '').split('');
        let formatted = '';
        let charIndex = 0;

        if (fmt === 'mercosul') {
            // Pattern: L L L N L N N (7 chars)
            const pattern = ['L', 'L', 'L', 'N', 'L', 'N', 'N'];

            for (let i = 0; i < pattern.length && charIndex < chars.length; i++) {
                const char = chars[charIndex];
                const expected = pattern[i];

                if (expected === 'L') {
                    if (isLetter(char)) {
                        formatted += char;
                        charIndex++;
                    } else {
                        // Skip invalid char if we can, or just stop? 
                        // Better UX: stop or ignore. Here we try to find next valid? 
                        // Simple strict: if next char doesn't match, stop.
                        // But users might paste. Let's filter input to find valid chars?
                        // No, standard masking usually rejects invalid keypress.
                        // Let's iterate raw chars; if match, append. If not, check if it's a number when expecting letter?
                        // Actually, common strategy: 
                        // If we expect L and get N, ignore N.
                        charIndex++; // Skip the invalid char in input stream constraint
                        i--; // Retry this pattern position with next char
                    }
                } else if (expected === 'N') {
                    if (isNumber(char)) {
                        formatted += char;
                        charIndex++;
                    } else {
                        charIndex++;
                        i--;
                    }
                }
            }
            return formatted.slice(0, 7);
        } else {
            // Legacy: L L L - N N N N
            // We format as LLL-NNNN
            // Pattern logic: 3 Letters, then force hyphen, then 4 Numbers.
            // We process LLL first.

            // First 3: LLL
            for (let i = 0; i < 3 && charIndex < chars.length; i++) {
                if (isLetter(chars[charIndex])) {
                    formatted += chars[charIndex];
                } else {
                    // ignore invalid
                }
                charIndex++;
            }

            // If we have 3 letters, add hyphen
            if (formatted.length === 3) {
                formatted += '-';
            }

            // Next 4: NNNN
            for (let i = 0; i < 4 && charIndex < chars.length; i++) {
                if (isNumber(chars[charIndex])) {
                    formatted += chars[charIndex];
                } else {
                    // ignore
                }
                charIndex++;
            }

            return formatted.slice(0, 8);
        }
    };

    // Improved handleChange to use strict masking with auto-detection
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        let currentFormat = format;

        // 1. Force Legacy if hyphen is typed
        if (raw.includes('-')) {
            if (currentFormat !== 'legacy') {
                currentFormat = 'legacy';
                setFormat('legacy');
            }
        } else {
            // 2. Auto-detect based on 5th character (Index 4)
            // Legacy: LLL-NNNN -> 5th char (ignoring hyphen) is Number (index 4 of cleaned string)
            // Mercosul: LLLNLNN -> 5th char is Letter (index 4 of cleaned string)
            const clean = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

            if (clean.length >= 5) {
                const fifthChar = clean[4];
                const isFifthLetter = /[A-Z]/.test(fifthChar);

                if (isFifthLetter && currentFormat !== 'mercosul') {
                    currentFormat = 'mercosul';
                    setFormat('mercosul');
                } else if (!isFifthLetter && /[0-9]/.test(fifthChar) && currentFormat !== 'legacy') {
                    // Logic loop: Mercosul also has number at index 3 (4th char). 
                    // But index 4 (5th char) IS Letter for Mercosul.
                    // If it is Number, it MUST be Legacy (or invalid Mercosul, but we assume Legacy intent).
                    currentFormat = 'legacy';
                    setFormat('legacy');
                }
            }
        }

        const newValue = applyMask(raw, currentFormat);
        onChange(newValue);
    };

    const toggleFormat = () => {
        const newFormat = format === 'mercosul' ? 'legacy' : 'mercosul';
        setFormat(newFormat);
        onChange(applyMask(value, newFormat));
    };

    return (
        <div className={`relative group ${className}`}>
            {/* Toggle Button - Floating outside or appearing on hover */}
            <button
                type="button"
                onClick={toggleFormat}
                className="absolute -top-3 -right-3 z-10 bg-cyber-gold text-black rounded-full p-1.5 shadow-lg border-2 border-white transform transition-transform hover:scale-110 hover:rotate-180"
                title="Mudar Modelo da Placa"
            >
                <RefreshCw size={12} className="font-bold" />
            </button>

            {/* Plate Container */}
            <div
                className={`
                    relative w-full max-w-[280px] h-[90px] mx-auto rounded-lg overflow-hidden border-4 shadow-xl transition-all duration-500
                    ${format === 'mercosul'
                        ? 'bg-white border-black/80'
                        : 'bg-linear-to-b from-gray-300 to-gray-400 border-gray-600'
                    }
                `}
            >
                {/* Mercosul Top Bar */}
                {format === 'mercosul' && (
                    <div className="absolute top-0 left-0 right-0 h-[28px] bg-blue-700 flex items-center justify-between px-2">
                        <div className="w-8 h-5 bg-blue-900 border border-white/20 relative overflow-hidden hidden sm:block">
                            {/* Abstract Flag Representation */}
                            <div className="absolute inset-0 bg-blue-700"></div>
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 bg-yellow-400 transform -skew-x-12"></div>
                            <div className="absolute inset-y-0 left-1/3 w-2 bg-green-600 rounded-full opacity-50"></div>
                        </div>
                        <span className="text-white font-bold text-xs tracking-widest mx-auto translate-x-1">BRASIL</span>
                        <div className="w-6 h-6 bg-transparent"></div> {/* Spacer */}
                        <div className="absolute bottom-[-10px] right-2">
                            {/* Hologram fake */}
                            <div className="w-4 h-4 rounded-full bg-white/20 blur-[1px]"></div>
                        </div>
                    </div>
                )}

                {/* Legacy Top Border Hint (Optional) */}
                {format === 'legacy' && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 font-bold tracking-[0.2em] opacity-40">
                        BRASIL
                    </div>
                )}

                {/* Input Field Area */}
                <div className={`
                    absolute bottom-0 left-0 right-0 top-6 flex items-center justify-center
                    ${format === 'legacy' ? 'top-0' : 'top-[22px]'}
                `}>
                    <input
                        type="text"
                        value={value}
                        onChange={handleChange}
                        placeholder={placeholder || (format === 'mercosul' ? 'ABC1D23' : 'ABC-1234')}
                        className={`
                            w-full h-full bg-transparent text-center font-bold outline-none uppercase tracking-widest
                            ${format === 'mercosul'
                                ? 'text-black text-4xl drop-shadow-sm font-[FE-Schrift]' // Standard font fallback will be sans-serif if not loaded
                                : 'text-gray-800 text-4xl font-mono drop-shadow-[1px_1px_0px_rgba(255,255,255,0.5)]'
                            }
                            placeholder:text-gray-300/50
                        `}
                        style={{ fontFamily: format === 'mercosul' ? '"Fira Sans", "Roboto", "Arial", sans-serif' : '"Courier New", monospace' }}
                        autoFocus={autoFocus}
                        maxLength={format === 'mercosul' ? 7 : 8}
                        onBlur={onBlur}
                    />
                </div>

                {/* QR Code / Details Simulation for Realism */}
                {format === 'mercosul' && (
                    <div className="absolute bottom-1 left-2 w-5 h-5 bg-black/10 rounded flex items-center justify-center text-[4px] text-black/50">
                        QRCode
                    </div>
                )}
            </div>

            {/* Cyber Label Underneath */}
            <div className="text-center mt-2 text-[10px] text-cyber-gold/50 font-mono uppercase tracking-widest">
                {format === 'mercosul' ? 'Padrão Mercosul' : 'Padrão Antigo'}
            </div>
        </div>
    );
};
