import { baseApi } from '@/store/api/baseApi';

const authApi = baseApi.injectEndpoints({
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
                    dispatch(login({ user: data.user, token: data.token }));
                } catch (error) {
                    console.error('Signup failed:', error);
                }
            },
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;

// import { login } from '@/store/features/auth/authSlice';
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const baseApi = createApi({
//     reducerPath: 'baseApi',
//     baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000/api/' }),
//     endpoints: (builder) => ({
//         login: builder.mutation({
//             query: (credentials) => ({
//                 url: 'login',
//                 method: 'POST',
//                 body: credentials,
//             }),
//             async onQueryStarted(_, { dispatch, queryFulfilled }) {
//                 try {
//                     const { data } = await queryFulfilled;
//                     dispatch(login({ user: data.user, token: data.token }));
//                 } catch (error) {
//                     console.error('Login failed:', error);
//                 }
//             },
//         }),
//         register: builder.mutation({
//             query: (credentials) => ({
//                 url: 'register',
//                 method: 'POST',
//                 body: credentials,
//             }),
//             async onQueryStarted(_, { dispatch, queryFulfilled }) {
//                 try {
//                     const { data } = await queryFulfilled;
//                     dispatch(login({ user: data.user, token: data.token }));
//                 } catch (error) {
//                     console.error('Signup failed:', error);
//                 }
//             },
//         }),
//     }),
// });

// export const { useLoginMutation, useRegisterMutation } = baseApi;
