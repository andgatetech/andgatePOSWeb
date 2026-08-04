import { baseApi } from '@/store/api/baseApi';

export interface ManualPaymentSummary {
    subscription: any | null;
    latest_payment: any | null;
    remaining_days: number | null;
    has_pending_payment: boolean;
    setup_fee_applies: boolean;
    payment_methods: string[];
    providers: Record<string, string>;
}

export interface AddonCatalogItem {
    slug: string;
    label_en: string;
    label_bn: string;
    monthly_price: number;
    min_plan_tier: number;
    type: 'quota' | 'permission_grant' | 'flag';
    grants?: string[];
    eligible: boolean;
    active_quantity: number;
}

export const manualPaymentsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getManualPaymentSummary: builder.query<{ success: boolean; data: ManualPaymentSummary }, void>({
            query: () => ({ url: '/manual-payments/summary', method: 'GET' }),
            providesTags: ['ManualPayments'],
        }),
        getManualPayments: builder.query<any, void>({
            query: () => ({ url: '/manual-payments', method: 'GET' }),
            providesTags: ['ManualPayments'],
        }),
        getSubscriptionPaymentHistory: builder.query<any, void>({
            query: () => ({ url: '/manual-payments/subscription-history', method: 'GET' }),
            providesTags: ['ManualPayments'],
        }),
        submitManualPayment: builder.mutation<any, FormData>({
            query: (body) => ({
                url: '/manual-payments',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ManualPayments'],
        }),
        getAddonCatalog: builder.query<{ success: boolean; data: AddonCatalogItem[] }, void>({
            query: () => ({ url: '/manual-payments/addons', method: 'GET' }),
            providesTags: ['ManualPayments'],
        }),
        submitAddonPayment: builder.mutation<any, FormData>({
            query: (body) => ({
                url: '/manual-payments/addons',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['ManualPayments'],
        }),
    }),
});

export const {
    useGetManualPaymentSummaryQuery,
    useGetManualPaymentsQuery,
    useGetSubscriptionPaymentHistoryQuery,
    useSubmitManualPaymentMutation,
    useGetAddonCatalogQuery,
    useSubmitAddonPaymentMutation,
} = manualPaymentsApi;
