import { baseApi } from '@/store/api/baseApi';

export const businessOsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBusinessOs: builder.query({
            query: (params) => ({
                url: '/business-os',
                method: 'GET',
                params,
            }),
            providesTags: ['BusinessOS'],
        }),
        createCashClosing: builder.mutation({
            query: (body) => ({
                url: '/business-os/cash-closings',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['BusinessOS'],
        }),
        updateCashClosing: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/business-os/cash-closings/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['BusinessOS'],
        }),
        createStaffAttendance: builder.mutation({
            query: (body) => ({
                url: '/business-os/staff-attendance',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['BusinessOS'],
        }),
        getAttendanceList: builder.query({
            query: (params) => ({ url: '/attendance', params }),
            providesTags: ['BusinessOS'],
        }),
        getAttendanceToday: builder.query({
            query: (params) => ({ url: '/attendance/today', params }),
            providesTags: ['BusinessOS'],
        }),
        getAttendanceSummary: builder.query({
            query: (params) => ({ url: '/attendance/summary', params }),
            providesTags: ['BusinessOS'],
        }),
        createBusinessTask: builder.mutation({
            query: (body) => ({
                url: '/business-os/tasks',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['BusinessOS'],
        }),
        updateBusinessTask: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/business-os/tasks/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['BusinessOS'],
        }),
        createPettyCashRequest: builder.mutation({
            query: (body) => ({
                url: '/business-os/petty-cash',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['BusinessOS'],
        }),
        updatePettyCashRequest: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/business-os/petty-cash/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['BusinessOS'],
        }),
        createServiceJob: builder.mutation({
            query: (body) => ({
                url: '/business-os/service-jobs',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['BusinessOS'],
        }),
        updateServiceJob: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/business-os/service-jobs/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['BusinessOS'],
        }),
    }),
});

export const {
    useGetBusinessOsQuery,
    useCreateCashClosingMutation,
    useUpdateCashClosingMutation,
    useCreateStaffAttendanceMutation,
    useGetAttendanceListQuery,
    useGetAttendanceTodayQuery,
    useGetAttendanceSummaryQuery,
    useCreateBusinessTaskMutation,
    useUpdateBusinessTaskMutation,
    useCreatePettyCashRequestMutation,
    useUpdatePettyCashRequestMutation,
    useCreateServiceJobMutation,
    useUpdateServiceJobMutation,
} = businessOsApi;
