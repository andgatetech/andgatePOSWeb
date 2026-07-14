import { baseApi } from '@/store/api/baseApi';

export type RunningBusinessMigrationChecklist = {
    business_profile: boolean;
    opening_cash_bank: boolean;
    opening_stock: boolean;
    customer_receivables: boolean;
    supplier_payables: boolean;
    opening_expenses_liabilities: boolean;
    owner_equity: boolean;
    review_ready: boolean;
};

export type RunningBusinessMigrationStatus = {
    configured: boolean;
    status: 'not_started' | 'draft' | 'in_progress' | 'ready' | 'posted' | 'cancelled';
    migration_date: string | null;
    current_step: keyof RunningBusinessMigrationChecklist;
    checklist: RunningBusinessMigrationChecklist;
    step_data: Record<string, any>;
    notes: string | null;
    completed_at: string | null;
    opening_balance: {
        configured: boolean;
        status: 'not_configured' | 'draft' | 'posted' | 'reversed';
        opening_date: string | null;
    };
};

export type SaveRunningBusinessMigrationPayload = {
    store_id: number;
    migration_date?: string | null;
    status?: 'draft' | 'in_progress';
    current_step?: keyof RunningBusinessMigrationChecklist;
    checklist?: Partial<RunningBusinessMigrationChecklist>;
    step_data?: Record<string, any>;
    notes?: string | null;
};

const runningBusinessMigrationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getRunningBusinessMigration: builder.query<{ data: RunningBusinessMigrationStatus }, { store_id: number }>({
            query: (params) => ({
                url: '/accounting/running-business-migration',
                method: 'GET',
                params,
            }),
            providesTags: (_result, _error, arg) => [{ type: 'RunningBusinessMigration', id: arg.store_id }],
        }),
        saveRunningBusinessMigration: builder.mutation<{ data: RunningBusinessMigrationStatus }, SaveRunningBusinessMigrationPayload>({
            query: (body) => ({
                url: '/accounting/running-business-migration',
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [{ type: 'RunningBusinessMigration', id: arg.store_id }],
        }),
        markRunningBusinessMigrationReady: builder.mutation<{ data: RunningBusinessMigrationStatus }, { store_id: number }>({
            query: (body) => ({
                url: '/accounting/running-business-migration/ready',
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [{ type: 'RunningBusinessMigration', id: arg.store_id }],
        }),
        postRunningBusinessOpeningBalance: builder.mutation<{ data: any }, { store_id: number }>({
            query: (body) => ({
                url: '/accounting/running-business-migration/post-opening-balance',
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'RunningBusinessMigration', id: arg.store_id },
                'AccountingJournals',
                'AccountingReports',
                'AccountingCashBook',
            ],
        }),
    }),
});

export const {
    useGetRunningBusinessMigrationQuery,
    useSaveRunningBusinessMigrationMutation,
    useMarkRunningBusinessMigrationReadyMutation,
    usePostRunningBusinessOpeningBalanceMutation,
} = runningBusinessMigrationApi;
