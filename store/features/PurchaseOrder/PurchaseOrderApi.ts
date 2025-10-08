import { baseApi } from '@/store/api/baseApi';

const PurchaseOrderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ========== PHASE 1: DRAFT PREPARATION ==========

        // Save Purchase Draft
        createPurchaseDraft: builder.mutation({
            query: (data: any) => ({
                url: '/purchase-drafts',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PurchaseDrafts'],
        }),

        // Get all Purchase Drafts
        getPurchaseDrafts: builder.query({
            query: (params: any = {}) => ({
                url: '/purchase-drafts',
                method: 'GET',
                params,
            }),
            providesTags: ['PurchaseDrafts'],
        }),

        // Get single Purchase Draft
        getPurchaseDraftById: builder.query({
            query: (id: number | string) => ({
                url: `/purchase-drafts/${id}`,
                method: 'GET',
            }),
            providesTags: ['PurchaseDrafts'],
        }),

        // Update Purchase Draft
        updatePurchaseDraft: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-drafts/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['PurchaseDrafts'],
        }),

        // Delete Purchase Draft
        deletePurchaseDraft: builder.mutation({
            query: (id: number | string) => ({
                url: `/purchase-drafts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PurchaseDrafts'],
        }),

        // ========== PHASE 2: CREATE PURCHASE ORDER ==========

        // Convert Draft to Purchase Order
        convertDraftToPurchaseOrder: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-drafts/${id}/create-purchase-order`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PurchaseDrafts', 'PurchaseOrders'],
        }),

        // Create Purchase Order (Direct - without draft)
        createPurchaseOrder: builder.mutation({
            query: (data: any) => ({
                url: '/purchase-order/store',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PurchaseOrders', 'Purchases'],
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

        // ========== PHASE 3: RECEIVING PROCESS ==========

        // Update Purchase Order (Receive Items)
        updatePurchaseOrder: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-order/update/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['PurchaseOrders', 'Products'],
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

export const {
    // Draft endpoints
    useCreatePurchaseDraftMutation,
    useGetPurchaseDraftsQuery,
    useGetPurchaseDraftByIdQuery,
    useUpdatePurchaseDraftMutation,
    useDeletePurchaseDraftMutation,

    // Purchase Order endpoints
    useConvertDraftToPurchaseOrderMutation,
    useCreatePurchaseOrderMutation,
    useGetPurchaseOrdersQuery,
    useGetPurchaseOrderByIdQuery,
    useEditPurchaseOrderQuery,
    useUpdatePurchaseOrderMutation,
    useDeletePurchaseOrderMutation,
} = PurchaseOrderApi;
