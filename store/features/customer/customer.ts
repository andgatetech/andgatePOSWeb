import { baseApi } from '@/store/api/baseApi';

const CustomerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
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
            query: ({
                store_id,
                search,
                membership,
                per_page,
                page,
            }: {
                store_id?: number | string;
                search?: string;
                membership?: 'normal' | 'silver' | 'gold' | 'platinum';
                per_page?: number;
                page?: number;
            } = {}) => {
                let params = new URLSearchParams();

                if (store_id) params.append('store_id', String(store_id));
                if (search) params.append('search', search);
                if (membership) params.append('membership', membership);
                if (per_page) params.append('per_page', String(per_page));
                if (page) params.append('page', String(page));

                return {
                    url: `/store/customers?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: (result) =>
                result
                    ? [...result.data.map((customer: any) => ({ type: 'StoreCustomers' as const, id: customer.id })), { type: 'StoreCustomers', id: 'LIST' }]
                    : [{ type: 'StoreCustomers', id: 'LIST' }],
        }),
    }),
    overrideExisting: false,
});

export const { useGetStoreCustomersQuery, useGetStoreCustomersListQuery } = CustomerApi;
