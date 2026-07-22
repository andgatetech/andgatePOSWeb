import { baseApi } from '@/store/api/baseApi';

const productStockApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProductStocks: builder.query({
            query: (params) => ({
                url: `/stock-report`,
                params,
            }),
            // No tags previously — the report never refetched after a sale, purchase
            // receipt, adjustment, or transfer changed stock (all of which invalidate 'Products').
            providesTags: ['Products'],
        }),
    }),
});

export const { useGetProductStocksQuery } = productStockApi;
