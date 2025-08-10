import { baseApi } from '../api/baseApi';

const ProductApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createProduct: builder.mutation({
            query: (newProduct) => ({
                url: '/products',
                method: 'POST',
                body: newProduct,
            }),
            invalidatesTags: ['Products'],
        }),

        getAllProducts: builder.query({
    query: (filters = {}) => ({
        url: '/products',
        method: 'GET',
        params: filters, // Let Laravel ignore empty ones
    }),
    providesTags: ['Products','Orders'],
}),

        updateAvailability: builder.mutation({
            query: ({ id, available }) => ({
                url: `/products/${id}/availability`,
                method: 'PUT',
                body: { available },
            }),
            invalidatesTags: ['Products'],
        }),

        deleteProduct: builder.mutation({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Products'],
        }),
    }),
});

export const { useCreateProductMutation, useGetAllProductsQuery, useUpdateAvailabilityMutation, useDeleteProductMutation } = ProductApi;
