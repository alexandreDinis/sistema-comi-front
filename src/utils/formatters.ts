export const formatarData = (dataString: string) => {
    if (!dataString) return '';
    // dataString comes as "2024-01-15". We split and create date manually to avoid UTC offset issues.
    const parts = dataString.split('-');
    if (parts.length !== 3) return dataString; // Fallback

    const [ano, mes, dia] = parts.map(Number);
    // Note: Month in Date constructor is 0-indexed (0=January, 11=December)
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
};

export const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
