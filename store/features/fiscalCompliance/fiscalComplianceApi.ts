import { baseApi } from '@/store/api/baseApi';

export interface FiscalDashboardRequest {
    store_id: number;
    period?: string;
}

export const fiscalComplianceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFiscalComplianceDashboard: builder.mutation({
            query: (data: FiscalDashboardRequest) => ({
                url: '/fiscal-compliance/dashboard',
                method: 'POST',
                body: data,
            }),
        }),
        registerFiscalDevice: builder.mutation({
            query: (data: Record<string, any>) => ({
                url: '/fiscal-compliance/devices/register',
                method: 'POST',
                body: data,
            }),
        }),
        closeFiscalPeriod: builder.mutation({
            query: (data: FiscalDashboardRequest) => ({
                url: '/fiscal-compliance/periods/close',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useGetFiscalComplianceDashboardMutation,
    useRegisterFiscalDeviceMutation,
    useCloseFiscalPeriodMutation,
} = fiscalComplianceApi;
