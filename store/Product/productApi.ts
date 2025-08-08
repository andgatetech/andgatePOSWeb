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
            query: (filters = {}) => {
                const params = new URLSearchParams();
                if (filters.search) params.append('search', filters.search);
                if (filters.price) params.append('price', filters.price);
                if (filters.price_min) params.append('price_min', filters.price_min);
                if (filters.price_max) params.append('price_max', filters.price_max);
                if (filters.available !== undefined) params.append('available', filters.available);
                if (filters.quantity) params.append('quantity', filters.quantity);
                if (filters.quantity_min) params.append('quantity_min', filters.quantity_min);
                if (filters.quantity_max) params.append('quantity_max', filters.quantity_max);
                return {
                    url: `/products?${params.toString()}`,
                    method: 'GET',
                };
            },
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
