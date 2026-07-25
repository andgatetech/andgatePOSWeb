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

// "No/expired subscription" states are now handled in-place by SubscriptionGate
// (driven by redux user.subscription_user — no network round-trip needed), which
// keeps the sidebar mounted. Only genuine active-subscription gaps (hit a plan's
// quota/feature ceiling) still need this hard-navigate upsell — those aren't
// covered by SubscriptionGate since the subscription itself is active.
const upsellErrorTypes = new Set(['quota_exhausted', 'feature_not_in_plan', 'feature_unavailable']);

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    const data =
        typeof result.error?.data === 'object' && result.error.data !== null
            ? (result.error.data as Record<string, any>)
            : undefined;
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
        && upsellErrorTypes.has(errorType)
        && !window.location.pathname.includes('/subscription')
        && !window.location.pathname.includes('/manual-payments')
        && !window.location.pathname.includes('/dashboard')
        && !window.location.pathname.includes('/ecommerce')
        // 2026-07-25: expense-create loads Chart of Accounts (Professional+) for an
        // OPTIONAL category dropdown — ExpenseCreatePage already renders fine without
        // it (coaAccounts.length > 0 && ...) and coa_account_id isn't required on
        // submit. That non-essential background call was hard-navigating Starter
        // users away from the expense form before they could even see it, for a
        // feature the form doesn't actually need. Same class of problem already
        // fixed for /dashboard and /ecommerce above.
        && !window.location.pathname.includes('/expenses')
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
        'StoreMfsAccounts',
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
        'ProductStock',
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
        'RunningBusinessMigration',
        'AiReports',
        'StockThresholds',
        'Stock',
        'AffiliateMembers',
        'AffiliateLedger',
        'AffiliatePayouts',
        'AffiliateConversions',
        'AffiliateDemoBookings',
        'AffiliateStats',
        'Coupons',
        'ManualPayments',
        'PurchaseReturns',
        'BusinessOS',
        'CashDrawer',
        'Payroll',
        'SalaryAdvance',
        'FestivalBonus',
        'Leave',
        'Holiday',
        'Shift',
        'EmployeeDocument',
        'StockTransfer',
        'BankAccounts',
        'BankTransactions',
        'CustomReports',
        'ScheduledReports',
        'DashboardLayout',
    ],
    endpoints: () => ({}),
});
