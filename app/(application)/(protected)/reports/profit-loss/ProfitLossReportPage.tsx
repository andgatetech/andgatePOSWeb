'use client';

import ReportPageLayout from '@/app/(application)/(protected)/reports/_shared/ReportPageLayout';
import ReusableTable from '@/components/common/ReusableTable';
import BasicReportFilter from '@/components/filters/reports/BasicReportFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetProfitLossReportMutation } from '@/store/features/reports/reportApi';
import { ArrowDown, ArrowUp, Banknote, Calendar, MinusCircle, PieChart, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ProfitLossReportPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});

    const [getProfitLossReport, { data: reportData, isLoading }] = useGetProfitLossReportMutation();

    const lastQueryParams = useRef<string>('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getProfitLossReport(queryParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParams]);

    const data = useMemo(() => reportData?.data || {}, [reportData]);
    const revenue = useMemo(() => data.revenue || {}, [data]);
    const cogs = useMemo(() => data.cost_of_goods_sold || {}, [data]);
    const grossProfit = useMemo(() => data.gross_profit || {}, [data]);
    const expenses = useMemo(() => data.operating_expenses || {}, [data]);
    const netProfit = useMemo(() => data.net_profit || {}, [data]);
    const monthlyTrend = useMemo(() => data.monthly_trend || [], [data]);
    const period = useMemo(() => data.period || {}, [data]);

    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
    }, []);

    const formatCurrency = (value: number) => `৳${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Monthly trend table columns
    const trendColumns = useMemo(
        () => [
            {
                key: 'month_name',
                label: 'Period',
                render: (value: any) => (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{value}</span>
                    </div>
                ),
            },
            { key: 'sales', label: 'Sales', render: (value: any) => <span className="font-semibold text-green-600">{formatCurrency(value)}</span> },
            { key: 'cogs', label: 'COGS', render: (value: any) => <span className="font-semibold text-orange-600">{formatCurrency(value)}</span> },
            { key: 'gross_profit', label: 'Gross Profit', render: (value: any) => <span className="font-semibold text-blue-600">{formatCurrency(value)}</span> },
            { key: 'expenses', label: 'Expenses', render: (value: any) => <span className="font-semibold text-red-600">{formatCurrency(value)}</span> },
            {
                key: 'net_profit',
                label: 'Net Profit',
                render: (value: any) => {
                    const isProfit = Number(value) >= 0;
                    return <span className={`font-bold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(value)}</span>;
                },
            },
        ],
        []
    );

    return (
        <ReportPageLayout
            title="Profit & Loss Report"
            description="View your business financial performance"
            icon={<TrendingUp className="h-6 w-6 text-white" />}
            iconBgClass="bg-gradient-to-r from-emerald-600 to-emerald-700"
        >
            <div className="mb-6">
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
                    {/* Period Info */}
                    {period.start_date && (
                        <div className="rounded-lg bg-gray-50 px-4 py-3">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Report Period:</span> {new Date(period.start_date).toLocaleDateString('en-GB')} to {new Date(period.end_date).toLocaleDateString('en-GB')}{' '}
                                ({Math.round(period.days)} days)
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
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">Total Sales</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.total_sales)}</p>
                                    <p className="mt-1 text-xs text-gray-500">{revenue.total_orders || 0} orders</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">Discounts</p>
                                    <p className="text-2xl font-bold text-red-600">-{formatCurrency(revenue.total_discount)}</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">Tax Collected</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.total_tax_collected)}</p>
                                </div>
                                <div className="rounded-lg bg-green-100 p-4">
                                    <p className="text-sm text-green-700">Net Sales</p>
                                    <p className="text-2xl font-bold text-green-700">{formatCurrency(revenue.net_sales)}</p>
                                </div>
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
        </ReportPageLayout>
    );
};

export default ProfitLossReportPage;
