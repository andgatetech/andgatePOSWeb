import { baseApi } from '@/store/api/baseApi';

export const cashDrawerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDrawers: builder.query({
            query: (params) => ({ url: '/drawers', method: 'GET', params }),
            providesTags: ['CashDrawer'],
        }),
        createDrawer: builder.mutation({
            query: (body) => ({ url: '/drawers', method: 'POST', body }),
            invalidatesTags: ['CashDrawer'],
        }),
        getCurrentDrawerSession: builder.query({
            query: ({ drawerId, ...params }: { drawerId: number; store_id: number }) => ({
                url: `/drawers/${drawerId}/session/current`,
                method: 'GET',
                params,
            }),
            providesTags: ['CashDrawer'],
        }),
        getDrawerSessions: builder.query({
            query: ({ drawerId, ...params }: { drawerId: number; store_id: number; per_page?: number; page?: number }) => ({
                url: `/drawers/${drawerId}/sessions`,
                method: 'GET',
                params,
            }),
            providesTags: ['CashDrawer'],
        }),
        openDrawer: builder.mutation({
            query: ({ drawerId, ...body }: { drawerId: number; store_id: number; opening_float: number; note?: string }) => ({
                url: `/drawers/${drawerId}/open`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['CashDrawer'],
        }),
        recordDrawerMovement: builder.mutation({
            query: ({ drawerId, ...body }: { drawerId: number; store_id: number; type: 'cash_in' | 'cash_out' | 'adjustment'; amount: number; note?: string }) => ({
                url: `/drawers/${drawerId}/movement`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['CashDrawer'],
        }),
        closeDrawer: builder.mutation({
            query: ({ drawerId, ...body }: { drawerId: number; store_id: number; actual_cash: number; note?: string }) => ({
                url: `/drawers/${drawerId}/close`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['CashDrawer'],
        }),
    }),
});

export const {
    useGetDrawersQuery,
    useCreateDrawerMutation,
    useGetCurrentDrawerSessionQuery,
    useGetDrawerSessionsQuery,
    useOpenDrawerMutation,
    useRecordDrawerMovementMutation,
    useCloseDrawerMutation,
} = cashDrawerApi;
