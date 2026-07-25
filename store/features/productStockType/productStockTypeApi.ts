import { baseApi } from '@/store/api/baseApi';

export const productStockTypeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdjustmentTypes: builder.query({
            query: (params: { store_id: number }) => ({
                url: '/adjustment-types',
                method: 'GET',
                params,
            }),
            providesTags: ['AdjustmentTypes'],
        }),
        createAdjustmentType: builder.mutation({
            query: (body: { store_id: number; type: string; description: string }) => ({
                url: '/adjustment-types',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['AdjustmentTypes'],
        }),
        deleteAdjustmentType: builder.mutation({
            query: (id: number) => ({
                url: `/adjustment-types/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AdjustmentTypes'],
        }),
    }),
});

export const {
    useGetAdjustmentTypesQuery,
    useCreateAdjustmentTypeMutation,
    useDeleteAdjustmentTypeMutation,
} = productStockTypeApi;
