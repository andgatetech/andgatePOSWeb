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
        getSupplierPurchase: builder.query({
            query: () => ({
                url: '/supplier/purchases',
                method: 'GET',
            }),
            providesTags: ['SupplierPurchases'], // <-- Correct place for providesTags
        }),
        updateSupplierPurchase: builder.mutation({
            query: (data) => ({
                url: `/purchases/${data.id}/status`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['SupplierPurchases'], // <-- Correct place for invalidatesTags
        }),
    }),
});

export const { useRegisterSupplierMutation, useGetSuppliersQuery, useGetSupplierPurchaseQuery, useUpdateSupplierPurchaseMutation } = supplierApi;
