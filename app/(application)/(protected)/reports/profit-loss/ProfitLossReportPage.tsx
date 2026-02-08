'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetProfitLossReportMutation } from '@/store/features/reports/reportApi';
import { ArrowDown, ArrowUp, Banknote, Calendar, MinusCircle, PieChart, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ProfitLossReportPage = () => {
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});

    const [getProfitLossReport, { data: reportData, isLoading }] = useGetProfitLossReportMutation();
    const [getProfitLossReportForExport] = useGetProfitLossReportMutation();

    const lastQueryParams = useRef<string>('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId]);

    // Reset lastQueryParams when store changes to force API recall
    useEffect(() => {
        lastQueryParams.current = '';
    }, [currentStoreId]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getProfitLossReport(queryParams);
        }
    }, [queryParams, currentStoreId, apiParams, getProfitLossReport]);

    const data = useMemo(() => reportData?.data || {}, [reportData]);
    const revenue = useMemo(() => data.revenue || {}, [data]);
    const cogs = useMemo(() => data.cost_of_goods_sold || {}, [data]);
    const grossProfit = useMemo(() => data.gross_profit || {}, [data]);
    const expenses = useMemo(() => data.operating_expenses || {}, [data]);
    const netProfit = useMemo(() => data.net_profit || {}, [data]);
    const monthlyTrend = useMemo(() => data.monthly_trend || [], [data]);
    const period = useMemo(() => data.period || {}, [data]);

    const handleFilterChange = useCallback((n: Record<string, any>) => {
        setApiParams(n);
    }, []);

    const fetchAllDataForExport = useCallback(async (): Promise<any[]> => {
        const exportParams: Record<string, any> = { ...apiParams, export: true };
        if (!exportParams.store_id && !exportParams.store_ids && currentStoreId) exportParams.store_id = currentStoreId;
        try {
            const result = await getProfitLossReportForExport(exportParams).unwrap();
            return result?.data?.monthly_trend || [];
        } catch (e) {
            console.error('Export failed:', e);
            return monthlyTrend;
        }
    }, [apiParams, currentStoreId, monthlyTrend, getProfitLossReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'month_name', label: 'Period', width: 20 },
            { key: 'sales', label: 'Sales', width: 15, format: (v) => formatCurrency(v) },
            { key: 'cogs', label: 'COGS', width: 15, format: (v) => formatCurrency(v) },
            { key: 'gross_profit', label: 'Gross Profit', width: 15, format: (v) => formatCurrency(v) },
            { key: 'expenses', label: 'Expenses', width: 15, format: (v) => formatCurrency(v) },
            { key: 'net_profit', label: 'Net Profit', width: 15, format: (v) => formatCurrency(v) },
        ],
        [formatCurrency]
    );

    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? 'All Stores'
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || 'All Stores'
            : currentStore?.store_name || 'All Stores';
        let dateType = 'none';
        if (apiParams.date_range_type) dateType = apiParams.date_range_type;
        else if (apiParams.start_date || apiParams.end_date) dateType = 'custom';
        return { dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: dateType }, storeName: selectedStore, customFilters: [] };
    }, [apiParams, currentStore, userStores]);

    const exportSummary = useMemo(
        () => [
            { label: 'Total Sales', value: formatCurrency(revenue.total_sales) },
            { label: 'Net Profit', value: formatCurrency(netProfit.amount) },
            { label: 'Profit Margin', value: `${netProfit.margin_percentage || 0}%` },
        ],
        [revenue, netProfit, formatCurrency]
    );

    const trendColumns = useMemo(
        () => [
            {
                key: 'month_name',
                label: 'Period',
                render: (v: any) => (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{v}</span>
                    </div>
                ),
            },
            { key: 'sales', label: 'Sales', render: (v: any) => <span className="font-semibold text-green-600">{formatCurrency(v)}</span> },
            { key: 'cogs', label: 'COGS', render: (v: any) => <span className="font-semibold text-orange-600">{formatCurrency(v)}</span> },
            { key: 'gross_profit', label: 'Gross Profit', render: (v: any) => <span className="font-semibold text-blue-600">{formatCurrency(v)}</span> },
            { key: 'expenses', label: 'Expenses', render: (v: any) => <span className="font-semibold text-red-600">{formatCurrency(v)}</span> },
            {
                key: 'net_profit',
                label: 'Net Profit',
                render: (v: any) => {
                    const p = Number(v) >= 0;
                    return <span className={`font-bold ${p ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(v)}</span>;
                },
            },
        ],
        [formatCurrency]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Profit & Loss Report"
                    reportDescription="View your business financial performance"
                    reportIcon={<TrendingUp className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-emerald-600 to-emerald-700"
                    data={monthlyTrend}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="profit_loss_report"
                    fetchAllData={fetchAllDataForExport}
                />

                <div className="mb-6 mt-6">
                    <BasicReportFilter onFilterChange={handleFilterChange} placeholder="Search..." />
                </div>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                            <p className="mt-4 text-sm text-gray-600">Loading report...</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {period.start_date && (
                            <div className="rounded-lg bg-gray-50 px-4 py-3">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Report Period:</span> {period.start_date || ''} to {period.end_date || ''} ({Math.round(period.days)} days)
                                </p>
                            </div>
                        )}

                        {/* Revenue Section */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-green-100 p-2">
                                        <Banknote className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
                                        <p className="text-sm text-gray-500">Total income from sales</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid gap-4 md:grid-cols-5">
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="text-sm text-gray-500">Total Sales</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.total_sales)}</p>
                                        <p className="mt-1 text-xs text-gray-500">{revenue.total_orders || 0} orders</p>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="text-sm text-gray-500">Discounts</p>
                                        <p className="text-2xl font-bold text-red-600">-{formatCurrency(revenue.total_discount)}</p>
                                    </div>
                                    <div className="rounded-lg bg-orange-50 p-4">
                                        <p className="text-sm text-orange-600">Sales Returns</p>
                                        <p className="text-2xl font-bold text-orange-600">-{formatCurrency(revenue.sales_returns || 0)}</p>
                                        <p className="mt-1 text-xs text-orange-500">
                                            {revenue.return_count || 0} returns | {Number(revenue.return_rate || 0).toFixed(2)}%
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-blue-50 p-4">
                                        <p className="text-sm text-blue-600">Exchange Amount</p>
                                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(revenue.exchange_amount || 0)}</p>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="text-sm text-gray-500">Tax Collected</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.total_tax_collected)}</p>
                                    </div>
                                </div>
                                <div className="mt-4 rounded-lg bg-green-100 p-4">
                                    <p className="text-sm text-green-700">Net Sales</p>
                                    <p className="text-2xl font-bold text-green-700">{formatCurrency(revenue.net_sales)}</p>
                                </div>
                            </div>
                        </div>

                        {/* COGS Section */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-orange-100 p-2">
                                        <MinusCircle className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Cost of Goods Sold</h3>
                                        <p className="text-sm text-gray-500">Direct costs of products sold</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="rounded-lg bg-orange-50 p-4">
                                        <p className="text-sm text-orange-700">Total COGS</p>
                                        <p className="text-2xl font-bold text-orange-700">{formatCurrency(cogs.cogs)}</p>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="text-sm text-gray-500">COGS as % of Sales</p>
                                        <p className="text-2xl font-bold text-gray-900">{cogs.cogs_percentage || 0}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gross Profit */}
                        <div className="overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
                            <div className="px-6 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-blue-100 p-2">
                                            <PieChart className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Gross Profit</h3>
                                            <p className="text-sm text-gray-500">Net Sales - COGS</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-blue-700">{formatCurrency(grossProfit.amount)}</p>
                                        <p className="text-sm text-blue-600">Margin: {grossProfit.margin_percentage || 0}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expenses */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-red-100 p-2">
                                        <ArrowDown className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Operating Expenses</h3>
                                        <p className="text-sm text-gray-500">Business overhead costs</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    <div className="rounded-lg bg-red-50 p-4">
                                        <p className="text-sm text-red-700">Total Expenses</p>
                                        <p className="text-2xl font-bold text-red-700">{formatCurrency(expenses.total)}</p>
                                    </div>
                                    {expenses.by_category && expenses.by_category.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700">By Category:</p>
                                            {expenses.by_category.map((cat: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                                                    <span className="text-sm text-gray-600">{cat.expense_ledger_type}</span>
                                                    <span className="font-semibold text-gray-900">{formatCurrency(cat.total)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Net Profit */}
                        <div
                            className={`overflow-hidden rounded-xl border-2 shadow-lg ${
                                Number(netProfit.amount) >= 0 ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50' : 'border-red-300 bg-gradient-to-r from-red-50 to-rose-50'
                            }`}
                        >
                            <div className="px-6 py-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`rounded-full p-3 ${Number(netProfit.amount) >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                            {Number(netProfit.amount) >= 0 ? <ArrowUp className="h-6 w-6 text-emerald-600" /> : <ArrowDown className="h-6 w-6 text-red-600" />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Net {Number(netProfit.amount) >= 0 ? 'Profit' : 'Loss'}</h3>
                                            <p className="text-sm text-gray-500">Gross Profit - Operating Expenses</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-4xl font-bold ${Number(netProfit.amount) >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(Math.abs(netProfit.amount || 0))}</p>
                                        <p className={`text-sm ${Number(netProfit.amount) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Margin: {netProfit.margin_percentage || 0}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Trend Table */}
                        {monthlyTrend.length > 0 && (
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-purple-100 p-2">
                                            <TrendingUp className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Monthly Trend</h3>
                                            <p className="text-sm text-gray-500">Month-by-month performance breakdown</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <ReusableTable data={monthlyTrend} columns={trendColumns} isLoading={false} emptyState={{ title: 'No trend data available' }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfitLossReportPage;
