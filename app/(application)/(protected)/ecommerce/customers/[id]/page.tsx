'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    ShoppingBag,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCcw,
    ExternalLink,
    PlusCircle,
    Calendar,
    CreditCard,
    Package,
    ShieldCheck,
    Building2,
    ReceiptText,
    Truck,
    RefreshCw,
} from 'lucide-react';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { useCurrency } from '@/hooks/useCurrency';
import { useGetEcommerceCustomerQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import { StatusBadge } from '../../components/EcommerceBadges';
import {
    getEcommercePaymentMethodLabel,
    getEcommerceStatusLabel,
} from '../../components/ecommerceUtils';

export default function EcommerceCustomerDetailPage() {
    const { isBn } = useTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const params = useParams();
    const router = useRouter();
    const customerId = params?.id as string;

    const {
        data: responseData,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetEcommerceCustomerQuery(customerId, {
        skip: !customerId,
    });

    const data = (responseData as any)?.data;
    const customer = data?.customer;
    const orders: any[] = data?.orders || [];
    const stats = data?.stats || {
        total_orders: 0,
        total_spent: 0,
        completed_orders: 0,
        pending_orders: 0,
        cancelled_orders: 0,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center py-24 space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
                <p className="text-sm font-bold text-slate-600">
                    {isBn ? 'গ্রাহকের বিস্তারিত তথ্য ও অর্ডার লোড হচ্ছে...' : 'Loading customer profile & order history...'}
                </p>
            </div>
        );
    }

    if (isError || !customer) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-6">
                <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-xs">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-3">
                        <XCircle className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                        {isBn ? 'গ্রাহক পাওয়া যায়নি' : 'Customer Not Found'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 mb-6">
                        {isBn
                            ? 'অনুরোধকৃত ই-কমার্স গ্রাহকটির কোনো রেকর্ড নেই অথবা মুছে ফেলা হয়েছে।'
                            : 'The requested ecommerce customer profile could not be found or has been removed.'}
                    </p>
                    <Link
                        href="/ecommerce/customers"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>{isBn ? 'গ্রাহক তালিকায় ফিরে যান' : 'Back to Customers List'}</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16 space-y-6">
            {/* Header with Navigation */}
            <div className="border-b border-slate-200 bg-white shadow-xs sticky top-0 z-20">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/ecommerce/customers"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                        {isBn ? 'ই-কমার্স গ্রাহক' : 'Ecommerce Customer'}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                        ID #{customer.id}
                                    </span>
                                </div>
                                <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                                    <span>{customer.name}</span>
                                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                        {customer.status || 'Active'}
                                    </span>
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => refetch()}
                                disabled={isFetching}
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-primary' : 'text-slate-500'}`} />
                                <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
                            </button>

                            <Link
                                href="/ecommerce/orders/create"
                                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition"
                            >
                                <PlusCircle className="h-4 w-4" />
                                <span>{isBn ? 'এই গ্রাহকের জন্য অর্ডার তৈরি' : 'Create Order'}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                {/* 1. Customer Overview & Quick Stats Banner */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left: Customer Info Card */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-4 space-y-4">
                        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black text-lg shadow-xs">
                                {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">{customer.name}</h2>
                                <p className="text-xs text-slate-500 font-mono">
                                    {isBn ? 'নিবন্ধিত:' : 'Member since:'} {customer.created_at || '—'}
                                </p>
                            </div>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-2.5 text-xs">
                            <div className="flex items-center gap-2.5 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <Phone className="h-4 w-4 text-primary shrink-0" />
                                <span className="font-mono font-bold text-slate-900">{customer.mobile_number || '—'}</span>
                            </div>

                            <div className="flex items-center gap-2.5 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <Mail className="h-4 w-4 text-primary shrink-0" />
                                <span className="truncate font-medium">{customer.email || '—'}</span>
                            </div>
                        </div>

                        {/* Saved Addresses list */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                <span>{isBn ? 'সংরক্ষিত ঠিকানাসমূহ' : 'Saved Addresses'}</span>
                                <span className="font-mono text-[10px] text-slate-400">({customer.addresses?.length || 0})</span>
                            </h3>

                            {customer.addresses && customer.addresses.length > 0 ? (
                                <div className="space-y-2">
                                    {customer.addresses.map((addr: any) => (
                                        <div
                                            key={addr.id}
                                            className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs space-y-1 hover:border-slate-300 transition"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-800 flex items-center gap-1">
                                                    <span>{addr.name || customer.name}</span>
                                                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                                        {addr.label || addr.type || 'Address'}
                                                    </span>
                                                </span>
                                                {addr.is_default && (
                                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-600">
                                                {addr.address_line}
                                                {addr.area ? `, ${addr.area}` : ''}
                                                {addr.zone ? `, ${addr.zone}` : ''}
                                                {addr.city ? `, ${addr.city}` : ''}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-mono">{addr.phone || customer.mobile_number}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">
                                    {isBn ? 'কোন ঠিকানা সংরক্ষিত নেই।' : 'No delivery address saved yet.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Metrics & KPI Summary */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                            {/* Total Orders */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                                <div className="flex items-center justify-between text-slate-500 mb-1">
                                    <span className="text-xs font-semibold">{isBn ? 'মোট অর্ডার' : 'Total Orders'}</span>
                                    <ShoppingBag className="h-4 w-4 text-primary" />
                                </div>
                                <div className="text-2xl font-black text-slate-900">
                                    {formatNumber(stats.total_orders)}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">{isBn ? 'সর্বমোট অর্ডার' : 'Lifetime orders'}</p>
                            </div>

                            {/* Total Spend */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                                <div className="flex items-center justify-between text-slate-500 mb-1">
                                    <span className="text-xs font-semibold">{isBn ? 'মোট খরচ' : 'Total Spend'}</span>
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div className="text-2xl font-black text-emerald-600">
                                    {formatCurrency(stats.total_spent)}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">{isBn ? 'সর্বমোট কেনাকাটা' : 'Total revenue'}</p>
                            </div>

                            {/* Completed Orders */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                                <div className="flex items-center justify-between text-slate-500 mb-1">
                                    <span className="text-xs font-semibold">{isBn ? 'সম্পন্ন হয়েছে' : 'Delivered'}</span>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </div>
                                <div className="text-2xl font-black text-slate-900">
                                    {formatNumber(stats.completed_orders)}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">{isBn ? 'সফল ডেলিভারি' : 'Completed orders'}</p>
                            </div>

                            {/* Pending / Cancelled */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                                <div className="flex items-center justify-between text-slate-500 mb-1">
                                    <span className="text-xs font-semibold">{isBn ? 'পেন্ডিং / বাতিল' : 'Pending / Cancel'}</span>
                                    <Clock className="h-4 w-4 text-amber-500" />
                                </div>
                                <div className="text-2xl font-black text-slate-900">
                                    {formatNumber(stats.pending_orders)} / {formatNumber(stats.cancelled_orders)}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">{isBn ? 'চলমান ও বাতিল অর্ডার' : 'In-flight & cancelled'}</p>
                            </div>
                        </div>

                        {/* Customer Loyalty / Activity Banner */}
                        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-sky-50/50 to-primary/5 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
                                    <ReceiptText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900">
                                        {isBn ? 'গ্রাহকের গড় অর্ডার ভ্যালু (AOV)' : 'Average Order Value (AOV)'}
                                    </h4>
                                    <p className="text-sm font-extrabold text-primary">
                                        {stats.total_orders > 0
                                            ? formatCurrency(stats.total_spent / stats.total_orders)
                                            : formatCurrency(0)}
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/ecommerce/orders/create"
                                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-primary hover:text-white hover:border-primary shadow-2xs transition flex items-center gap-1.5"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>{isBn ? 'নতুন অর্ডার দিন' : 'Place New Order'}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Customer's Orders List & Details Table */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                                <span>{isBn ? 'গ্রাহকের অর্ডার ইতিহাস ও বিবরণ' : 'Customer Orders & Details'}</span>
                                <span className="font-mono text-xs text-slate-400">({orders.length})</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {isBn
                                    ? 'অর্ডারের ছোট বিবরণ দেখুন এবং পুরো অর্ডারটি দেখতে ক্লিক করুন।'
                                    : 'Click any order to view full order details, invoice and courier tracking.'}
                            </p>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 space-y-2">
                            <ShoppingBag className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="text-xs font-semibold">{isBn ? 'কোন পূর্ববর্তী অর্ডার পাওয়া যায়নি।' : 'No orders found for this customer.'}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="p-5 hover:bg-slate-50/70 transition space-y-4"
                                >
                                    {/* Order Row Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                                                #{order.id}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-sm text-slate-900">
                                                        {order.order_number}
                                                    </span>
                                                    <StatusBadge status={order.status} />
                                                </div>
                                                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-slate-400" />
                                                        <span>{order.created_at}</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span className="font-medium text-slate-700">{order.store_name}</span>
                                                    {order.source_name && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-slate-200/70 rounded text-slate-700">
                                                                {order.source_name}
                                                            </span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Total & Action to Open Full Order Details Page */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-slate-400">{isBn ? 'অর্ডার মোট:' : 'Order Total:'}</div>
                                                <div className="text-base font-black text-slate-900">
                                                    {formatCurrency(order.total)}
                                                </div>
                                            </div>

                                            <Link
                                                href={`/ecommerce/orders/${order.id}`}
                                                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition"
                                            >
                                                <span>{isBn ? 'সম্পূর্ণ অর্ডার দেখুন' : 'View Full Order'}</span>
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Order Items Small Details Box */}
                                    {order.items && order.items.length > 0 && (
                                        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                <Package className="h-3.5 w-3.5 text-primary" />
                                                <span>{isBn ? 'অর্ডারের পণ্যসমূহ:' : 'Ordered Items:'}</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {order.items.map((item: any) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 border border-slate-100 text-xs"
                                                    >
                                                        <div className="truncate mr-2">
                                                            <p className="font-bold text-slate-800 truncate">{item.product_name}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono">
                                                                {item.quantity} {item.unit || 'pcs'} × {formatCurrency(item.unit_price)}
                                                            </p>
                                                        </div>
                                                        <div className="font-bold text-slate-900 font-mono shrink-0">
                                                            {formatCurrency(item.subtotal)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Order Footer summary info (Shipping address & payment info) */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-1">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                                            <span>
                                                {isBn ? 'পেমেন্ট:' : 'Payment:'} <strong>{getEcommercePaymentMethodLabel(order.payment_method)}</strong> (
                                                <span className="capitalize">{order.payment_status}</span>)
                                            </span>
                                        </div>

                                        {order.shipping_address && (
                                            <div className="flex items-center gap-1.5 text-slate-600 truncate max-w-md">
                                                <Truck className="h-3.5 w-3.5 text-primary shrink-0" />
                                                <span className="truncate">
                                                    {order.shipping_address.address_line || ''}{' '}
                                                    {order.shipping_address.city ? `• ${order.shipping_address.city}` : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
