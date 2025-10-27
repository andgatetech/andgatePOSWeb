import { baseApi } from '@/store/api/baseApi';

const ProductAttributeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all product attributes for the store
        getStoreAttributes: builder.query({
            query: (params: any = {}) => ({
                url: `/product-attributes`,
                method: 'GET',
                params, // Can include { store_id: 1 }
            }),
            providesTags: ['ProductAttributes'],
        }),

        // Get single product attribute
        getProductAttribute: builder.query({
            query: (id: number) => ({
                url: `/product-attributes/${id}`,
                method: 'GET',
            }),
            providesTags: ['ProductAttributes'],
        }),

        // Create product attribute
        createProductAttribute: builder.mutation({
            query: ({ name, store_id }: { name: string; store_id: number }) => ({
                url: '/product-attributes',
                method: 'POST',
                body: { name, store_id },
            }),
            invalidatesTags: ['ProductAttributes', 'Stores'],
        }),

        // Update product attribute
        updateProductAttribute: builder.mutation({
            query: ({ id, name, store_id, is_active }: { id: number; name: string; store_id?: number; is_active?: number | boolean }) => {
                const body: any = { name };
                if (store_id !== undefined) body.store_id = store_id;
                if (is_active !== undefined) body.is_active = is_active;
                return {
                    url: `/product-attributes/${id}`,
                    method: 'PUT',
                    body,
                };
            },
            invalidatesTags: ['ProductAttributes', 'Stores'],
        }),

        // Delete product attribute
        deleteProductAttribute: builder.mutation({
            query: (id: number) => ({
                url: `/product-attributes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProductAttributes', 'Stores'],
        }),

        // Get all attributes for a specific product
        getProductAttributeValues: builder.query({
            query: (productId: number) => ({
                url: `/products/${productId}/attributes`,
                method: 'GET',
            }),
            providesTags: ['ProductAttributeValues'],
        }),

        // Assign/Update multiple attributes to a product
        assignProductAttributes: builder.mutation({
            query: ({ productId, attributes }: { productId: number; attributes: Array<{ attribute_id: number; value: string }> }) => ({
                url: `/products/${productId}/attributes`,
                method: 'POST',
                body: { attributes },
            }),
            invalidatesTags: ['ProductAttributeValues', 'Products'],
        }),

        // Update single attribute value
        updateAttributeValue: builder.mutation({
            query: ({ id, value }: { id: number; value: string }) => ({
                url: `/attribute-values/${id}`,
                method: 'PUT',
                body: { value },
            }),
            invalidatesTags: ['ProductAttributeValues'],
        }),

        // Delete single attribute value
        deleteAttributeValue: builder.mutation({
            query: (id: number) => ({
                url: `/attribute-values/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProductAttributeValues'],
        }),
    }),
});

export const {
    useGetStoreAttributesQuery,
    useGetProductAttributeQuery,
    useCreateProductAttributeMutation,
    useUpdateProductAttributeMutation,
    useDeleteProductAttributeMutation,
    useGetProductAttributeValuesQuery,
    useAssignProductAttributesMutation,
    useUpdateAttributeValueMutation,
    useDeleteAttributeValueMutation,
} = ProductAttributeApi;
