'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import DateColumn from '@/components/common/DateColumn';
import ReusableTable from '@/components/common/ReusableTable';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetAnomaliesQuery } from '@/store/features/aiReports/aiReportsApi';
import { AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

const SEVERITY_COLORS: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
};

const AnomaliesPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [severity, setSeverity] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const params = useMemo(() => {
        const p: Record<string, any> = {};
        if (currentStoreId) p.store_id = currentStoreId;
        if (severity) p.severity = severity;
        if (startDate) p.start_date = startDate;
        if (endDate) p.end_date = endDate;
        return p;
    }, [currentStoreId, severity, startDate, endDate]);

    const { data, isLoading } = useGetAnomaliesQuery(params, { skip: !currentStoreId });

    const anomalies = useMemo(() => data?.data?.flags || data?.data || [], [data]);
    const severityCounts = useMemo(
        () => anomalies.reduce((acc: Record<string, number>, item: any) => {
            const key = item.severity || 'low';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {}),
        [anomalies]
    );

    const getDetectedAt = (row: any) => row.meta?.created_at || row.meta?.adjusted_at || row.detected_at || '';

    const exportColumns = useMemo<ExportColumn[]>(
        () => [
            { key: 'type', label: t('lbl_type'), width: 18 },
            { key: 'message', label: t('lbl_description'), width: 42 },
            { key: 'severity', label: t('lbl_severity'), width: 12, format: (value) => value ? t(`lbl_urgency_${value}`) : '' },
            { key: 'meta', label: t('lbl_detected_at'), width: 18, format: (_value, row) => getDetectedAt(row) },
        ],
        [t]
    );

    const exportSummary = useMemo(
        () => [
            { label: t('lbl_total_items'), value: anomalies.length },
            { label: t('lbl_critical'), value: severityCounts.critical || 0 },
            { label: t('lbl_high'), value: severityCounts.high || 0 },
            { label: t('lbl_medium'), value: severityCounts.medium || 0 },
        ],
        [anomalies.length, severityCounts.critical, severityCounts.high, severityCounts.medium, t]
    );

    const columns = [
        { key: 'type', label: t('lbl_type'), sortable: false },
        { key: 'message', label: t('lbl_description'), sortable: false },
        {
            key: 'severity',
            label: t('lbl_severity'),
            sortable: false,
            render: (_value: any, row: any) => (
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${SEVERITY_COLORS[row.severity] || 'bg-gray-100 text-gray-600'}`}>
                    {t(`lbl_urgency_${row.severity}`)}
                </span>
            ),
        },
        {
            key: 'meta',
            label: t('lbl_detected_at'),
            sortable: false,
            render: (_value: any, row: any) => <DateColumn date={getDetectedAt(row)} />,
        },
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <AlertTriangle className="h-6 w-6" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{t('lbl_anomaly_detection')}</h1>
                        <p className="text-sm text-slate-500">{t('lbl_anomaly_detection_desc')}</p>
                    </div>
                </div>
                <ReportExportToolbar
                    reportTitle={t('lbl_anomaly_detection')}
                    reportDescription={t('lbl_anomaly_detection_desc')}
                    data={anomalies}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={{
                        dateRange: { startDate, endDate, type: startDate || endDate ? 'custom' : 'none' },
                        customFilters: severity ? [{ label: t('lbl_severity'), value: t(`lbl_urgency_${severity}`) }] : [],
                    }}
                    fileName="anomaly_detection"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
                <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="">{t('lbl_all_severities')}</option>
                    <option value="low">{t('lbl_low')}</option>
                    <option value="medium">{t('lbl_medium')}</option>
                    <option value="high">{t('lbl_high')}</option>
                    <option value="critical">{t('lbl_critical')}</option>
                </select>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">{t('lbl_total_items')}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{anomalies.length}</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-semibold uppercase text-red-600">{t('lbl_critical')}</p>
                    <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        {severityCounts.critical || 0}
                    </p>
                </div>
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <p className="text-xs font-semibold uppercase text-orange-700">{t('lbl_high')}</p>
                    <p className="mt-1 text-2xl font-bold text-orange-800">{severityCounts.high || 0}</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-xs font-semibold uppercase text-green-700">{t('lbl_safe')}</p>
                    <p className="mt-1 flex items-center gap-2 text-2xl font-bold text-green-800">
                        <ShieldCheck className="h-5 w-5" />
                        {anomalies.length === 0 ? t('lbl_safe') : severityCounts.low || 0}
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <ReusableTable
                    columns={columns}
                    data={anomalies}
                    isLoading={isLoading}
                    emptyMessage={t('lbl_no_anomalies')}
                />
            </div>
        </div>
    );
};

export default AnomaliesPage;
