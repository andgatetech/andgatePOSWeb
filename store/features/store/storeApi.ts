import { baseApi } from '@/store/api/baseApi';

const storeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        storeCreate: builder.mutation({
            query: (storeData) => ({
                url: '/stores',
                method: 'POST',
                body: storeData,
            }),
            invalidatesTags: ['Store', 'User'],
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

export const { useStoreCreateMutation, useGetStoresQuery } = storeApi;
