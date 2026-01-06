export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const formatPercentage = (value: number): string => {
    return `${value.toFixed(2).replace('.', ',')}%`;
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export const formatInputCurrency = (value: string): string => {
    // Remove tudo que não é número
    const digits = value.replace(/\D/g, '');

    // Converte para centavos
    const amount = parseInt(digits || '0') / 100;

    // Formata como moeda (sem o símbolo R$ para facilitar o input)
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const parseCurrencyString = (value: string): number => {
    // Converte de volta para número (ex: "1.250,50" -> 1250.50)
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
};
