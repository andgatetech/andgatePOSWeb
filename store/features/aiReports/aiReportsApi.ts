import { baseApi } from '@/store/api/baseApi';

const aiReportsApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getReorderSuggestions: builder.query<any, Record<string, any>>({
            query: (params) => ({ url: '/reports/reorder-suggestions', params }),
            providesTags: ['AiReports'],
        }),
        getAnomalies: builder.query<any, Record<string, any>>({
            query: (params) => ({ url: '/reports/anomalies', params }),
            providesTags: ['AiReports'],
        }),
        getDemandForecast: builder.query<any, Record<string, any>>({
            query: (params) => ({ url: '/reports/demand-forecast', params }),
            providesTags: ['AiReports'],
        }),
        getDailySummary: builder.query<any, Record<string, any>>({
            query: (params) => ({ url: '/reports/summary/daily', params }),
            providesTags: ['AiReports'],
        }),
        getWeeklySummary: builder.query<any, Record<string, any>>({
            query: (params) => ({ url: '/reports/summary/weekly', params }),
            providesTags: ['AiReports'],
        }),

        getThresholdIntelligence: builder.query<any, { store_id: number; lead_days?: number }>({
            query: (params) => ({ url: '/reports/threshold-intelligence', params }),
            providesTags: ['AiReports'],
        }),
    }),
});

export const {
    useGetReorderSuggestionsQuery,
    useGetAnomaliesQuery,
    useGetDemandForecastQuery,
    useGetDailySummaryQuery,
    useGetWeeklySummaryQuery,
    useGetThresholdIntelligenceQuery,
} = aiReportsApi;
