'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetArAgingReportMutation } from '@/store/features/reports/reportApi';
import { useEffect, useMemo, useState } from 'react';

interface AgingRow {
    customer_id: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    bucket_0_30: number;
    bucket_31_60: number;
    bucket_61_90: number;
    bucket_91_plus: number;
    total_due: number;
    total_paid: number;
    total_remaining: number;
    open_due_count: number;
}

interface AgingSummary {
    bucket_0_30: number;
    bucket_31_60: number;
    bucket_61_90: number;
    bucket_91_plus: number;
    total_remaining: number;
    total_customers: number;
}

const BucketBadge = ({ value, variant }: { value: number; variant: 'green' | 'yellow' | 'orange' | 'red' }) => {
    const { formatCurrency } = useCurrency();
    if (!value) return <span className="text-gray-300">—</span>;
    const colors = {
        green:  'bg-green-50 text-green-700',
        yellow: 'bg-yellow-50 text-yellow-700',
        orange: 'bg-orange-50 text-orange-700',
        red:    'bg-red-50 text-red-700',
    };
    return (
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${colors[variant]}`}>
            {formatCurrency(value)}
        </span>
    );
};

const ArAgingReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId } = useCurrentStore();

    const [asOfDate, setAsOfDate] = useState('');
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState<AgingRow[]>([]);
    const [summary, setSummary] = useState<AgingSummary | null>(null);
    const [reportAsOf, setReportAsOf] = useState('');

    const [getArAging, { isLoading }] = useGetArAgingReportMutation();

    const exportColumns = useMemo<ExportColumn[]>(
        () => [
            { key: 'customer_name', label: 'Customer', width: 18 },
            { key: 'customer_phone', label: 'Phone', width: 15 },
            { key: 'open_due_count', label: 'Open Dues', width: 9 },
            { key: 'bucket_0_30', label: '0-30 Days', width: 11, format: (value) => formatCurrency(Number(value) || 0) },
            { key: 'bucket_31_60', label: '31-60 Days', width: 11, format: (value) => formatCurrency(Number(value) || 0) },
            { key: 'bucket_61_90', label: '61-90 Days', width: 11, format: (value) => formatCurrency(Number(value) || 0) },
            { key: 'bucket_91_plus', label: '91+ Days', width: 11, format: (value) => formatCurrency(Number(value) || 0) },
            { key: 'total_due', label: 'Total Due', width: 12, format: (value) => formatCurrency(Number(value) || 0) },
            { key: 'total_paid', label: 'Paid', width: 11, format: (value) => formatCurrency(Number(value) || 0) },
            { key: 'total_remaining', label: 'Outstanding', width: 13, format: (value) => formatCurrency(Number(value) || 0) },
        ],
        [formatCurrency]
    );

    const fetchReport = async () => {
        if (!currentStoreId) return;
        const payload: any = { store_id: currentStoreId };
        if (asOfDate) payload.as_of_date = asOfDate;
        if (search.trim()) payload.search = search.trim();

        try {
            const res = await getArAging(payload).unwrap();
            setRows(res?.data?.rows ?? []);
            setSummary(res?.data?.summary ?? null);
            setReportAsOf(res?.data?.as_of ?? '');
        } catch {
            setRows([]);
            setSummary(null);
        }
    };

    useEffect(() => {
        if (currentStoreId) fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStoreId]);

    const buckets = [
        { key: 'bucket_0_30',    label: '0–30 days',  variant: 'green'  as const },
        { key: 'bucket_31_60',   label: '31–60 days', variant: 'yellow' as const },
        { key: 'bucket_61_90',   label: '61–90 days', variant: 'orange' as const },
        { key: 'bucket_91_plus', label: '91+ days',   variant: 'red'    as const },
    ];

    const exportSummary = useMemo(
        () => summary
            ? [
                { label: '0-30 Days', value: formatCurrency(summary.bucket_0_30) },
                { label: '31-60 Days', value: formatCurrency(summary.bucket_31_60) },
                { label: '61-90 Days', value: formatCurrency(summary.bucket_61_90) },
                { label: '91+ Days', value: formatCurrency(summary.bucket_91_plus) },
                { label: 'Total Outstanding', value: formatCurrency(summary.total_remaining) },
                { label: 'Customers', value: summary.total_customers },
            ]
            : [],
        [formatCurrency, summary]
    );

    const exportFilters = useMemo(
        () => ({
            customFilters: [
                { label: 'As of', value: reportAsOf || 'Today' },
                ...(search.trim() ? [{ label: 'Search', value: search.trim() }] : []),
            ],
        }),
        [reportAsOf, search]
    );

    return (
        <div className="space-y-5 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">A/R Aging Report</h1>
                    {reportAsOf && (
                        <p className="text-xs text-gray-400 mt-0.5">As of {reportAsOf}</p>
                    )}
                </div>
                <ReportExportToolbar
                    reportTitle="A/R Aging Report"
                    reportDescription="Customer outstanding balance by due age"
                    data={rows}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={exportFilters}
                    fileName="ar_aging_report"
                    fetchAllData={async () => {
                        if (!currentStoreId) return rows;
                        const payload: any = { store_id: currentStoreId };
                        if (asOfDate) payload.as_of_date = asOfDate;
                        if (search.trim()) payload.search = search.trim();
                        const res = await getArAging(payload).unwrap();
                        return res?.data?.rows ?? [];
                    }}
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex-1 min-w-[180px]">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">As of Date</label>
                    <input
                        type="date"
                        value={asOfDate}
                        onChange={(e) => setAsOfDate(e.target.value)}
                        className="form-input w-full rounded-lg border-gray-200 py-2 text-sm"
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Search Customer</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchReport()}
                        placeholder="Name or phone..."
                        className="form-input w-full rounded-lg border-gray-200 py-2 text-sm"
                    />
                </div>
                <button
                    type="button"
                    onClick={fetchReport}
                    disabled={isLoading}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-primary/90"
                >
                    {isLoading ? 'Loading...' : 'Run Report'}
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {buckets.map((b) => {
                        const val = summary[b.key as keyof AgingSummary] as number;
                        const colors = {
                            green:  'border-green-200 bg-green-50 text-green-700',
                            yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
                            orange: 'border-orange-200 bg-orange-50 text-orange-700',
                            red:    'border-red-200 bg-red-50 text-red-700',
                        };
                        return (
                            <div key={b.key} className={`rounded-xl border p-3 ${colors[b.variant]}`}>
                                <p className="text-xs font-semibold opacity-70">{b.label}</p>
                                <p className="mt-1 text-lg font-black">{formatCurrency(val)}</p>
                            </div>
                        );
                    })}
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-primary">
                        <p className="text-xs font-semibold opacity-70">Total Outstanding</p>
                        <p className="mt-1 text-lg font-black">{formatCurrency(summary.total_remaining)}</p>
                        <p className="text-xs opacity-60">{summary.total_customers} customers</p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3 text-right">0–30 days</th>
                            <th className="px-4 py-3 text-right">31–60 days</th>
                            <th className="px-4 py-3 text-right">61–90 days</th>
                            <th className="px-4 py-3 text-right">91+ days</th>
                            <th className="px-4 py-3 text-right">Total Due</th>
                            <th className="px-4 py-3 text-right">Paid</th>
                            <th className="px-4 py-3 text-right font-bold text-gray-700">Outstanding</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading && (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-sm text-gray-400">Loading...</td>
                            </tr>
                        )}
                        {!isLoading && rows.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-sm text-gray-400">
                                    No outstanding receivables found.
                                </td>
                            </tr>
                        )}
                        {rows.map((row) => (
                            <tr key={row.customer_id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-gray-800">{row.customer_name}</p>
                                    <p className="text-xs text-gray-400">{row.customer_phone}</p>
                                    <p className="text-xs text-gray-300">{row.open_due_count} open due{row.open_due_count !== 1 ? 's' : ''}</p>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <BucketBadge value={Number(row.bucket_0_30)} variant="green" />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <BucketBadge value={Number(row.bucket_31_60)} variant="yellow" />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <BucketBadge value={Number(row.bucket_61_90)} variant="orange" />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <BucketBadge value={Number(row.bucket_91_plus)} variant="red" />
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600">
                                    {formatCurrency(row.total_due)}
                                </td>
                                <td className="px-4 py-3 text-right text-green-600">
                                    {formatCurrency(row.total_paid)}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-red-600">
                                    {formatCurrency(row.total_remaining)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {rows.length > 0 && summary && (
                        <tfoot>
                            <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                                <td className="px-4 py-3 text-xs uppercase tracking-wider text-gray-500">Totals</td>
                                <td className="px-4 py-3 text-right text-green-700">{formatCurrency(summary.bucket_0_30)}</td>
                                <td className="px-4 py-3 text-right text-yellow-700">{formatCurrency(summary.bucket_31_60)}</td>
                                <td className="px-4 py-3 text-right text-orange-700">{formatCurrency(summary.bucket_61_90)}</td>
                                <td className="px-4 py-3 text-right text-red-700">{formatCurrency(summary.bucket_91_plus)}</td>
                                <td className="px-4 py-3 text-right text-gray-700">—</td>
                                <td className="px-4 py-3 text-right text-gray-700">—</td>
                                <td className="px-4 py-3 text-right text-red-700">{formatCurrency(summary.total_remaining)}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default ArAgingReportPage;
