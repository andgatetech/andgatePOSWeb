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
    }),
});

export const {
    // Queries
    useGetDashboardSummaryQuery,
} = DashboardApi;
