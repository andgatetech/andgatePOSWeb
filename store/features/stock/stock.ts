import { baseApi } from '@/store/api/baseApi';

export const stockApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Stock Summary
        getStockSummary: builder.query({
            query: (params) => ({
                url: '/stock/summary',
                method: 'GET',
                params,
            }),
            providesTags: ['Stock'],
        }),

        // Stock Movement
        getStockMovement: builder.query({
            query: (params) => ({
                url: '/stock/movement',
                method: 'GET',
                params,
            }),
            providesTags: ['Stock'],
        }),

        // Stock Category Wise
        getStockCategoryWise: builder.query({
            query: (params) => ({
                url: '/stock/category-wise',
                method: 'GET',
                params,
            }),
            providesTags: ['Stock'],
        }),

        // Stock Analysis
        getStockAnalysis: builder.query({
            query: (params) => ({
                url: '/stock/analysis',
                method: 'GET',
                params,
            }),
            providesTags: ['Stock'],
        }),
    }),
    overrideExisting: false,
});

export const { useGetStockSummaryQuery, useGetStockMovementQuery, useGetStockCategoryWiseQuery, useGetStockAnalysisQuery } = stockApi;
