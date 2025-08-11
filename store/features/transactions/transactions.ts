import { baseApi } from "@/store/api/baseApi";

const TransactionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllTransactions: builder.query({
            query: () => ({
                url: '/transactions',
                method: 'GET',
            }),
            providesTags: ['Transactions'],
        }),
    }),
});

export const { useGetAllTransactionsQuery } = TransactionApi;
