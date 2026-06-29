import { baseApi } from '@/store/api/baseApi';

export const shiftApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getShiftTemplates: builder.query({
            query: (params: { store_id: number }) => ({ url: '/shifts/templates', method: 'GET', params }),
            providesTags: ['Shift'],
        }),
        createShiftTemplate: builder.mutation({
            query: (body: { store_id: number; name: string; start_time: string; end_time: string }) => ({
                url: '/shifts/templates',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Shift'],
        }),
        getShiftRoster: builder.query({
            query: (params: { store_id: number; date_from: string; date_to: string }) => ({
                url: '/shifts/roster',
                method: 'GET',
                params,
            }),
            providesTags: ['Shift'],
        }),
        assignShift: builder.mutation({
            query: (body: { store_id: number; user_id: number; shift_template_id: number; date: string }) => ({
                url: '/shifts/roster',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Shift'],
        }),
        deleteShiftAssignment: builder.mutation({
            query: ({ id, ...body }: { id: number; store_id: number }) => ({
                url: `/shifts/roster/${id}`,
                method: 'DELETE',
                body,
            }),
            invalidatesTags: ['Shift'],
        }),
    }),
});

export const {
    useGetShiftTemplatesQuery,
    useCreateShiftTemplateMutation,
    useGetShiftRosterQuery,
    useAssignShiftMutation,
    useDeleteShiftAssignmentMutation,
} = shiftApi;
