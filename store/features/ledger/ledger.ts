import { baseApi } from '@/store/api/baseApi';

export const ledgerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // 1️⃣ Get ledgers with optional search, filter, pagination
        // getLedgers: builder.query({
        //     query: ({ search, store_id, store_ids, per_page = 10, page = 1, date_from, date_to }) => {
        //         const params = new URLSearchParams();
        //         if (search) params.append('search', search);
        //         if (store_id !== undefined) params.append('store_id', store_id.toString());
        //         if (store_ids && Array.isArray(store_ids)) {
        //             store_ids.forEach((id) => params.append('store_ids[]', id.toString()));
        //         }
        //         if (per_page) params.append('per_page', per_page.toString());
        //         if (page) params.append('page', page.toString());
        //         if (date_from) params.append('date_from', date_from);
        //         if (date_to) params.append('date_to', date_to);

        //         return {
        //             url: '/ledgers',
        //             method: 'GET',
        //             params,
        //         };
        //     },
        //     providesTags: ['Ledger'],
        // }),

        getLedgers: builder.query({
            query: ({ search, store_id, store_ids, per_page = 10, page = 1, date_from, date_to }) => {
                const params = new URLSearchParams();

                if (search) params.append('search', search);
                if (store_id !== undefined) params.append('store_id', store_id.toString());

                // ✅ Properly handle `store_ids`
                if (store_ids) {
                    if (store_ids === 'all') {
                        // ✅ Send as plain string so backend can detect it
                        params.append('store_ids', 'all');
                    } else if (Array.isArray(store_ids)) {
                        store_ids.forEach((id) => params.append('store_ids[]', id.toString()));
                    }
                }

                if (per_page) params.append('per_page', per_page.toString());
                if (page) params.append('page', page.toString());
                if (date_from) params.append('date_from', date_from);
                if (date_to) params.append('date_to', date_to);

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

        // 3️⃣ Get ledger journals
        getLedgerJournals: builder.query({
            query: ({ ledgerId, params }) => ({
                url: `/ledgers/${ledgerId}/journals`,
                method: 'GET',
                params,
            }),
            providesTags: ['Journals'],
        }),

        // 4️⃣ Update ledger
        updateLedger: builder.mutation({
            query: ({ ledgerId, data }) => ({
                url: `/ledgers/${ledgerId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Ledger'],
        }),

        // 5️⃣ Show single ledger
        showLedger: builder.query({
            query: (ledgerId) => ({
                url: `/ledgers/${ledgerId}`,
                method: 'GET',
            }),
            providesTags: ['Ledger'],
        }),

        // 6️⃣ Delete a ledger by ID
        deleteLedger: builder.mutation({
            query: (ledgerId) => ({
                url: `/ledgers/${ledgerId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Ledger'],
        }),
    }),
});

export const { useGetLedgersQuery, useCreateLedgerMutation, useGetLedgerJournalsQuery, useDeleteLedgerMutation, useUpdateLedgerMutation, useShowLedgerQuery } = ledgerApi;
