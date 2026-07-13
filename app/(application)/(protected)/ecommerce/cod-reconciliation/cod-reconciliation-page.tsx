'use client';

import { useMemo, useState } from 'react';
import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetCodReconciliationQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import { Banknote, CalendarDays, CircleDollarSign, RefreshCw, Truck, WalletCards } from 'lucide-react';

export default function CodReconciliationPage() {
    const { t } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId } = useCurrentStore();
    const today = new Date().toISOString().slice(0, 10);
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const [dateFrom, setDateFrom] = useState(monthAgo);
    const [dateTo, setDateTo] = useState(today);
    const [provider, setProvider] = useState('');

    const params = useMemo(
        () => ({
            store_id: currentStoreId,
            date_from: dateFrom,
            date_to: dateTo,
            ...(provider ? { provider } : {}),
        }),
        [currentStoreId, dateFrom, dateTo, provider]
    );

    const { data, isFetching, refetch } = useGetCodReconciliationQuery(params, { skip: !currentStoreId });
    const payload = data?.data || {};
    const summary = payload.summary || {};
    const items = payload.items || [];

    const summaryCards = [
        {
            label: t('cod_reconciliation_delivered_cod'),
            value: summary.delivered_cod,
            icon: CircleDollarSign,
            tone: 'text-[#046ca9] bg-[#eef7fc] border-[#cde2ef]',
        },
        {
            label: t('cod_reconciliation_paid_cod'),
            value: summary.paid_cod_order_total,
            icon: Banknote,
            tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        },
        {
            label: t('cod_reconciliation_unsettled_cod'),
            value: summary.unsettled_cod,
            icon: WalletCards,
            tone: 'text-[#e79237] bg-[#fff4e6] border-[#f3d6ad]',
        },
        {
            label: t('cod_reconciliation_delivery_fee'),
            value: summary.delivery_fee_total,
            icon: Truck,
            tone: 'text-slate-700 bg-slate-50 border-slate-200',
        },
    ];

    return (
        <div className="min-h-full bg-[#f6f8fb] p-3 sm:p-5">
            <div className="mx-auto max-w-7xl space-y-4">
                <div className="flex flex-col gap-4 rounded-lg border border-[#d8e4ec] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#046ca9] text-white shadow-sm">
                            <WalletCards className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{t('cod_reconciliation_title')}</h1>
                            <p className="mt-1 text-sm text-gray-500">{t('cod_reconciliation_subtitle')}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#cde2ef] bg-[#eef7fc] px-4 text-sm font-semibold text-[#034d79] transition hover:bg-[#d7e9f5]"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                        {t('btn_refresh')}
                    </button>
                </div>

                <section className="rounded-lg border border-[#d8e4ec] bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <CalendarDays className="h-4 w-4 text-[#046ca9]" />
                        <span>{t('btn_filter')}</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[minmax(150px,1fr)_minmax(150px,1fr)_minmax(180px,1fr)_minmax(170px,0.9fr)]">
                        <label className="min-w-0">
                            <span className="mb-1 block text-xs font-semibold uppercase text-gray-500">{t('lbl_from_date')}</span>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(event) => setDateFrom(event.target.value)}
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/15"
                            />
                        </label>
                        <label className="min-w-0">
                            <span className="mb-1 block text-xs font-semibold uppercase text-gray-500">{t('lbl_to_date')}</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(event) => setDateTo(event.target.value)}
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/15"
                            />
                        </label>
                        <label className="min-w-0">
                            <span className="mb-1 block text-xs font-semibold uppercase text-gray-500">{t('cod_reconciliation_provider')}</span>
                            <select
                                value={provider}
                                onChange={(event) => setProvider(event.target.value)}
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/15"
                            >
                                <option value="">{t('cod_reconciliation_all_providers')}</option>
                                <option value="pathao">Pathao</option>
                                <option value="redx">RedX</option>
                                <option value="steadfast">Steadfast</option>
                            </select>
                        </label>
                        <div className="flex min-w-0 items-center gap-3 rounded-lg border border-[#cde2ef] bg-[#eef7fc] px-3 py-2 text-sm font-semibold text-[#034d79]">
                            <WalletCards className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                                {formatNumber(summary.shipment_count || 0)} {t('cod_reconciliation_shipments')}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <div key={card.label} className="rounded-lg border border-[#d8e4ec] bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-xs font-semibold uppercase leading-5 text-gray-500">{card.label}</p>
                                <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${card.tone}`}>
                                    <card.icon className="h-4 w-4" />
                                </span>
                            </div>
                            <p className="mt-3 text-xl font-bold text-gray-900">{formatCurrency(Number(card.value || 0))}</p>
                        </div>
                    ))}
                </section>

                <section className="overflow-hidden rounded-lg border border-[#d8e4ec] bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-4 py-3">
                        <h2 className="text-sm font-bold text-gray-900">{t('cod_reconciliation_title')}</h2>
                        <p className="mt-1 text-xs text-gray-500">{t('cod_reconciliation_subtitle')}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-[#f6f8fb] text-left text-xs font-semibold uppercase text-gray-500">
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
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item: any) => (
                                    <tr key={`${item.store_id}-${item.provider}`} className="transition hover:bg-[#f6f8fb]">
                                        <td className="px-4 py-3 font-semibold text-gray-900">#{item.store_id}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex rounded-md bg-[#eef7fc] px-2 py-1 text-xs font-semibold capitalize text-[#034d79]">{item.provider}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-700">{formatNumber(item.shipment_count || 0)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(Number(item.delivered_cod || 0))}</td>
                                        <td className="px-4 py-3 text-right font-medium text-emerald-700">{formatCurrency(Number(item.paid_cod_order_total || 0))}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-[#b86812]">{formatCurrency(Number(item.unsettled_cod || 0))}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(Number(item.returned_cod || 0))}</td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center">
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#eef7fc] text-[#046ca9]">
                                                    <WalletCards className="h-6 w-6" />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-700">{t('cod_reconciliation_empty')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
