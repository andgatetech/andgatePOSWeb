import { baseApi } from '@/store/api/baseApi';

const PurchaseOrderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Create Purchase Order
        createPurchaseOrder: builder.mutation({
            query: (data: any) => ({
                url: '/purchase-order/store',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PurchaseOrders'],
        }),

        // Get all Purchase Orders
        getPurchaseOrders: builder.query({
            query: (params: any = {}) => ({
                url: '/purchase-order/list',
                method: 'GET',
                params,
            }),
            providesTags: ['PurchaseOrders'],
        }),

        // Get single Purchase Order
        getPurchaseOrderById: builder.query({
            query: (id: number | string) => ({
                url: `/purchase-order/${id}`,
                method: 'GET',
            }),
            providesTags: ['PurchaseOrders'],
        }),

        // Edit Purchase Order (fetch data for form)
        editPurchaseOrder: builder.query({
            query: (id: number | string) => ({
                url: `/purchase-order/edit/${id}`,
                method: 'GET',
            }),
            providesTags: ['PurchaseOrders'],
        }),

        // Update Purchase Order
        updatePurchaseOrder: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-order/update/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['PurchaseOrders'],
        }),

        // Delete Purchase Order
        deletePurchaseOrder: builder.mutation({
            query: (id: number | string) => ({
                url: `/purchase-order/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PurchaseOrders'],
        }),
    }),
});

export const { useCreatePurchaseOrderMutation, useGetPurchaseOrdersQuery, useGetPurchaseOrderByIdQuery, useEditPurchaseOrderQuery, useUpdatePurchaseOrderMutation, useDeletePurchaseOrderMutation } =
    PurchaseOrderApi;
