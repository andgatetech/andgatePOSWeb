// src/store/features/auth/authApi.ts
import { baseApi } from '@/store/api/baseApi';
import { login, logout } from './authSlice';

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
                    dispatch(login({ user: data.user, token: data.token }));
                } catch (error) { }
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
                    dispatch(login({ user: data.user, token: data.token }));
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
    }),
    overrideExisting: false,
});


export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetAllLeadsQuery, useCreateLeadMutation } = authApi;
