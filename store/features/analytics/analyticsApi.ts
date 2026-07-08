import { baseApi } from '@/store/api/baseApi';

const analyticsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCustomReports: builder.query({
            query: (params: { store_id: number | string }) => ({
                url: '/analytics/custom-reports',
                method: 'GET',
                params,
            }),
            providesTags: ['CustomReports'],
        }),
        getCustomReportById: builder.query({
            query: (id: number | string) => ({
                url: `/analytics/custom-reports/${id}`,
                method: 'GET',
            }),
            providesTags: ['CustomReports'],
        }),
        createCustomReport: builder.mutation({
            query: (data: any) => ({
                url: '/analytics/custom-reports',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['CustomReports'],
        }),
        updateCustomReport: builder.mutation({
            query: ({ id, ...data }: any) => ({
                url: `/analytics/custom-reports/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['CustomReports'],
        }),
        deleteCustomReport: builder.mutation({
            query: (id: number | string) => ({
                url: `/analytics/custom-reports/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['CustomReports'],
        }),
        runCustomReport: builder.mutation({
            query: ({ id, filters }: { id: number | string; filters?: any }) => ({
                url: `/analytics/custom-reports/${id}/run`,
                method: 'POST',
                body: filters ? { filters } : {},
            }),
        }),

        getScheduledReports: builder.query({
            query: (params: { store_id: number | string }) => ({
                url: '/analytics/scheduled-reports',
                method: 'GET',
                params,
            }),
            providesTags: ['ScheduledReports'],
        }),
        createScheduledReport: builder.mutation({
            query: (data: any) => ({
                url: '/analytics/scheduled-reports',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['ScheduledReports'],
        }),
        updateScheduledReport: builder.mutation({
            query: ({ id, ...data }: any) => ({
                url: `/analytics/scheduled-reports/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['ScheduledReports'],
        }),
        deleteScheduledReport: builder.mutation({
            query: (id: number | string) => ({
                url: `/analytics/scheduled-reports/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ScheduledReports'],
        }),
        runScheduledReportNow: builder.mutation({
            query: (id: number | string) => ({
                url: `/analytics/scheduled-reports/${id}/run`,
                method: 'POST',
            }),
        }),

        getDashboardLayout: builder.query({
            query: (params?: { store_id?: number | string }) => ({
                url: '/analytics/dashboard-layout',
                method: 'GET',
                params,
            }),
            providesTags: ['DashboardLayout'],
        }),
        saveDashboardLayout: builder.mutation({
            query: (data: any) => ({
                url: '/analytics/dashboard-layout',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['DashboardLayout'],
        }),

        getSalesTv: builder.query({
            query: (params?: { store_id?: number | string }) => ({
                url: '/analytics/sales-tv',
                method: 'GET',
                params,
            }),
        }),

        getBranchBenchmark: builder.query({
            query: (params: { start_date?: string; end_date?: string }) => ({
                url: '/analytics/branch-benchmark',
                method: 'GET',
                params,
            }),
        }),

        getCashFlowForecast: builder.query({
            query: (params?: { days_back?: number; forecast_days?: number }) => ({
                url: '/analytics/cash-flow-forecast',
                method: 'GET',
                params,
            }),
        }),

        getBreakEven: builder.query({
            query: (params: { start_date?: string; end_date?: string }) => ({
                url: '/analytics/break-even',
                method: 'GET',
                params,
            }),
        }),
    }),
});

export const {
    useGetCustomReportsQuery,
    useGetCustomReportByIdQuery,
    useCreateCustomReportMutation,
    useUpdateCustomReportMutation,
    useDeleteCustomReportMutation,
    useRunCustomReportMutation,
    useGetScheduledReportsQuery,
    useCreateScheduledReportMutation,
    useUpdateScheduledReportMutation,
    useDeleteScheduledReportMutation,
    useRunScheduledReportNowMutation,
    useGetDashboardLayoutQuery,
    useSaveDashboardLayoutMutation,
    useGetSalesTvQuery,
    useGetBranchBenchmarkQuery,
    useGetCashFlowForecastQuery,
    useGetBreakEvenQuery,
} = analyticsApi;
