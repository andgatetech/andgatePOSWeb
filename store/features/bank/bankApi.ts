import { baseApi } from '@/store/api/baseApi';

const BankApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBankAccounts: builder.query({
            query: (params: any = {}) => ({
                url: '/bank-accounts',
                method: 'GET',
                params,
            }),
            providesTags: ['BankAccounts'],
        }),
        getBankAccountById: builder.query({
            query: (id: number | string) => ({
                url: `/bank-accounts/${id}`,
                method: 'GET',
            }),
            providesTags: ['BankAccounts'],
        }),
        createBankAccount: builder.mutation({
            query: (data: any) => ({
                url: '/bank-accounts',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['BankAccounts'],
        }),
        updateBankAccount: builder.mutation({
            query: ({ id, ...data }: any) => ({
                url: `/bank-accounts/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['BankAccounts'],
        }),
        archiveBankAccount: builder.mutation({
            query: ({ id, ...data }: any) => ({ url: `/bank-accounts/${id}/archive`, method: 'PATCH', body: data }),
            invalidatesTags: ['BankAccounts'],
        }),
        safeDeleteBankAccount: builder.mutation({
            query: ({ id, ...data }: any) => ({ url: `/bank-accounts/${id}/safe-delete`, method: 'DELETE', body: data }),
            invalidatesTags: ['BankAccounts'],
        }),
        getBankTransactions: builder.query({
            query: (params: any = {}) => ({
                url: '/bank-transactions',
                method: 'GET',
                params,
            }),
            providesTags: ['BankTransactions'],
        }),
        createBankTransaction: builder.mutation({
            query: (data: any) => ({
                url: '/bank-transactions',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['BankTransactions', 'BankAccounts'],
        }),
        updateBankTransaction: builder.mutation({
            query: ({ id, ...data }: any) => ({
                url: `/bank-transactions/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['BankTransactions', 'BankAccounts'],
        }),
        reconcileBankTransaction: builder.mutation({
            query: ({ id, ...data }: any) => ({
                url: `/bank-transactions/${id}/reconcile`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['BankTransactions', 'BankAccounts'],
        }),
        voidAndReverseBankTransaction: builder.mutation({
            query: ({ id, reason, storeId }: any) => ({
                url: `/bank-transactions/${id}/void-and-reverse`,
                method: 'POST',
                body: { reason, store_id: storeId },
            }),
            invalidatesTags: ['BankTransactions', 'BankAccounts'],
        }),
        correctReconciledBankTransaction: builder.mutation({
            query: ({ id, reason, storeId }: any) => ({
                url: `/bank-transactions/${id}/reconciliation-correction`,
                method: 'POST',
                body: { reason, store_id: storeId },
            }),
            invalidatesTags: ['BankTransactions', 'BankAccounts'],
        }),
    }),
});

export const {
    useGetBankAccountsQuery,
    useGetBankAccountByIdQuery,
    useCreateBankAccountMutation,
    useUpdateBankAccountMutation,
    useArchiveBankAccountMutation,
    useSafeDeleteBankAccountMutation,
    useGetBankTransactionsQuery,
    useCreateBankTransactionMutation,
    useUpdateBankTransactionMutation,
    useReconcileBankTransactionMutation,
    useVoidAndReverseBankTransactionMutation,
    useCorrectReconciledBankTransactionMutation,
} = BankApi;
