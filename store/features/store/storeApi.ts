import { baseApi } from '@/store/api/baseApi';

const storeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        create: builder.mutation({
            query: (storeData) => ({
                url: '/stores',
                method: 'POST',
                body: storeData,
            }),
            invalidatesTags: ['Store', 'User'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(create({ user: data.user, token: data.token, store: data.store }));
                } catch (error) {
                    console.error('Create failed:', error);
                }
            },
        }),
        getStores: builder.query({
            query: (params = {}) => ({
                url: '/stores',
                method: 'GET',
            }),
            providesTags: ['Store'],
            transformResponse: (response) => response.stores || response,
        }),
    }),
});

export const { useCreateMutation, useGetStoresQuery } = storeApi;
