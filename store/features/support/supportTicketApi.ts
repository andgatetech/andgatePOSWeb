import { baseApi } from '@/store/api/baseApi';

export const supportTicketApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSupportTickets: builder.query({
            query: (params) => ({
                url: '/support/tickets',
                method: 'GET',
                params,
            }),
            providesTags: ['SupportTicket'],
        }),
        getSupportTicket: builder.query({
            query: (ticketId: number) => ({
                url: `/support/tickets/${ticketId}`,
                method: 'GET',
            }),
            providesTags: ['SupportTicket'],
        }),
        createSupportTicket: builder.mutation({
            query: (body: { subject: string; description: string; category?: string; store_id?: number }) => ({
                url: '/support/tickets',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SupportTicket'],
        }),
        replyToSupportTicket: builder.mutation({
            query: ({ ticketId, message }: { ticketId: number; message: string }) => ({
                url: `/support/tickets/${ticketId}/reply`,
                method: 'POST',
                body: { message },
            }),
            invalidatesTags: ['SupportTicket'],
        }),
        deleteSupportTicket: builder.mutation({
            query: (ticketId: number) => ({
                url: `/support/tickets/${ticketId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['SupportTicket'],
        }),
    }),
});

export const {
    useGetSupportTicketsQuery,
    useGetSupportTicketQuery,
    useCreateSupportTicketMutation,
    useReplyToSupportTicketMutation,
    useDeleteSupportTicketMutation,
} = supportTicketApi;
