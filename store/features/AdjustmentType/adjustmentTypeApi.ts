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

export const { useGetAdjustmentTypesQuery, useCreateAdjustmentTypeMutation } = adjustmentTypeApi;
