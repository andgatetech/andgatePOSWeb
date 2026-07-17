// Single source of truth for all payment status/method values, colors, and i18n keys.
// Import from here — never define these inline in components.

export const PAYMENT_STATUS_CONFIGS = {
    paid:    { labelKey: 'status_paid',    bg: 'bg-success-light', text: 'text-success', hex: '#00ab55' },
    partial: { labelKey: 'status_partial', bg: 'bg-warning-light', text: 'text-warning', hex: '#e2a03f' },
    due:     { labelKey: 'status_due',     bg: 'bg-danger-light',  text: 'text-danger',  hex: '#e7515a' },
    pending: { labelKey: 'status_pending', bg: 'bg-warning-light', text: 'text-warning', hex: '#e2a03f' },
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

/**
 * Returns the payment statuses that are valid for a given payment method.
 * Cash can be paid now, partially paid, or due. All other methods clear as paid.
 */
export function getAllowedStatusesForMethod(method: string): readonly string[] {
    const lower = (method || '').toLowerCase();
    return lower === 'cash' ? ['paid', 'partial', 'due'] : ['paid'];
}
