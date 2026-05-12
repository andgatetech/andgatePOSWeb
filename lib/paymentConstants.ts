// Single source of truth for all payment status/method values, colors, and i18n keys.
// Import from here — never define these inline in components.

export const PAYMENT_STATUS_CONFIGS = {
    paid:    { labelKey: 'status_paid',    bg: 'bg-green-100',  text: 'text-green-800',  hex: '#22c55e' },
    partial: { labelKey: 'status_partial', bg: 'bg-yellow-100', text: 'text-yellow-800', hex: '#3b82f6' },
    due:     { labelKey: 'status_due',     bg: 'bg-red-100',    text: 'text-red-800',    hex: '#ef4444' },
    pending: { labelKey: 'status_pending', bg: 'bg-orange-100', text: 'text-orange-800', hex: '#f97316' },
} as const;

// Backend aliases — normalize before any comparison or display
export const PAYMENT_STATUS_ALIASES: Record<string, string> = {
    completed: 'paid',
    unpaid: 'due',
};

export function normalizePaymentStatus(status: string): string {
    const lower = (status || '').toLowerCase();
    return PAYMENT_STATUS_ALIASES[lower] ?? lower;
}

export function getPaymentStatusConfig(rawStatus: string) {
    const canonical = normalizePaymentStatus(rawStatus);
    return (
        PAYMENT_STATUS_CONFIGS[canonical as keyof typeof PAYMENT_STATUS_CONFIGS] ?? {
            labelKey: '',
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            hex: '#6b7280',
        }
    );
}

// Fallback statuses for POS when the store has no custom payment_statuses configured.
// Components should translate the labelKey via t(PAYMENT_STATUS_CONFIGS[s.value].labelKey).
export const FALLBACK_PAYMENT_STATUSES = [
    { id: 1, value: 'paid' },
    { id: 2, value: 'partial' },
    { id: 3, value: 'due' },
] as const;

// Expense / purchase payment type → i18n key
export const PAYMENT_TYPE_I18N_KEYS: Record<string, string> = {
    cash: 'lbl_cash',
    card: 'lbl_card',
    bank_transfer: 'lbl_bank_transfer',
    bank: 'lbl_bank',
    others: 'lbl_others',
};

export function getPaymentTypeI18nKey(type: string): string {
    return PAYMENT_TYPE_I18N_KEYS[(type || '').toLowerCase()] ?? 'lbl_others';
}

// Default payment method for POS / order-edit initialization
export const DEFAULT_PAYMENT_METHOD = {
    id: 0,
    payment_method_name: 'cash',
} as const;

// Methods where payment is collected immediately — "due" status is not valid.
// Matched by substring so "Cash on Delivery", "bKash", "Nagad" etc. are covered.
const IMMEDIATE_METHOD_KEYWORDS = ['cash', 'bkash', 'nagad', 'rocket', 'upay', 'card', 'tap', 'gpay', 'paytm'];

/**
 * Returns the payment statuses that are valid for a given payment method.
 * Cash-like (immediate) methods cannot be "due" — money is received on the spot.
 */
export function getAllowedStatusesForMethod(method: string): readonly string[] {
    const lower = (method || '').toLowerCase();
    const isImmediate = IMMEDIATE_METHOD_KEYWORDS.some((kw) => lower.includes(kw));
    return isImmediate ? ['paid', 'partial'] : ['paid', 'partial', 'due'];
}
