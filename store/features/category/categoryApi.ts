import { baseApi } from '@/store/api/baseApi';

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        categoryCreate: builder.mutation({
            query: (data) => ({
                url: '/categories',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Category'],
        }),
        getCategories: builder.query({
            query: () => ({
                url: '/categories',
                method: 'GET',
            }),
            providesTags: ['Category'],
        }),
    }),
});

export const { useCategoryCreateMutation, useGetCategoriesQuery } = categoryApi;
