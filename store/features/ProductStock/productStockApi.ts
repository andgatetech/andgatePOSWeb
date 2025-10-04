import { baseApi } from '@/store/api/baseApi';

const productStockApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProductStocks: builder.query({
            query: (params) => ({
                url: `/stock-report`,
                params,
            }),
        }),
    }),
});

export const { useGetProductStocksQuery } = productStockApi;
