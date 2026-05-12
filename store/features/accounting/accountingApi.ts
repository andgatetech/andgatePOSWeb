import { baseApi } from '@/store/api/baseApi';

export const accountingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ── Chart of Accounts ─────────────────────────────────────────
        getAccounts: builder.query({
            query: (params) => ({ url: '/accounting/accounts', method: 'GET', params }),
            providesTags: ['AccountingCOA'],
        }),
        createAccount: builder.mutation({
            query: (body) => ({ url: '/accounting/accounts', method: 'POST', body }),
            invalidatesTags: ['AccountingCOA'],
        }),
        updateAccount: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/accounting/accounts/${id}`, method: 'PUT', body }),
            invalidatesTags: ['AccountingCOA'],
        }),
        seedDefaultAccounts: builder.mutation({
            query: (body) => ({ url: '/accounting/accounts/seed-defaults', method: 'POST', body }),
            invalidatesTags: ['AccountingCOA'],
        }),

        // ── Journals ──────────────────────────────────────────────────
        getJournals: builder.query({
            query: (params) => ({ url: '/accounting/journals', method: 'GET', params }),
            providesTags: ['AccountingJournals'],
        }),

        // ── Cash Book ─────────────────────────────────────────────────
        getCashBook: builder.query({
            query: (params) => ({ url: '/accounting/cash-book', method: 'GET', params }),
            providesTags: ['AccountingCashBook'],
        }),

        // ── Income ────────────────────────────────────────────────────
        getIncome: builder.query({
            query: (params) => ({ url: '/accounting/income', method: 'GET', params }),
            providesTags: ['AccountingIncome'],
        }),
        createIncome: builder.mutation({
            query: (body) => ({ url: '/accounting/income', method: 'POST', body }),
            invalidatesTags: ['AccountingIncome', 'AccountingCashBook', 'AccountingJournals'],
        }),
        deleteIncome: builder.mutation({
            query: (id) => ({ url: `/accounting/income/${id}`, method: 'DELETE' }),
            invalidatesTags: ['AccountingIncome', 'AccountingCashBook', 'AccountingJournals'],
        }),

        // ── Financial Statements ──────────────────────────────────────
        getProfitAndLoss: builder.query({
            query: (params) => ({ url: '/accounting/profit-loss', method: 'GET', params }),
            providesTags: ['AccountingReports'],
        }),
        getBalanceSheet: builder.query({
            query: (params) => ({ url: '/accounting/balance-sheet', method: 'GET', params }),
            providesTags: ['AccountingReports'],
        }),
        getTrialBalance: builder.query({
            query: (params) => ({ url: '/accounting/trial-balance', method: 'GET', params }),
            providesTags: ['AccountingReports'],
        }),
    }),
});

export const {
    useGetAccountsQuery,
    useCreateAccountMutation,
    useUpdateAccountMutation,
    useSeedDefaultAccountsMutation,
    useGetJournalsQuery,
    useGetCashBookQuery,
    useGetIncomeQuery,
    useCreateIncomeMutation,
    useDeleteIncomeMutation,
    useGetProfitAndLossQuery,
    useGetBalanceSheetQuery,
    useGetTrialBalanceQuery,
} = accountingApi;
