'use client';

import ReusableTable from '@/components/common/ReusableTable';
import DateColumn from '@/components/common/DateColumn';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetAnomaliesQuery } from '@/store/features/aiReports/aiReportsApi';
import { AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';

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

    const anomalies = useMemo(() => data?.data?.anomalies || data?.data || [], [data]);

    const columns = [
        { key: 'type', label: t('lbl_type'), sortable: false },
        { key: 'entity', label: t('lbl_entity'), sortable: false },
        { key: 'value', label: t('lbl_value'), sortable: false },
        { key: 'expected_range', label: t('lbl_expected_range'), sortable: false },
        {
            key: 'severity',
            label: t('lbl_severity'),
            sortable: false,
            render: (row: any) => (
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${SEVERITY_COLORS[row.severity] || 'bg-gray-100 text-gray-600'}`}>
                    {row.severity}
                </span>
            ),
        },
        {
            key: 'detected_at',
            label: t('lbl_detected_at'),
            sortable: false,
            render: (row: any) => <DateColumn date={row.detected_at} />,
        },
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#046ca9] to-[#034d79] px-6 py-5 text-white shadow-lg">
                <AlertTriangle className="h-8 w-8 flex-shrink-0 opacity-90" />
                <div>
                    <h1 className="text-xl font-bold">{t('lbl_anomaly_detection')}</h1>
                    <p className="text-sm opacity-80">{t('lbl_anomaly_detection_desc')}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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

            <ReusableTable
                columns={columns}
                data={anomalies}
                isLoading={isLoading}
                emptyMessage={t('lbl_no_anomalies')}
            />
        </div>
    );
};

export default AnomaliesPage;
