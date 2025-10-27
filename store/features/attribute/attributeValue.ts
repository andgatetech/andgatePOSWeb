import { baseApi } from '@/store/api/baseApi';

export const attributeValueApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all attributes for a specific product
        getProductAttributes: builder.query({
            query: ({ productId }: { productId: number }) => ({
                url: `/products/${productId}/attributes`,
                method: 'GET',
            }),
            providesTags: (result: any, error: any, { productId }: { productId: number }) => [{ type: 'ProductAttributes', id: productId }],
        }),

        // Assign multiple attributes to a product
        assignAttributesToProduct: builder.mutation({
            query: ({ productId, attributes }: { productId: number; attributes: Array<{ attribute_id: number; value: string }> }) => ({
                url: `/products/${productId}/attributes`,
                method: 'POST',
                body: { attributes },
            }),
            invalidatesTags: (result: any, error: any, { productId }: { productId: number }) => [{ type: 'ProductAttributes', id: productId }],
        }),

        // Update a single attribute value
        updateAttributeValue: builder.mutation({
            query: ({ attributeValueId, value }: { attributeValueId: number; value: string }) => ({
                url: `/product-attribute-values/${attributeValueId}`,
                method: 'PUT',
                body: { value },
            }),
            invalidatesTags: ['ProductAttributes', 'Stores'],
        }),

        // Delete a single attribute value
        deleteAttributeValue: builder.mutation({
            query: ({ attributeValueId }: { attributeValueId: number }) => ({
                url: `/product-attribute-values/${attributeValueId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProductAttributes'],
        }),
    }),
});

export const { useGetProductAttributesQuery, useAssignAttributesToProductMutation, useUpdateAttributeValueMutation, useDeleteAttributeValueMutation } = attributeValueApi;
