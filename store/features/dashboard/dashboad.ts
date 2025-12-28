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
        // Get dashboard sections (Top Selling, Low Stock, Recent Sales)
        getDashboardSections: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();

                // Add store_id filter
                if (params?.store_id) queryParams.append('store_id', params.store_id);

                // Top Selling Products filters
                if (params?.filter) queryParams.append('filter', params.filter);
                if (params?.start_date) queryParams.append('start_date', params.start_date);
                if (params?.end_date) queryParams.append('end_date', params.end_date);
                if (params?.top_selling_limit) queryParams.append('top_selling_limit', params.top_selling_limit);

                // Low Stock Products filters
                if (params?.low_stock_threshold) queryParams.append('low_stock_threshold', params.low_stock_threshold);
                if (params?.low_stock_limit) queryParams.append('low_stock_limit', params.low_stock_limit);

                // Recent Sales filters
                if (params?.recent_sales_limit) queryParams.append('recent_sales_limit', params.recent_sales_limit);

                const queryString = queryParams.toString();

                return {
                    url: `/dashboard/sections${queryString ? `?${queryString}` : ''}`,
                    method: 'GET',
                };
            },
            providesTags: ['Dashboard'],
        }),
        // Get dashboard sections five (Top Categories, Top Brands, Top Purchased Products)
        getDashboardSectionsFive: builder.query({
            query: (params) => {
                const queryParams = new URLSearchParams();

                // Add store_id filter
                if (params?.store_id) queryParams.append('store_id', params.store_id);

                // Category filters
                if (params?.category_filter) queryParams.append('category_filter', params.category_filter);
                if (params?.category_start_date) queryParams.append('category_start_date', params.category_start_date);
                if (params?.category_end_date) queryParams.append('category_end_date', params.category_end_date);
                if (params?.category_limit) queryParams.append('category_limit', params.category_limit);

                // Brand filters
                if (params?.brand_filter) queryParams.append('brand_filter', params.brand_filter);
                if (params?.brand_start_date) queryParams.append('brand_start_date', params.brand_start_date);
                if (params?.brand_end_date) queryParams.append('brand_end_date', params.brand_end_date);
                if (params?.brand_limit) queryParams.append('brand_limit', params.brand_limit);

                // Purchase/Product filters
                if (params?.purchase_filter) queryParams.append('purchase_filter', params.purchase_filter);
                if (params?.purchase_start_date) queryParams.append('purchase_start_date', params.purchase_start_date);
                if (params?.purchase_end_date) queryParams.append('purchase_end_date', params.purchase_end_date);
                if (params?.purchase_limit) queryParams.append('purchase_limit', params.purchase_limit);

                const queryString = queryParams.toString();

                return {
                    url: `/dashboard/sections-five${queryString ? `?${queryString}` : ''}`,
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
    useGetDashboardSectionsQuery,
    useGetDashboardSectionsFiveQuery,
} = DashboardApi;
