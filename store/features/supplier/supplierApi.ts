import { baseApi } from '@/store/api/baseApi';

const supplierApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        registerSupplier: builder.mutation({
            query: (data) => ({
                url: '/suppliers',
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
            query: (params) => ({
                url: '/suppliers',
                method: 'GET',
                params,
            }),
            providesTags: ['Suppliers'],
        }),
        getSingleSupplier: builder.query({
            query: (id) => ({
                url: `/suppliers/${id}`,
                method: 'GET',
            }),
            providesTags: ['Suppliers'],
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
        updateSupplier: builder.mutation({
            query: (data) => ({
                url: `/suppliers/${data.id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Suppliers'],
        }),
        deleteSupplier: builder.mutation({
            query: (id) => ({
                url: `/suppliers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Suppliers'],
        }),
    }),
});

export const {
    useRegisterSupplierMutation,
    useGetSuppliersQuery,
    useGetSingleSupplierQuery,
    useGetSupplierPurchaseQuery,
    useUpdateSupplierPurchaseMutation,
    useLoginSupplierMutation,
    useUpdateSupplierMutation,
    useDeleteSupplierMutation,
} = supplierApi;
