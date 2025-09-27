import { baseApi } from '@/store/api/baseApi';

const CustomerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCustomer: builder.mutation({
            query: (customerData) => ({
                url: '/customers',
                method: 'POST',
                body: customerData,
            }),
            invalidatesTags: [
                { type: 'Customers', id: 'LIST' },
                { type: 'StoreCustomers', id: 'LIST' }, // ✅ ensures store customers list reloads
            ],
        }),
        // Existing endpoint
        getStoreCustomers: builder.query({
            query: ({ search }: { search?: string } = {}) => {
                let url = '/customers';
                if (search) url += `?search=${encodeURIComponent(search)}`;
                return { url, method: 'GET' };
            },
            providesTags: (result) =>
                result ? [...result.data.map((customer: any) => ({ type: 'Customers' as const, id: customer.id })), { type: 'Customers', id: 'LIST' }] : [{ type: 'Customers', id: 'LIST' }],
        }),

        // ✅ New endpoint for /store/customers
        getStoreCustomersList: builder.query({
            query: (params) => ({
                url: '/store/customers',
                method: 'GET',
                params,
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map((customer: any) => ({
                              type: 'StoreCustomers' as const,
                              id: customer.id,
                          })),
                          { type: 'StoreCustomers', id: 'LIST' },
                      ]
                    : [{ type: 'StoreCustomers', id: 'LIST' }],
        }),

        // ✅ Update customer mutation to invalidate store customers list
        updateCustomer: builder.mutation({
            query: ({ customerId, customerData }) => ({
                url: `/customers/${customerId}`,
                method: 'PUT',
                body: customerData,
            }),
            invalidatesTags: (result, error, { customerId }) => [
                { type: 'Customers', id: customerId },
                { type: 'StoreCustomers', id: 'LIST' }, // ✅ ensures store customers list reloads
            ],
        }),
        // ✅ Delete customer mutation to invalidate store customers list
        deleteCustomer: builder.mutation({
            query: (customerId) => ({
                url: `/customers/${customerId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, customerId) => [
                { type: 'Customers', id: customerId },
                { type: 'Customers', id: 'LIST' },
                { type: 'StoreCustomers', id: 'LIST' }, // ✅ ensures store customers list reloads
            ],
        }),
    }),
    overrideExisting: false,
});

export const { useCreateCustomerMutation, useGetStoreCustomersQuery, useGetStoreCustomersListQuery, useUpdateCustomerMutation, useDeleteCustomerMutation } = CustomerApi;
