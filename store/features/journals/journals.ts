import { baseApi } from '@/store/api/baseApi';

export const journalApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // 1️⃣ Get journals with optional search, filter, pagination
        getJournals: builder.query({
            query: ({ search, store_id, store_ids, per_page = 10, page = 1, ledger_id, min_amount, max_amount, type, user_id, start_date, end_date, sort_field, sort_direction }) => {
                const params = new URLSearchParams();

                if (search) params.append('search', search);
                if (store_id !== undefined && store_id !== 'all') params.append('store_id', store_id.toString());

                // Handle store_ids for 'all' stores
                if (store_ids) {
                    if (store_ids === 'all') {
                        params.append('store_ids', 'all');
                    } else if (Array.isArray(store_ids)) {
                        store_ids.forEach((id) => params.append('store_ids[]', id.toString()));
                    } else {
                        params.append('store_ids', store_ids);
                    }
                }

                if (per_page) params.append('per_page', per_page.toString());
                if (page) params.append('page', page.toString());

                // Journal-specific filters
                if (ledger_id) params.append('ledger_id', ledger_id.toString());
                if (min_amount) params.append('min_amount', min_amount.toString());
                if (max_amount) params.append('max_amount', max_amount.toString());
                if (type) params.append('type', type);
                if (user_id) params.append('user_id', user_id.toString());

                // Date filters
                if (start_date) params.append('start_date', start_date);
                if (end_date) params.append('end_date', end_date);

                // Sorting
                if (sort_field) params.append('sort_field', sort_field);
                if (sort_direction) params.append('sort_direction', sort_direction);

                return {
                    url: '/journals',
                    method: 'GET',
                    params,
                };
            },
            providesTags: ['Journal'],
        }),

        // 2️⃣ Create a new journal
        createJournal: builder.mutation({
            query: (data) => ({
                url: '/journals',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Journal'],
        }),
        getSingleJournals: builder.query({
            query: (id) => ({
                url: `/journals/${id}`,
                method: 'GET',
            }),
            providesTags: ['Journal'],
        }),
        updateJournal: builder.mutation({
            query: ({ journalId, data }) => ({
                url: `/journals/${journalId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Journal'],
        }),
        deleteJournal: builder.mutation({
            query: (id) => ({
                url: `/journals/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Journal'],
        }),
    }),
});

export const { useGetJournalsQuery, useCreateJournalMutation, useGetSingleJournalsQuery, useUpdateJournalMutation, useDeleteJournalMutation } = journalApi;
