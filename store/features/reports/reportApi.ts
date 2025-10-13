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
        getSalesReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/sales',
                method: 'POST',
                body: data,
            }),
        }),
        getExpensesReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/expense',
                method: 'POST',
                body: data,
            }),
        }),
        getPurchaseReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/purchase-order',
                method: 'POST',
                body: data,
            }),
        }),
        getPurchaseTransactionReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/purchase-transaction',
                method: 'POST',
                body: data,
            }),
        }),
        getCurrentStockReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/stock',
                method: 'POST',
                body: data,
            }),
        }),
        getStockAdjustmentReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/adjustment',
                method: 'POST',
                body: data,
            }),
        }),
        getLowStockReport: builder.mutation({
            query: (data: any) => ({
                url: '/reports/low-stock',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useGetTaxReportMutation,
    useGetTransactionReportMutation,
    useGetIdleProductReportMutation,
    useGetIncomeReportMutation,
    useGetProfitLossReportMutation,
    useGetSalesReportMutation,
    useGetExpensesReportMutation,
    useGetPurchaseReportMutation,
    useGetPurchaseTransactionReportMutation,
    useGetCurrentStockReportMutation,
    useGetStockAdjustmentReportMutation,
    useGetLowStockReportMutation,
} = ReportApi;
