import { baseApi } from '@/store/api/baseApi';

export const festivalBonusApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFestivalBonusRuns: builder.query({
            query: (params: { store_id: number }) => ({ url: '/festival-bonus/runs', method: 'GET', params }),
            providesTags: ['FestivalBonus'],
        }),
        createFestivalBonusRun: builder.mutation({
            query: (body: { store_id: number; title: string; percentage: number }) => ({
                url: '/festival-bonus/runs',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['FestivalBonus'],
        }),
        getFestivalBonusRun: builder.query({
            query: ({ runId, ...params }: { runId: number; store_id: number }) => ({
                url: `/festival-bonus/runs/${runId}`,
                method: 'GET',
                params,
            }),
            providesTags: ['FestivalBonus'],
        }),
        payFestivalBonusRun: builder.mutation({
            query: ({ runId, ...body }: { runId: number; store_id: number; payment_method?: string }) => ({
                url: `/festival-bonus/runs/${runId}/pay`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['FestivalBonus', 'CashDrawer'],
        }),
    }),
});

export const {
    useGetFestivalBonusRunsQuery,
    useCreateFestivalBonusRunMutation,
    useGetFestivalBonusRunQuery,
    usePayFestivalBonusRunMutation,
} = festivalBonusApi;
