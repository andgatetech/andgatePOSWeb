'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetDashboardSummaryQuery } from '@/store/features/dashboard/dashboad';
import {
    BadgePercent,
    Banknote,
    CalendarDays,
    ChevronDown,
    CreditCard,
    FileText,
    Layers,
    Package,
    Percent,
    Receipt,
    RefreshCw,
    ShoppingCart,
    TrendingUp,
    Wallet
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';

// ─── Types ───────────────────────────────────────────────────────────────────

type PeriodType = 'today' | 'weekly' | 'monthly' | 'yearly' | 'custom';

interface PeriodOption {
    value: PeriodType;
    label: string;
}

// ─── Period Options ──────────────────────────────────────────────────────────

const PERIOD_VALUES: PeriodType[] = ['today', 'weekly', 'monthly', 'yearly', 'custom'];

// ─── Skeleton ────────────────────────────────────────────────────────────────

const CardSkeleton = ({ colored = false }: { colored?: boolean }) => (
    <div className={`animate-pulse rounded-xl p-4 shadow-sm ${colored ? 'bg-gray-300' : 'border border-gray-100 bg-white'}`}>
        <div className="flex items-center justify-between">
            <div>
                <div className={`mb-2 h-3 w-20 rounded ${colored ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
                <div className={`h-6 w-28 rounded ${colored ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
            </div>
            <div className={`h-9 w-9 rounded-lg ${colored ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
        </div>
        <div className={`mt-3 border-t pt-2.5 ${colored ? 'border-white/20' : 'border-gray-100'}`}>
            <div className={`h-3 w-14 rounded ${colored ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
        </div>
    </div>
);

// ─── Colorful Card (first 8 cards) ──────────────────────────────────────────

interface ColorfulCardProps {
    title: string;
    numericValue: number;
    icon: React.ElementType;
    bgGradient: string;
    route: string;
    isCurrency?: boolean;
    isPercentage?: boolean;
    showMinus?: boolean;
    change?: number;
    trend?: 'positive' | 'negative' | 'neutral';
}

const ColorfulCard = ({ title, numericValue, icon: Icon, bgGradient, route, isCurrency = true, isPercentage = false, showMinus = false, change, trend }: ColorfulCardProps) => {
    const { formatCurrency, formatNumber } = useCurrency();
    const { t } = getTranslation();

    return (
        <div className={`group rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-lg ${bgGradient}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/70">{title}</p>
                    <p className="text-xl font-bold text-white">
                        {showMinus && <span className="text-base font-semibold text-white/80">− </span>}
                        <CountUp
                            end={numericValue}
                            duration={1.5}
                            formattingFn={(n) =>
                                isCurrency ? formatCurrency(n) :
                                isPercentage ? formatNumber(n, 2) + '%' :
                                formatNumber(Math.round(n), 0)
                            }
                        />
                    </p>
                    {change !== undefined && change !== 0 && (
                        <span className={`mt-1 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                            trend === 'positive' ? 'bg-white/25 text-white' :
                            trend === 'negative' ? 'bg-black/20 text-white/80' :
                            'bg-white/10 text-white/60'
                        }`}>
                            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
                        </span>
                    )}
                </div>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 transition-transform duration-200 group-hover:scale-110">
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </div>
            <div className="mt-3 border-t border-white/20 pt-2.5">
                <Link href={route} className="text-xs font-medium text-white/80 transition-colors hover:text-white">
                    {t('lbl_view_all')} →
                </Link>
            </div>
        </div>
    );
};

// ─── White Card (last 4 cards) ───────────────────────────────────────────────

interface WhiteCardProps {
    title: string;
    numericValue: number;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    route: string;
    isCurrency?: boolean;
    isPercentage?: boolean;
    change?: number;
    trend?: 'positive' | 'negative' | 'neutral';
}

const WhiteCard = ({ title, numericValue, icon: Icon, iconBg, iconColor, route, isCurrency = true, isPercentage = false, change, trend }: WhiteCardProps) => {
    const { formatCurrency, formatNumber } = useCurrency();
    const { t } = getTranslation();

    return (
        <div className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">{title}</p>
                    <p className="text-xl font-bold text-gray-900">
                        <CountUp
                            end={numericValue}
                            duration={1.5}
                            formattingFn={(n) =>
                                isCurrency ? formatCurrency(n) :
                                isPercentage ? formatNumber(n, 2) + '%' :
                                formatNumber(Math.round(n), 0)
                            }
                        />
                    </p>
                    {change !== undefined && change !== 0 && (
                        <span className={`mt-1 inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                            trend === 'positive' ? 'bg-green-50 text-green-600' :
                            trend === 'negative' ? 'bg-red-50 text-red-600' :
                            'bg-gray-50 text-gray-500'
                        }`}>
                            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
                        </span>
                    )}
                </div>
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconBg} transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
            </div>
            <div className="mt-3 border-t border-gray-100 pt-2.5">
                <Link href={route} className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
                    {t('lbl_view_all')} →
                </Link>
            </div>
        </div>
    );
};

// ─── Filter Dropdown ─────────────────────────────────────────────────────────

interface FilterDropdownProps {
    selectedPeriod: PeriodType;
    onPeriodChange: (period: PeriodType) => void;
    customStartDate: string;
    customEndDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onApplyCustom: () => void;
    periodLabel: string;
}

const FilterDropdown = ({ selectedPeriod, onPeriodChange, customStartDate, customEndDate, onStartDateChange, onEndDateChange, onApplyCustom, periodLabel }: FilterDropdownProps) => {
    const { t } = getTranslation();
    const periodOptions: PeriodOption[] = [
        { value: 'today', label: t('lbl_today') },
        { value: 'weekly', label: t('lbl_this_week') },
        { value: 'monthly', label: t('lbl_this_month') },
        { value: 'yearly', label: t('lbl_this_year') },
        { value: 'custom', label: t('lbl_custom_range') },
    ];
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
            >
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span>{periodLabel}</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                    <div className="space-y-0.5">
                        {periodOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onPeriodChange(option.value);
                                    if (option.value !== 'custom') {
                                        setIsOpen(false);
                                    }
                                }}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                                    selectedPeriod === option.value ? 'bg-primary/[0.08] font-medium text-primary' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <CalendarDays className="h-4 w-4" />
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {selectedPeriod === 'custom' && (
                        <div className="mt-2 border-t border-gray-100 pt-3">
                            <div className="space-y-2 px-1">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_start_date')}</label>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => onStartDateChange(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_end_date')}</label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => onEndDateChange(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        onApplyCustom();
                                        setIsOpen(false);
                                    }}
                                    disabled={!customStartDate || !customEndDate}
                                    className="mt-1 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {t('btn_apply_range')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Summary Component ──────────────────────────────────────────────────

export default function Summary() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const periodOptions: PeriodOption[] = [
        { value: 'today', label: t('lbl_today') },
        { value: 'weekly', label: t('lbl_this_week') },
        { value: 'monthly', label: t('lbl_this_month') },
        { value: 'yearly', label: t('lbl_this_year') },
        { value: 'custom', label: t('lbl_custom_range') },
    ];
    const [period, setPeriod] = useState<PeriodType>('monthly');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [appliedCustomStart, setAppliedCustomStart] = useState('');
    const [appliedCustomEnd, setAppliedCustomEnd] = useState('');

    // Build query params
    const queryParams: Record<string, any> = {};
    if (currentStoreId) queryParams.store_id = currentStoreId;

    if (period === 'custom' && appliedCustomStart && appliedCustomEnd) {
        queryParams.period = 'custom';
        queryParams.start_date = appliedCustomStart;
        queryParams.end_date = appliedCustomEnd;
    } else if (period !== 'custom') {
        queryParams.period = period;
    }

    const { data: dashboardData, isLoading, isError } = useGetDashboardSummaryQuery(queryParams);

    const handlePeriodChange = (newPeriod: PeriodType) => {
        setPeriod(newPeriod);
    };

    const handleApplyCustom = () => {
        setAppliedCustomStart(customStartDate);
        setAppliedCustomEnd(customEndDate);
    };

    const getPeriodLabel = () => {
        const option = periodOptions.find((o) => o.value === period);
        if (period === 'custom' && appliedCustomStart && appliedCustomEnd) {
            return `${appliedCustomStart} — ${appliedCustomEnd}`;
        }
        return option?.label || t('lbl_this_month');
    };

    // ─── Loading ─────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">{t('lbl_overview')}</h2>
                    <div className="h-9 w-36 animate-pulse rounded-lg bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <CardSkeleton key={i} colored />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    // ─── Error ───────────────────────────────────────────────────────────────

    if (isError || !dashboardData?.data) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-600">{t('msg_failed_to_load_dashboard')}</p>
            </div>
        );
    }

    const { cards } = dashboardData.data;

    // ─── Layout (columns read top→bottom, left→right): ──────────────────────
    // Col 1: Total Sales        | Total Sales Return
    // Col 2: Profit Margin      | Business Profit
    // Col 3: Sales Receivable(−)| Total Expenses(−)
    // Col 4: Total Purchase     | Product Profit

    const row1Cards = [
        {
            title: t('lbl_total_sales'),
            numericValue: cards.total_sales?.value ?? 0,
            icon: FileText,
            bgGradient: 'bg-gradient-to-br from-[#046ca9] to-[#034d79]',
            route: '/reports/sales',
            change: cards.total_sales?.change,
            trend: cards.total_sales?.trend,
        },
        {
            title: t('lbl_profit_margin'),
            numericValue: cards.profit_margin?.value ?? 0,
            icon: Percent,
            bgGradient: 'bg-gradient-to-br from-[#0f9f6e] to-[#047857]',
            route: '/reports/profit-loss',
            isCurrency: false,
            isPercentage: true,
            change: cards.profit_margin?.change,
            trend: cards.profit_margin?.trend,
        },
        {
            title: t('lbl_sales_receivable'),
            numericValue: cards.sales_receivable?.value ?? 0,
            icon: CreditCard,
            bgGradient: 'bg-gradient-to-br from-[#e79237] to-[#b45309]',
            route: '/reports/sales',
            showMinus: true,
            change: cards.sales_receivable?.change,
            trend: cards.sales_receivable?.trend,
        },
        {
            title: t('lbl_total_purchase'),
            numericValue: cards.total_purchase?.value ?? 0,
            icon: ShoppingCart,
            bgGradient: 'bg-gradient-to-br from-[#6d5dfc] to-[#4338ca]',
            route: '/reports/purchase',
            change: cards.total_purchase?.change,
            trend: cards.total_purchase?.trend,
        },
    ];

    const row2Cards = [
        {
            title: t('lbl_total_sales_return'),
            numericValue: cards.total_sales_return?.value ?? 0,
            icon: RefreshCw,
            bgGradient: 'bg-gradient-to-br from-[#ef4444] to-[#b91c1c]',
            route: '/reports/order-returns',
            change: cards.total_sales_return?.change,
            trend: cards.total_sales_return?.trend,
        },
        {
            title: t('lbl_business_profit'),
            numericValue: cards.business_profit?.value ?? 0,
            icon: Wallet,
            bgGradient: 'bg-gradient-to-br from-[#10b981] to-[#047857]',
            route: '/reports/profit-loss',
            change: cards.business_profit?.change,
            trend: cards.business_profit?.trend,
        },
        {
            title: t('lbl_total_expenses'),
            numericValue: cards.total_expenses?.value ?? 0,
            icon: Banknote,
            bgGradient: 'bg-gradient-to-br from-[#f43f5e] to-[#be123c]',
            route: '/reports/expense',
            showMinus: true,
            change: cards.total_expenses?.change,
            trend: cards.total_expenses?.trend,
        },
        {
            title: t('lbl_product_profit'),
            numericValue: cards.product_profit?.value ?? 0,
            icon: TrendingUp,
            bgGradient: 'bg-gradient-to-br from-[#0891b2] to-[#0e7490]',
            route: '/reports/profit-loss',
            change: cards.product_profit?.change,
            trend: cards.product_profit?.trend,
        },
    ];

    // ─── Last 4 White Cards ──────────────────────────────────────────────────

    const row3Cards = [
        {
            title: t('lbl_total_discount'),
            numericValue: cards.total_discount?.value ?? 0,
            icon: BadgePercent,
            iconBg: 'bg-[#e79237]/10',
            iconColor: 'text-[#e79237]',
            route: '/reports/sales',
            change: cards.total_discount?.change,
            trend: cards.total_discount?.trend,
        },
        {
            title: t('lbl_total_tax'),
            numericValue: cards.total_tax?.value ?? 0,
            icon: Receipt,
            iconBg: 'bg-[#046ca9]/10',
            iconColor: 'text-[#046ca9]',
            route: '/reports/sales',
            change: cards.total_tax?.change,
            trend: cards.total_tax?.trend,
        },
        {
            title: t('lbl_total_orders'),
            numericValue: cards.total_orders?.value ?? 0,
            icon: Layers,
            iconBg: 'bg-[#6d5dfc]/10',
            iconColor: 'text-[#4338ca]',
            route: '/orders',
            isCurrency: false,
            change: cards.total_orders?.change,
            trend: cards.total_orders?.trend,
        },
        {
            title: t('lbl_total_items_sold'),
            numericValue: cards.total_items_sold?.value ?? 0,
            icon: Package,
            iconBg: 'bg-[#10b981]/10',
            iconColor: 'text-[#047857]',
            route: '/reports/sales',
            isCurrency: false,
            change: cards.total_items_sold?.change,
            trend: cards.total_items_sold?.trend,
        },
    ];

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="space-y-4">
            {/* Header with Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 sm:pt-0">
                <h2 className="text-lg font-semibold text-gray-800">{t('lbl_overview')}</h2>
                <FilterDropdown
                    selectedPeriod={period}
                    onPeriodChange={handlePeriodChange}
                    customStartDate={customStartDate}
                    customEndDate={customEndDate}
                    onStartDateChange={setCustomStartDate}
                    onEndDateChange={setCustomEndDate}
                    onApplyCustom={handleApplyCustom}
                    periodLabel={getPeriodLabel()}
                />
            </div>

            {/* Row 1 — Colorful (Sales, Profit Margin, Sales Receivable−, Total Purchase) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {row1Cards.map((card, i) => (
                    <ColorfulCard key={i} {...card} />
                ))}
            </div>

            {/* Row 2 — Colorful (Sales Return, Business Profit, Total Expenses−, Product Profit) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {row2Cards.map((card, i) => (
                    <ColorfulCard key={i} {...card} />
                ))}
            </div>

            {/* Row 3 — White (Discount, Tax, Orders, Items Sold) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {row3Cards.map((card, i) => (
                    <WhiteCard key={i} {...card} />
                ))}
            </div>
        </div>
    );
}
