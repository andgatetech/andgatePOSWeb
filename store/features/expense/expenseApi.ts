import { baseApi } from '@/store/api/baseApi';
// optional: if you have TS types

export const expenseApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // 1️⃣ Fetch expenses with filters
        getExpenses: builder.query({
            query: (params) => ({
                url: '/expenses',
                method: 'GET',
                params,
            }),
            providesTags: ['Expenses'],
        }),

        // 2️⃣ Create a new expense
        createExpense: builder.mutation({
            query: (body) => ({
                url: '/expenses',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Expenses'],
        }),
    }),
});

export const { useGetExpensesQuery, useCreateExpenseMutation } = expenseApi;
