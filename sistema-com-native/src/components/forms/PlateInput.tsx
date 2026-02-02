import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { theme } from '../../theme';

type PlateFormat = 'mercosul' | 'legacy';

interface PlateInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
}

export const PlateInput: React.FC<PlateInputProps> = ({ value, onChange, onBlur }) => {
    const [format, setFormat] = useState<PlateFormat>('mercosul');

    const isLetter = (char: string) => /^[A-Z]$/.test(char.toUpperCase());
    const isNumber = (char: string) => /^[0-9]$/.test(char);

    // Determina o tipo de teclado baseado na posição atual
    const keyboardType = useMemo((): KeyboardTypeOptions => {
        const cleanValue = value.replace(/[^A-Z0-9]/gi, '');
        const currentPosition = cleanValue.length;

        if (format === 'mercosul') {
            // Mercosul: L L L N L N N (posições 0,1,2,4 são letras; 3,5,6 são números)
            const letterPositions = [0, 1, 2, 4];
            const numberPositions = [3, 5, 6];

            if (currentPosition >= 7) {
                return 'default'; // Placa completa
            }

            if (numberPositions.includes(currentPosition)) {
                return 'number-pad';
            }
            return 'default'; // Para letras, usa teclado padrão
        } else {
            // Legacy: L L L - N N N N (posições 0,1,2 são letras; 3,4,5,6 são números)
            if (currentPosition >= 3) {
                return 'number-pad';
            }
            return 'default';
        }
    }, [value, format]);

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
                        charIndex++;
                        i--;
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
            for (let i = 0; i < 3 && charIndex < chars.length; i++) {
                if (isLetter(chars[charIndex])) {
                    formatted += chars[charIndex];
                }
                charIndex++;
            }

            if (formatted.length === 3) {
                formatted += '-';
            }

            for (let i = 0; i < 4 && charIndex < chars.length; i++) {
                if (isNumber(chars[charIndex])) {
                    formatted += chars[charIndex];
                }
                charIndex++;
            }

            return formatted.slice(0, 8);
        }
    };

    const handleChange = (text: string) => {
        const newValue = applyMask(text, format);
        onChange(newValue);
    };

    const toggleFormat = () => {
        const newFormat = format === 'mercosul' ? 'legacy' : 'mercosul';
        setFormat(newFormat);
        onChange(applyMask(value, newFormat));
    };

    // Hint para o usuário sobre qual tipo de caractere digitar
    const getPositionHint = (): string => {
        const cleanValue = value.replace(/[^A-Z0-9]/gi, '');
        const currentPosition = cleanValue.length;

        if (format === 'mercosul') {
            if (currentPosition >= 7) return 'Placa completa';
            const letterPositions = [0, 1, 2, 4];
            return letterPositions.includes(currentPosition) ? 'Digite uma LETRA' : 'Digite um NÚMERO';
        } else {
            if (currentPosition >= 7) return 'Placa completa';
            return currentPosition < 3 ? 'Digite uma LETRA' : 'Digite um NÚMERO';
        }
    };

    return (
        <View style={styles.container}>
            {/* Toggle Button */}
            <TouchableOpacity onPress={toggleFormat} style={styles.toggleButton}>
                <RefreshCw size={16} color="#000" />
            </TouchableOpacity>

            {/* Plate Container */}
            <View style={[
                styles.plateContainer,
                format === 'mercosul' ? styles.plateMercosul : styles.plateLegacy
            ]}>
                {/* Mercosul Top Bar */}
                {format === 'mercosul' && (
                    <View style={styles.mercosulBar}>
                        <View style={styles.flagContainer}>
                            <View style={styles.flagBlue} />
                            <View style={styles.flagYellow} />
                        </View>
                        <Text style={styles.brasilText}>BRASIL</Text>
                        <View style={{ width: 30 }} />
                    </View>
                )}

                {/* Legacy Label */}
                {format === 'legacy' && (
                    <Text style={styles.legacyLabel}>BRASIL</Text>
                )}

                {/* Input Field */}
                <View style={[
                    styles.inputContainer,
                    format === 'mercosul' ? { marginTop: 32 } : { marginTop: 16 }
                ]}>
                    <TextInput
                        value={value}
                        onChangeText={handleChange}
                        onBlur={onBlur}
                        placeholder={format === 'mercosul' ? 'ABC1D23' : 'ABC-1234'}
                        placeholderTextColor="rgba(0,0,0,0.25)"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        keyboardType={keyboardType}
                        maxLength={format === 'mercosul' ? 7 : 8}
                        style={[
                            styles.input,
                            format === 'mercosul' ? styles.inputMercosul : styles.inputLegacy
                        ]}
                    />
                </View>

                {/* QR Code indicator for Mercosul */}
                {format === 'mercosul' && (
                    <View style={styles.qrCode}>
                        <Text style={styles.qrText}>QR</Text>
                    </View>
                )}
            </View>

            {/* Position Hint */}
            <Text style={styles.positionHint}>{getPositionHint()}</Text>

            {/* Format Label */}
            <Text style={styles.formatLabel}>
                {format === 'mercosul' ? 'Padrão Mercosul' : 'Padrão Antigo'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 20,
    },
    toggleButton: {
        position: 'absolute',
        top: -10,
        right: 10,
        zIndex: 10,
        backgroundColor: theme.colors.primary,
        borderRadius: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    plateContainer: {
        width: 320,
        height: 100,
        borderRadius: 10,
        borderWidth: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 10,
    },
    plateMercosul: {
        backgroundColor: '#FFFFFF',
        borderColor: '#1a1a1a',
    },
    plateLegacy: {
        backgroundColor: '#B0B0B0',
        borderColor: '#666666',
    },
    mercosulBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 30,
        backgroundColor: '#1a4d8c',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    flagContainer: {
        width: 28,
        height: 18,
        backgroundColor: '#003087',
        borderRadius: 2,
        overflow: 'hidden',
    },
    flagBlue: {
        flex: 1,
        backgroundColor: '#003087',
    },
    flagYellow: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        height: 5,
        backgroundColor: '#FFCC00',
    },
    brasilText: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 4,
    },
    legacyLabel: {
        position: 'absolute',
        top: 6,
        alignSelf: 'center',
        fontSize: 10,
        color: 'rgba(0,0,0,0.35)',
        fontWeight: '700',
        letterSpacing: 5,
    },
    inputContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    input: {
        width: '100%',
        textAlign: 'center',
        fontWeight: '900',
        letterSpacing: 8,
    },
    inputMercosul: {
        fontSize: 42,
        color: '#000000',
        fontWeight: '800',
    },
    inputLegacy: {
        fontSize: 40,
        color: '#333333',
        fontFamily: 'monospace',
    },
    qrCode: {
        position: 'absolute',
        bottom: 6,
        left: 8,
        width: 22,
        height: 22,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrText: {
        fontSize: 7,
        color: 'rgba(0,0,0,0.4)',
        fontWeight: '700',
    },
    positionHint: {
        marginTop: 6,
        fontSize: 11,
        color: theme.colors.primary,
        fontWeight: '600',
        letterSpacing: 1,
    },
    formatLabel: {
        marginTop: 4,
        fontSize: 10,
        color: 'rgba(212, 175, 55, 0.5)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});

