import { baseApi } from "@/store/api/baseApi";



const PurchaseApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createPurchase: builder.mutation({
            query: (newPurchase: any) => ({
                url: '/purchases',
                method: 'POST',
                body: newPurchase,
            }),
            invalidatesTags: ['Purchases'],
        }),

        getAllPurchases: builder.query({
            query: () => ({
                url: '/purchases',
                method: 'GET',
            }),
            providesTags: ['Purchases'],
        }),

        getPurchaseById: builder.query({
            query: (id: any) => ({
                url: `/purchases/${id}`,
                method: 'GET',
            }),
            providesTags: ['Purchases'],
        }),

        receivePurchase: builder.mutation({
            query: (id: any) => ({
                url: `/purchases/${id}/receive`,
                method: 'PUT',
            }),
            invalidatesTags: ['Purchases'],
        }),

        updatePurchaseStatus: builder.mutation({
            query: ({ id, statusData }) => ({
                url: `/purchases/${id}/status`,
                method: 'PUT',
                body: statusData, // status data object e.g. { status: 'approved' }
            }),
            invalidatesTags: ['Purchases'],
        }),

        getAllPurchasesTransactions: builder.query({
            query: () => ({
                url: '/purchases/transactions ',
                method: 'GET',
            }),
            providesTags: ['Purchases'],
        }),
    }),
});

export const { useCreatePurchaseMutation, useGetAllPurchasesQuery, useGetPurchaseByIdQuery, useReceivePurchaseMutation, useUpdatePurchaseStatusMutation,useGetAllPurchasesTransactionsQuery } = PurchaseApi;
