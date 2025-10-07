import { baseApi } from '@/store/api/baseApi';

const CustomerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCustomer: builder.mutation({
            query: (customerData) => ({
                url: '/customers',
                method: 'POST',
                body: customerData,
            }),
            invalidatesTags: [{ type: 'Customers', id: 'LIST' }],
        }),
        // Existing endpoint
        getStoreCustomers: builder.query({
            query: ({
                store_id,
                search,
            }: {
                store_id?: number | string;
                search?: string;
            } = {}) => {
                let params = new URLSearchParams();

                if (store_id) params.append('store_id', String(store_id));
                if (search) params.append('search', search);

                return {
                    url: `/customers?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: (result) =>
                result ? [...result.data.map((customer: any) => ({ type: 'Customers' as const, id: customer.id })), { type: 'Customers', id: 'LIST' }] : [{ type: 'Customers', id: 'LIST' }],
        }),

        // ✅ Store customers list endpoint for /customers
        getStoreCustomersList: builder.query({

            query: ({
                store_id,
                store_ids,
                search,
                membership,
                per_page,
                page,
            }: {
                store_id?: number | string;
                 store_ids?: number[] | string;
                search?: string;
                membership?: 'normal' | 'silver' | 'gold' | 'platinum';
                per_page?: number;
                page?: number;
            } = {}) => {
                let params = new URLSearchParams();

                if (store_id) params.append('store_id', String(store_id));
                        if (store_ids) {
            // Support both array and string
            const ids = Array.isArray(store_ids) ? store_ids.join(',') : store_ids;
            params.append('store_ids', ids);
        }
                if (search) params.append('search', search);
                if (membership) params.append('membership', membership);
                if (per_page) params.append('per_page', String(per_page));
                if (page) params.append('page', String(page));

                return {
                    url: `/customers?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: (result) =>
                result ? [...result.data.map((customer: any) => ({ type: 'Customers' as const, id: customer.id })), { type: 'Customers', id: 'LIST' }] : [{ type: 'Customers', id: 'LIST' }],

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
                { type: 'Customers', id: 'LIST' },
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
            ],
        }),
    }),
    overrideExisting: true,
});

export const { useCreateCustomerMutation, useGetStoreCustomersQuery, useGetStoreCustomersListQuery, useUpdateCustomerMutation, useDeleteCustomerMutation } = CustomerApi;
