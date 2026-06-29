import { baseApi } from '@/store/api/baseApi';

export const salaryAdvanceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSalaryAdvances: builder.query({
            query: (params: { store_id: number; status?: string; user_id?: number }) => ({
                url: '/salary-advances',
                method: 'GET',
                params,
            }),
            providesTags: ['SalaryAdvance'],
        }),
        createSalaryAdvance: builder.mutation({
            query: (body: { store_id: number; user_id: number; amount: number; reason?: string }) => ({
                url: '/salary-advances',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SalaryAdvance'],
        }),
        approveSalaryAdvance: builder.mutation({
            query: ({ id, ...body }: { id: number; store_id: number }) => ({
                url: `/salary-advances/${id}/approve`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SalaryAdvance', 'CashDrawer'],
        }),
        rejectSalaryAdvance: builder.mutation({
            query: ({ id, ...body }: { id: number; store_id: number }) => ({
                url: `/salary-advances/${id}/reject`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SalaryAdvance'],
        }),
    }),
});

export const {
    useGetSalaryAdvancesQuery,
    useCreateSalaryAdvanceMutation,
    useApproveSalaryAdvanceMutation,
    useRejectSalaryAdvanceMutation,
} = salaryAdvanceApi;
