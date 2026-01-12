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

export const formatInputCurrency = (value: string) => {
    if (!value) return '';

    // Remove tudo que não é dígito
    const onlyNumbers = value.replace(/\D/g, '');

    if (!onlyNumbers) return '';

    // Converte para decimal
    const numberValue = parseInt(onlyNumbers) / 100;

    // Formata usando a função existente, mas sem o símbolo R$ para facilitar a edição se preferir, ou com ele.
    // O input currency padrão geralmente mantém o formatação completa "R$ 1.234,56"
    return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const parseCurrencyString = (value: string) => {
    if (!value) return 0;
    // Remove R$, pontos e espaços, troca vírgula por ponto
    const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
};

export const formatarPorcentagem = (valor: number) => {
    return `${valor.toFixed(2)}%`;
};

export const formatCNPJ = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
};

export const formatTelefone = (value: string) => {
    const v = value.replace(/\D/g, '');
    // (11) 99999-9999
    if (v.length > 10) {
        return v
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 15);
    }
    // (11) 9999-9999
    return v
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 14);
};

export const formatCEP = (value: string) => {
    const v = value.replace(/\D/g, '');
    return v
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .slice(0, 9);
};
