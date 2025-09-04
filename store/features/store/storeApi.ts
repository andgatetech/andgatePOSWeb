import { baseApi } from '@/store/api/baseApi';

const StoreApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        updateStore: builder.mutation({
            query: ({ id, updateData }) => ({
                url: `/stores/${id}`,
                method: 'PUT',
                body: updateData,
            }),
            invalidatesTags: ['Stores'],
        }),
        allStores: builder.query({
            query: () => ({
                url: '/stores',
                method: 'GET',
            }),
        }),
        GetWhoLogin: builder.query({
            query: () => ({
                url: '/user',
                method: 'GET',
            }),
        }),

        getStaffMember: builder.query({
            query: () => ({
                url: '/store/members',
                method: 'GET',
            }),
        }),
        staffRegister: builder.mutation({
            query: (newStaff) => ({
                url: '/staff/register',
                method: 'POST',
                body: newStaff,
            }),
        }),
    }),
});

export const {
    useUpdateStoreMutation,

    useGetWhoLoginQuery,
    useGetStaffMemberQuery,
    useStaffRegisterMutation,
    useAllStoresQuery,
} = StoreApi;
