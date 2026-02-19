'use client';

import { useCurrency } from '@/hooks/useCurrency';
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

const periodOptions: PeriodOption[] = [
    { value: 'today', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'yearly', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
];

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
}

const ColorfulCard = ({ title, numericValue, icon: Icon, bgGradient, route, isCurrency = true, isPercentage = false, showMinus = false }: ColorfulCardProps) => {
    const { symbol } = useCurrency();

    return (
        <div className={`group rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-lg ${bgGradient}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/70">{title}</p>
                    <p className="text-xl font-bold text-white">
                        {showMinus && <span className="text-base font-semibold text-white/80">− </span>}
                        {isCurrency && <span className="text-base font-semibold text-white/80">{symbol}</span>}
                        <CountUp end={numericValue} duration={1.5} decimals={isCurrency ? 2 : isPercentage ? 2 : 0} separator="," />
                        {isPercentage && <span className="text-base font-semibold text-white/80">%</span>}
                    </p>
                </div>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 transition-transform duration-200 group-hover:scale-110">
                    <Icon className="h-4 w-4 text-white" />
                </div>
            </div>
            <div className="mt-3 border-t border-white/20 pt-2.5">
                <Link href={route} className="text-xs font-medium text-white/80 transition-colors hover:text-white">
                    View All →
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
}

const WhiteCard = ({ title, numericValue, icon: Icon, iconBg, iconColor, route, isCurrency = true, isPercentage = false }: WhiteCardProps) => {
    const { symbol } = useCurrency();

    return (
        <div className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">{title}</p>
                    <p className="text-xl font-bold text-gray-900">
                        {isCurrency && <span className="text-base font-semibold text-gray-500">{symbol}</span>}
                        <CountUp end={numericValue} duration={1.5} decimals={isCurrency ? 2 : isPercentage ? 2 : 0} separator="," />
                        {isPercentage && <span className="text-base font-semibold text-gray-500">%</span>}
                    </p>
                </div>
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconBg} transition-transform duration-200 group-hover:scale-110`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
            </div>
            <div className="mt-3 border-t border-gray-100 pt-2.5">
                <Link href={route} className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700">
                    View All →
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
                                    selectedPeriod === option.value ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-600 hover:bg-gray-50'
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
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Start Date</label>
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => onStartDateChange(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">End Date</label>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => onEndDateChange(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        onApplyCustom();
                                        setIsOpen(false);
                                    }}
                                    disabled={!customStartDate || !customEndDate}
                                    className="mt-1 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Apply Range
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
    const { currentStoreId } = useCurrentStore();
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
        return option?.label || 'This Month';
    };

    // ─── Loading ─────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
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
                <p className="text-sm text-red-600">Failed to load dashboard data. Please try again.</p>
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
            title: 'Total Sales',
            numericValue: cards.total_sales?.value ?? 0,
            icon: FileText,
            bgGradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            route: '/reports/sales',
        },
        {
            title: 'Profit Margin',
            numericValue: cards.profit_margin?.value ?? 0,
            icon: Percent,
            bgGradient: 'bg-gradient-to-br from-violet-500 to-violet-600',
            route: '/reports/profit-loss',
            isCurrency: false,
            isPercentage: true,
        },
        {
            title: 'Sales Receivable',
            numericValue: cards.sales_receivable?.value ?? 0,
            icon: CreditCard,
            bgGradient: 'bg-gradient-to-br from-sky-500 to-sky-600',
            route: '/reports/sales',
            showMinus: true,
        },
        {
            title: 'Total Purchase',
            numericValue: cards.total_purchase?.value ?? 0,
            icon: ShoppingCart,
            bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
            route: '/reports/purchases',
        },
    ];

    const row2Cards = [
        {
            title: 'Total Sales Return',
            numericValue: cards.total_sales_return?.value ?? 0,
            icon: RefreshCw,
            bgGradient: 'bg-gradient-to-br from-rose-500 to-rose-600',
            route: '/reports/order-returns',
        },
        {
            title: 'Business Profit',
            numericValue: cards.business_profit?.value ?? 0,
            icon: Wallet,
            bgGradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
            route: '/reports/profit-loss',
        },
        {
            title: 'Total Expenses',
            numericValue: cards.total_expenses?.value ?? 0,
            icon: Banknote,
            bgGradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
            route: '/reports/expenses',
            showMinus: true,
        },
        {
            title: 'Product Profit',
            numericValue: cards.product_profit?.value ?? 0,
            icon: TrendingUp,
            bgGradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
            route: '/reports/profit-loss',
        },
    ];

    // ─── Last 4 White Cards ──────────────────────────────────────────────────

    const row3Cards = [
        {
            title: 'Total Discount',
            numericValue: cards.total_discount?.value ?? 0,
            icon: BadgePercent,
            iconBg: 'bg-pink-50',
            iconColor: 'text-pink-600',
            route: '/reports/sales',
        },
        {
            title: 'Total Tax',
            numericValue: cards.total_tax?.value ?? 0,
            icon: Receipt,
            iconBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            route: '/reports/sales',
        },
        {
            title: 'Total Orders',
            numericValue: cards.total_orders?.value ?? 0,
            icon: Layers,
            iconBg: 'bg-cyan-50',
            iconColor: 'text-cyan-600',
            route: '/orders',
            isCurrency: false,
        },
        {
            title: 'Total Items Sold',
            numericValue: cards.total_items_sold?.value ?? 0,
            icon: Package,
            iconBg: 'bg-lime-50',
            iconColor: 'text-lime-600',
            route: '/reports/sales',
            isCurrency: false,
        },
    ];

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="space-y-4">
            {/* Header with Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 sm:pt-0">
                <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
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
