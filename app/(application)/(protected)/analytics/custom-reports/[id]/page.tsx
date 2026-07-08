'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useGetCustomReportByIdQuery, useRunCustomReportMutation } from '@/store/features/analytics/analyticsApi';
import { ArrowLeft, Play } from 'lucide-react';

export default function CustomReportDetailPage() {
    const { t } = getTranslation();
    const router = useRouter();
    const { id } = useParams();
    const { formatCurrency } = useCurrency();
    const reportId = Number(id);

    const { data: reportData, isLoading: reportLoading } = useGetCustomReportByIdQuery(reportId, { skip: !reportId });
    const [runReport, { isLoading: running }] = useRunCustomReportMutation();

    const [result, setResult] = useState<any>(null);

    const report = reportData?.data?.report;

    const handleRun = async () => {
        const res = await runReport({ id: reportId }).unwrap();
        setResult(res.data);
    };

    if (reportLoading) return <p className="text-sm text-gray-500">{t('lbl_loading')}</p>;
    if (!report) return <p className="text-sm text-gray-500">{t('msg_no_data_found')}</p>;

    const columns = result?.columns || report.config?.columns || [];
    const rows = result?.rows || [];
    const summary = result?.summary || {};

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{report.name}</h1>
                        <p className="text-sm text-gray-500 capitalize">{report.report_type}</p>
                    </div>
                </div>
                <button onClick={handleRun} disabled={running} className="btn btn-primary inline-flex items-center gap-2">
                    <Play className="h-4 w-4" /> {running ? t('lbl_running') : t('lbl_run_report')}
                </button>
            </div>

            {report.description && <p className="text-sm text-gray-600">{report.description}</p>}

            {Object.keys(summary).length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    {Object.entries(summary).map(([key, stats]: [string, any]) => (
                        <div key={key} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                            <p className="text-sm text-gray-500">{key}</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(stats.sum)}</p>
                            <p className="text-xs text-gray-500">Avg {formatCurrency(stats.avg)} · {stats.count} rows</p>
                        </div>
                    ))}
                </div>
            )}

            {rows.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                {columns.map((col: string) => (
                                    <th key={col} className="px-4 py-3 font-semibold capitalize">{col.replace(/_/g, ' ')}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((row: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    {columns.map((col: string) => (
                                        <td key={col} className="px-4 py-2">
                                            {typeof row[col] === 'number' ? formatCurrency(row[col]) : (row[col] ?? '-')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-500">{t('msg_no_data_found')}</p>
            )}
        </div>
    );
}
