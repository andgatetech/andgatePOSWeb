import { baseApi } from '@/store/api/baseApi';

export const leaveApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLeaveTypes: builder.query({
            query: (params: { store_id: number }) => ({ url: '/leave/types', method: 'GET', params }),
            providesTags: ['Leave'],
        }),
        getLeaveBalances: builder.query({
            query: (params: { store_id: number; user_id: number; year?: number }) => ({
                url: '/leave/balances',
                method: 'GET',
                params,
            }),
            providesTags: ['Leave'],
        }),
        getLeaveRequests: builder.query({
            query: (params: { store_id: number; status?: string; user_id?: number }) => ({
                url: '/leave/requests',
                method: 'GET',
                params,
            }),
            providesTags: ['Leave'],
        }),
        createLeaveRequest: builder.mutation({
            query: (body: { store_id: number; user_id: number; leave_type_id: number; start_date: string; end_date: string; reason?: string }) => ({
                url: '/leave/requests',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Leave'],
        }),
        approveLeaveRequest: builder.mutation({
            query: ({ id, ...body }: { id: number; store_id: number }) => ({
                url: `/leave/requests/${id}/approve`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Leave'],
        }),
        rejectLeaveRequest: builder.mutation({
            query: ({ id, ...body }: { id: number; store_id: number }) => ({
                url: `/leave/requests/${id}/reject`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Leave'],
        }),
    }),
});

export const {
    useGetLeaveTypesQuery,
    useGetLeaveBalancesQuery,
    useGetLeaveRequestsQuery,
    useCreateLeaveRequestMutation,
    useApproveLeaveRequestMutation,
    useRejectLeaveRequestMutation,
} = leaveApi;
