'use client';
import { RootState } from '@/store';
import { Currency } from '@/store/features/auth/authSlice';
import UniversalCookie from 'universal-cookie';
import { useSelector } from 'react-redux';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const toLocalDigits = (str: string, lang: string): string => {
    if (lang !== 'bn') return str;
    return str.replace(/[0-9]/g, (d) => BN_DIGITS[parseInt(d)]);
};

// Default currency fallback
const DEFAULT_CURRENCY: Currency = {
    currency_code: 'BDT',
    currency_name: 'Bangladeshi Taka',
    currency_symbol: '৳',
    currency_position: 'before',
    decimal_places: 2,
    thousand_separator: ',',
    decimal_separator: '.',
};

/**
 * Custom hook to get currency settings and formatting utilities
 * @returns Object containing currency settings and formatCurrency function
 */
export const useCurrency = () => {
    const currency = useSelector((state: RootState) => state.auth?.currentStore?.currency || DEFAULT_CURRENCY);
    const lang = typeof window !== 'undefined' ? new UniversalCookie().get('i18nextLng') || 'bn' : 'bn';

    const formatCurrency = (amount: number | string | null | undefined): string => {
        if (amount === null || amount === undefined) return '-';

        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return '-';

        const formattedNumber = numAmount.toFixed(currency.decimal_places);
        const [integerPart, decimalPart] = formattedNumber.split('.');

        const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousand_separator);
        const finalNumber = decimalPart ? `${withSeparators}${currency.decimal_separator}${decimalPart}` : withSeparators;

        const localNumber = toLocalDigits(finalNumber, lang);
        return currency.currency_position === 'before'
            ? `${currency.currency_symbol}${localNumber}`
            : `${localNumber}${currency.currency_symbol}`;
    };

    const formatNumber = (value: number | string | null | undefined, decimals = 0): string => {
        if (value === null || value === undefined) return '-';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '-';
        const formatted = num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        return toLocalDigits(formatted, lang);
    };

    return {
        currency,
        formatCurrency,
        formatNumber,
        symbol: currency.currency_symbol,
        code: currency.currency_code,
        name: currency.currency_name,
    };
};
