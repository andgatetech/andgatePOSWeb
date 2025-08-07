import { baseApi } from '@/store/api/baseApi';

const supplierApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        registerSupplier: builder.mutation({
            query: (data) => ({
                url: '/supplier/register',
                method: 'POST',
                body: data,
            }),
        }),
        loginSupplier: builder.mutation({
            query: (data) => ({
                url: '/supplier/login',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const { useRegisterSupplierMutation } = supplierApi;
