import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { apiBaseUrl } from '@/lib/api-url';
import { clearAuthCookies, clearAuthLocalStorage, isTokenExpired } from '@/lib/auth-session';
import { RootState } from '..';

const rawBaseQuery = fetchBaseQuery({
    baseUrl: apiBaseUrl(),

    // mode: 'cors',
    // credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const { token, tokenExpiresAt } = (getState() as RootState).auth;

        if (token && !isTokenExpired(tokenExpiresAt)) {
            headers.set('authorization', `Bearer ${token}`);
        }

        headers.set('Accept', 'application/json');

        return headers;
    },
});

const subscriptionErrorTypes = new Set([
    'no_subscription',
    'no_active_subscription',
    'subscription_expired',
    'expired',
    'quota_exhausted',
    'feature_not_in_plan',
    'feature_unavailable',
    'subscription_required',
]);

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    const data = result.error?.data as Record<string, any> | undefined;
    const errorType = data?.error_type;

    if (typeof window !== 'undefined' && result.error?.status === 401) {
        api.dispatch({ type: 'auth/logout' });
        clearAuthCookies();
        clearAuthLocalStorage();

        if (!window.location.pathname.includes('/login')) {
            window.location.assign('/login');
        }
    }

    if (
        typeof window !== 'undefined'
        && (result.error?.status === 402 || result.error?.status === 403)
        && typeof errorType === 'string'
        && subscriptionErrorTypes.has(errorType)
        && !window.location.pathname.includes('/subscription')
    ) {
        const params = new URLSearchParams();
        params.set('error_type', errorType);

        if (data?.message) {
            params.set('message', String(data.message));
        }

        const details: Record<string, any> = {};
        ['feature', 'used', 'limit', 'required_permission', 'required_features'].forEach((key) => {
            if (data?.[key] !== undefined) details[key] = data[key];
        });

        if (data?.data && typeof data.data === 'object') {
            Object.assign(details, data.data);
        }

        if (Object.keys(details).length > 0) {
            params.set('details', JSON.stringify(details));
        }

        // Delay redirect to allow redux-persist to flush state before page unloads
        setTimeout(() => {
            window.location.assign(`/subscription?${params.toString()}`);
        }, 100);
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery,
    tagTypes: [
        'Stores',
        'User',
        'Products',
        'Orders',
        'Purchases',
        'Categories',
        'Transactions',
        'SupplierPurchases',
        'Customers',
        'Ledger',
        'ActivityLogs',
        'Expenses',
        'StockAdjustment',
        'Suppliers',
        'Feedback',
        'Journal',
        'Brand',
        'PurchaseOrders',
        'PurchaseDrafts',
        'TaxReport',
        'TransactionReport',
        'IdleProductReport',
        'PurchaseDues',
        'ProductAttributeValues',
        'ProductAttributes',
        'WarrantyTypes',
        'ProductSerials',
        'ProductWarranties',
        'PaymentMethods',
        'Dashboard',
        'Plans',
        'Permissions',
        'Notifications',
        'EcommerceManagement',
        'Roles',
        'AuditLogs',
        'Company',
        'ExportJobs',
        'AccountingCOA',
        'AccountingJournals',
        'AccountingCashBook',
        'AccountingIncome',
        'AccountingReports',
        'AiReports',
        'StockThresholds',
        'AffiliateMembers',
        'AffiliateLedger',
        'AffiliatePayouts',
        'AffiliateConversions',
        'AffiliateDemoBookings',
        'AffiliateStats',
        'ManualPayments',
        'PurchaseReturns',
    ],
    endpoints: () => ({}),
});
