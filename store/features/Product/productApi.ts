import { baseApi } from '../../api/baseApi';

const ProductApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createProduct: builder.mutation({
            query: (newProduct) => ({
                url: '/products',
                method: 'POST',
                body: newProduct,
            }),
            invalidatesTags: ['Products', 'Orders'],
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

        deleteProduct: builder.mutation({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Products', 'Orders'],
        }),

        updateProduct: builder.mutation({
            query: ({ id, formData }) => {
                // Add Laravel method spoofing for PUT request with FormData
                formData.append('_method', 'PUT');
                return {
                    url: `/products/${id}`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: ['Products', 'Orders'],
        }),

        getSingleProduct: builder.query({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'GET',
            }),
            providesTags: ['Products'],
        }),

       

        getActivityLogs: builder.query({
            query: () => ({
                url: `/activity-logs`,
                method: 'GET',
            }),
            providesTags: ['ActivityLogs'],
        }),

        generateBarCodes: builder.mutation({
            query: (pos_products) => ({
                url: '/products/barcode',
                method: 'POST',
                body: { pos_products },
            }),
            transformResponse: (response: any) => {
                // Backend returns: { success, message, data: { barcodes, total_generated, errors } }
                return response;
            },
            invalidatesTags: ['Products', 'Orders'],
        }),

        generateQRCodes: builder.mutation({
            query: (pos_products) => ({
                url: '/products/qrcode',
                method: 'POST',
                body: { pos_products },
            }),
            transformResponse: (response: any) => {
                // Backend returns: { success, message, data: { barcodes, total_generated, errors } }
                return response;
            },
            invalidatesTags: ['Products', 'Orders'],
        }),

        updateAvailability: builder.mutation({
            query: ({ id, available }) => ({
                url: `/products/${id}/availability`,
                method: 'PUT',
                body: { available },
            }),
            invalidatesTags: ['Products', 'Orders'],
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
            invalidatesTags: ['Products', 'Orders'],
        }),

        downloadBulkUploadTemplate: builder.mutation<{ success: boolean }, void>({
            queryFn: async (arg, api, extraOptions, baseQuery) => {
                const result = await baseQuery({
                    url: '/products/bulk-upload/template',
                    method: 'GET',
                    responseHandler: async (response) => {
                        if (!response.ok) {
                            throw new Error('Failed to download template');
                        }
                        return response.blob();
                    },
                });

                if (result.error) {
                    return { error: result.error };
                }

                // Handle blob download immediately
                const blob = result.data as Blob;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'product_upload_template.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Return simple success flag instead of blob
                return { data: { success: true } };
            },
        }),

        createStockAdjustment: builder.mutation({
            query: (adjustmentData) => ({
                url: '/product-adjustments',
                method: 'POST',
                body: adjustmentData,
            }),
            invalidatesTags: ['Products', 'Orders'],
        }),

        updateSerialStatus: builder.mutation({
            query: (serialData) => ({
                url: '/product-adjustments/serial-status',
                method: 'POST',
                body: serialData,
            }),
            invalidatesTags: ['Products', 'Orders'],
        }),
    }),
});

export const {
    useCreateProductMutation,
    useGetAllProductsQuery,
    useLazyGetAllProductsQuery,
    useGetSingleProductQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useUpdateAvailabilityMutation,
    useGenerateBarCodesMutation,
    useGenerateQRCodesMutation,
    useGetActivityLogsQuery,
    useGetUnitsQuery,
    useProductBulkUploadMutation,
    useDownloadBulkUploadTemplateMutation,
    useCreateStockAdjustmentMutation,
    useUpdateSerialStatusMutation,
} = ProductApi;
