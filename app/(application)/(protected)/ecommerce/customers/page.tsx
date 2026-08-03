'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Users,
    Search,
    ShoppingBag,
    TrendingUp,
    MapPin,
    Phone,
    Mail,
    ChevronRight,
    ArrowUpDown,
    ExternalLink,
    PlusCircle,
    Calendar,
    RefreshCw,
    UserCheck,
    Eye,
    ChevronLeft,
    ShieldCheck,
} from 'lucide-react';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetEcommerceCustomersQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import EcommerceCustomerDrawer from '../orders/create/components/EcommerceCustomerDrawer';

export default function EcommerceCustomersPage() {
    const { isBn } = useTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Selected customer for Quick Drawer
    const [quickViewCustomerId, setQuickViewCustomerId] = useState<number | null>(null);

    const {
        data: responseData,
        isLoading,
        isFetching,
        refetch,
    } = useGetEcommerceCustomersQuery({
        page,
        per_page: perPage,
        search: searchQuery.trim(),
        sort_field: sortField,
        sort_direction: sortDirection,
        store_id: currentStoreId || undefined,
    });

    const data = (responseData as any)?.data;
    const customers: any[] = useMemo(() => data?.items || [], [data]);
    const pagination = data?.pagination || {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 20,
        from: 0,
        to: 0,
    };
    const stats = data?.stats || {
        total_customers: 0,
        total_orders: 0,
        total_spent: 0,
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16 space-y-6 -mx-3 sm:-mx-4 lg:-mx-6">
            {/* Top Header Banner */}
            <div className="border-b border-slate-200 bg-white shadow-xs">
                <div className="w-full px-4 py-5 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                    {isBn ? 'অনলাইন শপ' : 'eCommerce'}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                    {isBn ? 'অনলাইন গ্রাহক ডেটাবেজ' : 'Online Store Customers'}
                                </span>
                            </div>
                            <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                                <Users className="h-6 w-6 text-primary" />
                                <span>{isBn ? 'ই-কমার্স গ্রাহক তালিকা' : 'Ecommerce Customers'}</span>
                            </h1>
                            <p className="mt-0.5 text-xs text-slate-500">
                                {isBn
                                    ? 'অনলাইন অর্ডারের গ্রাহক প্রোফাইল, মোট অর্ডার ও খরচের বিবরণ দেখুন।'
                                    : 'Manage ecommerce customers, view purchase history, addresses, and order volume.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => refetch()}
                                disabled={isFetching}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition disabled:opacity-50"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-primary' : 'text-slate-500'}`} />
                                <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
                            </button>

                            <Link
                                href="/ecommerce/orders/create"
                                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition"
                            >
                                <PlusCircle className="h-4 w-4" />
                                <span>{isBn ? 'নতুন অর্ডার তৈরি' : 'Create Order'}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full px-4 sm:px-6 space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {/* Total Customers */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {isBn ? 'মোট অনলাইন গ্রাহক' : 'Total Customers'}
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Users className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">
                                {formatNumber(stats.total_customers)}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                                {isBn ? 'নিবন্ধিত অ্যাকাউন্ট' : 'Registered Accounts'}
                            </span>
                        </div>
                    </div>

                    {/* Total Orders Placed */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {isBn ? 'মোট অনলাইন অর্ডার' : 'Total Online Orders'}
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">
                                {formatNumber(stats.total_orders)}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                                {isBn ? 'টি অর্ডার সম্পন্ন' : 'Orders Placed'}
                            </span>
                        </div>
                    </div>

                    {/* Total Revenue / Spend */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {isBn ? 'মোট বিক্রয় / খরচ' : 'Total Order Revenue'}
                            </span>
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-600">
                                {formatCurrency(stats.total_spent)}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                                {isBn ? 'সর্বমোট আয়' : 'Lifetime Sales'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Table Container Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    {/* Search & Filter Bar */}
                    <div className="border-b border-slate-200 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
                        <div className="relative max-w-md flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setPage(1);
                                }}
                                placeholder={isBn ? 'গ্রাহকের নাম, মোবাইল নম্বর, ইমেইল বা ঠিকানা দিয়ে খুঁজুন...' : 'Search by customer name, phone, email or address...'}
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none"
                            />
                        </div>

                        <div className="mt-3 flex items-center justify-between sm:mt-0 gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                <span>{isBn ? 'প্রতি পেজে:' : 'Show:'}</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 focus:border-primary focus:outline-none"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>

                            <span className="text-xs font-semibold text-slate-400">
                                {isBn ? 'মোট ফলাফল:' : 'Found:'} <strong className="text-slate-800 font-bold">{formatNumber(pagination.total)}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Customers Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3.5">
                                        <button
                                            type="button"
                                            onClick={() => handleSort('name')}
                                            className="flex items-center gap-1 hover:text-slate-900 transition"
                                        >
                                            <span>{isBn ? 'গ্রাহক পরিচিতি' : 'Customer'}</span>
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3.5">{isBn ? 'যোগাযোগ' : 'Contact'}</th>
                                    <th className="px-4 py-3.5">{isBn ? 'ঠিকানা (লোকেশন)' : 'Primary Address'}</th>
                                    <th className="px-4 py-3.5 text-center">
                                        <button
                                            type="button"
                                            onClick={() => handleSort('orders_count')}
                                            className="inline-flex items-center gap-1 hover:text-slate-900 transition"
                                        >
                                            <span>{isBn ? 'অর্ডার সংখ্যা' : 'Orders'}</span>
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3.5 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleSort('total_spent')}
                                            className="inline-flex items-center gap-1 hover:text-slate-900 transition"
                                        >
                                            <span>{isBn ? 'মোট খরচ' : 'Total Spent'}</span>
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3.5 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleSort('created_at')}
                                            className="inline-flex items-center gap-1 hover:text-slate-900 transition"
                                        >
                                            <span>{isBn ? 'নিবন্ধন তারিখ' : 'Joined'}</span>
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="px-4 py-3.5 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-slate-400">
                                            <div className="inline-flex flex-col items-center gap-2">
                                                <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                <span className="text-xs font-medium">{isBn ? 'ই-কমার্স গ্রাহক তালিকা লোড হচ্ছে...' : 'Loading ecommerce customers...'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-slate-400">
                                            <div className="inline-flex flex-col items-center gap-2">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                    <Users className="h-6 w-6" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">
                                                    {isBn ? 'কোন গ্রাহক পাওয়া যায়নি' : 'No Ecommerce Customers Found'}
                                                </p>
                                                <p className="text-xs text-slate-400 max-w-sm">
                                                    {searchQuery
                                                        ? (isBn ? 'অনুসন্ধানের সাথে মিলে এমন কোন গ্রাহক নেই।' : 'No customer matches your search query.')
                                                        : (isBn ? 'অনলাইন স্টোরে অর্ডার সম্পন্ন হলে এখানে গ্রাহকদের তালিকা দেখাবে।' : 'Customers who place online orders will appear here.')}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((cust) => {
                                        const primary = cust.primary_address;
                                        return (
                                            <tr key={cust.id} className="hover:bg-slate-50/60 transition group">
                                                {/* Customer Name & Avatar */}
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                                                            {cust.name ? cust.name.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`/ecommerce/customers/${cust.id}`}
                                                                className="font-bold text-slate-900 hover:text-primary transition flex items-center gap-1.5"
                                                            >
                                                                <span>{cust.name}</span>
                                                                <span className="text-[10px] font-mono font-normal text-slate-400">
                                                                    #{cust.id}
                                                                </span>
                                                            </Link>
                                                            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                {cust.status || 'Active'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact Details */}
                                                <td className="px-4 py-3.5">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5 text-slate-700 font-mono font-medium">
                                                            <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                                            <span>{cust.mobile_number || '—'}</span>
                                                        </div>
                                                        {cust.email && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate max-w-[180px]">
                                                                <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                                                                <span className="truncate">{cust.email}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Primary Address */}
                                                <td className="px-4 py-3.5">
                                                    {primary ? (
                                                        <div className="space-y-0.5 max-w-[240px]">
                                                            <div className="flex items-center gap-1 text-slate-800 font-medium truncate">
                                                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                                                <span className="truncate">{primary.city || primary.area || 'Address'}</span>
                                                                {primary.type && (
                                                                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                                                                        {primary.type}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 truncate">
                                                                {primary.full_address || primary.address_line}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[11px]">
                                                            {isBn ? 'ঠিকানা যুক্ত নেই' : 'No address saved'}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Orders Count */}
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 border border-sky-200 font-mono">
                                                        <ShoppingBag className="h-3 w-3 text-sky-500" />
                                                        <span>{formatNumber(cust.orders_count || 0)}</span>
                                                    </span>
                                                </td>

                                                {/* Total Spent */}
                                                <td className="px-4 py-3.5 text-right font-mono">
                                                    <span className="font-bold text-slate-900 text-xs">
                                                        {formatCurrency(cust.total_spent || 0)}
                                                    </span>
                                                </td>

                                                {/* Joined Date */}
                                                <td className="px-4 py-3.5 text-right text-slate-500 text-[11px]">
                                                    <span className="font-medium">{cust.created_at || '—'}</span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setQuickViewCustomerId(cust.id)}
                                                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-primary hover:text-primary shadow-2xs transition"
                                                            title={isBn ? 'কুইক প্রিভিউ' : 'Quick Preview'}
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </button>

                                                        <Link
                                                            href={`/ecommerce/customers/${cust.id}`}
                                                            className="flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition shadow-2xs"
                                                        >
                                                            <span>{isBn ? 'প্রোফাইল ও অর্ডার' : 'View Profile'}</span>
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {pagination.total > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:px-6 bg-slate-50/50 text-xs">
                            <div className="text-slate-500">
                                {isBn ? (
                                    <span>
                                        দেখানো হচ্ছে <strong>{formatNumber(pagination.from || 1)}</strong> থেকে{' '}
                                        <strong>{formatNumber(pagination.to || pagination.total)}</strong> (মোট{' '}
                                        <strong>{formatNumber(pagination.total)}</strong> গ্রাহকের মধ্যে)
                                    </span>
                                ) : (
                                    <span>
                                        Showing <strong>{pagination.from || 1}</strong> to{' '}
                                        <strong>{pagination.to || pagination.total}</strong> of{' '}
                                        <strong>{pagination.total}</strong> customers
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page <= 1 || isFetching}
                                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 transition"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    <span>{isBn ? 'পূর্ববর্তী' : 'Previous'}</span>
                                </button>

                                <span className="px-2 font-bold text-slate-700">
                                    {formatNumber(page)} / {formatNumber(pagination.last_page || 1)}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.last_page || 1))}
                                    disabled={page >= (pagination.last_page || 1) || isFetching}
                                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-bold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 transition"
                                >
                                    <span>{isBn ? 'পরবর্তী' : 'Next'}</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Customer Quick View Drawer */}
            <EcommerceCustomerDrawer
                isOpen={quickViewCustomerId !== null}
                onClose={() => setQuickViewCustomerId(null)}
                customerId={quickViewCustomerId}
            />
        </div>
    );
}
