import { baseApi } from '@/store/api/baseApi';
import { logout } from './authSlice';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (userInfo) => ({
                url: '/login',
                method: 'POST',
                body: userInfo,
            }),
        }),
        register: builder.mutation({
            query: (userInfo) => ({
                url: '/register',
                method: 'POST',
                body: userInfo,
            }),
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

        getAllPermissions: builder.query({
            query: () => ({
                url: '/permissions',
                method: 'GET',
            }),
            providesTags: ['Permissions'],
        }),

        updateUserPermission: builder.mutation({
            query: ({ userId, permissionData }) => ({
                url: `/permissions/user/${userId}`,
                method: 'PUT',
                body: permissionData,
            }),
            invalidatesTags: ['Permissions'],
        }),
        getUserPermissions: builder.query({
            query: (userId) => ({
                url: `/permissions/user/${userId}`,
                method: 'GET',
            }),
            providesTags: ['Permissions'],
        }),
        forgotPassword: builder.mutation({
            query: (data: { email: string }) => ({
                url: '/forgot-password',
                method: 'POST',
                body: data,
            }),
        }),
        resetPassword: builder.mutation({
            query: (data: { token: string; email: string; password: string; password_confirmation: string }) => ({
                url: '/reset-password',
                method: 'POST',
                body: data,
            }),
        }),
        changePassword: builder.mutation({
            query: (data: { current_password: string; new_password: string; new_password_confirmation: string }) => ({
                url: '/user/change-password',
                method: 'POST',
                body: data,
            }),
        }),
        getStorePermissions: builder.query({
            query: (storeId: number) => ({
                url: '/auth/permissions',
                params: { store_id: storeId },
            }),
            providesTags: ['Permissions'],
        }),
    }),
    overrideExisting: true,
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetAllLeadsQuery,
    useCreateLeadMutation,
    useUpdateUserMutation,
    useGetAllPermissionsQuery,
    useUpdateUserPermissionMutation,
    useGetUserPermissionsQuery,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useChangePasswordMutation,
    useGetStorePermissionsQuery,
    useLazyGetStorePermissionsQuery,
} = authApi;
