import { baseApi } from '@/store/api/baseApi';

const ProductWarrantyApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all product warranties with filters
        getProductWarranties: builder.query({
            query: (params: any = {}) => ({
                url: `/product-warranties`,
                method: 'GET',
                params, // Can include { store_id, product_id, warranty_type_id, search }
            }),
            providesTags: ['ProductWarranties'],
        }),

        // Get single product warranty
        getProductWarranty: builder.query({
            query: (id: number) => ({
                url: `/product-warranties/${id}`,
                method: 'GET',
            }),
            providesTags: ['ProductWarranties'],
        }),

        // Get warranties for a specific product
        getProductWarrantiesByProduct: builder.query({
            query: (productId: number) => ({
                url: `/product-warranties/product/${productId}`,
                method: 'GET',
            }),
            providesTags: ['ProductWarranties'],
        }),

        // Create product warranties (bulk)
        createProductWarranties: builder.mutation({
            query: ({ product_id, warranties }: { product_id: number; warranties: Array<{ warranty_type_id: number; duration_months?: number; duration_days?: number }> }) => ({
                url: '/product-warranties',
                method: 'POST',
                body: { product_id, warranties },
            }),
            invalidatesTags: ['ProductWarranties', 'Products'],
        }),

        // Update product warranty
        updateProductWarranty: builder.mutation({
            query: ({ id, warranty_type_id, duration_months, duration_days }: { id: number; warranty_type_id?: number; duration_months?: number; duration_days?: number }) => {
                const body: any = {};
                if (warranty_type_id !== undefined) body.warranty_type_id = warranty_type_id;
                if (duration_months !== undefined) body.duration_months = duration_months;
                if (duration_days !== undefined) body.duration_days = duration_days;

                return {
                    url: `/product-warranties/${id}`,
                    method: 'PUT',
                    body,
                };
            },
            invalidatesTags: ['ProductWarranties', 'Products'],
        }),

        // Delete product warranty
        deleteProductWarranty: builder.mutation({
            query: (id: number) => ({
                url: `/product-warranties/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProductWarranties', 'Products'],
        }),

        // Bulk delete product warranties
        bulkDeleteProductWarranties: builder.mutation({
            query: (ids: number[]) => ({
                url: '/product-warranties/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: ['ProductWarranties', 'Products'],
        }),
    }),
});

export const {
    useGetProductWarrantiesQuery,
    useGetProductWarrantyQuery,
    useGetProductWarrantiesByProductQuery,
    useCreateProductWarrantiesMutation,
    useUpdateProductWarrantyMutation,
    useDeleteProductWarrantyMutation,
    useBulkDeleteProductWarrantiesMutation,
} = ProductWarrantyApi;
