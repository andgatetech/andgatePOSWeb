import { baseApi } from '@/store/api/baseApi';

const DashboardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get dashboard summary
        getDashboardSummary: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();

                // Add store_id filter
                if (params?.store_id) queryParams.append('store_id', params.store_id);

                const queryString = queryParams.toString();

                return {
                    url: `/dashboard/summary${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            providesTags: ['Dashboard'],
        }),
        // Get dashboard analytics
        getDashboardAnalytics: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();

                // Add store_id filter
                if (params?.store_id) queryParams.append('store_id', params.store_id);

                // Add chart_period filter (daily, weekly, monthly, yearly)
                if (params?.chart_period) queryParams.append('chart_period', params.chart_period);

                // Add customer_period filter (today, this_week, this_month, this_year)
                if (params?.customer_period) queryParams.append('customer_period', params.customer_period);

                const queryString = queryParams.toString();

                return {
                    url: `/dashboard/analytics${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            providesTags: ['Dashboard'],
        }),
    }),
});

export const {
    // Queries
    useGetDashboardSummaryQuery,
    useGetDashboardAnalyticsQuery,
} = DashboardApi;
