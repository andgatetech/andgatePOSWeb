import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const AFFILIATE_TOKEN_KEY = 'affiliate_token';

export const getAffiliateToken = (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(AFFILIATE_TOKEN_KEY) : null;

export const setAffiliateToken = (token: string): void =>
    localStorage.setItem(AFFILIATE_TOKEN_KEY, token);

export const removeAffiliateToken = (): void =>
    localStorage.removeItem(AFFILIATE_TOKEN_KEY);

export const affiliatePortalApi = createApi({
    reducerPath: 'affiliatePortalApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
        prepareHeaders: (headers) => {
            const token = getAffiliateToken();
            if (token) headers.set('Authorization', `Bearer ${token}`);
            headers.set('Accept', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['AffiliatePortalStats', 'AffiliatePortalConversions', 'AffiliatePortalLedger', 'AffiliatePortalPayouts', 'AffiliatePortalDemos'],
    endpoints: (builder) => ({
        // ── Auth ────────────────────────────────────────────────────────────
        loginAffiliate: builder.mutation<{ data: { token: string; member: any } }, { mobile: string; password: string }>({
            query: (body) => ({ url: '/affiliate/auth/login', method: 'POST', body }),
        }),

        setAffiliatePassword: builder.mutation<any, { mobile: string; code: string; password: string; password_confirmation: string }>({
            query: (body) => ({ url: '/affiliate/auth/set-password', method: 'POST', body }),
        }),

        getAffiliateMe: builder.query<any, void>({
            query: () => '/affiliate/auth/me',
            providesTags: ['AffiliatePortalStats'],
        }),

        changeAffiliatePassword: builder.mutation<any, { current_password: string; password: string; password_confirmation: string }>({
            query: (body) => ({ url: '/affiliate/auth/change-password', method: 'POST', body }),
        }),

        logoutAffiliate: builder.mutation<any, void>({
            query: () => ({ url: '/affiliate/auth/logout', method: 'POST' }),
        }),

        // ── Portal ───────────────────────────────────────────────────────────
        getPortalDashboard: builder.query<any, void>({
            query: () => '/affiliate/portal/dashboard',
            providesTags: ['AffiliatePortalStats'],
        }),

        getPortalConversions: builder.query<any, { page?: number }>({
            query: (params) => ({ url: '/affiliate/portal/conversions', params }),
            providesTags: [{ type: 'AffiliatePortalConversions', id: 'LIST' }],
        }),

        getPortalLedger: builder.query<any, { page?: number }>({
            query: (params) => ({ url: '/affiliate/portal/ledger', params }),
            providesTags: [{ type: 'AffiliatePortalLedger', id: 'LIST' }],
        }),

        getPortalPayouts: builder.query<any, { page?: number }>({
            query: (params) => ({ url: '/affiliate/portal/payouts', params }),
            providesTags: [{ type: 'AffiliatePortalPayouts', id: 'LIST' }],
        }),

        requestPortalPayout: builder.mutation<any, { method: string; account_number: string }>({
            query: (body) => ({ url: '/affiliate/portal/payout-request', method: 'POST', body }),
            invalidatesTags: ['AffiliatePortalStats', { type: 'AffiliatePortalPayouts', id: 'LIST' }, { type: 'AffiliatePortalLedger', id: 'LIST' }],
        }),

        bookPortalDemo: builder.mutation<any, any>({
            query: (body) => ({ url: '/affiliate/portal/demo-bookings', method: 'POST', body }),
            invalidatesTags: [{ type: 'AffiliatePortalDemos', id: 'LIST' }],
        }),

        getPortalDemoBookings: builder.query<any, { page?: number }>({
            query: (params) => ({ url: '/affiliate/portal/demo-bookings', params }),
            providesTags: [{ type: 'AffiliatePortalDemos', id: 'LIST' }],
        }),

        getPortalSubAffiliates: builder.query<any, { page?: number }>({
            query: (params) => ({ url: '/affiliate/portal/sub-affiliates', params }),
        }),
    }),
});

export const {
    useLoginAffiliateMutation,
    useSetAffiliatePasswordMutation,
    useGetAffiliateMeQuery,
    useChangeAffiliatePasswordMutation,
    useLogoutAffiliateMutation,
    useGetPortalDashboardQuery,
    useGetPortalConversionsQuery,
    useGetPortalLedgerQuery,
    useGetPortalPayoutsQuery,
    useRequestPortalPayoutMutation,
    useBookPortalDemoMutation,
    useGetPortalDemoBookingsQuery,
    useGetPortalSubAffiliatesQuery,
} = affiliatePortalApi;
