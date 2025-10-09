import { baseApi } from '@/store/api/baseApi';

const PurchaseDueApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all purchase dues
        getPurchaseDues: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();

                // Add filters if provided
                if (params?.store_id) queryParams.append('store_id', params.store_id);
                if (params?.supplier_id) queryParams.append('supplier_id', params.supplier_id);
                if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
                if (params?.page) queryParams.append('page', params.page);
                if (params?.per_page) queryParams.append('per_page', params.per_page);

                const queryString = queryParams.toString();
                return {
                    url: `/purchase-dues${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            providesTags: ['PurchaseDues'],
        }),

        // Get single purchase due details
        getPurchaseDueById: builder.query({
            query: (id) => ({
                url: `/purchase-dues/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'PurchaseDues', id }],
        }),

        // Make partial payment
        makePartialPayment: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-dues/${id}/payment`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => ['PurchaseDues', { type: 'PurchaseDues', id }, 'PurchaseOrders'],
        }),

        // Clear full due
        clearFullDue: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-dues/${id}/clear`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => ['PurchaseDues', { type: 'PurchaseDues', id }, 'PurchaseOrders'],
        }),
    }),
});

export const {
    // Queries
    useGetPurchaseDuesQuery,
    useGetPurchaseDueByIdQuery,

    // Mutations
    useMakePartialPaymentMutation,
    useClearFullDueMutation,
} = PurchaseDueApi;
