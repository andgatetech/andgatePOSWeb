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

        //  Update a expense
        updateExpense: builder.mutation({
            query: ({ expenseId, data }) => ({
                url: `/expenses/${expenseId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Expenses'],
        }),
        // 3️⃣ Other endpoints like deleteExpense can be added similarly
        deleteExpense: builder.mutation({
            query: (expenseId) => ({
                url: `/expenses/${expenseId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Expenses'],
        }),
        getSingleExpense: builder.query({
            query: (expenseId) => ({
                url: `/expenses/${expenseId}`,
                method: 'GET',
            }),
            providesTags: ['Expenses'],
        }),
    }),
});

export const { useGetExpensesQuery, useCreateExpenseMutation, useUpdateExpenseMutation, useDeleteExpenseMutation, useGetSingleExpenseQuery } = expenseApi;
