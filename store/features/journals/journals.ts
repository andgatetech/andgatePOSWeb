import { baseApi } from '@/store/api/baseApi';

export const journalApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // 1️⃣ Get journals with optional search, filter, pagination
        getJournals: builder.query({
            query: ({ search, store_id, per_page = 10, page = 1 }) => {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (store_id !== undefined) params.append('store_id', store_id.toString());
                if (per_page) params.append('per_page', per_page.toString());
                if (page) params.append('page', page.toString());

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
    }),
});

export const { useGetJournalsQuery, useCreateJournalMutation } = journalApi;
