import { baseApi } from '@/store/api/baseApi';

const adjustmentTypeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdjustmentTypes: builder.query({
            query: (params) => ({
                url: 'adjustment-types',
                method: 'GET',
                params,
            }),
            providesTags: ['AdjustmentType'],
        }),
        getSingleAdjustmentTypes: builder.query({
            query: (store_id) => ({
                url: `/adjustment-types/${store_id}`,
                method: 'GET',
            }),
            providesTags: ['AdjustmentType'],
        }),
        createAdjustmentType: builder.mutation({
            query: (data) => ({
                url: 'adjustment-types',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['AdjustmentType'],
        }),
    }),
});

export const { useGetAdjustmentTypesQuery, useGetSingleAdjustmentTypesQuery, useCreateAdjustmentTypeMutation } = adjustmentTypeApi;
