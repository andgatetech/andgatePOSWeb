import { baseApi } from '@/store/api/baseApi';

export interface QuoteReturnItem {
    order_item_id: number;
    quantity_returned: number;
}

export interface QuoteNewItem {
    product_id: number;
    quantity: number;
    unit_price: number;
    discount?: number;
    tax_included?: boolean;
}

export interface QuoteOrderReturnPayload {
    order_id: number;
    store_id: number;
    return_items: QuoteReturnItem[];
    new_items?: QuoteNewItem[];
}

export interface QuoteOrderReturnResult {
    return_items: any[];
    new_items: any[];
    totals: {
        total_return_amount: number;
        total_new_amount: number;
        net_amount: number;
        direction: 'refund' | 'charge';
        precision: number;
    };
}

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
        quoteOrderReturn: builder.mutation<QuoteOrderReturnResult, QuoteOrderReturnPayload>({
            query: (body) => ({
                url: '/order-returns/quote',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useSendOrderInvoiceMutation, useQuoteOrderReturnMutation } = orderApi;
