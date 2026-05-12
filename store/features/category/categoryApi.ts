import { baseApi } from '@/store/api/baseApi';

const CategoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Create category
        createCategory: builder.mutation({
            query: (newCategory: any) => {
                const isFormData = typeof FormData !== 'undefined' && newCategory instanceof FormData;
                const looksLikeFormData = newCategory && typeof newCategory.append === 'function' && typeof newCategory.get === 'function';

                if (isFormData || looksLikeFormData) {
                    return {
                        url: '/categories',
                        method: 'POST',
                        body: newCategory,
                    };
                }

                const formData = new FormData();
                formData.append('name', String(newCategory.name || '').trim());
                formData.append('description', String(newCategory.description || '').trim());
                if (newCategory.image) {
                    formData.append('image', newCategory.image);
                }
                if (newCategory.store_id) {
                    formData.append('store_id', newCategory.store_id.toString());
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
            query: (params: any = {}) => ({
                url: `/categories`,
                method: 'GET',
                params,
            }),
            providesTags: ['Categories'],
        }),

        // Get single category
        getCategoryById: builder.query({
            query: (id: number) => `/categories/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Categories', id }],
        }),
    }),
});

export const { useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, useGetCategoryQuery, useGetCategoryByIdQuery } = CategoryApi;
