import { baseApi } from '@/store/api/baseApi';

const CustomerDueApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCustomerDues: builder.query({
            query: (params: any = {}) => ({
                url: '/customer-dues',
                method: 'GET',
                params,
            }),
            providesTags: ['Orders'],
        }),
        getCustomerDueById: builder.query({
            query: (id: number | string) => ({
                url: `/customer-dues/${id}`,
                method: 'GET',
            }),
            providesTags: ['Orders'],
        }),
        collectCustomerDuePayment: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/customer-dues/${id}/payment`,
                method: 'POST',
                body: {
                    store_id: data.store_id,
                    payment_amount: data.amount,
                    payment_method: data.payment_method || 'cash',
                    note: data.note,
                    reference_no: data.reference_no,
                },
            }),
            invalidatesTags: ['Orders'],
        }),
        clearCustomerDue: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/customer-dues/${id}/clear`,
                method: 'POST',
                body: {
                    store_id: data.store_id,
                    payment_method: data.payment_method || 'cash',
                    note: data.note,
                    reference_no: data.reference_no,
                },
            }),
            invalidatesTags: ['Orders'],
        }),
    }),
});

export const {
    useGetCustomerDuesQuery,
    useGetCustomerDueByIdQuery,
    useCollectCustomerDuePaymentMutation,
    useClearCustomerDueMutation,
} = CustomerDueApi;
