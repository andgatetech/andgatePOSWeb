import { baseApi } from '@/store/api/baseApi';

const companyApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getCompanies: builder.query({
            query: (params: Record<string, any> = {}) => ({
                url: '/company',
                method: 'GET',
                params,
            }),
            providesTags: ['Company'],
        }),
        getCompany: builder.query({
            query: (id: number) => ({
                url: `/company/${id}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Company', id }],
        }),
        getCompanyBranches: builder.query({
            query: (id: number) => ({
                url: `/company/${id}/branches`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Company', id: `branches-${id}` }],
        }),
        createCompany: builder.mutation({
            query: (data: FormData | Record<string, any>) => ({
                url: '/company',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Company'],
        }),
        updateCompany: builder.mutation({
            query: ({ id, data }: { id: number; data: FormData | Record<string, any> }) => {
                if (data instanceof FormData) {
                    data.append('_method', 'PUT');
                    return { url: `/company/${id}`, method: 'POST', body: data };
                }
                return { url: `/company/${id}`, method: 'PUT', body: data };
            },
            invalidatesTags: ['Company'],
        }),
        deleteCompany: builder.mutation({
            query: (id: number) => ({
                url: `/company/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Company'],
        }),
    }),
});

export const {
    useGetCompaniesQuery,
    useGetCompanyQuery,
    useGetCompanyBranchesQuery,
    useCreateCompanyMutation,
    useUpdateCompanyMutation,
    useDeleteCompanyMutation,
} = companyApi;
