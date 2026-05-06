export const getNumberLocale = (language?: string): string => {
    const normalized = (language || 'bn').replace('_', '-').split('-')[0];
    if (normalized === 'bn') return 'bn-BD';
    if (normalized === 'en') return 'en-BD';
    return language || 'bn-BD';
};

export const formatLocalizedNumber = (
    value: number | string | null | undefined,
    language?: string,
    options: Intl.NumberFormatOptions = {}
): string => {
    if (value === null || value === undefined) return '-';

    const numericValue = typeof value === 'string' ? Number(value) : value;
    if (!Number.isFinite(numericValue)) return String(value);

    try {
        return new Intl.NumberFormat(getNumberLocale(language), options).format(numericValue);
    } catch {
        return String(value);
    }
};
