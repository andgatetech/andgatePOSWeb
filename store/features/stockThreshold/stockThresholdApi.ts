import { baseApi } from '@/store/api/baseApi';

export interface ThresholdItem {
    stock_id: number;
    product_id: number;
    product_name: string;
    category_id: number | null;
    category_name: string | null;
    category_threshold: number;
    sku: string | null;
    quantity: number;
    low_stock_quantity: number;
    suppress_low_stock: boolean;
    store_id: number;
    effective_threshold: number;
}

export interface ThresholdListResponse {
    items: ThresholdItem[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        has_more_pages: boolean;
    };
}

export interface BulkUpdatePayload {
    store_id: number;
    items: {
        stock_id: number;
        low_stock_quantity?: number;
        suppress_low_stock?: boolean;
    }[];
}

const StockThresholdApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStockThresholds: builder.query<{ data: ThresholdListResponse }, {
            store_id?: number;
            page?: number;
            per_page?: number;
            search?: string;
            category_id?: number;
        }>({
            query: (params) => ({
                url: '/products/thresholds',
                method: 'GET',
                params,
            }),
            providesTags: ['StockThresholds'],
        }),

        bulkUpdateThresholds: builder.mutation<{ data: { updated: number } }, BulkUpdatePayload>({
            query: (data) => ({
                url: '/products/thresholds/bulk',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['StockThresholds'],
        }),

        updateCategoryThreshold: builder.mutation<
            { data: { id: number; low_stock_threshold: number } },
            { categoryId: number; low_stock_threshold: number }
        >({
            query: ({ categoryId, low_stock_threshold }) => ({
                url: `/categories/${categoryId}/threshold`,
                method: 'PATCH',
                body: { low_stock_threshold },
            }),
            invalidatesTags: ['StockThresholds', 'Categories'],
        }),
    }),
});

export const {
    useGetStockThresholdsQuery,
    useBulkUpdateThresholdsMutation,
    useUpdateCategoryThresholdMutation,
} = StockThresholdApi;
