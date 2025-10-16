import { baseApi } from '@/store/api/baseApi';

const TransactionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllTransactions: builder.query({
            query: (params) => ({
                url: '/transactions',
                method: 'GET',
                params,
            }),
            providesTags: ['Transactions'],
        }),
    }),
});

export const { useGetAllTransactionsQuery } = TransactionApi;
