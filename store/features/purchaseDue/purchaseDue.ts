import { baseApi } from '@/store/api/baseApi';

const PurchaseDueApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all purchase dues
        getPurchaseDues: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();

                // Add all possible filters
                if (params?.store_id) queryParams.append('store_id', params.store_id);
                if (params?.store_ids) queryParams.append('store_ids', params.store_ids);
                if (params?.supplier_id) queryParams.append('supplier_id', params.supplier_id);
                if (params?.status) queryParams.append('status', params.status);
                if (params?.search) queryParams.append('search', params.search);
                if (params?.start_date) queryParams.append('start_date', params.start_date);
                if (params?.end_date) queryParams.append('end_date', params.end_date);
                if (params?.has_due_only) queryParams.append('has_due_only', params.has_due_only);
                if (params?.page) queryParams.append('page', params.page);
                if (params?.per_page) queryParams.append('per_page', params.per_page);
                if (params?.sort_field) queryParams.append('sort_field', params.sort_field);
                if (params?.sort_direction) queryParams.append('sort_direction', params.sort_direction);

                const queryString = queryParams.toString();

                return {
                    url: `/purchase-dues${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            providesTags: ['PurchaseDues'],
        }),

        // Make partial payment
        makePartialPayment: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-order/${id}/payment`,
                method: 'POST',
                body: {
                    payment_amount: data.amount,
                    payment_method: data.payment_method || 'cash',
                    payment_notes: data.notes || '',
                },
            }),
            invalidatesTags: (result, error, { id }) => ['PurchaseDues', { type: 'PurchaseDues', id }, 'PurchaseOrders'],
        }),

        // Clear full due
        clearFullDue: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-order/${id}/clear`,
                method: 'POST',
                body: {
                    payment_method: data.payment_method || 'cash',
                    payment_notes: data.notes || '',
                },
            }),
            invalidatesTags: (result, error, { id }) => ['PurchaseDues', { type: 'PurchaseDues', id }, 'PurchaseOrders'],
        }),
    }),
});

export const {
    // Queries
    useGetPurchaseDuesQuery,

    // Mutations
    useMakePartialPaymentMutation,
    useClearFullDueMutation,
} = PurchaseDueApi;
