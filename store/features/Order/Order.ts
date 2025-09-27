import { baseApi } from '@/store/api/baseApi';

const OrderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (newOrder: any) => ({
                url: '/orders',
                method: 'POST',
                body: newOrder,
            }),
            invalidatesTags: [{ type: 'Customers', id: 'LIST' }, 'Orders', 'Products', 'Transactions'],
        }),

        getAllOrders: builder.query({
            query: (filters = {}) => ({
                url: '/orders',
                method: 'GET',
                params: filters, // Let Laravel ignore empty ones
            }),
            providesTags: ['Orders'],
        }),

        getOrderById: builder.query({
            query: (id: any) => ({
                url: `/orders/${id}`,
                method: 'GET',
            }),
            providesTags: ['Orders'],
        }),
        getOrderItems: builder.query({
            query: (id: any) => ({
                url: `/orders/${id}/items`,
                method: 'GET',
            }),
            providesTags: ['Orders'],
        }),
    }),
});

export const { useCreateOrderMutation, useGetAllOrdersQuery, useGetOrderByIdQuery, useGetOrderItemsQuery } = OrderApi;
