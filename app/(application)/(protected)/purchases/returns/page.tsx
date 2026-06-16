'use client';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetPurchaseReturnsQuery } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const PurchaseReturnsListPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();

    const [page, setPage] = useState(1);

    const { data, isLoading, isFetching } = useGetPurchaseReturnsQuery(
        { store_id: currentStoreId, per_page: 20, page },
        { skip: !currentStoreId }
    );

    const returns = data?.data?.data ?? [];
    const meta = data?.data;

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/purchases/list" className="text-gray-500 hover:text-primary">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <RotateCcw size={20} className="text-danger" />
                            {t('purchase_returns') || 'Purchase Returns'}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {t('purchase_returns_subtitle') || 'History of returned items to suppliers'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                        <tr>
                            <th className="px-4 py-3">{t('reference') || 'Reference'}</th>
                            <th className="px-4 py-3">{t('purchase_order') || 'Purchase Order'}</th>
                            <th className="px-4 py-3">{t('supplier') || 'Supplier'}</th>
                            <th className="px-4 py-3">{t('refund_type') || 'Refund Type'}</th>
                            <th className="px-4 py-3 text-right">{t('amount') || 'Amount'}</th>
                            <th className="px-4 py-3">{t('status') || 'Status'}</th>
                            <th className="px-4 py-3">{t('date') || 'Date'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {isLoading || isFetching ? (
                            <tr>
                                <td colSpan={7} className="py-10 text-center text-gray-400">
                                    {t('loading') || 'Loading…'}
                                </td>
                            </tr>
                        ) : returns.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-10 text-center text-gray-400">
                                    {t('no_purchase_returns') || 'No purchase returns found'}
                                </td>
                            </tr>
                        ) : (
                            returns.map((ret: any) => (
                                <tr key={ret.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-3 font-mono text-primary font-medium">
                                        <Link href={`/purchases/returns/${ret.id}`} className="hover:underline">
                                            {ret.return_reference}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                        {ret.purchase_order?.invoice_number || '—'}
                                    </td>
                                    <td className="px-4 py-3">{ret.supplier?.name || '—'}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                                ret.refund_type === 'cash'
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-primary/10 text-primary'
                                            }`}
                                        >
                                            {ret.refund_type === 'cash'
                                                ? (t('refund_cash') || 'Cash')
                                                : (t('refund_credit') || 'Credit')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right font-medium text-danger">
                                        {formatCurrency(ret.total_amount)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-block rounded-full bg-success/10 text-success px-2 py-0.5 text-xs font-medium">
                                            {ret.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {new Date(ret.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                        {t('prev') || 'Prev'}
                    </button>
                    <span className="px-3 py-1.5 text-sm text-gray-500">
                        {page} / {meta.last_page}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                        disabled={page === meta.last_page}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                        {t('next') || 'Next'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PurchaseReturnsListPage;
