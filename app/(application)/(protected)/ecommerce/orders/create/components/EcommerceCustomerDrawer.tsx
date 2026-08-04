'use client';

import React from 'react';
import Link from 'next/link';
import {
    X,
    User,
    Phone,
    Mail,
    MapPin,
    ShoppingBag,
    Calendar,
    ExternalLink,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    CreditCard,
    ArrowUpRight,
    Check,
} from 'lucide-react';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { useCurrency } from '@/hooks/useCurrency';
import { useGetEcommerceCustomerQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import { StatusBadge } from '../../../components/EcommerceBadges';
import { getEcommerceStatusLabel, getEcommercePaymentMethodLabel } from '../../../components/ecommerceUtils';

interface EcommerceCustomerDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: number | string | null;
    onSelectAddress?: (addr: {
        addressLine: string;
        districtName?: string;
        zoneName?: string;
        areaName?: string;
        name?: string;
        phone?: string;
    }) => void;
}

export default function EcommerceCustomerDrawer({
    isOpen,
    onClose,
    customerId,
    onSelectAddress,
}: EcommerceCustomerDrawerProps) {
    const { t, i18n } = useTranslation();
    const isBn = i18n.language === 'bn';
    const { formatCurrency, formatNumber } = useCurrency();

    const { data: customerResponse, isLoading, isError } = useGetEcommerceCustomerQuery(
        customerId as any,
        { skip: !customerId || !isOpen }
    );

    if (!isOpen) return null;

    const data = (customerResponse as any)?.data;
    const customer = data?.customer;
    const orders = data?.orders || [];
    const stats = data?.stats || {
        total_orders: 0,
        total_spent: 0,
        completed_orders: 0,
        pending_orders: 0,
        cancelled_orders: 0,
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-2xl bg-slate-50 border-l border-slate-200 shadow-2xl flex flex-col transform transition ease-in-out duration-300">
                    {/* Header */}
                    <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-base shadow-xs">
                                {customer?.name ? customer.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    {customer?.name || (t('ecomm_customer_drawer_title'))}
                                    {customer?.status && (
                                        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            {customer.status}
                                        </span>
                                    )}
                                </h3>
                                <p className="text-xs text-slate-500 font-mono">
                                    ID: #{customerId} • {customer?.mobile_number || (t('ecomm_customers_loading'))}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-3 text-slate-400">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                <p className="text-sm font-medium">{t('ecomm_customers_loading')}</p>
                            </div>
                        ) : isError || !customer ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
                                <p className="text-sm font-semibold">{t('ecomm_customer_not_found')}</p>
                            </div>
                        ) : (
                            <>
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                                        <div className="flex items-center justify-between text-slate-500 mb-1">
                                            <span className="text-xs font-semibold">{t('ecomm_customer_drawer_orders_count')}</span>
                                            <ShoppingBag className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">
                                            {formatNumber(stats.total_orders)}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                                        <div className="flex items-center justify-between text-slate-500 mb-1">
                                            <span className="text-xs font-semibold">{t('ecomm_customer_drawer_total_spent')}</span>
                                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <div className="text-lg font-bold text-emerald-600">
                                            {formatCurrency(stats.total_spent)}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                                        <div className="flex items-center justify-between text-slate-500 mb-1">
                                            <span className="text-xs font-semibold">{t('lbl_completed')}</span>
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">
                                            {formatNumber(stats.completed_orders)}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                                        <div className="flex items-center justify-between text-slate-500 mb-1">
                                            <span className="text-xs font-semibold">{t('lbl_pending')}</span>
                                            <Clock className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">
                                            {formatNumber(stats.pending_orders)} / {formatNumber(stats.cancelled_orders)}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact & Addresses */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-primary" />
                                            {t('ecomm_customer_drawer_addresses')}
                                        </h4>
                                        <Link
                                            href={`/ecommerce/customers/${customer.id}`}
                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                        >
                                            <span>{t('ecomm_customers_view_profile')}</span>
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            <Phone className="h-4 w-4 text-primary shrink-0" />
                                            <span className="font-mono font-medium">{customer.mobile_number}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            <Mail className="h-4 w-4 text-primary shrink-0" />
                                            <span className="truncate">{customer.email || '—'}</span>
                                        </div>
                                    </div>

                                    {/* Saved Addresses List */}
                                    {customer.addresses && customer.addresses.length > 0 && (
                                        <div className="space-y-2 pt-1">
                                            <p className="text-[11px] font-bold text-slate-500">
                                                {t('ecomm_customer_drawer_addresses') + ':'}
                                            </p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {customer.addresses.map((addr: any) => (
                                                    <div
                                                        key={addr.id}
                                                        className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary/40 transition group"
                                                    >
                                                        <div className="flex items-start gap-2.5">
                                                            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-xs text-slate-900">{addr.name || customer.name}</span>
                                                                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                                                                        {addr.label || addr.type || 'Address'}
                                                                    </span>
                                                                    {addr.is_default && (
                                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                                                            Default
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-slate-600 mt-0.5">
                                                                    {addr.address_line}
                                                                    {addr.area ? `, ${addr.area}` : ''}
                                                                    {addr.zone ? `, ${addr.zone}` : ''}
                                                                    {addr.city ? `, ${addr.city}` : ''}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{addr.phone || customer.mobile_number}</p>
                                                            </div>
                                                        </div>

                                                        {onSelectAddress && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    onSelectAddress({
                                                                        addressLine: addr.address_line || '',
                                                                        districtName: addr.city || '',
                                                                        zoneName: addr.zone || '',
                                                                        areaName: addr.area || '',
                                                                        name: addr.name || customer.name,
                                                                        phone: addr.phone || customer.mobile_number,
                                                                    });
                                                                    onClose();
                                                                }}
                                                                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-primary hover:text-white hover:border-primary shadow-2xs transition shrink-0"
                                                            >
                                                                {t('ecomm_delivery_address_label')}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Order History Section */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                                            {t('ecomm_customer_drawer_order_history')} ({orders.length})
                                        </h4>
                                    </div>

                                    {orders.length === 0 ? (
                                        <div className="py-8 text-center text-slate-400 text-xs">
                                            {t('ecomm_customer_drawer_no_orders')}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {orders.map((order: any) => (
                                                <div
                                                    key={order.id}
                                                    className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5 hover:border-slate-300 hover:bg-white transition space-y-3"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div>
                                                            <span className="font-mono font-bold text-xs text-slate-900">
                                                                {order.order_number}
                                                            </span>
                                                            <p className="text-[11px] text-slate-400">
                                                                {order.created_at} • {order.store_name}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <StatusBadge status={order.status} />
                                                            <Link
                                                                href={`/ecommerce/orders/${order.id}`}
                                                                target="_blank"
                                                                className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline px-2 py-1 rounded-lg bg-primary/5 border border-primary/20"
                                                            >
                                                                <span>{t('ecomm_customers_col_orders')}</span>
                                                                <ExternalLink className="h-3 w-3" />
                                                            </Link>
                                                        </div>
                                                    </div>

                                                    {/* Items preview */}
                                                    {order.items && order.items.length > 0 && (
                                                        <div className="rounded-lg bg-white border border-slate-100 p-2 text-xs space-y-1">
                                                            {order.items.slice(0, 3).map((item: any) => (
                                                                <div key={item.id} className="flex items-center justify-between text-slate-600">
                                                                    <span className="truncate max-w-[280px]">
                                                                        {item.product_name} <span className="font-mono text-slate-400">x{item.quantity}</span>
                                                                    </span>
                                                                    <span className="font-medium font-mono">{formatCurrency(item.subtotal)}</span>
                                                                </div>
                                                            ))}
                                                            {order.items.length > 3 && (
                                                                <p className="text-[10px] text-slate-400 pt-0.5">
                                                                    + {order.items.length - 3} {t('ecomm_cart_items')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Financial summary footer */}
                                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <CreditCard className="h-3.5 w-3.5" />
                                                            <span>{getEcommercePaymentMethodLabel(order.payment_method)}</span>
                                                            <span className="capitalize text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                                                {order.payment_status}
                                                            </span>
                                                        </div>

                                                        <div className="font-bold text-slate-900">
                                                            {t('ecomm_invoice_total') + ':'} {formatCurrency(order.total)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-end gap-3 sticky bottom-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                        >
                            {t('ecomm_nav_cancel')}
                        </button>
                        {customer?.id && (
                            <Link
                                href={`/ecommerce/customers/${customer.id}`}
                                className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 shadow-xs transition flex items-center gap-1.5"
                            >
                                <span>{t('ecomm_customers_view_profile')}</span>
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
