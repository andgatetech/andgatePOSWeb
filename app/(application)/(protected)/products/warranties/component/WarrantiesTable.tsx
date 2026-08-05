'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import {
    useGetProductSerialsQuery,
} from '@/store/features/warrenty/ProductSerialApi';
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    Hash,
    Search,
    Clock,
    Calendar,
    Package,
    Receipt,
    User,
    Copy,
    Check,
    ExternalLink,
    Eye,
    RefreshCw,
    X,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    ArrowLeft,
    MoreVertical,
} from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

// ── Row Actions Dropdown Component ──
const WarrantyRowActions: React.FC<{
    item: any;
    onViewDetails: (item: any) => void;
    onCopySerial: (serial: string) => void;
}> = ({ item, onViewDetails, onCopySerial }) => {
    const { t } = getTranslation();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 192;
            const dropdownHeight = 130;
            let top = rect.bottom + 5;
            let left = rect.right - dropdownWidth;
            if (top + dropdownHeight > window.innerHeight) {
                top = rect.top - dropdownHeight - 5;
            }
            if (left < 8) left = 8;
            setPosition({ top, left });
        }
    }, [isOpen]);

    return (
        <div className="relative flex justify-end">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition shadow-2xs border border-transparent hover:border-slate-200"
                title={t('warranties_col_actions')}
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
                    <div
                        ref={dropdownRef}
                        className="fixed z-[101] w-48 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl animate-in fade-in zoom-in-95 duration-100"
                        style={{ top: `${position.top}px`, left: `${position.left}px` }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                setIsOpen(false);
                                onViewDetails(item);
                            }}
                            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                            <Eye className="h-4 w-4 text-indigo-600" />
                            <span>{t('warranties_action_view_details')}</span>
                        </button>

                        {item.order && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push(`/orders/${item.order.id}`);
                                }}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                            >
                                <ExternalLink className="h-4 w-4 text-indigo-600" />
                                <span>{t('warranties_action_order_details')}</span>
                            </button>
                        )}

                        {item.serial_number && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    onCopySerial(item.serial_number);
                                }}
                                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition border-t border-slate-50"
                            >
                                <Copy className="h-4 w-4 text-slate-400" />
                                <span>{t('warranties_action_copy_serial')}</span>
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const WarrantiesTable: React.FC = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();
    const { formatNumber } = useCurrency();

    // Filters & Pagination State — Default to 'active_warranty' as requested
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<string>('active_warranty');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

    // Modal state for viewing serial details
    const [selectedSerial, setSelectedSerial] = useState<any | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Build query params
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            page,
            per_page: perPage,
        };

        if (currentStoreId) {
            params.store_id = currentStoreId;
        }

        if (searchTerm.trim()) {
            params.search = searchTerm.trim();
        }

        // Handle tab selection
        if (activeTab === 'active_warranty') {
            params.status = 'active_warranty';
        } else if (activeTab === 'expiring_soon') {
            params.status = 'expiring_soon';
        } else if (activeTab === 'sold') {
            params.status = 'sold';
        } else if (activeTab === 'in_stock') {
            params.status = 'in_stock';
        } else if (activeTab === 'expired_warranty') {
            params.status = 'expired_warranty';
        }

        return params;
    }, [page, perPage, currentStoreId, searchTerm, activeTab]);

    const { data: serialsResponse, isLoading, isFetching, refetch } = useGetProductSerialsQuery(queryParams, {
        refetchOnMountOrArgChange: true,
    });

    const items = serialsResponse?.data?.items ?? [];
    const pagination = serialsResponse?.data?.pagination ?? {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
    };
    const stats = serialsResponse?.data?.stats ?? {
        total: 0,
        in_stock: 0,
        sold: 0,
        active_warranty: 0,
        expiring_soon: 0,
        expired_warranty: 0,
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSerial(text);
        setTimeout(() => setCopiedSerial(null), 2000);
    };

    const handleViewDetails = (serial: any) => {
        setSelectedSerial(serial);
        setIsDetailsOpen(true);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleTabChange = (tabKey: string) => {
        setActiveTab(tabKey);
        setPage(1);
    };

    // Tab Configuration in the exact user-specified sequence
    const TABS = [
        {
            key: 'active_warranty',
            label: t('warranties_tab_active_warranty'),
            icon: ShieldCheck,
            count: stats.active_warranty,
            badgeClass: 'bg-emerald-100 text-emerald-800',
        },
        {
            key: 'expiring_soon',
            label: t('warranties_tab_expiring_soon'),
            icon: ShieldAlert,
            count: stats.expiring_soon,
            badgeClass: 'bg-amber-100 text-amber-800',
        },
        {
            key: 'sold',
            label: t('warranties_tab_sold'),
            icon: Receipt,
            count: stats.sold,
            badgeClass: 'bg-indigo-100 text-indigo-800',
        },
        {
            key: 'in_stock',
            label: t('warranties_tab_in_stock'),
            icon: Package,
            count: stats.in_stock,
            badgeClass: 'bg-blue-100 text-blue-800',
        },
        {
            key: 'expired_warranty',
            label: t('warranties_tab_expired'),
            icon: ShieldX,
            count: stats.expired_warranty,
            badgeClass: 'bg-rose-100 text-rose-800',
        },
        {
            key: 'all',
            label: t('warranties_tab_all'),
            icon: Hash,
            count: stats.total,
            badgeClass: 'bg-slate-100 text-slate-800',
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 -mx-3 sm:-mx-4 lg:-mx-6">
            {/* ── Sticky Header (Matching ecommerce/orders/create full-width style) ── */}
            <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
                <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/products"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                            title={t('warranties_back_to_products')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                                    {t('warranties_inventory_lifecycle')}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                    <Sparkles className="h-3 w-3 text-emerald-500" />
                                    {t('warranties_live_tracking')}
                                </span>
                            </div>
                            <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900">
                                {t('warranties_page_title')}
                            </h1>
                        </div>
                    </div>

                    {/* Quick KPIs in Header */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700">
                            <span className="text-slate-500 font-normal">{t('warranties_kpi_active')}:</span>
                            <span className="font-bold text-emerald-600">{formatNumber(stats.active_warranty)}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 font-normal">{t('warranties_kpi_expiring_soon')}:</span>
                            <span className="font-bold text-amber-600">{formatNumber(stats.expiring_soon)}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 font-normal">{t('warranties_kpi_in_stock')}:</span>
                            <span className="font-bold text-blue-600">{formatNumber(stats.in_stock)}</span>
                        </div>

                        <button
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
                            <span>{t('lbl_refresh')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Main Page Content ── */}
            <div className="w-full px-4 py-5 lg:px-6 space-y-6">
                {/* ── KPI Summary Cards (Ordered: Active Warranty, Expiring Soon, Sold, In Stock, Expired, All) ── */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {/* 1. Active Warranties */}
                    <div
                        onClick={() => handleTabChange('active_warranty')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                            activeTab === 'active_warranty'
                                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'border-slate-200/90 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('warranties_kpi_active')}</span>
                            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-600">{formatNumber(stats.active_warranty)}</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-emerald-700">{t('warranties_protected_units')}</p>
                    </div>

                    {/* 2. Expiring Soon */}
                    <div
                        onClick={() => handleTabChange('expiring_soon')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                            activeTab === 'expiring_soon'
                                ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                                : 'border-slate-200/90 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('warranties_kpi_expiring_soon')}</span>
                            <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
                                <ShieldAlert className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-amber-600">{formatNumber(stats.expiring_soon)}</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-amber-700">{t('warranties_within_30_days')}</p>
                    </div>

                    {/* 3. Sold & In Service */}
                    <div
                        onClick={() => handleTabChange('sold')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                            activeTab === 'sold'
                                ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                                : 'border-slate-200/90 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('warranties_kpi_sold_active')}</span>
                            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
                                <Receipt className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-indigo-600">{formatNumber(stats.sold)}</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-indigo-700">{t('warranties_customer_assigned')}</p>
                    </div>

                    {/* 4. In Stock */}
                    <div
                        onClick={() => handleTabChange('in_stock')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                            activeTab === 'in_stock'
                                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                                : 'border-slate-200/90 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('warranties_kpi_in_stock')}</span>
                            <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                                <Package className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-blue-600">{formatNumber(stats.in_stock)}</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-blue-700">{t('warranties_available_to_sell')}</p>
                    </div>

                    {/* 5. Expired Warranties */}
                    <div
                        onClick={() => handleTabChange('expired_warranty')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                            activeTab === 'expired_warranty'
                                ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 shadow-xs'
                                : 'border-slate-200/90 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('warranties_tab_expired')}</span>
                            <div className="rounded-xl bg-rose-100 p-2 text-rose-600">
                                <ShieldX className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-rose-600">{formatNumber(stats.expired_warranty)}</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-rose-700">{t('warranties_coverage_ended')}</p>
                    </div>

                    {/* 6. Total Serials */}
                    <div
                        onClick={() => handleTabChange('all')}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                            activeTab === 'all'
                                ? 'border-slate-600 bg-slate-100 ring-2 ring-slate-400/20 shadow-xs'
                                : 'border-slate-200/90 bg-white'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('warranties_kpi_total')}</span>
                            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                                <Hash className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">{formatNumber(stats.total)}</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-slate-500">{t('warranties_all_serials')}</p>
                    </div>
                </div>

                {/* ── Filter Tabs & Search Controls ── */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    {/* Tabs in requested order */}
                    <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100/90 p-1.5">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                                        isActive
                                            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span>{tab.label}</span>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                            isActive ? tab.badgeClass : 'bg-slate-200/80 text-slate-600'
                                        }`}
                                    >
                                        {formatNumber(tab.count)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Bar */}
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('warranties_search_placeholder')}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-10 pr-9 text-xs sm:text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setPage(1);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Table Card ── */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th scope="col" className="px-6 py-4">{t('warranties_col_serial')}</th>
                                    <th scope="col" className="px-6 py-4">{t('warranties_col_product')}</th>
                                    <th scope="col" className="px-6 py-4">{t('warranties_col_serial_status')}</th>
                                    <th scope="col" className="px-6 py-4">{t('warranties_col_order_customer')}</th>
                                    <th scope="col" className="px-6 py-4">{t('warranties_col_warranty_remaining')}</th>
                                    <th scope="col" className="px-6 py-4 text-right">{t('warranties_col_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    Array.from({ length: 6 }).map((_, idx) => (
                                        <tr key={idx} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-28 rounded bg-slate-200" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-40 rounded bg-slate-200 mb-1" />
                                                <div className="h-3 w-20 rounded bg-slate-100" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-6 w-20 rounded-full bg-slate-200" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-32 rounded bg-slate-200 mb-1" />
                                                <div className="h-3 w-24 rounded bg-slate-100" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-6 w-36 rounded-full bg-slate-200" />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-block h-8 w-16 rounded bg-slate-200" />
                                            </td>
                                        </tr>
                                    ))
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-14 text-center">
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                <Shield className="h-7 w-7" />
                                            </div>
                                            <h3 className="mt-3 text-base font-bold text-slate-900">{t('warranties_no_items_found')}</h3>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {t('warranties_no_items_found_desc')}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item: any) => {
                                        const warranty = item.warranty;
                                        const hasWarranty = !!warranty;
                                        const remainingDays = warranty?.remaining_days ?? null;
                                        const warrantyStatus = warranty?.status ?? (item.status === 'in_stock' ? 'in_stock' : 'none');

                                        return (
                                            <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
                                                {/* Serial Number */}
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                                            {item.serial_number}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCopy(item.serial_number)}
                                                            title={t('order_click_to_copy')}
                                                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                                                        >
                                                            {copiedSerial === item.serial_number ? (
                                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Product Info */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold border border-slate-200">
                                                            {item.product?.name ? item.product.name.charAt(0).toUpperCase() : <Package className="h-5 w-5" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="truncate font-bold text-slate-900 max-w-xs">
                                                                {item.product?.name ?? t('lbl_unknown_product')}
                                                            </div>
                                                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                                                                {item.product?.sku && (
                                                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                                                                        {t('lbl_sku')}: {item.product.sku}
                                                                    </span>
                                                                )}
                                                                {item.product?.category && (
                                                                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                                                                        {item.product.category}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Serial Status */}
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {item.status === 'in_stock' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                            {t('warranties_status_in_stock')}
                                                        </span>
                                                    ) : item.status === 'sold' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            {t('warranties_status_sold')}
                                                        </span>
                                                    ) : item.status === 'returned' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                            {t('warranties_status_returned')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                            {item.status}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Order & Customer */}
                                                <td className="px-6 py-4">
                                                    {item.order ? (
                                                        <div className="space-y-1.5 text-xs">
                                                            {/* Invoice Badge linking to full order page */}
                                                            <div className="flex items-center gap-2">
                                                                <Link
                                                                    href={`/orders/${item.order.id}`}
                                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-1 font-bold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 transition border border-indigo-200"
                                                                    title={t('warranties_action_order_details')}
                                                                >
                                                                    <Receipt className="h-3 w-3 text-indigo-600" />
                                                                    <span>{t('warranties_inv_prefix')}{item.order.invoice}</span>
                                                                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                                                                </Link>
                                                            </div>

                                                            {item.order.customer ? (
                                                                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                                    <User className="h-3.5 w-3.5 text-slate-400" />
                                                                    <span>{item.order.customer.name}</span>
                                                                    {item.order.customer.phone && (
                                                                        <span className="text-slate-400 font-normal">({item.order.customer.phone})</span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="text-slate-400 font-normal">{t('pos_walk_in_customer')}</div>
                                                            )}

                                                            {item.sold_date && (
                                                                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                                                    <Calendar className="h-3 w-3" />
                                                                    <span>{t('warranties_sold_on')} {item.sold_date}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">{t('warranties_not_sold_yet')}</span>
                                                    )}
                                                </td>

                                                {/* Warranty & Remaining Days */}
                                                <td className="px-6 py-4">
                                                    {hasWarranty ? (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-slate-800">
                                                                    {warranty.warranty_type ?? t('warranties_standard_warranty')}
                                                                </span>
                                                            </div>

                                                            {/* Remaining Days Live Badge */}
                                                            {warrantyStatus === 'expired' ? (
                                                                <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                                                                    <ShieldX className="h-3.5 w-3.5 text-rose-600" />
                                                                    <span>{t('warranties_badge_expired')}</span>
                                                                </div>
                                                            ) : remainingDays !== null ? (
                                                                <div
                                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                                                                        remainingDays <= 30
                                                                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                                                                            : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                                                    }`}
                                                                >
                                                                    <Clock className={`h-3.5 w-3.5 ${remainingDays <= 30 ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`} />
                                                                    <span>
                                                                        {remainingDays > 0
                                                                            ? `${formatNumber(remainingDays)} ${t('warranties_days_remaining')}`
                                                                            : t('warranties_expires_today')}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                                    <span>{t('warranties_active_coverage')}</span>
                                                                </div>
                                                            )}

                                                            {/* Dates */}
                                                            {warranty.end_date && (
                                                                <div className="text-[11px] text-slate-400">
                                                                    {t('warranties_valid_until')} <span className="font-semibold text-slate-600">{warranty.end_date}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : item.status === 'in_stock' ? (
                                                        <div className="text-xs text-slate-500">
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                                                                <Shield className="h-3 w-3" />
                                                                {t('warranties_activates_upon_sale')}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">{t('warranties_no_warranty_configured')}</span>
                                                    )}
                                                </td>

                                                {/* Actions Dropdown */}
                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    <WarrantyRowActions
                                                        item={item}
                                                        onViewDetails={handleViewDetails}
                                                        onCopySerial={handleCopy}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 sm:flex-row">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{t('warranties_showing')}</span>
                            <span className="font-bold text-slate-900">
                                {pagination.total > 0 ? (pagination.current_page - 1) * pagination.per_page + 1 : 0}
                            </span>
                            <span>{t('warranties_to')}</span>
                            <span className="font-bold text-slate-900">
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                            </span>
                            <span>{t('warranties_of')}</span>
                            <span className="font-bold text-slate-900">{formatNumber(pagination.total)}</span>
                            <span>{t('warranties_serials_unit')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setPage(1);
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none"
                            >
                                <option value={15}>15 {t('warranties_per_page')}</option>
                                <option value={30}>30 {t('warranties_per_page')}</option>
                                <option value={50}>50 {t('warranties_per_page')}</option>
                                <option value={100}>100 {t('warranties_per_page')}</option>
                            </select>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={pagination.current_page <= 1 || isLoading}
                                    className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="px-2 text-xs font-bold text-slate-700">
                                    {pagination.current_page} / {pagination.last_page || 1}
                                </span>
                                <button
                                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.last_page))}
                                    disabled={pagination.current_page >= pagination.last_page || isLoading}
                                    className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Serial Details Modal ── */}
            <Transition appear show={isDetailsOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsDetailsOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    {selectedSerial && (
                                        <div className="space-y-6">
                                            {/* Modal Header */}
                                            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-mono text-sm font-bold text-indigo-700 border border-indigo-100">
                                                            {selectedSerial.serial_number}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCopy(selectedSerial.serial_number)}
                                                            className="text-slate-400 hover:text-slate-600"
                                                            title={t('order_click_to_copy')}
                                                        >
                                                            {copiedSerial === selectedSerial.serial_number ? (
                                                                <Check className="h-4 w-4 text-emerald-600" />
                                                            ) : (
                                                                <Copy className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                                                        {selectedSerial.product?.name ?? t('lbl_unknown_product')}
                                                    </h3>
                                                </div>
                                                <button
                                                    onClick={() => setIsDetailsOpen(false)}
                                                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </div>

                                            {/* Warranty Highlight Banner */}
                                            {selectedSerial.warranty ? (
                                                <div
                                                    className={`rounded-2xl p-5 border ${
                                                        selectedSerial.warranty.status === 'expired'
                                                            ? 'border-rose-200 bg-rose-50/70'
                                                            : selectedSerial.warranty.remaining_days !== null && selectedSerial.warranty.remaining_days <= 30
                                                            ? 'border-amber-200 bg-amber-50/70'
                                                            : 'border-emerald-200 bg-emerald-50/70'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2.5">
                                                            <Shield
                                                                className={`h-6 w-6 ${
                                                                    selectedSerial.warranty.status === 'expired'
                                                                        ? 'text-rose-600'
                                                                        : selectedSerial.warranty.remaining_days !== null && selectedSerial.warranty.remaining_days <= 30
                                                                        ? 'text-amber-600'
                                                                        : 'text-emerald-600'
                                                                }`}
                                                            />
                                                            <div>
                                                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                                    {t('warranties_modal_coverage')}
                                                                </div>
                                                                <div className="text-base font-black text-slate-900">
                                                                    {selectedSerial.warranty.warranty_type ?? t('warranties_standard_warranty')}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Remaining Days Counter */}
                                                        {selectedSerial.warranty.status === 'expired' ? (
                                                            <div className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                                                                {t('warranties_badge_expired')}
                                                            </div>
                                                        ) : selectedSerial.warranty.remaining_days !== null ? (
                                                            <div
                                                                className={`rounded-xl px-3.5 py-1.5 text-right border ${
                                                                    selectedSerial.warranty.remaining_days <= 30
                                                                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                                                                        : 'bg-emerald-100 border-emerald-300 text-emerald-900'
                                                                }`}
                                                            >
                                                                <div className="text-lg font-black leading-tight">
                                                                    {formatNumber(selectedSerial.warranty.remaining_days)}
                                                                </div>
                                                                <div className="text-[10px] font-bold uppercase tracking-wider">
                                                                    {t('warranties_modal_days_remaining')}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                                {t('warranties_active_coverage')}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-3 text-xs sm:grid-cols-3">
                                                        <div>
                                                            <span className="text-slate-500">{t('warranties_modal_duration')}</span>
                                                            <span className="ml-1.5 font-bold text-slate-900">
                                                                {selectedSerial.warranty.duration_days
                                                                    ? `${formatNumber(selectedSerial.warranty.duration_days)} days`
                                                                    : 'Standard'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">{t('warranties_modal_start_date')}</span>
                                                            <span className="ml-1.5 font-bold text-slate-900">
                                                                {selectedSerial.warranty.start_date ?? t('lbl_na')}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">{t('warranties_modal_end_date')}</span>
                                                            <span className="ml-1.5 font-bold text-slate-900">
                                                                {selectedSerial.warranty.end_date ?? t('lbl_na')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                                                    {t('warranties_modal_no_warranty')}
                                                </div>
                                            )}

                                            {/* Order & Customer Details */}
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                {/* Order Info */}
                                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                                            <Receipt className="h-4 w-4 text-indigo-600" />
                                                            {t('warranties_modal_order_details')}
                                                        </div>
                                                        {selectedSerial.order && (
                                                            <Link
                                                                href={`/orders/${selectedSerial.order.id}`}
                                                                onClick={() => setIsDetailsOpen(false)}
                                                                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                <span>{t('warranties_modal_view_order')}</span>
                                                                <ExternalLink className="h-3 w-3" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                    {selectedSerial.order ? (
                                                        <div className="space-y-2 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">{t('warranties_modal_invoice')}</span>
                                                                <span className="font-bold text-slate-900">#{selectedSerial.order.invoice}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">{t('warranties_modal_sold_date')}</span>
                                                                <span className="font-bold text-slate-900">{selectedSerial.order.sold_date || selectedSerial.sold_date}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">{t('warranties_modal_store')}</span>
                                                                <span className="font-bold text-slate-900">{selectedSerial.store?.name ?? t('lbl_store')}</span>
                                                            </div>

                                                            <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                                                                <Link
                                                                    href={`/orders/${selectedSerial.order.id}`}
                                                                    onClick={() => setIsDetailsOpen(false)}
                                                                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                                                                >
                                                                    <span>{t('warranties_modal_open_order_details')}</span>
                                                                    <ExternalLink className="h-3 w-3 text-slate-400" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-500 italic">{t('warranties_not_sold_yet')}</p>
                                                    )}
                                                </div>

                                                {/* Customer Info */}
                                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                                                        <User className="h-4 w-4 text-indigo-600" />
                                                        {t('warranties_modal_customer_details')}
                                                    </div>
                                                    {selectedSerial.order?.customer ? (
                                                        <div className="space-y-2 text-xs">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-500">{t('lbl_name')}:</span>
                                                                <span className="font-bold text-slate-900">{selectedSerial.order.customer.name}</span>
                                                            </div>
                                                            {selectedSerial.order.customer.phone && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500">{t('lbl_phone')}:</span>
                                                                    <span className="font-bold text-slate-900">{selectedSerial.order.customer.phone}</span>
                                                                </div>
                                                            )}
                                                            {selectedSerial.order.customer.email && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-500">{t('lbl_email')}:</span>
                                                                    <span className="font-bold text-slate-900">{selectedSerial.order.customer.email}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-500 italic">{t('warranties_modal_no_customer')}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Notes / Remarks */}
                                            {selectedSerial.notes && (
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                                                    <span className="font-bold text-slate-900">{t('warranties_modal_notes')} </span>
                                                    {selectedSerial.notes}
                                                </div>
                                            )}

                                            {/* Modal Actions */}
                                            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                                                <button
                                                    onClick={() => setIsDetailsOpen(false)}
                                                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                                                >
                                                    {t('btn_close')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default WarrantiesTable;

