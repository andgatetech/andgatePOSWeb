import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiBaseUrl } from '@/lib/api-url';

const AFFILIATE_ADMIN_TOKEN_KEY = 'affiliate_admin_token';

export const getAffiliateAdminToken = (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(AFFILIATE_ADMIN_TOKEN_KEY) : null;

export const setAffiliateAdminToken = (token: string): void =>
    localStorage.setItem(AFFILIATE_ADMIN_TOKEN_KEY, token);

export const removeAffiliateAdminToken = (): void =>
    localStorage.removeItem(AFFILIATE_ADMIN_TOKEN_KEY);

export const affiliateAdminApi = createApi({
    reducerPath: 'affiliateAdminApi',
    baseQuery: fetchBaseQuery({
        baseUrl: apiBaseUrl(),
        prepareHeaders: (headers) => {
            const token = getAffiliateAdminToken();
            if (token) headers.set('Authorization', `Bearer ${token}`);
            headers.set('Accept', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['AffAdminStats', 'AffAdminMembers', 'AffAdminLedger', 'AffAdminPayouts', 'AffAdminDemos'],
    endpoints: (builder) => ({
        // ── Auth ────────────────────────────────────────────────────────────
        loginAffiliateAdmin: builder.mutation<{ data: { token: string; admin: any } }, { email: string; password: string }>({
            query: (body) => ({ url: '/affiliate/admin/auth/login', method: 'POST', body }),
        }),

        getAffiliateAdminMe: builder.query<any, void>({
            query: () => '/affiliate/admin/auth/me',
        }),

        changeAffiliateAdminPassword: builder.mutation<any, { current_password: string; password: string; password_confirmation: string }>({
            query: (body) => ({ url: '/affiliate/admin/auth/change-password', method: 'POST', body }),
        }),

        logoutAffiliateAdmin: builder.mutation<any, void>({
            query: () => ({ url: '/affiliate/admin/auth/logout', method: 'POST' }),
        }),

        // ── Panel ────────────────────────────────────────────────────────────
        getAdminStats: builder.query<any, void>({
            query: () => '/affiliate/admin/stats',
            providesTags: ['AffAdminStats'],
        }),

        getAdminMembers: builder.query<any, { page?: number; status?: string; search?: string }>({
            query: (params) => ({ url: '/affiliate/admin/members', params }),
            providesTags: [{ type: 'AffAdminMembers', id: 'LIST' }],
        }),

        approveAdminMember: builder.mutation<any, { id: number; tier_id?: number }>({
            query: ({ id, ...body }) => ({ url: `/affiliate/admin/members/${id}/approve`, method: 'POST', body }),
            invalidatesTags: [{ type: 'AffAdminMembers', id: 'LIST' }, 'AffAdminStats'],
        }),

        suspendAdminMember: builder.mutation<any, number>({
            query: (id) => ({ url: `/affiliate/admin/members/${id}/suspend`, method: 'POST' }),
            invalidatesTags: [{ type: 'AffAdminMembers', id: 'LIST' }],
        }),

        addAdminBonus: builder.mutation<any, { affiliateId: number; amount: number; note?: string }>({
            query: ({ affiliateId, ...body }) => ({ url: `/affiliate/admin/members/${affiliateId}/bonus`, method: 'POST', body }),
            invalidatesTags: ['AffAdminStats', 'AffAdminLedger'],
        }),

        triggerAdminPayout: builder.mutation<any, { affiliateId: number; method: string; account_number: string; transaction_id?: string }>({
            query: ({ affiliateId, ...body }) => ({ url: `/affiliate/admin/members/${affiliateId}/payout`, method: 'POST', body }),
            invalidatesTags: ['AffAdminStats', 'AffAdminPayouts', 'AffAdminLedger', { type: 'AffAdminMembers', id: 'LIST' }],
        }),

        getAdminLedger: builder.query<any, { page?: number }>({
            query: (params) => ({ url: '/affiliate/admin/ledger', params }),
            providesTags: ['AffAdminLedger'],
        }),

        lockAdminCommissions: builder.mutation<any, void>({
            query: () => ({ url: '/affiliate/admin/ledger/lock', method: 'POST' }),
            invalidatesTags: ['AffAdminLedger', 'AffAdminStats'],
        }),

        getAdminPayouts: builder.query<any, { page?: number; status?: string }>({
            query: (params) => ({ url: '/affiliate/admin/payouts', params }),
            providesTags: ['AffAdminPayouts'],
        }),

        markAdminPayoutFailed: builder.mutation<any, { payoutId: number; note?: string }>({
            query: ({ payoutId, ...body }) => ({ url: `/affiliate/admin/payouts/${payoutId}/mark-failed`, method: 'POST', body }),
            invalidatesTags: ['AffAdminPayouts', 'AffAdminLedger'],
        }),

        getAdminDemoBookings: builder.query<any, { page?: number; status?: string }>({
            query: (params) => ({ url: '/affiliate/admin/demo-bookings', params }),
            providesTags: ['AffAdminDemos'],
        }),

        completeAdminDemoBooking: builder.mutation<any, number>({
            query: (id) => ({ url: `/affiliate/admin/demo-bookings/${id}/complete`, method: 'POST' }),
            invalidatesTags: ['AffAdminDemos', 'AffAdminStats'],
        }),

        runAdminTierProgression: builder.mutation<any, void>({
            query: () => ({ url: '/affiliate/admin/tier-progression', method: 'POST' }),
            invalidatesTags: [{ type: 'AffAdminMembers', id: 'LIST' }, 'AffAdminStats'],
        }),
    }),
});

export const {
    useLoginAffiliateAdminMutation,
    useGetAffiliateAdminMeQuery,
    useChangeAffiliateAdminPasswordMutation,
    useLogoutAffiliateAdminMutation,
    useGetAdminStatsQuery,
    useGetAdminMembersQuery,
    useApproveAdminMemberMutation,
    useSuspendAdminMemberMutation,
    useAddAdminBonusMutation,
    useTriggerAdminPayoutMutation,
    useGetAdminLedgerQuery,
    useLockAdminCommissionsMutation,
    useGetAdminPayoutsQuery,
    useMarkAdminPayoutFailedMutation,
    useGetAdminDemoBookingsQuery,
    useCompleteAdminDemoBookingMutation,
    useRunAdminTierProgressionMutation,
} = affiliateAdminApi;
