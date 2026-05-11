import { baseApi } from '@/store/api/baseApi';

const auditLogsApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getAuditLogs: builder.query({
            query: (params: Record<string, any> = {}) => ({
                url: '/audit-logs',
                method: 'GET',
                params,
            }),
            providesTags: ['AuditLogs'],
        }),
        getAuditLog: builder.query({
            query: (id: number) => ({
                url: `/audit-logs/${id}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'AuditLogs', id }],
        }),
    }),
});

export const { useGetAuditLogsQuery, useGetAuditLogQuery } = auditLogsApi;
