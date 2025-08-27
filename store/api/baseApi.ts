import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '..';

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://127.0.0.1:8000/api/',
    // credentials: 'include',
    // mode: 'cors',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;

        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }

        //headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');

        return headers;
    },
});

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery,
    tagTypes: ['Stores', 'User', 'Products', 'Orders', 'Purchases', 'Categories', 'Transactions', 'SupplierPurchases'],
    endpoints: () => ({}),
});
