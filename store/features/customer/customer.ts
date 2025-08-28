import { baseApi } from '@/store/api/baseApi';

const CustomerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStoreCustomers: builder.query({
            query: ({ search }: { search?: string } = {}) => {
                let url = '/customers';
                if (search) url += `?search=${encodeURIComponent(search)}`;
                return { url, method: 'GET' };
            },
            providesTags: (result) =>
                result ? [...result.data.map((customer: any) => ({ type: 'Customers' as const, id: customer.id })), { type: 'Customers', id: 'LIST' }] : [{ type: 'Customers', id: 'LIST' }],
        }),
    }),
    overrideExisting: false,
});

export const { useGetStoreCustomersQuery } = CustomerApi;
