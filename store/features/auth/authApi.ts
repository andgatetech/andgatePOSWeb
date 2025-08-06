import { baseApi } from '@/store/api/baseApi';
import { login } from './authSlice';


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

