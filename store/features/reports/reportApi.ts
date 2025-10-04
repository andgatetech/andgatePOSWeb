import { baseApi } from '@/store/api/baseApi';

const ReportApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Tax Report - Using Next.js API proxy to avoid CORS
        getTaxReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/tax', 
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
            invalidatesTags: ['TaxReport'],
        }),

        // Transaction Report - Using Next.js API proxy to avoid CORS
        getTransactionReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/transaction', 
                method: 'POST',
                body: data,
               
            }),
            invalidatesTags: ['TransactionReport'],
        }),

        // Idle Product Report - Using Next.js API proxy to avoid CORS
        getIdleProductReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/idle-product', 
                method: 'POST',
                body: data,
              
            }),
            invalidatesTags: ['IdleProductReport'],
        }),

        // (Optional) — Add more reports later like income, expenses, etc.
    }),
});

export const { useGetTaxReportMutation, useGetTransactionReportMutation, useGetIdleProductReportMutation } = ReportApi;
