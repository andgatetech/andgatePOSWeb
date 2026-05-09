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
                url: '/ecommerce/management/orders',
                method: 'GET',
                params,
            }),
            providesTags: [{ type: 'EcommerceManagement', id: 'ORDERS' }],
        }),

        getEcommerceOrder: builder.query({
            query: (id: number) => ({
                url: `/ecommerce/management/orders/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'EcommerceManagement', id: `ORDER-${id}` }],
        }),

        updateEcommerceOrderStatus: builder.mutation({
            query: ({ id, status }: { id: number; status: string }) => ({
                url: `/ecommerce/management/orders/${id}/status`,
                method: 'PATCH',
                body: { status },
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
    }),
});

export const {
    useGetEcommerceStoresQuery,
    useRequestEcommerceStoreStatusMutation,
    useGetEcommerceOrdersQuery,
    useGetEcommerceOrderQuery,
    useUpdateEcommerceOrderStatusMutation,
    useGetEcommerceProductsQuery,
    useUpdateEcommerceProductVisibilityMutation,
    useBulkUpdateEcommerceProductVisibilityMutation,
    useGetEcommerceCartsQuery,
    useGetEcommerceWishlistsQuery,
} = ecommerceManagementApi;
