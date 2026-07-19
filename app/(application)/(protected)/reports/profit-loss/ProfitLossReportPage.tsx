'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetProfitLossReportMutation } from '@/store/features/reports/reportApi';
import { ArrowDown, ArrowUp, Banknote, CalendarDays, ChevronDown, CircleDollarSign, Minus, Package, Percent, Receipt, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';
import UniversalCookie from 'universal-cookie';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CountUp from 'react-countup';

// ─── Types ───────────────────────────────────────────────────────────────────

type PeriodType = 'today' | 'weekly' | 'monthly' | 'yearly' | 'custom';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const toLocalDigits = (str: string): string => {
    if (typeof window === 'undefined') return str;
    const lang = new UniversalCookie().get('i18nextLng') || 'en';
    if (lang !== 'bn') return str;
    return str.replace(/[0-9]/g, (d) => BN_DIGITS[parseInt(d)]);
};

const AnimatedCurrency = ({ value, symbol }: { value: number; symbol: string }) => {
    const formattingFn = (val: number) => {
        const fixed = val.toFixed(2);
        const [int, dec] = fixed.split('.');
        const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return toLocalDigits(`${withSep}.${dec}`);
    };
    return (
        <span>
            {symbol}
            <CountUp end={value} duration={1.5} decimals={2} separator="," formattingFn={formattingFn} />
        </span>
    );
};

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
    periodOptions,
}: {
    period: PeriodType;
    onPeriodChange: (p: PeriodType) => void;
    customStart: string;
    customEnd: string;
    onStartChange: (d: string) => void;
    onEndChange: (d: string) => void;
    onApply: () => void;
    label: string;
    periodOptions: { value: PeriodType; label: string }[];
}) => {
    const { t } = getTranslation();
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
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                    <div className="space-y-0.5">
                        {periodOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onPeriodChange(opt.value);
                                    if (opt.value !== 'custom') setOpen(false);
                                }}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                    period === opt.value ? 'bg-info-light font-medium text-info' : 'text-gray-600 hover:bg-gray-50'
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
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_start')}</label>
                                <input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => onStartChange(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_end')}</label>
                                <input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => onEndChange(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    onApply();
                                    setOpen(false);
                                }}
                                disabled={!customStart || !customEnd}
                                className="mt-1 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {t('btn_apply_range')}
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
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
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
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${operation === '-' ? 'bg-danger-light text-danger' : 'bg-success-light text-success'}`}>
                    {operation === '-' ? <Minus className="h-3 w-3" /> : '='}
                </div>
            </div>
        )}
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
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
    const { t } = getTranslation();
    const periodOptions: { value: PeriodType; label: string }[] = [
        { value: 'today', label: t('lbl_today') },
        { value: 'weekly', label: t('lbl_this_week') },
        { value: 'monthly', label: t('lbl_this_month') },
        { value: 'yearly', label: t('lbl_this_year') },
        { value: 'custom', label: t('lbl_custom_range') },
    ];
    const { formatCurrency, formatNumber, symbol } = useCurrency();
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
        return periodOptions.find((o) => o.value === period)?.label || t('lbl_this_month');
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
    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'item', label: t('lbl_item'), width: 30 },
            { key: 'amount', label: t('lbl_amount'), width: 20 },
        ],
        [t]
    );

    const filterSummary = useMemo(() => {
        const storeName = currentStore?.store_name || t('lbl_all_stores');
        // Map our period values to what ReportExportToolbar expects
        const typeMap: Record<string, string> = { today: 'today', weekly: 'this_week', monthly: 'this_month', yearly: 'this_year', custom: 'custom' };
        const mappedType = typeMap[period] || 'none';
        // Only pass dates for custom range to avoid parseSafeDate errors
        const startDate = period === 'custom' && periodInfo.start_date ? periodInfo.start_date : undefined;
        const endDate = period === 'custom' && periodInfo.end_date ? periodInfo.end_date : undefined;
        return { dateRange: { startDate, endDate, type: mappedType }, storeName, customFilters: [] };
    }, [currentStore, periodInfo, period, t]);

    const exportSummary = useMemo(
        () => [
            { label: t('lbl_you_earned'), value: formatCurrency(summary.you_earned) },
            { label: t('lbl_you_keep'), value: formatCurrency(summary.you_keep) },
            { label: t('lbl_margin'), value: `${formatNumber(businessProfit.margin || 0)}%` },
        ],
        [summary, businessProfit, formatCurrency, formatNumber]
    );

    const fetchAllDataForExport = useCallback(async (): Promise<any[]> => {
        const exportParams: Record<string, any> = { ...bodyParams, export: true };
        try {
            const result = await getProfitLossReportForExport(exportParams).unwrap();
            const d = result?.data || {};
            return [
                { item: t('lbl_total_sales'), amount: formatCurrency(d.income?.total_sales) },
                { item: t('lbl_sales_returns'), amount: formatCurrency(d.income?.sales_returns) },
                { item: t('lbl_net_sales_you_earned'), amount: formatCurrency(d.income?.net_sales) },
                { item: t('lbl_cost_of_products'), amount: formatCurrency(d.cost?.cost_of_goods_sold) },
                { item: t('lbl_product_profit'), amount: formatCurrency(d.product_profit?.amount) },
                { item: t('lbl_product_margin'), amount: `${formatNumber(d.product_profit?.margin || 0)}%` },
                { item: t('lbl_expenses'), amount: formatCurrency(d.expenses?.total) },
                { item: t('lbl_business_profit_you_keep'), amount: formatCurrency(d.business_profit?.amount) },
            ];
        } catch (e) {
            console.error('Export failed:', e);
            return [];
        }
    }, [bodyParams, formatCurrency, formatNumber, getProfitLossReportForExport, t]);

    return (
        <div className="min-h-screen bg-[#f6f8fb]">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle={t('report_profit_loss_title')}
                    reportDescription={t('report_profit_loss_desc')}
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
                        periodOptions={periodOptions}
                    />
                </div>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-success border-t-emerald-600"></div>
                            <p className="mt-4 text-sm text-gray-600">{t('msg_calculating_profit')}</p>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="rounded-lg border border-danger bg-danger-light p-6 text-center">
                        <p className="text-sm text-danger">{t('msg_failed_load_report_try_again')}</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* ━━━ HERO: Bottom Line ━━━ */}
                        <div
                            className={`overflow-hidden rounded-lg border-2 shadow-lg ${
                                isProfit ? 'border-success bg-gradient-to-br from-emerald-50 via-white to-green-50' : 'border-danger bg-gradient-to-br from-red-50 via-white to-rose-50'
                            }`}
                        >
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`rounded-lg p-3 ${isProfit ? 'bg-success-light' : 'bg-danger-light'}`}>
                                            {isProfit ? <ArrowUp className="h-7 w-7 text-success" /> : <ArrowDown className="h-7 w-7 text-danger" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">{isProfit ? t('msg_after_all_costs_earned') : t('msg_after_all_costs_lost')}</p>
                                            <p className={`text-3xl font-extrabold sm:text-4xl ${isProfit ? 'text-success' : 'text-danger'}`}>
                                                <AnimatedCurrency value={Math.abs(businessProfit.amount || 0)} symbol={symbol} />
                                            </p>
                                            <p className={`mt-1 text-sm ${isProfit ? 'text-success' : 'text-danger'}`}>
                                                {t('lbl_business_margin')}: <span className="font-bold">{formatNumber(businessProfit.margin || 0)}%</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 sm:gap-6">
                                        <div className={`rounded-lg px-4 py-3 ${isProfit ? 'bg-success-light' : 'bg-danger-light'}`}>
                                            <p className="text-[11px] font-medium text-gray-400">{t('lbl_product_margin')}</p>
                                            <p className={`text-2xl font-bold ${isProfit ? 'text-success' : 'text-danger'}`}>{formatNumber(productProfit.margin || 0)}%</p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 px-4 py-3">
                                            <p className="text-[11px] font-medium text-gray-400">{t('lbl_total_orders')}</p>
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
                                iconBg="bg-success-light"
                                iconColor="text-success"
                                label={t('msg_total_money_received_from_customers')}
                                sublabel={t('lbl_you_earned')}
                                value={summary.you_earned || 0}
                                symbol={symbol}
                                valueColor="text-success"
                            />
                            <SummaryCard
                                icon={Package}
                                iconBg="bg-danger-light"
                                iconColor="text-danger"
                                label={t('msg_what_you_paid_for_products_sold')}
                                sublabel={t('lbl_products_cost')}
                                value={summary.products_cost || 0}
                                symbol={symbol}
                                valueColor="text-danger"
                            />
                            <SummaryCard
                                icon={Receipt}
                                iconBg="bg-danger-light"
                                iconColor="text-danger"
                                label={t('msg_running_costs_examples')}
                                sublabel={t('lbl_your_expenses')}
                                value={summary.your_expenses || 0}
                                symbol={symbol}
                                valueColor="text-danger"
                            />
                            <SummaryCard
                                icon={isProfit ? TrendingUp : ArrowDown}
                                iconBg={isProfit ? 'bg-success-light' : 'bg-danger-light'}
                                iconColor={isProfit ? 'text-success' : 'text-danger'}
                                label={t('msg_real_profit_after_all_costs')}
                                sublabel={t('lbl_you_keep')}
                                value={summary.you_keep || 0}
                                symbol={symbol}
                                valueColor={isProfit ? 'text-success' : 'text-danger'}
                            />
                        </div>

                        {/* ━━━ How Profit Is Calculated ━━━ */}
                        <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-5 sm:p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <Percent className="h-5 w-5 text-gray-400" />
                                <h3 className="text-sm font-semibold text-gray-700">{t('lbl_how_profit_calculated')}</h3>
                            </div>

                            <div className="mx-auto max-w-xl space-y-0">
                                <CalcStep
                                    step={1}
                                    icon={ShoppingCart}
                                    iconBg="bg-success-light"
                                    iconColor="text-success"
                                    title={t('lbl_total_sales')}
                                    subtitle={t('msg_all_your_sales')}
                                    value={income.total_sales || 0}
                                    symbol={symbol}
                                    valueColor="text-success"
                                />
                                <CalcStep
                                    step={2}
                                    icon={ArrowDown}
                                    iconBg="bg-danger-light"
                                    iconColor="text-danger"
                                    title={t('lbl_returns_discounts')}
                                    subtitle={t('msg_returned_items_discounts')}
                                    value={(income.sales_returns || 0) + (income.total_discount || 0)}
                                    symbol={symbol}
                                    valueColor="text-danger"
                                    operation="-"
                                />
                                <CalcStep
                                    step={3}
                                    icon={Banknote}
                                    iconBg="bg-info-light"
                                    iconColor="text-info"
                                    title={t('lbl_net_sales')}
                                    subtitle={t('msg_what_you_actually_earned')}
                                    value={income.net_sales || 0}
                                    symbol={symbol}
                                    valueColor="text-info"
                                    operation="="
                                />
                                <CalcStep
                                    step={4}
                                    icon={Package}
                                    iconBg="bg-danger-light"
                                    iconColor="text-danger"
                                    title={t('lbl_product_cost')}
                                    subtitle={t('msg_purchase_price_items_sold').replace('{count}', formatNumber(cost.total_items_sold || 0))}
                                    value={cost.cost_of_goods_sold || 0}
                                    symbol={symbol}
                                    valueColor="text-danger"
                                    operation="-"
                                />
                                <CalcStep
                                    step={5}
                                    icon={TrendingUp}
                                    iconBg="bg-info-light"
                                    iconColor="text-info"
                                    title={t('lbl_product_profit')}
                                    subtitle={t('msg_margin_percent').replace('{percent}', formatNumber(productProfit.margin || 0))}
                                    value={productProfit.amount || 0}
                                    symbol={symbol}
                                    valueColor="text-info"
                                    operation="="
                                />
                                <CalcStep
                                    step={6}
                                    icon={Receipt}
                                    iconBg="bg-danger-light"
                                    iconColor="text-danger"
                                    title={t('lbl_expenses')}
                                    subtitle={t('msg_expense_examples')}
                                    value={expenses.total || 0}
                                    symbol={symbol}
                                    valueColor="text-danger"
                                    operation="-"
                                />
                                <CalcStep
                                    step={7}
                                    icon={isProfit ? TrendingUp : ArrowDown}
                                    iconBg={isProfit ? 'bg-success-light' : 'bg-danger-light'}
                                    iconColor={isProfit ? 'text-success' : 'text-danger'}
                                    title={t('lbl_business_profit')}
                                    subtitle={t('msg_this_is_what_you_keep')}
                                    value={businessProfit.amount || 0}
                                    symbol={symbol}
                                    valueColor={isProfit ? 'text-success' : 'text-danger'}
                                    operation="="
                                />
                            </div>
                        </div>

                        {/* ━━━ Detailed Breakdown ━━━ */}
                        <div className="grid gap-4 lg:grid-cols-2">
                            {/* Income Details */}
                            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <CircleDollarSign className="h-5 w-5 text-success" />
                                        <h3 className="text-sm font-semibold text-gray-800">{t('lbl_income_details')}</h3>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-50 p-5">
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-600">{t('lbl_total_sales')}</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(income.total_sales)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-600">{t('lbl_total_orders')}</span>
                                        <span className="font-semibold text-gray-900">{income.total_orders || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-600">{t('lbl_sales_returns')}</span>
                                        <span className="font-semibold text-warning">−{formatCurrency(income.sales_returns)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-600">{t('lbl_discounts_given')}</span>
                                        <span className="font-semibold text-warning">−{formatCurrency(income.total_discount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5">
                                        <span className="text-sm text-gray-600">{t('lbl_tax_collected')}</span>
                                        <span className="font-semibold text-gray-900">{formatCurrency(income.total_tax)}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between rounded-lg bg-success-light px-3 py-3">
                                        <span className="text-sm font-semibold text-success">{t('lbl_net_sales_you_earned')}</span>
                                        <span className="text-lg font-bold text-success">{formatCurrency(income.net_sales)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cost & Expenses */}
                            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-5 w-5 text-warning" />
                                        <h3 className="text-sm font-semibold text-gray-800">{t('lbl_costs_expenses')}</h3>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-50 p-5">
                                    <div className="flex items-center justify-between py-2.5">
                                        <div>
                                            <span className="text-sm text-gray-600">{t('lbl_product_cost')}</span>
                                            <p className="text-[11px] text-gray-400">{t('msg_purchase_price_items').replace('{count}', formatNumber(cost.total_items_sold || 0))}</p>
                                        </div>
                                        <span className="font-semibold text-warning">{formatCurrency(cost.cost_of_goods_sold)}</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-info-light px-3 py-2.5">
                                        <div>
                                            <span className="text-sm font-semibold text-info">{t('lbl_product_profit')}</span>
                                            <p className="text-[11px] text-info">{t('msg_sales_minus_product_cost')}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-info">{formatCurrency(productProfit.amount)}</span>
                                            <p className="text-[11px] text-info">{formatNumber(productProfit.margin || 0)}% margin</p>
                                        </div>
                                    </div>
                                    <div className="pt-2.5">
                                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">{t('lbl_expenses')}</p>
                                        {expenses.breakdown && expenses.breakdown.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {expenses.breakdown.map((cat: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                                        <span className="text-sm text-gray-600">{cat.category}</span>
                                                        <span className="font-semibold text-danger">{formatCurrency(cat.amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg bg-gray-50 px-3 py-2 text-center text-xs text-gray-400">{t('msg_no_expenses_recorded')}</div>
                                        )}
                                        <div className="mt-2 flex items-center justify-between rounded-lg bg-danger-light px-3 py-3">
                                            <span className="text-sm font-semibold text-danger">{t('lbl_total_expenses')}</span>
                                            <span className="text-lg font-bold text-danger">{formatCurrency(expenses.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ━━━ Final Banner ━━━ */}
                        <div
                            className={`overflow-hidden rounded-lg border-2 ${
                                isProfit ? 'border-success bg-gradient-to-r from-emerald-600 to-green-600' : 'border-danger bg-gradient-to-r from-red-600 to-rose-600'
                            } p-6 text-white shadow-lg`}
                        >
                            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-white/20 p-3">{isProfit ? <TrendingUp className="h-6 w-6" /> : <ArrowDown className="h-6 w-6" />}</div>
                                    <div>
                                        <p className="text-sm font-medium text-white/80">{isProfit ? t('msg_bottom_line_you_earned') : t('msg_bottom_line_you_lost')}</p>
                                        <p className="text-3xl font-extrabold">
                                            <AnimatedCurrency value={Math.abs(businessProfit.amount || 0)} symbol={symbol} />
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6 text-center">
                                    <div>
                                        <p className="text-xs text-white/70">{t('lbl_product_margin')}</p>
                                        <p className="text-xl font-bold">{formatNumber(productProfit.margin || 0)}%</p>
                                    </div>
                                    <div className="h-10 w-px bg-white/20"></div>
                                    <div>
                                        <p className="text-xs text-white/70">{t('lbl_business_margin')}</p>
                                        <p className="text-xl font-bold">{formatNumber(businessProfit.margin || 0)}%</p>
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
