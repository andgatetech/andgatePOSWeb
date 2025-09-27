import { baseApi } from '@/store/api/baseApi';

export const ledgerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // 1️⃣ Get ledgers with optional search, filter, pagination
        getLedgers: builder.query({
            query: ({ search, store_id, per_page = 10, page = 1 }) => {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (store_id !== undefined) params.append('store_id', store_id.toString());
                if (per_page) params.append('per_page', per_page.toString());
                if (page) params.append('page', page.toString());

                return {
                    url: '/ledgers',
                    method: 'GET',
                    params,
                };
            },
            providesTags: ['Ledger'],
        }),

        // 2️⃣ Create a new ledger
        createLedger: builder.mutation({
            query: (data) => ({
                url: '/ledgers',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Ledger'],
        }),
        getLedgerJournals: builder.query({
            query: ({ ledgerId, params }) => ({
                url: `/ledgers/${ledgerId}/journals`,
                method: 'GET',
                params, // filters go here
            }),
            providesTags: ['Journals'],
        }),

        deleteLedger: builder.mutation({
            query: (ledgerId) => ({
                url: `/ledgers/${ledgerId}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const { useGetLedgersQuery, useCreateLedgerMutation, useGetLedgerJournalsQuery, useDeleteLedgerMutation } = ledgerApi;
