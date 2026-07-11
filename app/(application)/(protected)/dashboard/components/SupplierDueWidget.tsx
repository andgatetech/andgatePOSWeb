'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetDashboardSupplierDuesQuery } from '@/store/features/dashboard/dashboad';
import { Phone, Truck } from 'lucide-react';
import Link from 'next/link';

interface SupplierDue {
    supplier_id: number;
    supplier_name: string;
    phone: string | null;
    remaining: number;
    order_count: number;
}

export default function SupplierDueWidget() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data, isLoading, isError } = useGetDashboardSupplierDuesQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );

    if (isLoading) {
        return <div className="h-32 animate-pulse rounded-xl bg-gray-200" />;
    }

    if (isError || !data?.data) return null;

    const summary = data.data;
    const topDues: SupplierDue[] = summary.top_dues || [];
    const hasDue = Number(summary.total_remaining || 0) > 0;

    if (!hasDue) {
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <Truck className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-emerald-900">{t('dashboard_supplier_due_snapshot')}</h3>
                            <p className="text-xs text-emerald-700">{t('dashboard_no_supplier_due')}</p>
                        </div>
                    </div>
                    <Link href="/suppliers/due" className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100">
                        {t('lbl_view_all')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm lg:col-span-2">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">{t('dashboard_supplier_due')}</p>
                        <h3 className="mt-1 text-2xl font-black text-gray-900">{formatCurrency(summary.total_remaining || 0)}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('dashboard_supplier_due_desc')}</p>
                    </div>
                    <Link href="/suppliers/due" className="rounded-lg bg-[#046ca9] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#034d79]">
                        {t('lbl_view_all')}
                    </Link>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    {summary.suppliers_with_due} {t('dashboard_suppliers_with_due')}
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">{t('dashboard_top_due_suppliers')}</h3>
                    <Link href="/suppliers/due" className="text-xs font-semibold text-[#046ca9] hover:text-[#034d79]">
                        {t('lbl_view_all')}
                    </Link>
                </div>

                <div className="space-y-2">
                    {topDues.slice(0, 4).map((due) => (
                        <div key={due.supplier_id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-2">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">{due.supplier_name}</p>
                                <p className="flex items-center gap-1 text-xs text-gray-500">
                                    <Phone className="h-3 w-3" />
                                    {due.phone || t('lbl_no_phone')}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-sm font-bold text-amber-700">{formatCurrency(due.remaining || 0)}</p>
                                <p className="text-[10px] text-gray-400">{due.order_count} {t('lbl_orders')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
