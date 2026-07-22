import { baseApi } from '@/store/api/baseApi';

export const stockTransferApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStockTransfers: builder.query({
            query: (params: { store_id: number; direction?: 'incoming' | 'outgoing'; status?: string }) => ({
                url: '/stock-transfers',
                method: 'GET',
                params: Object.fromEntries(
                    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
                ),
            }),
            providesTags: ['StockTransfer'],
        }),
        getStockTransfer: builder.query({
            query: ({ id, ...params }: { id: number; store_id: number }) => ({
                url: `/stock-transfers/${id}`,
                method: 'GET',
                params,
            }),
            providesTags: ['StockTransfer'],
        }),
        createStockTransfer: builder.mutation({
            query: (body: { store_id: number; to_store_id: number; note?: string; items: { product_id: number; product_stock_id: number; quantity: number }[] }) => ({
                url: '/stock-transfers',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['StockTransfer'],
        }),
        shipStockTransfer: builder.mutation({
            query: ({ id, ...body }: { id: number; store_id: number }) => ({
                url: `/stock-transfers/${id}/ship`,
                method: 'POST',
                body,
            }),
            // Ship moves quantity out of the source store's stock, so product/stock views must refetch too.
            invalidatesTags: ['StockTransfer', 'Products'],
        }),
        receiveStockTransfer: builder.mutation({
            query: ({ id, ...body }: { id: number; store_id: number }) => ({
                url: `/stock-transfers/${id}/receive`,
                method: 'POST',
                body,
            }),
            // Receive adds quantity into the destination store's stock, so product/stock views must refetch too.
            invalidatesTags: ['StockTransfer', 'Products'],
        }),
        cancelStockTransfer: builder.mutation({
            query: ({ id, ...body }: { id: number; store_id: number }) => ({
                url: `/stock-transfers/${id}/cancel`,
                method: 'POST',
                body,
            }),
            // Cancelling a shipped transfer releases/restores reserved stock.
            invalidatesTags: ['StockTransfer', 'Products'],
        }),
    }),
});

export const {
    useGetStockTransfersQuery,
    useGetStockTransferQuery,
    useCreateStockTransferMutation,
    useShipStockTransferMutation,
    useReceiveStockTransferMutation,
    useCancelStockTransferMutation,
} = stockTransferApi;
