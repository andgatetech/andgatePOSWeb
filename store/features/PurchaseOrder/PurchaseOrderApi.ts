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
            invalidatesTags: ['PurchaseDrafts', 'Products', 'Orders'],
        }),

        // Get all Purchase Drafts
        getPurchaseDrafts: builder.query({
            query: (params: any = {}) => ({
                url: '/purchase-drafts',
                method: 'GET',
                params,
            }),
            providesTags: ['PurchaseDrafts', 'Products', 'Orders'],
        }),

        // Get single Purchase Draft
        getPurchaseDraftById: builder.query({
            query: (id: number | string) => ({
                url: `/purchase-drafts/${id}`,
                method: 'GET',
            }),
            providesTags: ['PurchaseDrafts', 'Products', 'Orders'],
        }),

        // Update Purchase Draft
        updatePurchaseDraft: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-drafts/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['PurchaseDrafts', 'Products', 'Orders'],
        }),

        // Delete Purchase Draft
        deletePurchaseDraft: builder.mutation({
            query: (id: number | string) => ({
                url: `/purchase-drafts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PurchaseDrafts', 'Products', 'Orders'],
        }),

        // ========== PHASE 2: CREATE PURCHASE ORDER ==========

        // Convert Draft to Purchase Order
        convertDraftToPurchaseOrder: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-drafts/${id}/create-purchase-order`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PurchaseDrafts', 'PurchaseOrders', 'Products', 'Orders'],
        }),

        // Create Purchase Order (Direct - without draft)
        createPurchaseOrder: builder.mutation({
            query: (data: any) => ({
                url: '/purchase-order',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PurchaseOrders', 'Products', 'Orders'],
        }),

        // Get all Purchase Orders
        getPurchaseOrders: builder.query({
            query: (params: any = {}) => ({
                url: '/purchase-order',
                method: 'GET',
                params,
            }),
            providesTags: ['PurchaseOrders', 'Products', 'Orders'],
        }),

        // // Get purchase order bar chart data
        // getPurchaseOrderChartData: builder.query({
        //     query: (params: any = {}) => ({
        //         url: '/purchase-order/chart/data',
        //         method: 'GET',
        //         params,
        //     }),
        //     providesTags: ['PurchaseOrders'],
        // }),

        // Get single Purchase Order
        getPurchaseOrderById: builder.query({
            query: (id: number | string) => ({
                url: `/purchase-order/${id}`,
                method: 'GET',
            }),
            providesTags: ['PurchaseOrders', 'Products', 'Orders'],
        }),

        // Edit Purchase Order (fetch data for form)
        editPurchaseOrder: builder.query({
            query: (id: number | string) => ({
                url: `/purchase-order/${id}`,
                method: 'GET',
            }),
            providesTags: ['PurchaseOrders', 'Products', 'Orders'],
        }),

        // ========== PHASE 3: RECEIVING PROCESS ==========

        // Update Purchase Order (Receive Items)
        updatePurchaseOrder: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-order/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['PurchaseOrders', 'Products', 'Orders'],
        }),

        // Delete Purchase Order
        deletePurchaseOrder: builder.mutation({
            query: (id: number | string) => ({
                url: `/purchase-order/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PurchaseOrders', 'Products', 'Orders'],
        }),

        // ========== PHASE 4: PAYMENT MANAGEMENT ==========

        // Make partial payment
        makePartialPayment: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-order/${id}/payment`,
                method: 'POST',
                body: {
                    store_id: data.store_id,
                    payment_amount: data.amount,
                    payment_method: data.payment_method || 'cash',
                },
            }),
            invalidatesTags: ['PurchaseOrders', 'Products', 'Orders'],
        }),

        // Clear full due
        clearFullDue: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/purchase-order/${id}/clear`,
                method: 'POST',
                body: {
                    store_id: data.store_id,
                    payment_method: data.payment_method || 'cash',
                },
            }),
            invalidatesTags: ['PurchaseOrders', 'Products', 'Orders'],
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

    // Purchase Order Chart Data
    //useGetPurchaseOrderChartDataQuery,

    // Purchase Order endpoints
    useConvertDraftToPurchaseOrderMutation,
    useCreatePurchaseOrderMutation,
    useGetPurchaseOrdersQuery,
    useGetPurchaseOrderByIdQuery,
    useEditPurchaseOrderQuery,
    useUpdatePurchaseOrderMutation,
    useDeletePurchaseOrderMutation,

    // Payment endpoints
    useMakePartialPaymentMutation,
    useClearFullDueMutation,
} = PurchaseOrderApi;
