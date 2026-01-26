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

        getOrderById: builder.query({
            query: (id: number) => ({
                url: `/orders/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Orders', id }],
        }),

        updateOrder: builder.mutation({
            query: ({ id, ...data }: { id: number; [key: string]: any }) => ({
                url: `/orders/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Orders', id }, 'Orders', 'Products', 'ProductSerials', 'Transactions', { type: 'Customers', id: 'LIST' }],
        }),

        // Order Return endpoints
        createOrderReturn: builder.mutation({
            query: (returnData: any) => ({
                url: '/order-returns',
                method: 'POST',
                body: returnData,
            }),
            invalidatesTags: ['Orders', 'Products', 'Transactions', { type: 'Customers', id: 'LIST' }],
        }),

        getAllOrderReturns: builder.query({
            query: (filters = {}) => ({
                url: '/order-returns',
                method: 'GET',
                params: filters,
            }),
            providesTags: ['Orders'],
        }),

        getOrderReturnById: builder.query({
            query: (id: number) => ({
                url: `/order-returns/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Orders', id }],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetAllOrdersQuery,
    useGetOrderByIdQuery,
    useLazyGetOrderByIdQuery,
    useUpdateOrderMutation,
    useCreateOrderReturnMutation,
    useGetAllOrderReturnsQuery,
    useGetOrderReturnByIdQuery,
} = OrderApi;
