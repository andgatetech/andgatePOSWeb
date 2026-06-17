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
        submitManualPayment: builder.mutation<any, FormData>({
            query: (body) => ({
                url: '/manual-payments',
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
    useSubmitManualPaymentMutation,
} = manualPaymentsApi;
