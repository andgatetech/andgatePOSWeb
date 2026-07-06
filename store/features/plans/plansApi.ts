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
    tier: number;
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
    is_most_popular: boolean;
    is_enterprise: boolean;
    cta_label_en: string | null;
    cta_label_bn: string | null;
    highlight_en: string | null;
    highlight_bn: string | null;
    created_at: string;
    updated_at: string;
    items: PlanItem[];
}

export interface PlansResponse {
    success: boolean;
    message: string;
    data: Plan[];
}

export interface AccessibleFeaturesResponse {
    success: boolean;
    message: string;
    data: {
        features: string[];
        plan: {
            id: number;
            plan_name_en: string;
            plan_name_bn: string;
            tier: number;
            status: string;
            billing_cycle: string;
            expire_date: string | null;
            quota_remaining: Record<string, number | null>;
        } | null;
    };
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
        getAccessibleFeatures: builder.query<AccessibleFeaturesResponse, void>({
            query: () => ({
                url: '/packages/features',
                method: 'GET',
            }),
            providesTags: ['Plans'],
        }),
    }),
});

export const { useGetPlansQuery, useGetAccessibleFeaturesQuery } = plansApi;

export function filterActivePlans(plans: Plan[]): Plan[] {
    return plans;
}

export function formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return `৳ 0`;
    const formatted = Math.round(num)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `৳ ${formatted}`;
}

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

export function calcYearlySavings(monthly: string, yearly: string): number {
    const m = parseFloat(monthly);
    const y = parseFloat(yearly);
    if (!m || !y) return 0;
    const monthlyTotal = m * 12;
    const saved = monthlyTotal - y;
    if (saved <= 0) return 0;
    return Math.round((saved / monthlyTotal) * 100);
}

export const PLAN_COLORS = ['green', 'blue', 'purple', 'orange', 'slate'] as const;
export type PlanColor = (typeof PLAN_COLORS)[number];

export function getPlanColor(index: number): PlanColor {
    return PLAN_COLORS[index % PLAN_COLORS.length];
}

export function isMostPopularPlan(plan: Pick<Plan, 'is_most_popular'>): boolean {
    return plan.is_most_popular === true;
}

export function isEnterprisePlan(plan: Pick<Plan, 'is_enterprise'>): boolean {
    return plan.is_enterprise === true;
}
