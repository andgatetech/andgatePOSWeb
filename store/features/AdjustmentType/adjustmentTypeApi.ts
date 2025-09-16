import { baseApi } from '@/store/api/baseApi';

const adjustmentTypeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdjustmentTypes: builder.query({
            query: () => 'adjustment-types',
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
