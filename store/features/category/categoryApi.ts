import { baseApi } from '@/store/api/baseApi';

const CategoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Create category
        createCategory: builder.mutation({
            query: (newCategory: any) => {
                const formData = new FormData();
                formData.append('name', newCategory.name || '');
                formData.append('description', newCategory.description || '');
                if (newCategory.image) {
                    formData.append('image', newCategory.image);
                }

                return {
                    url: '/categories',
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: ['Categories'],
        }),

        // Update category
        updateCategory: builder.mutation({
            query: ({ id, updatedCategory }: any) => {
                const formData = new FormData();
                if (updatedCategory.name) formData.append('name', updatedCategory.name);
                if (updatedCategory.description) formData.append('description', updatedCategory.description);
                if (updatedCategory.image) formData.append('image', updatedCategory.image);

                // Laravel requires _method=PUT for file uploads
                formData.append('_method', 'PUT');

                return {
                    url: `/categories/${id}`,
                    method: 'POST', // POST + _method=PUT
                    body: formData,
                };
            },
            invalidatesTags: ['Categories'],
        }),

        // Delete category
        deleteCategory: builder.mutation({
            query: (id: number) => ({
                url: `/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Categories'],
        }),

        // Get all categories
        getCategory: builder.query({
            query: () => ({
                url: `/categories`,
                method: 'GET',
            }),
            providesTags: ['Categories'],
        }),
    }),
});

export const { useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, useGetCategoryQuery } = CategoryApi;
