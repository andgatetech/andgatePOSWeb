import { baseApi } from '@/store/api/baseApi';

const productStockApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProductStocks: builder.query({
            query: ({ page = 1, per_page = 10, search = '', category_id = 'all', sort_by = '', order = 'asc' } = {}) => ({
                url: `/stock-report`,
                params: {
                    page,
                    per_page,
                    search,
                    category_id,
                    sort_by,
                    order,
                },
            }),
        }),
    }),
});

export const { useGetProductStocksQuery } = productStockApi;
