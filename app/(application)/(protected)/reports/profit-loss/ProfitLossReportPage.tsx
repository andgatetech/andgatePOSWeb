'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetProfitLossReportMutation } from '@/store/features/reports/reportApi';
import {
    ArrowDown,
    ArrowUp,
    Banknote,
    CalendarDays,
    ChevronDown,
    CircleDollarSign,
    Minus,
    Package,
    Percent,
    Receipt,
    ShoppingCart,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CountUp from 'react-countup';

// ─── Types ───────────────────────────────────────────────────────────────────

type PeriodType = 'today' | 'weekly' | 'monthly' | 'yearly' | 'custom';

const periodOptions: { value: PeriodType; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'yearly', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AnimatedCurrency = ({ value, symbol }: { value: number; symbol: string }) => (
    <span>
        {symbol}
        <CountUp end={value} duration={1.5} decimals={2} separator="," />
    </span>
);

// ─── Period Filter Dropdown ──────────────────────────────────────────────────

const PeriodFilter = ({
    period,
    onPeriodChange,
    customStart,
    customEnd,
    onStartChange,
    onEndChange,
    onApply,
    label,
}: {
    period: PeriodType;
    onPeriodChange: (p: PeriodType) => void;
    customStart: string;
    customEnd: string;
    onStartChange: (d: string) => void;
    onEndChange: (d: string) => void;
    onApply: () => void;
    label: string;
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
            >
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span>{label}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                    <div className="space-y-0.5">
                        {periodOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onPeriodChange(opt.value);
                                    if (opt.value !== 'custom') setOpen(false);
                                }}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                    period === opt.value ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <CalendarDays className="h-4 w-4" />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {period === 'custom' && (
                        <div className="mt-2 space-y-2 border-t border-gray-100 px-1 pt-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">Start</label>
                                <input type="date" value={customStart} onChange={(e) => onStartChange(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">End</label>
                                <input type="date" value={customEnd} onChange={(e) => onEndChange(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                            </div>
                            <button
                                onClick={() => { onApply(); setOpen(false); }}
                                disabled={!customStart || !customEnd}
                                className="mt-1 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Apply Range
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Quick Summary Card ──────────────────────────────────────────────────────

const SummaryCard = ({
    icon: Icon,
    iconBg,
    iconColor,
    label,
    sublabel,
    value,
    symbol,
    valueColor,
}: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    label: string;
    sublabel: string;
    value: number;
    symbol: string;
    valueColor: string;
}) => (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-400">{sublabel}</p>
                <p className={`text-xl font-bold ${valueColor}`}>
                    <AnimatedCurrency value={value} symbol={symbol} />
                </p>
                <p className="truncate text-[11px] text-gray-400">{label}</p>
            </div>
        </div>
    </div>
);

// ─── Calculation Step ────────────────────────────────────────────────────────

const CalcStep = ({
    step,
    icon: Icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    value,
    symbol,
    valueColor,
    operation,
}: {
    step: number;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    value: number;
    symbol: string;
    valueColor: string;
    operation?: '-' | '=';
}) => (
    <>
        {operation && (
            <div className="flex justify-center py-1">
                <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        operation === '-' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'
                    }`}
                >
                    {operation === '-' ? <Minus className="h-3 w-3" /> : '='}
                </div>
            </div>
        )}
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">{step}</span>
                    <span className="text-sm font-semibold text-gray-700">{title}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-gray-400">{subtitle}</p>
            </div>
            <p className={`flex-shrink-0 text-lg font-bold ${valueColor}`}>
                <AnimatedCurrency value={value} symbol={symbol} />
            </p>
        </div>
    </>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const ProfitLossReportPage = () => {
    const { formatCurrency, symbol } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();

    const [period, setPeriod] = useState<PeriodType>('monthly');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [appliedStart, setAppliedStart] = useState('');
    const [appliedEnd, setAppliedEnd] = useState('');

    const [getProfitLossReport, { data: reportData, isLoading, isError }] = useGetProfitLossReportMutation();
    const [getProfitLossReportForExport] = useGetProfitLossReportMutation();

    const lastQueryRef = useRef<string>('');

    // Build POST body params
    const bodyParams = useMemo(() => {
        const params: Record<string, any> = {};
        if (currentStoreId) params.store_id = currentStoreId;
        if (period === 'custom' && appliedStart && appliedEnd) {
            params.period = 'custom';
            params.start_date = appliedStart;
            params.end_date = appliedEnd;
        } else if (period !== 'custom') {
            params.period = period;
        }
        return params;
    }, [currentStoreId, period, appliedStart, appliedEnd]);

    // Reset on store change
    useEffect(() => {
        lastQueryRef.current = '';
    }, [currentStoreId]);

    // Trigger mutation when params change
    useEffect(() => {
        const key = JSON.stringify(bodyParams);
        if (lastQueryRef.current === key) return;
        if (currentStoreId) {
            lastQueryRef.current = key;
            getProfitLossReport(bodyParams);
        }
    }, [bodyParams, currentStoreId, getProfitLossReport]);

    const handleApplyCustom = () => {
        setAppliedStart(customStart);
        setAppliedEnd(customEnd);
    };

    const getPeriodLabel = () => {
        if (period === 'custom' && appliedStart && appliedEnd) return `${appliedStart} — ${appliedEnd}`;
        return periodOptions.find((o) => o.value === period)?.label || 'This Month';
    };

    // Data
    const data = useMemo(() => reportData?.data || {}, [reportData]);
    const income = useMemo(() => data.income || {}, [data]);
    const cost = useMemo(() => data.cost || {}, [data]);
    const productProfit = useMemo(() => data.product_profit || {}, [data]);
    const expenses = useMemo(() => data.expenses || {}, [data]);
    const businessProfit = useMemo(() => data.business_profit || {}, [data]);
    const summary = useMemo(() => data.summary || {}, [data]);
    const periodInfo = useMemo(() => data.period || {}, [data]);

    const isProfit = Number(businessProfit.amount) >= 0;

    // Export helpers
    const exportColumns: ExportColumn[] = useMemo(() => [
        { key: 'item', label: 'Item', width: 30 },
        { key: 'amount', label: 'Amount', width: 20 },
    ], []);

    const filterSummary = useMemo(() => {
        const storeName = currentStore?.store_name || 'All Stores';
        // Map our period values to what ReportExportToolbar expects
        const typeMap: Record<string, string> = { today: 'today', weekly: 'this_week', monthly: 'this_month', yearly: 'this_year', custom: 'custom' };
        const mappedType = typeMap[period] || 'none';
        // Only pass dates for custom range to avoid parseSafeDate errors
        const startDate = period === 'custom' && periodInfo.start_date ? periodInfo.start_date : undefined;
        const endDate = period === 'custom' && periodInfo.end_date ? periodInfo.end_date : undefined;
        return { dateRange: { startDate, endDate, type: mappedType }, storeName, customFilters: [] };
    }, [currentStore, periodInfo, period]);

    const exportSummary = useMemo(() => [
        { label: 'You Earned', value: formatCurrency(summary.you_earned) },
        { label: 'You Keep', value: formatCurrency(summary.you_keep) },
        { label: 'Business Margin', value: `${businessProfit.margin || 0}%` },
    ], [summary, businessProfit, formatCurrency]);

    const fetchAllDataForExport = useCallback(async (): Promise<any[]> => {
        const exportParams: Record<string, any> = { ...bodyParams, export: true };
        try {
            const result = await getProfitLossReportForExport(exportParams).unwrap();
            const d = result?.data || {};
            return [
                { item: 'Total Sales', amount: formatCurrency(d.income?.total_sales) },
                { item: 'Sales Returns', amount: formatCurrency(d.income?.sales_returns) },
                { item: 'Net Sales (You Earned)', amount: formatCurrency(d.income?.net_sales) },
                { item: 'Cost of Products', amount: formatCurrency(d.cost?.cost_of_goods_sold) },
                { item: 'Product Profit', amount: formatCurrency(d.product_profit?.amount) },
                { item: 'Product Margin', amount: `${d.product_profit?.margin || 0}%` },
                { item: 'Expenses', amount: formatCurrency(d.expenses?.total) },
                { item: 'Business Profit (You Keep)', amount: formatCurrency(d.business_profit?.amount) },
            ];
        } catch (e) {
            console.error('Export failed:', e);
            return [];
        }
    }, [bodyParams, formatCurrency, getProfitLossReportForExport]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle="Profit & Loss"
                    reportDescription="Understand how your business is performing"
                    reportIcon={<TrendingUp className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-emerald-600 to-emerald-700"
                    data={[]}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="profit_loss_report"
                    fetchAllData={fetchAllDataForExport}
                />

                {/* Filter Row */}
                <div className="mb-6 mt-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {periodInfo.start_date && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm">
                                <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                                {periodInfo.start_date} → {periodInfo.end_date}
                            </span>
                        )}
                    </div>
                    <PeriodFilter
                        period={period}
                        onPeriodChange={setPeriod}
                        customStart={customStart}
                        customEnd={customEnd}
                        onStartChange={setCustomStart}
                        onEndChange={setCustomEnd}
                        onApply={handleApplyCustom}
                        label={getPeriodLabel()}
                    />
                </div>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                            <p className="mt-4 text-sm text-gray-600">Calculating your profit...</p>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                        <p className="text-sm text-red-600">Failed to load report. Please try again.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* ━━━ HERO: Bottom Line ━━━ */}
                        <div
                            className={`overflow-hidden rounded-2xl border-2 shadow-lg ${
                                isProfit ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50' : 'border-red-200 bg-gradient-to-br from-red-50 via-white to-rose-50'
                            }`}
                        >
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`rounded-2xl p-3 ${isProfit ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                            {isProfit ? <ArrowUp className="h-7 w-7 text-emerald-600" /> : <ArrowDown className="h-7 w-7 text-red-600" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">After all costs, you {isProfit ? 'earned' : 'lost'}</p>
                                            <p className={`text-3xl font-extrabold sm:text-4xl ${isProfit ? 'text-emerald-700' : 'text-red-700'}`}>
                                                <AnimatedCurrency value={Math.abs(businessProfit.amount || 0)} symbol={symbol} />
                                            </p>
                                            <p className={`mt-1 text-sm ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                                                Business Margin: <span className="font-bold">{businessProfit.margin || 0}%</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 sm:gap-6">
                                        <div className={`rounded-xl px-4 py-3 ${isProfit ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                            <p className="text-[11px] font-medium text-gray-400">Product Margin</p>
                                            <p className={`text-2xl font-bold ${isProfit ? 'text-emerald-700' : 'text-red-700'}`}>{productProfit.margin || 0}%</p>
                                        </div>
                                        <div className="rounded-xl bg-gray-50 px-4 py-3">
                                            <p className="text-[11px] font-medium text-gray-400">Total Orders</p>
                                            <p className="text-2xl font-bold text-gray-800">{income.total_orders || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ━━━ Quick Summary Cards ━━━ */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <SummaryCard
                                icon={CircleDollarSign}
                                iconBg="bg-emerald-50"
                                iconColor="text-emerald-600"
                                label="Total money received from customers"
                                sublabel="You Earned"
                                value={summary.you_earned || 0}
                                symbol={symbol}
                                valueColor="text-emerald-700"
                            />
                            <SummaryCard
                                icon={Package}
                                iconBg="bg-orange-50"
                                iconColor="text-orange-600"
                                label="What you paid for products sold"
                                sublabel="Products Cost"
                                value={summary.products_cost || 0}
                                symbol={symbol}
                                valueColor="text-orange-700"
                            />
                            <SummaryCard
                                icon={Receipt}
                                iconBg="bg-red-50"
                                iconColor="text-red-500"
                                label="Rent, bills, salaries & other costs"
                                sublabel="Your Expenses"
                                value={summary.your_expenses || 0}
                                symbol={symbol}
                                valueColor="text-red-600"
                            />
                            <SummaryCard
                                icon={isProfit ? TrendingUp : ArrowDown}
                                iconBg={isProfit ? 'bg-emerald-50' : 'bg-red-50'}
                                iconColor={isProfit ? 'text-emerald-600' : 'text-red-500'}
                                label="Your real profit after all costs"
                                sublabel="You Keep"
                                value={summary.you_keep || 0}
                                symbol={symbol}
                                valueColor={isProfit ? 'text-emerald-700' : 'text-red-600'}
                            />
                        </div>

                        {/* ━━━ How Profit Is Calculated ━━━ */}
                        <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 sm:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Percent className="h-5 w-5 text-gray-400" />
                                <h3 className="text-sm font-semibold text-gray-700">How your profit is calculated</h3>
                            </div>

                            <div className="mx-auto max-w-xl space-y-0">
                                <CalcStep step={1} icon={ShoppingCart} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Total Sales" subtitle="All your sales" value={income.total_sales || 0} symbol={symbol} valueColor="text-emerald-700" />
                                <CalcStep step={2} icon={ArrowDown} iconBg="bg-orange-50" iconColor="text-orange-500" title="Returns & Discounts" subtitle="Returned items + discounts given" value={(income.sales_returns || 0) + (income.total_discount || 0)} symbol={symbol} valueColor="text-orange-600" operation="-" />
                                <CalcStep step={3} icon={Banknote} iconBg="bg-blue-50" iconColor="text-blue-600" title="Net Sales" subtitle="What you actually earned" value={income.net_sales || 0} symbol={symbol} valueColor="text-blue-700" operation="=" />
                                <CalcStep step={4} icon={Package} iconBg="bg-orange-50" iconColor="text-orange-600" title="Product Cost" subtitle={`Purchase price of ${cost.total_items_sold || 0} items sold`} value={cost.cost_of_goods_sold || 0} symbol={symbol} valueColor="text-orange-700" operation="-" />
                                <CalcStep step={5} icon={TrendingUp} iconBg="bg-violet-50" iconColor="text-violet-600" title="Product Profit" subtitle={`${productProfit.margin || 0}% margin`} value={productProfit.amount || 0} symbol={symbol} valueColor="text-violet-700" operation="=" />
                                <CalcStep step={6} icon={Receipt} iconBg="bg-red-50" iconColor="text-red-500" title="Expenses" subtitle="Rent, utilities, salaries, etc." value={expenses.total || 0} symbol={symbol} valueColor="text-red-600" operation="-" />
                                <CalcStep step={7} icon={isProfit ? TrendingUp : ArrowDown} iconBg={isProfit ? 'bg-emerald-50' : 'bg-red-50'} iconColor={isProfit ? 'text-emerald-600' : 'text-red-500'} title="Business Profit" subtitle="This is what you keep" value={businessProfit.amount || 0} symbol={symbol} valueColor={isProfit ? 'text-emerald-700' : 'text-red-600'} operation="=" />
                            </div>
                        </div>

                        {/* ━━━ Detailed Breakdown ━━━ */}
                        <div className="grid gap-4 lg:grid-cols-2">
                            {/* Income Details */}
                            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <CircleDollarSign className="h-5 w-5 text-emerald-600" />
                                        <h3 className="text-sm font-semibold text-gray-800">Income Details</h3>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-50 p-5">
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-600">Total Sales</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(income.total_sales)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-600">Total Orders</span>
                                        <span className="font-semibold text-gray-900">{income.total_orders || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-600">Sales Returns</span>
                                        <span className="font-semibold text-orange-600">−{formatCurrency(income.sales_returns)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-600">Discounts Given</span>
                                        <span className="font-semibold text-orange-600">−{formatCurrency(income.total_discount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-600">Tax Collected</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(income.total_tax)}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-3">
                                        <span className="text-sm font-semibold text-emerald-700">Net Sales (You Earned)</span>
                                        <span className="text-lg font-bold text-emerald-700">{formatCurrency(income.net_sales)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cost & Expenses */}
                            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5 text-orange-600" />
                                        <h3 className="text-sm font-semibold text-gray-800">Costs & Expenses</h3>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-50 p-5">
                                    <div className="flex items-center justify-between py-2.5">
                                        <div>
                                            <span className="text-sm text-gray-600">Product Cost</span>
                                            <p className="text-[11px] text-gray-400">Purchase price of {cost.total_items_sold || 0} items</p>
                                        </div>
                                        <span className="font-semibold text-orange-700">{formatCurrency(cost.cost_of_goods_sold)}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-violet-50 px-3 py-2.5">
                                        <div>
                                            <span className="text-sm font-semibold text-violet-700">Product Profit</span>
                                            <p className="text-[11px] text-violet-500">Sales − Product Cost</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-violet-700">{formatCurrency(productProfit.amount)}</span>
                                            <p className="text-[11px] text-violet-500">{productProfit.margin || 0}% margin</p>
                                        </div>
                                    </div>
                                    <div className="pt-2.5">
                                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">Expenses</p>
                                        {expenses.breakdown && expenses.breakdown.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {expenses.breakdown.map((cat: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                                        <span className="text-sm text-gray-600">{cat.category}</span>
                                                        <span className="font-semibold text-red-600">{formatCurrency(cat.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg bg-gray-50 px-3 py-2 text-center text-xs text-gray-400">No expenses recorded</div>
                                        )}
                                        <div className="mt-2 flex items-center justify-between rounded-lg bg-red-50 px-3 py-3">
                                            <span className="text-sm font-semibold text-red-600">Total Expenses</span>
                                            <span className="text-lg font-bold text-red-600">{formatCurrency(expenses.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ━━━ Final Banner ━━━ */}
                        <div
                            className={`overflow-hidden rounded-2xl border-2 ${
                                isProfit ? 'border-emerald-200 bg-gradient-to-r from-emerald-600 to-green-600' : 'border-red-200 bg-gradient-to-r from-red-600 to-rose-600'
                            } p-6 text-white shadow-lg`}
                        >
                            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-white/20 p-3">
                                        {isProfit ? <TrendingUp className="h-6 w-6" /> : <ArrowDown className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white/80">Bottom Line — You {isProfit ? 'Earned' : 'Lost'}</p>
                                        <p className="text-3xl font-extrabold">
                                            <AnimatedCurrency value={Math.abs(businessProfit.amount || 0)} symbol={symbol} />
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6 text-center">
                                    <div>
                                        <p className="text-xs text-white/70">Product Margin</p>
                                        <p className="text-xl font-bold">{productProfit.margin || 0}%</p>
                                    </div>
                                    <div className="h-10 w-px bg-white/20"></div>
                                    <div>
                                        <p className="text-xs text-white/70">Business Margin</p>
                                        <p className="text-xl font-bold">{businessProfit.margin || 0}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfitLossReportPage;
