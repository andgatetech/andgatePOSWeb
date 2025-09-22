import { baseApi } from '@/store/api/baseApi';

const productAdjustmentHistoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProductAdjustments: builder.query({
            query: ({ storeId, productId, params }) => ({
                url: `/stores/${storeId}/products/${productId}/adjustments`,
                params: { ...params },
            }),
        }),
    }),
});

export const { useGetProductAdjustmentsQuery } = productAdjustmentHistoryApi;
