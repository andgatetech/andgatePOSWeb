import { baseApi } from '@/store/api/baseApi';
import { login } from '@/store/features/auth/authSlice'; // ✅ adjust this import if needed

const storeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        storeCreate: builder.mutation({
            query: (storeData) => ({
                url: '/stores',
                method: 'POST',
                body: storeData,
            }),
            invalidatesTags: ['Store', 'User'],
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;

                   
                    dispatch(login({ user: data.user, token: data.token }));

                } catch (error) {
                    console.error('Create failed:', error);
                }
            },
        }),

        getStores: builder.query({
            query: () => ({
                url: '/stores',
                method: 'GET',
            }),
            providesTags: ['Store'],
            transformResponse: (response: any) => response.stores || response,
        }),
    }),
});

export const { useStoreCreateMutation, useGetStoresQuery } = storeApi;
