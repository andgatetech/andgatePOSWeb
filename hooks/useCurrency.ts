'use client';
import { RootState } from '@/store';
import { Currency } from '@/store/features/auth/authSlice';
import UniversalCookie from 'universal-cookie';
import { useSelector } from 'react-redux';
import { getTranslation } from '@/i18n';
import { formatLocalizedNumber, getNumberLocale } from '@/lib/localized-number';

// Default currency fallback
const DEFAULT_CURRENCY: Currency = {
    currency_code: 'BDT',
    currency_name: 'Bangladeshi Taka',
    currency_symbol: '৳',
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
    const { i18n } = getTranslation();
    const currency = {
        ...DEFAULT_CURRENCY,
        ...(currentStore?.currency || {}),
    };
    const cookieLang = typeof window !== 'undefined' ? new UniversalCookie().get('i18nextLng') : undefined;
    const uiLang = (i18n.language || cookieLang || 'bn').replace('_', '-');
    const locale = getNumberLocale(uiLang);

    const formatCurrency = (amount: number | string | null | undefined): string => {
        if (amount === null || amount === undefined) return '-';

        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return '-';

        try {
            const formattedNumber = new Intl.NumberFormat(locale, {
                minimumFractionDigits: currency.decimal_places,
                maximumFractionDigits: currency.decimal_places,
            }).format(numAmount);

            return currency.currency_position === 'before'
                ? `${currency.currency_symbol}${formattedNumber}`
                : `${formattedNumber}${currency.currency_symbol}`;
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

    const formatNumber = (value: number | string | null | undefined, decimalsOrOptions: number | Intl.NumberFormatOptions = 0): string => {
        const options = typeof decimalsOrOptions === 'number'
            ? { minimumFractionDigits: decimalsOrOptions, maximumFractionDigits: decimalsOrOptions }
            : decimalsOrOptions;
        return formatLocalizedNumber(value, uiLang, options);
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
