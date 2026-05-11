'use client';

import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetAuditLogsQuery } from '@/store/features/auditLogs/auditLogsApi';
import { Activity, ChevronDown, Eye, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

const ACTION_COLORS: Record<string, string> = {
    created: 'bg-green-100 text-green-800',
    updated: 'bg-blue-100 text-blue-800',
    deleted: 'bg-red-100 text-red-800',
    returned: 'bg-amber-100 text-amber-800',
    adjusted: 'bg-purple-100 text-purple-800',
    permission_changed: 'bg-indigo-100 text-indigo-800',
    role_changed: 'bg-cyan-100 text-cyan-800',
};

const ActionBadge = ({ action }: { action: string }) => {
    const cls = ACTION_COLORS[action] || 'bg-gray-100 text-gray-700';
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{action}</span>;
};

const JsonViewer = ({ data, label }: { data: any; label: string }) => {
    const [open, setOpen] = useState(false);
    if (!data || Object.keys(data).length === 0) return <span className="text-xs text-gray-400">-</span>;
    return (
        <div>
            <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                {label} <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <pre className="mt-1 max-h-40 overflow-auto rounded bg-gray-50 p-2 text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

const AuditLogsPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [filterEntityType, setFilterEntityType] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');
    const [detailLog, setDetailLog] = useState<any>(null);

    const queryParams = useMemo(() => {
        const p: Record<string, any> = { page: currentPage, per_page: itemsPerPage };
        if (currentStoreId) p.store_id = currentStoreId;
        if (filterEntityType) p.entity_type = filterEntityType;
        if (filterAction) p.action = filterAction;
        if (filterFrom) p.from = filterFrom;
        if (filterTo) p.to = filterTo;
        return p;
    }, [currentPage, itemsPerPage, currentStoreId, filterEntityType, filterAction, filterFrom, filterTo]);

    const { data, isLoading } = useGetAuditLogsQuery(queryParams, { refetchOnMountOrArgChange: 30 });

    const logs = useMemo(() => {
        const d = data as any;
        if (!d) return [];
        if (Array.isArray(d?.data?.data)) return d.data.data;
        if (Array.isArray(d?.data)) return d.data;
        return [];
    }, [data]);

    const paginationMeta = useMemo(() => {
        const d = data as any;
        return d?.data?.meta || d?.meta || null;
    }, [data]);

    const totalItems = paginationMeta?.total || 0;
    const totalPages = paginationMeta?.last_page || 1;

    const resetFilters = useCallback(() => {
        setFilterEntityType('');
        setFilterAction('');
        setFilterFrom('');
        setFilterTo('');
        setCurrentPage(1);
    }, []);

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'action',
                label: t('audit_action'),
                render: (value) => <ActionBadge action={value} />,
            },
            {
                key: 'entity_type',
                label: t('audit_entity_type'),
                render: (value) => <span className="font-mono text-xs text-gray-700">{value}</span>,
            },
            {
                key: 'entity_label',
                label: t('audit_entity_label'),
                render: (value) => <span className="text-sm text-gray-900">{value || '-'}</span>,
            },
            {
                key: 'actor_name',
                label: t('audit_actor'),
                render: (value) => <span className="text-sm font-medium text-gray-700">{value || t('lbl_system')}</span>,
            },
            {
                key: 'old_values',
                label: t('audit_old_values'),
                render: (value) => <JsonViewer data={value} label={t('audit_view_old')} />,
            },
            {
                key: 'new_values',
                label: t('audit_new_values'),
                render: (value) => <JsonViewer data={value} label={t('audit_view_new')} />,
            },
            {
                key: 'ip_address',
                label: t('audit_ip'),
                render: (value) => <span className="font-mono text-xs text-gray-500">{value || '-'}</span>,
            },
            {
                key: 'created_at',
                label: t('lbl_created'),
                render: (value) => {
                    if (!value) return <span className="text-xs text-gray-400">-</span>;
                    const parts = String(value).split(' ');
                    return (
                        <span className="flex flex-col text-xs text-gray-600">
                            <span>{parts[0]}</span>
                            {parts[1] && <span className="text-gray-400">{parts[1]}</span>}
                        </span>
                    );
                },
            },
        ],
        [t]
    );

    if (isLoading) return <Loader message={t('audit_loading')} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('audit_title')}</h1>
                        <p className="text-sm text-gray-500">{t('audit_desc')}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                        type="text"
                        value={filterEntityType}
                        onChange={(e) => { setFilterEntityType(e.target.value); setCurrentPage(1); }}
                        placeholder={t('audit_filter_entity_type')}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                        type="text"
                        value={filterAction}
                        onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
                        placeholder={t('audit_filter_action')}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                        type="date"
                        value={filterFrom}
                        onChange={(e) => { setFilterFrom(e.target.value); setCurrentPage(1); }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                        type="date"
                        value={filterTo}
                        onChange={(e) => { setFilterTo(e.target.value); setCurrentPage(1); }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
                {(filterEntityType || filterAction || filterFrom || filterTo) && (
                    <button onClick={resetFilters} className="mt-2 text-xs text-gray-500 hover:text-red-600 flex items-center gap-1">
                        <X className="h-3 w-3" /> {t('btn_clear_filters')}
                    </button>
                )}
            </div>

            <ReusableTable
                data={logs}
                columns={columns}
                pagination={{
                    currentPage,
                    totalPages,
                    itemsPerPage,
                    totalItems,
                    onPageChange: setCurrentPage,
                    onItemsPerPageChange: (items) => { setItemsPerPage(items); setCurrentPage(1); },
                }}
                emptyState={{
                    icon: <Activity className="mx-auto h-16 w-16" />,
                    title: t('audit_empty_title'),
                    description: t('audit_empty_desc'),
                }}
            />

            {detailLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="font-bold text-gray-900">{t('audit_detail_title')}</h2>
                            <button onClick={() => setDetailLog(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3 text-sm">
                            <div><strong>{t('audit_action')}:</strong> {detailLog.action}</div>
                            <div><strong>{t('audit_entity_type')}:</strong> {detailLog.entity_type}</div>
                            <div><strong>{t('audit_entity_label')}:</strong> {detailLog.entity_label}</div>
                            <div><strong>{t('audit_actor')}:</strong> {detailLog.actor_name || t('lbl_system')}</div>
                            <div><strong>{t('audit_ip')}:</strong> {detailLog.ip_address || '-'}</div>
                            {detailLog.old_values && Object.keys(detailLog.old_values).length > 0 && (
                                <div>
                                    <strong>{t('audit_old_values')}:</strong>
                                    <pre className="mt-1 rounded bg-gray-50 p-2 text-xs whitespace-pre-wrap">{JSON.stringify(detailLog.old_values, null, 2)}</pre>
                                </div>
                            )}
                            {detailLog.new_values && Object.keys(detailLog.new_values).length > 0 && (
                                <div>
                                    <strong>{t('audit_new_values')}:</strong>
                                    <pre className="mt-1 rounded bg-gray-50 p-2 text-xs whitespace-pre-wrap">{JSON.stringify(detailLog.new_values, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogsPage;
