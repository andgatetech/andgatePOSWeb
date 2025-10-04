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
                params: filters, // Let Laravel ignore empty ones
            }),
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
