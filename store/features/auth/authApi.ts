import { baseApi } from '@/store/api/baseApi';
import { login, logout, setUser } from './authSlice';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (userInfo) => ({
                url: '/login',
                method: 'POST',
                body: userInfo,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;

                    const { user, token } = data;

                    dispatch(login({ user, token }));
                } catch (error) {
                    console.error('Login failed:', error);
                }
            },
        }),
        register: builder.mutation({
            query: (userInfo) => ({
                url: '/register',
                method: 'POST',
                body: userInfo,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;

                    const { user, token } = data;

                    dispatch(login({ user, token }));
                } catch (error) {
                    console.error('Registration failed:', error);
                }
            },
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(logout());
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            },
        }),
        getAllLeads: builder.query({
            query: () => ({
                url: '/leads/all',
                method: 'GET',
            }),
        }),
        createLead: builder.mutation({
            query: (leadData) => ({
                url: '/leads/create',
                method: 'POST',
                body: leadData,
            }),
        }),
        updateUser: builder.mutation({
            query: (userData) => ({
                url: '/user/update',
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        getUserInfo: builder.query({
            query: () => ({
                url: '/user',
                method: 'GET',
            }),
            providesTags: ['User'],
        }),
        getAllPermissions: builder.query({
            query: () => ({
                url: '/permissions/all',
                method: 'GET',
            }),
        }),
        updateUserPermission: builder.mutation({
            query: ({ userId, permissionData }) => ({
                url: `/permissions/${userId}/update`,
                method: 'PUT',
                body: permissionData,
                invalidatesTags: ['Permissions'],
            }),
        }),
        getUserPermissions: builder.query({
            query: (userId) => ({
                url: `/permissions/${userId}`,
                method: 'GET',
                providesTags: ['Permissions'],
            }),
        }),
    }),
    overrideExisting: true,
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetAllLeadsQuery, useCreateLeadMutation, useUpdateUserMutation, useGetUserInfoQuery,useGetAllPermissionsQuery,useUpdateUserPermissionMutation, useGetUserPermissionsQuery} = authApi;
