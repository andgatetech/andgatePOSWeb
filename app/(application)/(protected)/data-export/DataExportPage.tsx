'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import {
    useDeleteExportJobMutation,
    useGetBackupStatusQuery,
    useGetExportJobsQuery,
    usePreviewStoreRestoreMutation,
    useQueueExportJobMutation,
    useRestoreStoreBackupMutation,
} from '@/store/features/exportJobs/exportJobsApi';
import { RootState } from '@/store';
import { AlertTriangle, Clock, Database, Download, FileArchive, FileDown, HardDrive, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const ExportTypeCard = ({ icon, title, desc, onExport, onQueue, isQueuing, isDownloading }: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    onExport: () => void;
    onQueue: () => void;
    isQueuing: boolean;
    isDownloading: boolean;
}) => {
    const { t } = getTranslation();
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="mt-0.5 text-sm text-gray-500">{desc}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={onExport}
                            disabled={isDownloading}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                        >
                            {isDownloading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Download className="h-3.5 w-3.5" />}
                            {t('export_download_now')}
                        </button>
                        <button
                            type="button"
                            onClick={onQueue}
                            disabled={isQueuing}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                            {isQueuing ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" /> : <Clock className="h-3.5 w-3.5" />}
                            {t('export_queue_job')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const JobStatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-800',
        processing: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
    };
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
};

const DataExportPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const token = useSelector((state: RootState) => state.auth.token);
    const [queuingType, setQueuingType] = useState<string | null>(null);
    const [downloadingType, setDownloadingType] = useState<string | null>(null);
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [restorePreview, setRestorePreview] = useState<any>(null);
    const [confirmPhrase, setConfirmPhrase] = useState('');

    const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs } = useGetExportJobsQuery(currentStoreId ? { store_id: currentStoreId } : {}, { refetchOnMountOrArgChange: 30 });
    const { data: backupData } = useGetBackupStatusQuery(undefined, { refetchOnMountOrArgChange: 60 });
    const [queueJob] = useQueueExportJobMutation();
    const [deleteJob] = useDeleteExportJobMutation();
    const [previewRestore, { isLoading: isPreviewingRestore }] = usePreviewStoreRestoreMutation();
    const [restoreBackup, { isLoading: isRestoringBackup }] = useRestoreStoreBackupMutation();

    const jobs = useMemo(() => {
        const d = jobsData as any;
        if (!d) return [];
        if (Array.isArray(d?.data?.jobs)) return d.data.jobs;
        if (Array.isArray(d?.data?.data)) return d.data.data;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    }, [jobsData]);

    const backupStatus = useMemo(() => {
        const d = backupData as any;
        return d?.data || d || null;
    }, [backupData]);

    const fetchBlobDownload = useCallback(async (url: string, filename: string, accept = 'text/csv') => {
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}`, Accept: accept },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
    }, [token]);

    const handleDirectExport = useCallback(async (type: string) => {
        setDownloadingType(type);
        try {
            const params = new URLSearchParams();
            if (currentStoreId) params.set('store_id', String(currentStoreId));
            await fetchBlobDownload(`${API_BASE}/api/export/${type}?${params.toString()}`, `${type}.csv`);
        } catch {
            showErrorDialog(t('export_queue_failed_title'), t('export_queue_failed_desc'));
        } finally {
            setDownloadingType(null);
        }
    }, [currentStoreId, fetchBlobDownload, t]);

    const handleQueueExport = useCallback(async (type: string) => {
        setQueuingType(type);
        try {
            const payload: { type: string; store_id?: number } = { type };
            if (currentStoreId) payload.store_id = currentStoreId;
            await queueJob(payload).unwrap();
            showSuccessDialog(t('export_queued_title'), t('export_queued_desc'));
            refetchJobs();
        } catch {
            showErrorDialog(t('export_queue_failed_title'), t('export_queue_failed_desc'));
        } finally {
            setQueuingType(null);
        }
    }, [currentStoreId, queueJob, refetchJobs, t]);

    const handleDeleteJob = useCallback(async (job: any) => {
        try {
            await deleteJob(job.id).unwrap();
        } catch {
            showErrorDialog(t('export_delete_failed_title'), t('export_delete_failed_desc'));
        }
    }, [deleteJob, t]);

    const handleDownloadJob = useCallback(async (job: any) => {
        try {
            const extension = job.type === 'full_backup' ? 'json' : 'csv';
            const accept = job.type === 'full_backup' ? 'application/json' : 'text/csv';
            await fetchBlobDownload(`${API_BASE}/api/export/jobs/${job.id}/download`, `export-job-${job.id}.${extension}`, accept);
        } catch {
            showErrorDialog(t('export_download_failed_title'), t('export_download_failed_desc'));
        }
    }, [fetchBlobDownload, t]);

    const buildRestoreFormData = useCallback(() => {
        if (!restoreFile || !currentStoreId) return null;
        const fd = new FormData();
        fd.append('store_id', String(currentStoreId));
        fd.append('backup_file', restoreFile);
        return fd;
    }, [currentStoreId, restoreFile]);

    const handlePreviewRestore = useCallback(async () => {
        const fd = buildRestoreFormData();
        if (!fd) {
            showErrorDialog(t('export_restore_missing_title'), t('export_restore_missing_desc'));
            return;
        }

        try {
            const result = await previewRestore(fd).unwrap();
            setRestorePreview((result as any)?.data || result);
            setConfirmPhrase('');
        } catch (error: any) {
            showErrorDialog(t('export_restore_invalid_title'), error?.data?.message || t('export_restore_invalid_desc'));
            setRestorePreview(null);
        }
    }, [buildRestoreFormData, previewRestore, t]);

    const handleRestoreBackup = useCallback(async () => {
        const fd = buildRestoreFormData();
        if (!fd || !restorePreview) {
            showErrorDialog(t('export_restore_missing_title'), t('export_restore_preview_first'));
            return;
        }

        fd.append('confirm_phrase', confirmPhrase);

        try {
            const result = await restoreBackup(fd).unwrap();
            setRestorePreview((result as any)?.data || restorePreview);
            showSuccessDialog(t('export_restore_success_title'), t('export_restore_success_desc'));
            setRestoreFile(null);
            setConfirmPhrase('');
            refetchJobs();
        } catch (error: any) {
            showErrorDialog(t('export_restore_failed_title'), error?.data?.message || t('export_restore_failed_desc'));
        }
    }, [buildRestoreFormData, confirmPhrase, refetchJobs, restoreBackup, restorePreview, t]);

    const exportTypes = useMemo(() => [
        { type: 'products', title: t('export_products_title'), desc: t('export_products_desc'), icon: <FileDown className="h-5 w-5" /> },
        { type: 'customers', title: t('export_customers_title'), desc: t('export_customers_desc'), icon: <FileDown className="h-5 w-5" /> },
        { type: 'orders', title: t('export_orders_title'), desc: t('export_orders_desc'), icon: <FileDown className="h-5 w-5" /> },
        { type: 'suppliers', title: t('export_suppliers_title'), desc: t('export_suppliers_desc'), icon: <FileDown className="h-5 w-5" /> },
    ], [t]);

    const jobColumns: TableColumn[] = useMemo(
        () => [
            {
                key: 'type',
                label: t('export_type'),
                render: (value) => <span className="font-mono text-xs font-medium text-gray-800">{value === 'full_backup' ? t('export_full_backup_title') : value}</span>,
            },
            {
                key: 'status',
                label: t('lbl_status'),
                render: (value) => <JobStatusBadge status={value} />,
            },
            {
                key: 'row_count',
                label: t('export_row_count'),
                render: (value) => <span className="text-sm text-gray-700">{value ?? '-'}</span>,
            },
            {
                key: 'requested_at',
                label: t('export_requested_at'),
                render: (value) => <span className="text-xs text-gray-500">{value ? String(value).split('.')[0].replace('T', ' ') : '-'}</span>,
            },
            {
                key: 'completed_at',
                label: t('export_completed_at'),
                render: (value) => <span className="text-xs text-gray-500">{value ? String(value).split('.')[0].replace('T', ' ') : '-'}</span>,
            },
        ],
        [t]
    );

    const jobActions: TableAction[] = useMemo(
        () => [
            {
                label: t('btn_download'),
                icon: <Download className="h-4 w-4" />,
                className: 'text-gray-700',
                hidden: (row) => row.status !== 'completed',
                onClick: handleDownloadJob,
            },
            {
                label: t('btn_delete'),
                icon: <Trash2 className="h-4 w-4" />,
                className: 'text-danger',
                onClick: handleDeleteJob,
            },
        ],
        [handleDownloadJob, handleDeleteJob, t]
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Database className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('export_title')}</h1>
                        <p className="text-sm text-gray-500">{t('export_desc')}</p>
                    </div>
                </div>
            </div>

            {backupStatus && (
                <div className={`flex items-center gap-3 rounded-xl border p-4 ${backupStatus.status === 'success' ? 'border-green-200 bg-green-50' : backupStatus.status === 'failed' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                    <HardDrive className={`h-5 w-5 shrink-0 ${backupStatus.status === 'success' ? 'text-green-600' : backupStatus.status === 'failed' ? 'text-red-600' : 'text-gray-500'}`} />
                    <div>
                        <p className="text-sm font-medium text-gray-900">{t('export_backup_status')}: <span className="capitalize">{backupStatus.status || t('lbl_unknown')}</span></p>
                        {backupStatus.at && <p className="text-xs text-gray-500">{t('export_last_backup')}: {backupStatus.at}</p>}
                        {backupStatus.message && <p className="text-xs text-gray-500">{backupStatus.message}</p>}
                    </div>
                </div>
            )}

            <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                <div className="rounded-xl border border-[#046ca9]/20 bg-[#046ca9]/5 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#046ca9] text-white">
                                <FileArchive className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">{t('export_full_backup_title')}</h2>
                                <p className="mt-1 text-sm text-gray-600">{t('export_full_backup_desc')}</p>
                                <p className="mt-2 text-xs font-medium text-[#034d79]">{t('export_full_backup_hint')}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleQueueExport('full_backup')}
                            disabled={queuingType === 'full_backup' || !currentStoreId}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#046ca9] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#034d79] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {queuingType === 'full_backup' ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FileArchive className="h-4 w-4" />}
                            {t('export_queue_full_backup')}
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <RotateCcw className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-sm font-semibold text-gray-900">{t('export_restore_title')}</h2>
                            <p className="mt-1 text-sm text-gray-600">{t('export_restore_desc')}</p>
                            <div className="mt-3 space-y-3">
                                <input
                                    type="file"
                                    accept="application/json,.json"
                                    onChange={(event) => {
                                        setRestoreFile(event.target.files?.[0] || null);
                                        setRestorePreview(null);
                                        setConfirmPhrase('');
                                    }}
                                    className="block w-full text-xs text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-amber-700"
                                />
                                <button
                                    type="button"
                                    onClick={handlePreviewRestore}
                                    disabled={!restoreFile || isPreviewingRestore || !currentStoreId}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isPreviewingRestore ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                                    {t('export_restore_preview')}
                                </button>
                                {restorePreview && (
                                    <div className="rounded-lg border border-amber-200 bg-white p-3">
                                        <p className="text-xs font-semibold text-gray-900">
                                            {t('export_restore_preview_ready')}: {restorePreview.row_count || 0} {t('export_rows')} / {restorePreview.table_count || 0} {t('export_tables')}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">{t('export_restore_confirm_help')}</p>
                                        <input
                                            type="text"
                                            value={confirmPhrase}
                                            onChange={(event) => setConfirmPhrase(event.target.value)}
                                            placeholder={restorePreview.confirm_phrase || 'RESTORE MY STORE'}
                                            className="mt-2 w-full rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-gray-800 focus:border-amber-500 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRestoreBackup}
                                            disabled={isRestoringBackup || confirmPhrase !== restorePreview.confirm_phrase}
                                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isRestoringBackup ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <RotateCcw className="h-3.5 w-3.5" />}
                                            {t('export_restore_now')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div>
                <h2 className="mb-3 text-sm font-semibold text-gray-700">{t('export_instant_section')}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    {exportTypes.map(({ type, title, desc, icon }) => (
                        <ExportTypeCard
                            key={type}
                            icon={icon}
                            title={title}
                            desc={desc}
                            onExport={() => handleDirectExport(type)}
                            onQueue={() => handleQueueExport(type)}
                            isQueuing={queuingType === type}
                            isDownloading={downloadingType === type}
                        />
                    ))}
                </div>
            </div>

            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">{t('export_jobs_section')}</h2>
                    <button onClick={() => refetchJobs()} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary">
                        <RefreshCw className="h-3.5 w-3.5" />
                        {t('btn_refresh')}
                    </button>
                </div>
                <ReusableTable
                    data={jobs}
                    columns={jobColumns}
                    actions={jobActions}
                    emptyState={{
                        icon: <Clock className="mx-auto h-16 w-16" />,
                        title: t('export_jobs_empty_title'),
                        description: t('export_jobs_empty_desc'),
                    }}
                />
            </div>
        </div>
    );
};

export default DataExportPage;
