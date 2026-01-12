export function limparPlaca(placa: string): string {
    if (!placa) return '';
    return placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function validarPlaca(placa: string): boolean {
    if (!placa) return false;
    const clean = limparPlaca(placa);
    if (clean.length !== 7) return false;

    // Regex Antiga: 3 letras + 4 números
    const regexAntiga = /^[A-Z]{3}[0-9]{4}$/;
    // Regex Mercosul: 3 letras + 1 número + 1 letra + 2 números
    const regexMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    return regexAntiga.test(clean) || regexMercosul.test(clean);
}

export function detectarTipoPlaca(placa: string): 'ANTIGA' | 'MERCOSUL' | null {
    const clean = limparPlaca(placa);
    if (/^[A-Z]{3}[0-9]{4}$/.test(clean)) return 'ANTIGA';
    if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(clean)) return 'MERCOSUL';
    return null;
}
