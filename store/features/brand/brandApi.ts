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
            providesTags: (result) =>
                result?.data?.items && Array.isArray(result.data.items)
                    ? [...result.data.items.map((brand: any) => ({ type: 'Brand', id: brand.id })), { type: 'Brand', id: 'LIST' }]
                    : [{ type: 'Brand', id: 'LIST' }],
        }),

        // ---------------- Get Single Brand ----------------
        getBrand: builder.query({
            query: (id) => `/brands/${id}`,
            providesTags: (result, error, id) => [{ type: 'Brand', id }],
        }),

        // ---------------- Update Brand ----------------
        updateBrand: builder.mutation({
            query: ({ id, formData }) => {
                formData.append('_method', 'PUT'); // ✅ Important for Laravel
                return {
                    url: `/brands/${id}`,
                    method: 'POST', // ✅ Laravel will treat it as PUT
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { id }) => [{ type: 'Brand', id }],
        }),

        // Archive is the default lifecycle action; permanent removal is explicit.
        archiveBrand: builder.mutation({
            query: ({ id, archive_reason }: { id: number; archive_reason?: string }) => ({ url: `/brands/${id}/archive`, method: 'PATCH', body: { archive_reason } }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Brand', id }, { type: 'Brand', id: 'LIST' }],
        }),
        safeDeleteBrand: builder.mutation({
            query: (id: number) => ({ url: `/brands/${id}/safe-delete`, method: 'POST' }),
            invalidatesTags: (result, error, id) => [{ type: 'Brand', id }, { type: 'Brand', id: 'LIST' }],
        }),
        // Backward-compatible hook name: DELETE now archives on the API.
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
        // ---------------- Get Brand Count by Store ----------------
        getBrandCountByStore: builder.query({
            query: (store_id) => ({
                url: `/brands/count`,
                method: 'GET',
                params: { store_id }, // Send as query param ?store_id=1
            }),
            providesTags: [{ type: 'Brand', id: 'COUNT' }],
        }),
        getTopBrandsByStock: builder.query({
            query: (store_id) => ({
                url: `/brands/top-in-stock`,
                method: 'GET',
                params: { store_id }, // Send as query param ?store_id=1
            }),
            providesTags: [{ type: 'Brand', id: 'COUNT' }],
        }),
        getTopPerformerBrands: builder.query({
            query: ({ store_id, start_date, end_date }) => ({
                url: `/brands/top-performers`,
                method: 'GET',
                params: { store_id, start_date, end_date }, // Send as query param ?store_id=1
            }),
            providesTags: [{ type: 'Brand', id: 'COUNT' }],
        }),
    }),
    overrideExisting: true,
});

export const {
    useCreateBrandMutation,
    useGetBrandsQuery,
    useGetBrandQuery,
    useUpdateBrandMutation,
    useArchiveBrandMutation,
    useSafeDeleteBrandMutation,
    useDeleteBrandMutation,
    useGetBrandCountByStoreQuery,
    useGetTopBrandsByStockQuery,
    useGetTopPerformerBrandsQuery,
} = brandApi;
