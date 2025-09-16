import { baseApi } from '@/store/api/baseApi';

export const stockAdjustmentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStockAdjustments: builder.query({
            query: (params) => ({
                url: '/stock-adjustments',
                params,
            }),
            providesTags: ['StockAdjustment'],
        }),

        getStockReport: builder.query({
            query: (params) => ({
                url: '/stock-report',
                params,
            }),
            providesTags: ['StockAdjustment'],
        }),

        // CREATE new stock adjustment
        createStockAdjustment: builder.mutation({
            query: (body) => ({
                url: '/stock-adjustments',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['StockAdjustment'],
        }),

        // DELETE stock adjustment
        deleteStockAdjustment: builder.mutation({
            query: (id) => ({
                url: `/stock-adjustments/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['StockAdjustment'],
        }),
    }),
});

export const { useGetStockAdjustmentsQuery, useCreateStockAdjustmentMutation, useDeleteStockAdjustmentMutation, useGetStockReportQuery } = stockAdjustmentApi;
