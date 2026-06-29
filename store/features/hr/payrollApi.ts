import { baseApi } from '@/store/api/baseApi';

export const payrollApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPayrollCycles: builder.query({
            query: (params: { store_id: number }) => ({ url: '/payroll/cycles', method: 'GET', params }),
            providesTags: ['Payroll'],
        }),
        createPayrollCycle: builder.mutation({
            query: (body: { store_id: number; period_start: string; period_end: string }) => ({
                url: '/payroll/cycles',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Payroll'],
        }),
        getPayrollCycle: builder.query({
            query: ({ cycleId, ...params }: { cycleId: number; store_id: number }) => ({
                url: `/payroll/cycles/${cycleId}`,
                method: 'GET',
                params,
            }),
            providesTags: ['Payroll'],
        }),
        generatePayrollEntries: builder.mutation({
            query: ({ cycleId, ...body }: { cycleId: number; store_id: number }) => ({
                url: `/payroll/cycles/${cycleId}/generate`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Payroll'],
        }),
        payPayrollCycle: builder.mutation({
            query: ({ cycleId, ...body }: { cycleId: number; store_id: number; payment_method?: string }) => ({
                url: `/payroll/cycles/${cycleId}/pay`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Payroll', 'SalaryAdvance', 'CashDrawer'],
        }),
    }),
});

export const {
    useGetPayrollCyclesQuery,
    useCreatePayrollCycleMutation,
    useGetPayrollCycleQuery,
    useGeneratePayrollEntriesMutation,
    usePayPayrollCycleMutation,
} = payrollApi;
