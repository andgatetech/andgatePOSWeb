import { baseApi } from '@/store/api/baseApi';

const reportApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getIncomeReport: builder.mutation({
            query: (body) => ({
                url: '/reports/income',
                method: 'POST',
                body,
            }),
        }),
        getProfitLossReport: builder.mutation({
            query: (body) => ({
                url: '/reports/profit-loss',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useGetIncomeReportMutation, useGetProfitLossReportMutation } = reportApi;
