import { baseApi } from '@/store/api/baseApi';

const ecommerceManagementApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getEcommerceStores: builder.query({
            query: (params = {}) => ({
                url: '/ecommerce/management/stores',
                method: 'GET',
                params,
            }),
            providesTags: [{ type: 'EcommerceManagement', id: 'STORES' }],
        }),

        requestEcommerceStoreStatus: builder.mutation({
            query: ({ storeId, requested_status, note }: { storeId: number; requested_status: 'enable' | 'disable'; note?: string }) => ({
                url: `/ecommerce/management/stores/${storeId}/status-request`,
                method: 'POST',
                body: { requested_status, note },
            }),
            invalidatesTags: [{ type: 'EcommerceManagement', id: 'STORES' }, { type: 'Notifications', id: 'LIST' }],
        }),

        getEcommerceOrders: builder.query({
            query: (params = {}) => ({
                url: '/ecommerce/management/store-orders',
                method: 'GET',
                params,
            }),
            providesTags: [{ type: 'EcommerceManagement', id: 'ORDERS' }],
        }),

        getEcommerceOrder: builder.query({
            query: (id: number) => ({
                url: `/ecommerce/management/store-orders/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'EcommerceManagement', id: `ORDER-${id}` }],
        }),

        updateEcommerceOrderStatus: builder.mutation({
            query: ({ id, status }: { id: number; status: string }) => ({
                url: `/ecommerce/management/store-orders/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'EcommerceManagement', id: 'ORDERS' },
                { type: 'EcommerceManagement', id: `ORDER-${id}` },
            ],
        }),

        updateEcommerceOrderPayment: builder.mutation({
            query: ({
                id,
                payment_status,
                payment_method,
                amount,
                payment_note,
            }: {
                id: number;
                payment_status: string;
                payment_method?: string;
                amount?: number | string;
                payment_note?: string;
            }) => ({
                url: `/ecommerce/management/store-orders/${id}/payment`,
                method: 'PATCH',
                body: { payment_status, payment_method, amount, payment_note },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'EcommerceManagement', id: 'ORDERS' },
                { type: 'EcommerceManagement', id: `ORDER-${id}` },
            ],
        }),

        getEcommerceProducts: builder.query({
            query: (params = {}) => ({
                url: '/ecommerce/management/products',
                method: 'GET',
                params,
            }),
            providesTags: [{ type: 'EcommerceManagement', id: 'PRODUCTS' }],
        }),

        updateEcommerceProductVisibility: builder.mutation({
            query: ({ productId, visible }: { productId: number; visible: boolean }) => ({
                url: `/ecommerce/management/products/${productId}/visibility`,
                method: 'PATCH',
                body: { visible },
            }),
            invalidatesTags: [{ type: 'EcommerceManagement', id: 'PRODUCTS' }],
        }),

        bulkUpdateEcommerceProductVisibility: builder.mutation({
            query: (body: Record<string, any>) => ({
                url: '/ecommerce/management/products/visibility/bulk',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: [{ type: 'EcommerceManagement', id: 'PRODUCTS' }],
        }),

        getEcommerceCarts: builder.query({
            query: (params = {}) => ({
                url: '/ecommerce/management/carts',
                method: 'GET',
                params,
            }),
            providesTags: [{ type: 'EcommerceManagement', id: 'CARTS' }],
        }),

        getEcommerceWishlists: builder.query({
            query: (params = {}) => ({
                url: '/ecommerce/management/wishlists',
                method: 'GET',
                params,
            }),
            providesTags: [{ type: 'EcommerceManagement', id: 'WISHLISTS' }],
        }),

        getCourierCredentials: builder.query({
            query: (params = {}) => ({
                url: '/ecommerce/management/couriers/credentials',
                method: 'GET',
                params,
            }),
            providesTags: [{ type: 'EcommerceManagement', id: 'COURIER-CREDENTIALS' }],
        }),

        getPathaoCities: builder.query({
            query: (params = {}) => ({
                url: '/ecommerce/management/couriers/pathao/cities',
                method: 'GET',
                params,
            }),
        }),

        getPathaoZones: builder.query({
            query: ({ cityId, store_id }: { cityId: number | string; store_id: number }) => ({
                url: `/ecommerce/management/couriers/pathao/cities/${cityId}/zones`,
                method: 'GET',
                params: { store_id },
            }),
        }),

        getPathaoAreas: builder.query({
            query: ({ zoneId, store_id }: { zoneId: number | string; store_id: number }) => ({
                url: `/ecommerce/management/couriers/pathao/zones/${zoneId}/areas`,
                method: 'GET',
                params: { store_id },
            }),
        }),

        getRedxAreas: builder.query({
            query: (params = {}) => ({
                url: '/ecommerce/management/couriers/redx/areas',
                method: 'GET',
                params,
            }),
        }),

        getRedxPickupStores: builder.query({
            query: (params = {}) => ({
                url: '/ecommerce/management/couriers/redx/pickup-stores',
                method: 'GET',
                params,
            }),
        }),

        runCourierFraudCheck: builder.mutation({
            query: (body: Record<string, any>) => ({
                url: '/ecommerce/management/fraud-checks',
                method: 'POST',
                body,
            }),
        }),

        runStoreOrderFraudCheck: builder.mutation({
            query: ({ id, ...body }: Record<string, any> & { id: number }) => ({
                url: `/ecommerce/management/store-orders/${id}/fraud-check`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'EcommerceManagement', id: 'ORDERS' },
                { type: 'EcommerceManagement', id: `ORDER-${id}` },
            ],
        }),

        saveCourierCredential: builder.mutation({
            query: (body: Record<string, any>) => ({
                url: '/ecommerce/management/couriers/credentials',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'EcommerceManagement', id: 'COURIER-CREDENTIALS' }],
        }),

        updateCourierCredential: builder.mutation({
            query: ({ id, ...body }: Record<string, any> & { id: number }) => ({
                url: `/ecommerce/management/couriers/credentials/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: [{ type: 'EcommerceManagement', id: 'COURIER-CREDENTIALS' }],
        }),

        deleteCourierCredential: builder.mutation({
            query: (id: number) => ({
                url: `/ecommerce/management/couriers/credentials/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'EcommerceManagement', id: 'COURIER-CREDENTIALS' }],
        }),

        calculateCourierPrice: builder.mutation({
            query: ({ id, ...body }: Record<string, any> & { id: number }) => ({
                url: `/ecommerce/management/store-orders/${id}/courier/price`,
                method: 'POST',
                body,
            }),
        }),

        createCourierShipment: builder.mutation({
            query: ({ id, ...body }: Record<string, any> & { id: number }) => ({
                url: `/ecommerce/management/store-orders/${id}/courier/create`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'EcommerceManagement', id: 'ORDERS' },
                { type: 'EcommerceManagement', id: `ORDER-${id}` },
            ],
        }),

        bulkCreateCourierShipments: builder.mutation({
            query: (body: Record<string, any>) => ({
                url: '/ecommerce/management/store-orders/courier/bulk-create',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'EcommerceManagement', id: 'ORDERS' }],
        }),

        refreshCourierStatus: builder.mutation({
            query: ({ id, provider }: { id: number; provider: string }) => ({
                url: `/ecommerce/management/store-orders/${id}/courier/status`,
                method: 'GET',
                params: { provider },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'EcommerceManagement', id: 'ORDERS' },
                { type: 'EcommerceManagement', id: `ORDER-${id}` },
            ],
        }),
    }),
});

export const {
    useGetEcommerceStoresQuery,
    useRequestEcommerceStoreStatusMutation,
    useGetEcommerceOrdersQuery,
    useGetEcommerceOrderQuery,
    useUpdateEcommerceOrderStatusMutation,
    useUpdateEcommerceOrderPaymentMutation,
    useGetEcommerceProductsQuery,
    useUpdateEcommerceProductVisibilityMutation,
    useBulkUpdateEcommerceProductVisibilityMutation,
    useGetEcommerceCartsQuery,
    useGetEcommerceWishlistsQuery,
    useGetCourierCredentialsQuery,
    useGetPathaoCitiesQuery,
    useGetPathaoZonesQuery,
    useGetPathaoAreasQuery,
    useLazyGetRedxAreasQuery,
    useGetRedxPickupStoresQuery,
    useRunCourierFraudCheckMutation,
    useRunStoreOrderFraudCheckMutation,
    useSaveCourierCredentialMutation,
    useUpdateCourierCredentialMutation,
    useDeleteCourierCredentialMutation,
    useCalculateCourierPriceMutation,
    useCreateCourierShipmentMutation,
    useBulkCreateCourierShipmentsMutation,
    useRefreshCourierStatusMutation,
} = ecommerceManagementApi;
