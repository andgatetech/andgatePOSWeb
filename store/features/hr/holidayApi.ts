import { baseApi } from '@/store/api/baseApi';

export const holidayApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getHolidays: builder.query({
            query: (params: { store_id: number; year?: number }) => ({ url: '/holidays', method: 'GET', params }),
            providesTags: ['Holiday'],
        }),
        createHoliday: builder.mutation({
            query: (body: { store_id: number; name: string; date: string; is_recurring?: boolean }) => ({
                url: '/holidays',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Holiday'],
        }),
        updateHoliday: builder.mutation({
            query: ({ id, ...body }: { id: number; store_id: number; name?: string; date?: string; is_recurring?: boolean }) => ({
                url: `/holidays/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Holiday'],
        }),
        deleteHoliday: builder.mutation({
            query: ({ id, ...body }: { id: number; store_id: number }) => ({
                url: `/holidays/${id}`,
                method: 'DELETE',
                body,
            }),
            invalidatesTags: ['Holiday'],
        }),
    }),
});

export const {
    useGetHolidaysQuery,
    useCreateHolidayMutation,
    useUpdateHolidayMutation,
    useDeleteHolidayMutation,
} = holidayApi;
