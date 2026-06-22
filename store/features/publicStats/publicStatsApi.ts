import { baseApi } from '@/store/api/baseApi';

export interface PublicStats {
    active_stores: number;
}

export interface PublicStatsResponse {
    success: boolean;
    message: string;
    data: PublicStats;
}

const publicStatsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPublicStats: builder.query<PublicStatsResponse, void>({
            query: () => ({
                url: '/public/stats',
                method: 'GET',
            }),
        }),
    }),
});

export const { useGetPublicStatsQuery } = publicStatsApi;
