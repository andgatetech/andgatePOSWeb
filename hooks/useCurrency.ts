'use client';
import { RootState } from '@/store';
import { Currency } from '@/store/features/auth/authSlice';
import { useSelector } from 'react-redux';

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

    /**
     * Format a number as currency based on store settings
     * @param amount - The amount to format
     * @returns Formatted currency string
     */
    const formatCurrency = (amount: number | string | null | undefined): string => {
        // Handle null/undefined
        if (amount === null || amount === undefined) return '-';

        // Convert to number
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

        // Handle invalid numbers
        if (isNaN(numAmount)) return '-';

        // Format the number with decimal places
        const formattedNumber = numAmount.toFixed(currency.decimal_places);

        // Split into integer and decimal parts
        const [integerPart, decimalPart] = formattedNumber.split('.');

        // Add thousand separators
        const withSeparators = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousand_separator);

        // Combine with decimal separator
        const finalNumber = decimalPart ? `${withSeparators}${currency.decimal_separator}${decimalPart}` : withSeparators;

        // Add currency symbol based on position
        return currency.currency_position === 'before' ? `${currency.currency_symbol}${finalNumber}` : `${finalNumber}${currency.currency_symbol}`;
    };

    return {
        currency,
        formatCurrency,
        symbol: currency.currency_symbol,
        code: currency.currency_code,
        name: currency.currency_name,
    };
};
