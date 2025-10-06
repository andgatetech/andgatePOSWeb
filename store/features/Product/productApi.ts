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
        getAllProductsWithStock: builder.query({
            query: (params) => ({
                url: '/products/in-stock',
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
        getProductQRCode: builder.query({
            query: (id) => `/products/${id}/qrcode`,
        }),
        getProductBrCode: builder.query({
            query: (id) => `/products/${id}/barcode`,
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
    }),
});

export const {
    useCreateProductMutation,
    useGetAllProductsQuery,
    useGetAllProductsWithStockQuery,
    useGetSingleProductQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useUpdateAvailabilityMutation,
    useGetProductQRCodeQuery,
    useGetProductBrCodeQuery,
    useGetActivityLogsQuery,
    useGetUnitsQuery,
} = ProductApi;
