'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetDashboardDeadStockQuery } from '@/store/features/dashboard/dashboad';
import { PackageX } from 'lucide-react';
import Link from 'next/link';

interface DeadStockProduct {
    product_id: number;
    product_name: string;
    sku: string;
    quantity: number;
    unit?: string;
    stock_value: number;
    last_sold_at: string | null;
    days_since_sale: number | null;
}

export default function DeadStockWidget() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data, isLoading, isError } = useGetDashboardDeadStockQuery(
        { store_id: currentStoreId, days: 90, limit: 5 },
        { skip: !currentStoreId }
    );

    if (isLoading) {
        return <div className="h-32 animate-pulse rounded-xl bg-gray-200" />;
    }

    if (isError || !data?.data) return null;

    const summary = data.data;
    const products: DeadStockProduct[] = summary.products || [];

    if (products.length === 0) return null;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
                        <PackageX className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{t('dashboard_dead_stock')}</p>
                        <h3 className="text-2xl font-black text-gray-900">{formatCurrency(summary.total_dead_stock_value || 0)}</h3>
                        <p className="mt-1 text-sm text-gray-500">{summary.count} {t('dashboard_dead_stock_desc')}</p>
                    </div>
                </div>
                <Link href="/reports/stock" className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50">
                    {t('lbl_view_all')}
                </Link>
            </div>

            <div className="space-y-2">
                {products.map((product) => (
                    <div key={product.product_id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-2">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{product.product_name}</p>
                            <p className="text-xs text-gray-500">
                                {product.sku} &middot; {product.quantity} {product.unit || t('lbl_units')}
                            </p>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-rose-700">{formatCurrency(product.stock_value || 0)}</p>
                            <p className="text-[10px] text-gray-400">
                                {product.days_since_sale !== null ? `${product.days_since_sale} ${t('dashboard_days_since_sale')}` : t('dashboard_never_sold')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
