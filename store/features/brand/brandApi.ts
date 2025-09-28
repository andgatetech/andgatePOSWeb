import { baseApi } from '@/store/api/baseApi';

export const brandApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ---------------- Create Brand ----------------
        createBrand: builder.mutation({
            query: (formData) => ({
                url: '/brands',
                method: 'POST',
                body: formData, // formData for file upload
            }),
            invalidatesTags: ['Brand'],
        }),

        // ---------------- Get All Brands ----------------
        getBrands: builder.query({
            query: (params) => ({
                url: '/brands',
                method: 'GET',
                params, // store_id, store_ids, search, etc
            }),
            providesTags: (result) => (result ? [...result.data.map((brand) => ({ type: 'Brand', id: brand.id })), { type: 'Brand', id: 'LIST' }] : [{ type: 'Brand', id: 'LIST' }]),
        }),

        // ---------------- Get Single Brand ----------------
        getBrand: builder.query({
            query: (id) => `/brands/${id}`,
            providesTags: (result, error, id) => [{ type: 'Brand', id }],
        }),

        // ---------------- Update Brand ----------------
        updateBrand: builder.mutation({
            query: ({ id, formData }) => ({
                url: `/brands/${id}`,
                method: 'PUT',
                body: formData, // formData for file upload
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Brand', id }],
        }),

        // ---------------- Delete Brand ----------------
        deleteBrand: builder.mutation({
            query: (id) => ({
                url: `/brands/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Brand', id },
                { type: 'Brand', id: 'LIST' },
            ],
        }),
    }),
    overrideExisting: false,
});

export const { useCreateBrandMutation, useGetBrandsQuery, useGetBrandQuery, useUpdateBrandMutation, useDeleteBrandMutation } = brandApi;
