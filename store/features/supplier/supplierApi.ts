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
        getSuppliers: builder.query({
            query: () => ({
                url: '/suppliers',
                method: 'GET',
            }),
        }),
    }),
});

export const { useRegisterSupplierMutation, useGetSuppliersQuery } = supplierApi;
