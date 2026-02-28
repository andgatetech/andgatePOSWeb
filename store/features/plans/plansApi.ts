import { baseApi } from '@/store/api/baseApi';

export interface PlanItem {
    id: number;
    subscription_id: number;
    title_en: string;
    title_bn: string;
    value: string | null;
}

export interface Plan {
    id: number;
    name_en: string;
    name_bn: string;
    monthly_price: string;
    yearly_price: string;
    discount: string;
    setup_fee: string;
    status: boolean;
    is_default: boolean;
    default_billing_cycle: string;
    default_billing_days: number | null;
    created_at: string;
    updated_at: string;
    items: PlanItem[];
}

export interface PlansResponse {
    success: boolean;
    message: string;
    data: Plan[];
}

const plansApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPlans: builder.query<PlansResponse, void>({
            query: () => ({
                url: '/plans',
                method: 'GET',
            }),
            providesTags: ['Plans'],
        }),
    }),
});

export const { useGetPlansQuery } = plansApi;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Return all plans exactly as the API sends them — no frontend filtering. */
export function filterActivePlans(plans: Plan[]): Plan[] {
    return plans;
}

/** Format a price string as Bengali Taka */
export function formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '৳ 0';
    return `৳ ${num.toLocaleString('en-BD', { maximumFractionDigits: 0 })}`;
}

/**
 * Apply discount to a price.
 * Returns the original price (for strikethrough) and the discounted final price.
 * discount field is a percentage e.g. "10.00" = 10%
 */
export function applyDiscount(
    price: string,
    discount: string
): {
    originalPrice: string;
    finalPrice: string;
    hasDiscount: boolean;
    discountPct: number;
} {
    const p = parseFloat(price);
    const d = parseFloat(discount);
    if (!d || d <= 0 || isNaN(p)) {
        return { originalPrice: '', finalPrice: formatPrice(price), hasDiscount: false, discountPct: 0 };
    }
    const final = p * (1 - d / 100);
    return {
        originalPrice: formatPrice(price),
        finalPrice: formatPrice(final),
        hasDiscount: true,
        discountPct: Math.round(d),
    };
}

/** Calculate yearly savings percentage compared to paying monthly x12 */
export function calcYearlySavings(monthly: string, yearly: string): number {
    const m = parseFloat(monthly);
    const y = parseFloat(yearly);
    if (!m || !y) return 0;
    const monthlyTotal = m * 12;
    const saved = monthlyTotal - y;
    if (saved <= 0) return 0;
    return Math.round((saved / monthlyTotal) * 100);
}

/** Cycle through the colour palette for plan cards */
export const PLAN_COLORS = ['green', 'blue', 'purple', 'orange', 'slate'] as const;
export type PlanColor = (typeof PLAN_COLORS)[number];

export function getPlanColor(index: number): PlanColor {
    return PLAN_COLORS[index % PLAN_COLORS.length];
}
