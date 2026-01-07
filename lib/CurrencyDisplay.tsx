'use client';
import { useCurrency } from '@/hooks/useCurrency';

interface CurrencyDisplayProps {
    amount: number | string | null | undefined;
    className?: string;
}

/**
 * Reusable component to display formatted currency
 * @param amount - The amount to display
 * @param className - Optional CSS classes
 */
export const CurrencyDisplay = ({ amount, className = '' }: CurrencyDisplayProps) => {
    const { formatCurrency } = useCurrency();

    return <span className={className}>{formatCurrency(amount)}</span>;
};
