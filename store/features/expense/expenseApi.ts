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

// // Fetch expenses with filters
// const { data, isLoading } = useGetExpensesQuery({
//   search: 'rent',
//   store_id: 1,
//   from_date: '2025-09-01',
//   to_date: '2025-09-10',
//   per_page: 10,
//   page: 1,
// });

// // Create expense
// const [createExpense] = useCreateExpenseMutation();

// await createExpense({
//   title: 'Rent',
//   notes: 'Office rent for September',
//   debit: 5000,
// });
