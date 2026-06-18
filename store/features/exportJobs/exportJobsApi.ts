import { baseApi } from '@/store/api/baseApi';

const exportJobsApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        getExportJobs: builder.query({
            query: (params: Record<string, any> = {}) => ({
                url: '/export/jobs',
                method: 'GET',
                params,
            }),
            providesTags: ['ExportJobs'],
        }),
        getExportJobStatus: builder.query({
            query: (id: number) => ({
                url: `/export/jobs/${id}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'ExportJobs', id }],
        }),
        queueExportJob: builder.mutation({
            query: (data: { type: string; store_id?: number; [key: string]: any }) => ({
                url: '/export/jobs',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['ExportJobs'],
        }),
        deleteExportJob: builder.mutation({
            query: (id: number) => ({
                url: `/export/jobs/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ExportJobs'],
        }),
        getBackupStatus: builder.query({
            query: () => ({
                url: '/backup/status',
                method: 'GET',
            }),
        }),
        previewStoreRestore: builder.mutation({
            query: (data: FormData) => ({
                url: '/export/restore/preview',
                method: 'POST',
                body: data,
            }),
        }),
        restoreStoreBackup: builder.mutation({
            query: (data: FormData) => ({
                url: '/export/restore',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['ExportJobs'],
        }),
    }),
});

export const {
    useGetExportJobsQuery,
    useGetExportJobStatusQuery,
    useQueueExportJobMutation,
    useDeleteExportJobMutation,
    useGetBackupStatusQuery,
    usePreviewStoreRestoreMutation,
    useRestoreStoreBackupMutation,
} = exportJobsApi;
