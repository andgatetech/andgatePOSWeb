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
            providesTags: ['Products', 'Orders'],
        }),
        getSingleProduct: builder.query({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'GET',
            }),
            providesTags: ['Products'],
        }),

        updateAvailability: builder.mutation({
            query: ({ id, available }) => ({
                url: `/products/${id}/availability`,
                method: 'PUT',
                body: { available },
            }),
            invalidatesTags: ['Products'],
        }),
        updateProduct: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/products/${id}`,
                method: 'PUT',
                body: data,
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

export const { useCreateProductMutation, useGetAllProductsQuery, useGetSingleProductQuery, useUpdateProductMutation, useDeleteProductMutation } = ProductApi;
