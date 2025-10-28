import { baseApi } from '@/store/api/baseApi';

const ProductSerialApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all product serials with filters
        getProductSerials: builder.query({
            query: (params: any = {}) => ({
                url: `/product-serials`,
                method: 'GET',
                params, // Can include { store_id, product_id, status, search, start_date, end_date }
            }),
            providesTags: ['ProductSerials'],
        }),

        // Get single product serial
        getProductSerial: builder.query({
            query: (id: number) => ({
                url: `/product-serials/${id}`,
                method: 'GET',
            }),
            providesTags: ['ProductSerials'],
        }),

        // Get available serials for a product (in_stock only)
        getAvailableSerials: builder.query({
            query: (productId: number) => ({
                url: `/product-serials/product/${productId}/available`,
                method: 'GET',
            }),
            providesTags: ['ProductSerials'],
        }),

        // Create product serials (bulk)
        createProductSerials: builder.mutation({
            query: ({ product_id, serials }: { product_id: number; serials: Array<{ serial_number: string; notes?: string }> }) => ({
                url: '/product-serials',
                method: 'POST',
                body: { product_id, serials },
            }),
            invalidatesTags: ['ProductSerials', 'Products'],
        }),

        // Update serial status
        updateProductSerial: builder.mutation({
            query: ({ id, status, notes }: { id: number; status: 'in_stock' | 'sold' | 'returned' | 'damaged'; notes?: string }) => ({
                url: `/product-serials/${id}`,
                method: 'PUT',
                body: { status, notes },
            }),
            invalidatesTags: ['ProductSerials'],
        }),

        // Delete product serial
        deleteProductSerial: builder.mutation({
            query: (id: number) => ({
                url: `/product-serials/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ProductSerials'],
        }),

        // Mark serials as sold (when creating order)
        markSerialsAsSold: builder.mutation({
            query: ({ serial_ids, order_id, sold_date }: { serial_ids: number[]; order_id: number; sold_date: string }) => ({
                url: '/product-serials/mark-sold',
                method: 'POST',
                body: { serial_ids, order_id, sold_date },
            }),
            invalidatesTags: ['ProductSerials', 'Orders'],
        }),
    }),
});

export const {
    useGetProductSerialsQuery,
    useGetProductSerialQuery,
    useGetAvailableSerialsQuery,
    useCreateProductSerialsMutation,
    useUpdateProductSerialMutation,
    useDeleteProductSerialMutation,
    useMarkSerialsAsSoldMutation,
} = ProductSerialApi;
