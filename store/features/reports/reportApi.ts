import { baseApi } from '@/store/api/baseApi';

const ReportApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Tax Report
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

        // Transaction Report 
        getTransactionReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/transaction',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['TransactionReport'],
        }),

        // Idle Product Report
        getIdleProductReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/idle-product',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['IdleProductReport'],
        }),

        getIncomeReport: builder.mutation({
            query: (body) => ({
                url: '/reports/income',
                method: 'POST',
                body,
            }),
        }),
        getProfitLossReport: builder.mutation({
            query: (body) => ({
                url: '/reports/profit-loss',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useGetTaxReportMutation, useGetTransactionReportMutation, useGetIdleProductReportMutation, useGetIncomeReportMutation, useGetProfitLossReportMutation } = ReportApi;
