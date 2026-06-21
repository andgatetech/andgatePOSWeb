import { baseApi } from '@/store/api/baseApi';

const customerItemsFromResult = (result: any): any[] => {
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.data?.items)) return result.data.items;
    if (Array.isArray(result?.items)) return result.items;
    return [];
};

const provideCustomerListTags = (result: any) => {
    const customers = customerItemsFromResult(result);
    return customers.length
        ? [...customers.map((customer: any) => ({ type: 'Customers' as const, id: customer.id })), { type: 'Customers' as const, id: 'LIST' }]
        : [{ type: 'Customers' as const, id: 'LIST' }];
};

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
            providesTags: provideCustomerListTags,
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
                sort_field,
                sort_direction,
            }: {
                store_id?: number | string;
                store_ids?: number[] | string;
                search?: string;
                membership?: 'normal' | 'silver' | 'gold' | 'platinum';
                per_page?: number;
                page?: number;
                sort_field?: string;
                sort_direction?: 'asc' | 'desc';
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
                if (sort_field) params.append('sort_field', sort_field);
                if (sort_direction) params.append('sort_direction', sort_direction);

                return {
                    url: `/customers?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: provideCustomerListTags,
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

        // Get single customer by ID
        getSingleCustomer: builder.query({
            query: (id: string | number) => ({
                url: `/customers/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Customers', id }],
        }),

        // Loyalty points earn/redeem history for a customer
        getCustomerPointTransactions: builder.query({
            query: ({ customerId, page, per_page }: { customerId: string | number; page?: number; per_page?: number }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', String(page));
                if (per_page) params.append('per_page', String(per_page));

                return {
                    url: `/customers/${customerId}/point-transactions?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: (result, error, { customerId }) => [{ type: 'Customers', id: `${customerId}-points` }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useCreateCustomerMutation,
    useGetStoreCustomersQuery,
    useGetStoreCustomersListQuery,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
    useGetSingleCustomerQuery,
    useGetCustomerPointTransactionsQuery,
} = CustomerApi;
