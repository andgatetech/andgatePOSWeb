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
                params: filters,
            }),
            providesTags: ['Orders'],
        }),
    }),
});

export const { useCreateOrderMutation, useGetAllOrdersQuery } = OrderApi;
