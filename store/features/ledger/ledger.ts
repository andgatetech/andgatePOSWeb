import { baseApi } from '@/store/api/baseApi';

export const ledgerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLedgers: builder.query({
            query: ({ search, store_id, store_ids, per_page = 10, page = 1, start_date, end_date, ledger_type, status, sort_field, sort_direction }) => {
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
                    } else {
                        // Handle comma-separated string
                        params.append('store_ids', store_ids);
                    }
                }

                if (per_page) params.append('per_page', per_page.toString());
                if (page) params.append('page', page.toString());
                if (start_date) params.append('start_date', start_date);
                if (end_date) params.append('end_date', end_date);
                if (ledger_type) params.append('ledger_type', ledger_type);
                if (status) params.append('status', status);
                if (sort_field) params.append('sort_field', sort_field);
                if (sort_direction) params.append('sort_direction', sort_direction);

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
