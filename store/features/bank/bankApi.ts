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
        deleteBankAccount: builder.mutation({
            query: (id: number | string) => ({
                url: `/bank-accounts/${id}`,
                method: 'DELETE',
            }),
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
        deleteBankTransaction: builder.mutation({
            query: (id: number | string) => ({
                url: `/bank-transactions/${id}`,
                method: 'DELETE',
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
    useDeleteBankAccountMutation,
    useGetBankTransactionsQuery,
    useCreateBankTransactionMutation,
    useUpdateBankTransactionMutation,
    useReconcileBankTransactionMutation,
    useDeleteBankTransactionMutation,
} = BankApi;
