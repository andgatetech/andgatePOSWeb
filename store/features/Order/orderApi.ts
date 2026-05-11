import { baseApi } from '@/store/api/baseApi';

const orderApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        sendOrderInvoice: builder.mutation({
            query: ({ orderId, store_id, email }: { orderId: number; store_id: number; email?: string }) => ({
                url: `/orders/${orderId}/send-invoice`,
                method: 'POST',
                body: { store_id, ...(email ? { email } : {}) },
            }),
        }),
    }),
});

export const { useSendOrderInvoiceMutation } = orderApi;
