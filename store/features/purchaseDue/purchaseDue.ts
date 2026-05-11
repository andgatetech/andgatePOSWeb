import { baseApi } from '@/store/api/baseApi';
export { useClearFullDueMutation, useMakePartialPaymentMutation } from '@/store/features/PurchaseOrder/PurchaseOrderApi';

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

        // Delete purchase due
        deletePurchaseDue: builder.mutation({
            query: (id) => ({
                url: `/purchase-order/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PurchaseDues', 'PurchaseOrders'],
        }),
    }),
});

export const {
    // Queries
    useGetPurchaseDuesQuery,

    // Mutations
    useDeletePurchaseDueMutation,
} = PurchaseDueApi;
