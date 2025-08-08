import { baseApi } from "@/store/api/baseApi";


const CategoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: () => ({
                url: '/categories',
                method: 'GET',
            }),
            providesTags: ['Categories'],
        }),

        getCategory: builder.query({
            query: (id) => ({
                url: `/categories/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Categories', id }],
        }),

        createCategory: builder.mutation({
            query: (newCategory) => ({
                url: '/categories',
                method: 'POST',
                body: newCategory,
            }),
            invalidatesTags: ['Categories'],
        }),

        updateCategory: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/categories/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Categories', id }],
        }),

        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Categories'],
        }),
    }),
});

export const { useGetCategoriesQuery, useGetCategoryQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } = CategoryApi;
