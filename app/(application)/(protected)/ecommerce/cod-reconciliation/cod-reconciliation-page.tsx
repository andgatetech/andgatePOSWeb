'use client';

import { useMemo, useState } from 'react';
import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetCodReconciliationQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import { RefreshCw, WalletCards } from 'lucide-react';

export default function CodReconciliationPage() {
    const { t } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId } = useCurrentStore();
    const today = new Date().toISOString().slice(0, 10);
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const [dateFrom, setDateFrom] = useState(monthAgo);
    const [dateTo, setDateTo] = useState(today);
    const [provider, setProvider] = useState('');

    const params = useMemo(() => ({
        store_id: currentStoreId,
        date_from: dateFrom,
        date_to: dateTo,
        ...(provider ? { provider } : {}),
    }), [currentStoreId, dateFrom, dateTo, provider]);

    const { data, isFetching, refetch } = useGetCodReconciliationQuery(params, { skip: !currentStoreId });
    const payload = data?.data || {};
    const summary = payload.summary || {};
    const items = payload.items || [];

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{t('cod_reconciliation_title')}</h1>
                    <p className="mt-1 text-sm text-slate-500">{t('cod_reconciliation_subtitle')}</p>
                </div>
                <button type="button" onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    {t('btn_refresh')}
                </button>
            </div>

            <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-4">
                <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <select value={provider} onChange={(event) => setProvider(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <option value="">{t('cod_reconciliation_all_providers')}</option>
                    <option value="pathao">Pathao</option>
                    <option value="redx">RedX</option>
                    <option value="steadfast">Steadfast</option>
                </select>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                    <WalletCards className="h-4 w-4 text-sky-600" />
                    {formatNumber(summary.shipment_count || 0)} {t('cod_reconciliation_shipments')}
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-4">
                {[
                    ['cod_reconciliation_delivered_cod', summary.delivered_cod],
                    ['cod_reconciliation_paid_cod', summary.paid_cod_order_total],
                    ['cod_reconciliation_unsettled_cod', summary.unsettled_cod],
                    ['cod_reconciliation_delivery_fee', summary.delivery_fee_total],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-slate-500">{t(String(label))}</p>
                        <p className="mt-2 text-lg font-bold text-slate-900">{formatCurrency(Number(value || 0))}</p>
                    </div>
                ))}
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">{t('lbl_store')}</th>
                                <th className="px-4 py-3">{t('cod_reconciliation_provider')}</th>
                                <th className="px-4 py-3 text-right">{t('cod_reconciliation_shipments')}</th>
                                <th className="px-4 py-3 text-right">{t('cod_reconciliation_delivered_cod')}</th>
                                <th className="px-4 py-3 text-right">{t('cod_reconciliation_paid_cod')}</th>
                                <th className="px-4 py-3 text-right">{t('cod_reconciliation_unsettled_cod')}</th>
                                <th className="px-4 py-3 text-right">{t('cod_reconciliation_returned_cod')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item: any) => (
                                <tr key={`${item.store_id}-${item.provider}`}>
                                    <td className="px-4 py-3 font-medium text-slate-800">#{item.store_id}</td>
                                    <td className="px-4 py-3 capitalize text-slate-600">{item.provider}</td>
                                    <td className="px-4 py-3 text-right">{formatNumber(item.shipment_count || 0)}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(Number(item.delivered_cod || 0))}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(Number(item.paid_cod_order_total || 0))}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-amber-700">{formatCurrency(Number(item.unsettled_cod || 0))}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(Number(item.returned_cod || 0))}</td>
                                </tr>
                            ))}
                            {items.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">{t('cod_reconciliation_empty')}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
