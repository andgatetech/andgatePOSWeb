'use client';
import { RootState } from '@/store';
import { Currency } from '@/store/features/auth/authSlice';
import UniversalCookie from 'universal-cookie';
import { useSelector } from 'react-redux';

// Default currency fallback
const DEFAULT_CURRENCY: Currency = {
    currency_code: 'USD',
    currency_name: 'US Dollar',
    currency_symbol: '$',
    currency_position: 'before',
    decimal_places: 2,
    rounding_mode: 'half_up',
    cash_rounding: null,
    thousand_separator: ',',
    decimal_separator: '.',
};

/**
 * Custom hook to get currency settings and formatting utilities
 * @returns Object containing currency settings and formatCurrency function
 */
export const useCurrency = () => {
    const currentStore = useSelector((state: RootState) => state.auth?.currentStore);
    const currency = currentStore?.currency || DEFAULT_CURRENCY;
    const cookieLang = typeof window !== 'undefined' ? new UniversalCookie().get('i18nextLng') : undefined;
    const locale = (currentStore?.locale || cookieLang || 'en').replace('_', '-');

    const formatCurrency = (amount: number | string | null | undefined): string => {
        if (amount === null || amount === undefined) return '-';

        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return '-';

        try {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency.currency_code || DEFAULT_CURRENCY.currency_code,
                minimumFractionDigits: currency.decimal_places,
                maximumFractionDigits: currency.decimal_places,
            }).format(numAmount);
        } catch {
            const formattedNumber = numAmount.toFixed(currency.decimal_places);
            const [integerPart, decimalPart] = formattedNumber.split('.');
            const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousand_separator);
            const finalNumber = decimalPart ? `${withSeparators}${currency.decimal_separator}${decimalPart}` : withSeparators;

            return currency.currency_position === 'before'
                ? `${currency.currency_symbol}${finalNumber}`
                : `${finalNumber}${currency.currency_symbol}`;
        }
    };

    const formatNumber = (value: number | string | null | undefined, decimals = 0): string => {
        if (value === null || value === undefined) return '-';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '-';
        return new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(num);
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
