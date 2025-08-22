import { baseApi } from "@/store/api/baseApi";



const StoreApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createStore: builder.mutation({
            query: (newStore: any) => ({
                url: '/stores',
                method: 'POST',
                body: newStore,
            }),
            invalidatesTags: ['Stores'],
        }),

        getAllStores: builder.query({
            query: () => ({
                url: '/stores',
                method: 'GET',
            }),
            providesTags: ['Stores'],
        }),

        getStoreById: builder.query({
            query: (id) => ({
                url: `/stores/${id}`,
                method: 'GET',
            }),
            providesTags: ['Stores'],
        }),

        updateStore: builder.mutation({
            query: ({ id, updateData }) => ({
                url: `/stores/${id}`,
                method: 'PUT',
                body: updateData,
            }),
            invalidatesTags: ['Stores'],
        }),

        deleteStore: builder.mutation({
            query: (id) => ({
                url: `/stores/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Stores'],
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

export const { useCreateStoreMutation, useGetAllStoresQuery, useGetStoreByIdQuery, useUpdateStoreMutation, useDeleteStoreMutation, useGetWhoLoginQuery , useGetStaffMemberQuery, useStaffRegisterMutation } = StoreApi;
