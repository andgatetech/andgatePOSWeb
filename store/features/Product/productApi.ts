import { baseApi } from '../../api/baseApi';

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
                params: filters,
                validateStatus: (response, result) => {
                    // Treat 404 as a valid response (empty products)
                    return response.status === 200 || response.status === 404;
                },
            }),
            transformResponse: (response: any) => {
                // If data is null (404 response), return empty array
                if (response && response.data === null) {
                    return { data: [], success: false };
                }
                // If response has valid data array, return it
                if (response && response.data) {
                    return response;
                }
                // Default fallback: empty array
                return { data: [], success: true };
            },
            providesTags: ['Products', 'Orders'],
        }),
        // getAllProductsWithStock: builder.query({
        //     query: (params) => ({
        //         url: '/products/in-stock',
        //         method: 'GET',
        //         params,
        //     }),
        //     providesTags: ['Products', 'Orders'],
        // }),

        getAllProductsWithStock: builder.query({
            query: ({ store_id, search }) => {
                const params = new URLSearchParams();
                if (store_id) params.append('store_id', store_id);
                if (search) params.append('search', search);
                return {
                    url: `/products/in-stock?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: ['Products', 'Orders'],
        }),
        getAllLowStockProducts: builder.query({
            query: (params) => ({
                url: '/products/low-stock',
                method: 'GET',
                params,
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

        updateProduct: builder.mutation({
            query: ({ id, data }) => ({
                url: `/products/${id}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Products', 'ActivityLogs'],
        }),
        getActivityLogs: builder.query({
            query: () => ({
                url: `/activity-logs`,
                method: 'GET',
            }),
            providesTags: ['ActivityLogs'],
        }),

        deleteProduct: builder.mutation({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Products'],
        }),
        generateBarcodes: builder.mutation({
            query: (products) => ({
                url: '/products/barcode',
                method: 'POST',
                body: { products },
            }),
        }),

        generateQRCodes: builder.mutation({
            query: (products) => ({
                url: '/products/qrcode',
                method: 'POST',
                body: { products },
            }),
        }),

        updateAvailability: builder.mutation({
            query: ({ id, available }) => ({
                url: `/products/${id}/availability`,
                method: 'PUT',
                body: { available },
            }),
            invalidatesTags: ['Products'],
        }),

        getUnits: builder.query({
            query: (params = {}) => ({
                url: `/store/units`,
                method: 'GET',
                params: params,
            }),
            providesTags: ['Products'],
        }),
        productBulkUpload: builder.mutation({
            query: (formData) => ({
                url: '/products/bulk-upload',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Products'],
        }),
    }),
});

export const {
    useCreateProductMutation,
    useGetAllProductsQuery,
    useGetAllProductsWithStockQuery,
    useGetAllLowStockProductsQuery,
    useGetSingleProductQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useUpdateAvailabilityMutation,
    useGenerateBarcodesMutation,
    useGenerateQRCodesMutation,
    useGetActivityLogsQuery,
    useGetUnitsQuery,
    useProductBulkUploadMutation,
} = ProductApi;
