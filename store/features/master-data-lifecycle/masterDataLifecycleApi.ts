import { baseApi } from '@/store/api/baseApi';

/** Explicit lifecycle operations; never use a settings full-sync to delete master data. */
export const masterDataLifecycleApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        archiveUnit: builder.mutation<void, { id: number; archive_reason?: string }>({
            query: ({ id, archive_reason }) => ({ url: `/units/${id}/archive`, method: 'PATCH', body: { archive_reason } }),
            invalidatesTags: ['Stores'],
        }),
        safeDeleteUnit: builder.mutation<void, number>({
            query: (id) => ({ url: `/units/${id}/safe-delete`, method: 'POST' }),
            invalidatesTags: ['Stores'],
        }),
        archiveStockType: builder.mutation<void, { id: number; archive_reason?: string }>({
            query: ({ id, archive_reason }) => ({ url: `/adjustment-types/${id}/archive`, method: 'PATCH', body: { archive_reason } }),
        }),
        safeDeleteStockType: builder.mutation<void, number>({
            query: (id) => ({ url: `/adjustment-types/${id}/safe-delete`, method: 'POST' }),
        }),
    }),
});

export const { useArchiveUnitMutation, useSafeDeleteUnitMutation, useArchiveStockTypeMutation, useSafeDeleteStockTypeMutation } = masterDataLifecycleApi;
