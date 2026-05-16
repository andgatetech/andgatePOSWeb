import { baseApi } from '@/store/api/baseApi';

export const affiliateApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // ── Public ──────────────────────────────────────────────────────────

        registerAffiliate: builder.mutation({
            query: (body) => ({ url: '/affiliate/register', method: 'POST', body }),
            invalidatesTags: [{ type: 'AffiliateMembers', id: 'LIST' }],
        }),

        getAffiliateCalculator: builder.query<any, { tier: string; monthly_fee: number; customers: number }>({
            query: (params) => ({ url: '/affiliate/calculator', params }),
        }),

        getAffiliateLeaderboard: builder.query<any, void>({
            query: () => '/affiliate/leaderboard',
        }),

        // ── Affiliate Portal (auth) ──────────────────────────────────────────

        getAffiliateDashboard: builder.query<any, void>({
            query: () => '/affiliate/dashboard',
            providesTags: ['AffiliateStats'],
        }),

        getAffiliateConversions: builder.query<any, { page?: number }>({
            query: (params) => ({ url: '/affiliate/conversions', params }),
            providesTags: [{ type: 'AffiliateConversions', id: 'LIST' }],
        }),

        getAffiliateLedger: builder.query<any, { page?: number }>({
            query: (params) => ({ url: '/affiliate/ledger', params }),
            providesTags: [{ type: 'AffiliateLedger', id: 'LIST' }],
        }),

        getAffiliatePayouts: builder.query<any, { page?: number }>({
            query: (params) => ({ url: '/affiliate/payouts', params }),
            providesTags: [{ type: 'AffiliatePayouts', id: 'LIST' }],
        }),

        requestAffiliatePayout: builder.mutation({
            query: (body) => ({ url: '/affiliate/payout-request', method: 'POST', body }),
            invalidatesTags: ['AffiliateStats', { type: 'AffiliatePayouts', id: 'LIST' }, { type: 'AffiliateLedger', id: 'LIST' }],
        }),

        bookAffiliateDemo: builder.mutation({
            query: (body) => ({ url: '/affiliate/demo-bookings', method: 'POST', body }),
            invalidatesTags: [{ type: 'AffiliateDemoBookings', id: 'LIST' }],
        }),

        getAffiliateDemoBookings: builder.query<any, { page?: number }>({
            query: (params) => ({ url: '/affiliate/demo-bookings', params }),
            providesTags: [{ type: 'AffiliateDemoBookings', id: 'LIST' }],
        }),

        // ── Admin ────────────────────────────────────────────────────────────

        getAffiliateStats: builder.query<any, void>({
            query: () => '/admin/affiliate/stats',
            providesTags: ['AffiliateStats'],
        }),

        getAffiliateMembers: builder.query<any, { page?: number; status?: string; tier?: string; search?: string }>({
            query: (params) => ({ url: '/admin/affiliate/members', params }),
            providesTags: (result) =>
                result?.data?.data
                    ? [...result.data.data.map((m: any) => ({ type: 'AffiliateMembers' as const, id: m.id })), { type: 'AffiliateMembers', id: 'LIST' }]
                    : [{ type: 'AffiliateMembers', id: 'LIST' }],
        }),

        getAffiliateMember: builder.query<any, number>({
            query: (id) => `/admin/affiliate/members/${id}`,
            providesTags: (_, __, id) => [{ type: 'AffiliateMembers', id }],
        }),

        approveAffiliateMember: builder.mutation<any, { id: number; tier_id?: number }>({
            query: ({ id, ...body }) => ({ url: `/admin/affiliate/members/${id}/approve`, method: 'POST', body }),
            invalidatesTags: (_, __, { id }) => [{ type: 'AffiliateMembers', id }, { type: 'AffiliateMembers', id: 'LIST' }, 'AffiliateStats'],
        }),

        suspendAffiliateMember: builder.mutation<any, number>({
            query: (id) => ({ url: `/admin/affiliate/members/${id}/suspend`, method: 'POST' }),
            invalidatesTags: (_, __, id) => [{ type: 'AffiliateMembers', id }, { type: 'AffiliateMembers', id: 'LIST' }],
        }),

        updateAffiliateMemberTier: builder.mutation<any, { id: number; tier_id: number }>({
            query: ({ id, ...body }) => ({ url: `/admin/affiliate/members/${id}/tier`, method: 'PUT', body }),
            invalidatesTags: (_, __, { id }) => [{ type: 'AffiliateMembers', id }],
        }),

        getAdminAffiliateLedger: builder.query<any, { page?: number; affiliate_id?: number; status?: string; type?: string }>({
            query: (params) => ({ url: '/admin/affiliate/ledger', params }),
            providesTags: [{ type: 'AffiliateLedger', id: 'LIST' }],
        }),

        lockAffiliateCommissions: builder.mutation<any, void>({
            query: () => ({ url: '/admin/affiliate/ledger/lock', method: 'POST' }),
            invalidatesTags: [{ type: 'AffiliateLedger', id: 'LIST' }, 'AffiliateStats'],
        }),

        addAffiliateBonus: builder.mutation<any, { affiliateId: number; amount: number; note?: string }>({
            query: ({ affiliateId, ...body }) => ({ url: `/admin/affiliate/members/${affiliateId}/bonus`, method: 'POST', body }),
            invalidatesTags: [{ type: 'AffiliateLedger', id: 'LIST' }, 'AffiliateStats'],
        }),

        getAdminAffiliatePayouts: builder.query<any, { page?: number; status?: string }>({
            query: (params) => ({ url: '/admin/affiliate/payouts', params }),
            providesTags: [{ type: 'AffiliatePayouts', id: 'LIST' }],
        }),

        triggerAffiliatePayout: builder.mutation<any, { affiliateId: number; method: string; account_number: string; transaction_id?: string }>({
            query: ({ affiliateId, ...body }) => ({ url: `/admin/affiliate/members/${affiliateId}/payout`, method: 'POST', body }),
            invalidatesTags: [{ type: 'AffiliatePayouts', id: 'LIST' }, { type: 'AffiliateLedger', id: 'LIST' }, 'AffiliateStats', { type: 'AffiliateMembers', id: 'LIST' }],
        }),

        markAffiliatePayoutFailed: builder.mutation<any, { payoutId: number; note?: string }>({
            query: ({ payoutId, ...body }) => ({ url: `/admin/affiliate/payouts/${payoutId}/mark-failed`, method: 'POST', body }),
            invalidatesTags: [{ type: 'AffiliatePayouts', id: 'LIST' }, { type: 'AffiliateLedger', id: 'LIST' }],
        }),

        getAdminDemoBookings: builder.query<any, { page?: number; status?: string; affiliate_id?: number }>({
            query: (params) => ({ url: '/admin/affiliate/demo-bookings', params }),
            providesTags: [{ type: 'AffiliateDemoBookings', id: 'LIST' }],
        }),

        completeDemoBooking: builder.mutation<any, number>({
            query: (id) => ({ url: `/admin/affiliate/demo-bookings/${id}/complete`, method: 'POST' }),
            invalidatesTags: [{ type: 'AffiliateDemoBookings', id: 'LIST' }, 'AffiliateStats'],
        }),

        runAffiliateTierProgression: builder.mutation<any, void>({
            query: () => ({ url: '/admin/affiliate/tier-progression', method: 'POST' }),
            invalidatesTags: [{ type: 'AffiliateMembers', id: 'LIST' }, 'AffiliateStats'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useRegisterAffiliateMutation,
    useGetAffiliateCalculatorQuery,
    useGetAffiliateLeaderboardQuery,
    useGetAffiliateDashboardQuery,
    useGetAffiliateConversionsQuery,
    useGetAffiliateLedgerQuery,
    useGetAffiliatePayoutsQuery,
    useRequestAffiliatePayoutMutation,
    useBookAffiliateDemoMutation,
    useGetAffiliateDemoBookingsQuery,
    useGetAffiliateStatsQuery,
    useGetAffiliateMembersQuery,
    useGetAffiliateMemberQuery,
    useApproveAffiliateMemberMutation,
    useSuspendAffiliateMemberMutation,
    useUpdateAffiliateMemberTierMutation,
    useGetAdminAffiliateLedgerQuery,
    useLockAffiliateCommissionsMutation,
    useAddAffiliateBonusMutation,
    useGetAdminAffiliatePayoutsQuery,
    useTriggerAffiliatePayoutMutation,
    useMarkAffiliatePayoutFailedMutation,
    useGetAdminDemoBookingsQuery,
    useCompleteDemoBookingMutation,
    useRunAffiliateTierProgressionMutation,
} = affiliateApi;
