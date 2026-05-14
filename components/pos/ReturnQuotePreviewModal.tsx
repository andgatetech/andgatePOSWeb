'use client';

import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import type { QuoteOrderReturnResult } from '@/store/features/Order/orderApi';
import { ArrowDownLeft, ArrowUpRight, CheckCircle, X } from 'lucide-react';

interface ReturnQuotePreviewModalProps {
    quote: QuoteOrderReturnResult | { data?: QuoteOrderReturnResult };
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ReturnQuotePreviewModal({
    quote,
    onConfirm,
    onCancel,
    isLoading = false,
}: ReturnQuotePreviewModalProps) {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();

    const normalizedQuote = ('data' in quote && quote.data ? quote.data : quote) as QuoteOrderReturnResult;
    const totals = normalizedQuote.totals || {
        total_return_amount: 0,
        total_new_amount: 0,
        net_amount: 0,
        direction: 'even' as const,
        precision: 2,
    };
    const isRefund = totals.direction === 'refund' || Number(totals.net_amount || 0) < 0;
    const isEven = totals.direction === 'even' || Number(totals.net_amount || 0) === 0;

    const fmt = (n: number) => formatCurrency(n);

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 text-white">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <h2 className="text-base font-bold">{t('return_quote_preview_title')}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="rounded-lg p-1 hover:bg-white/20 transition"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Return items */}
                    {normalizedQuote.return_items?.length > 0 && (
                        <section>
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                {t('return_quote_items_returned')}
                            </h3>
                            <div className="space-y-1.5 rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
                                {normalizedQuote.return_items.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {item.product_name ?? item.name ?? `Item #${i + 1}`}
                                            <span className="ml-1 text-xs text-gray-400">×{item.quantity_returned ?? item.quantity}</span>
                                        </span>
                                        <span className="font-semibold text-danger">
                                            -{fmt(item.subtotal ?? item.total ?? 0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Exchange items */}
                    {normalizedQuote.new_items?.length > 0 && (
                        <section>
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                {t('return_quote_exchange_items')}
                            </h3>
                            <div className="space-y-1.5 rounded-xl bg-green-50 p-3 dark:bg-green-900/20">
                                {normalizedQuote.new_items.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {item.product_name ?? item.name ?? `Item #${i + 1}`}
                                            <span className="ml-1 text-xs text-gray-400">×{item.quantity}</span>
                                        </span>
                                        <span className="font-semibold text-success">
                                            +{fmt(item.subtotal ?? item.total ?? 0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Totals */}
                    <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>{t('return_quote_return_amount')}</span>
                            <span className="font-medium text-danger">-{fmt(totals.total_return_amount)}</span>
                        </div>
                        {totals.total_new_amount > 0 && (
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>{t('return_quote_exchange_amount')}</span>
                                <span className="font-medium text-success">+{fmt(totals.total_new_amount)}</span>
                            </div>
                        )}
                        <hr className="border-gray-200 dark:border-gray-700" />
                        {/* Net direction badge */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-800 dark:text-white">
                                {t('return_quote_net')}
                            </span>
                            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
                                isRefund
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}>
                                {isRefund
                                    ? <ArrowDownLeft className="h-4 w-4" />
                                    : <ArrowUpRight className="h-4 w-4" />
                                }
                                {fmt(Math.abs(Number(totals.net_amount || 0)))}
                                <span className="ml-0.5 text-xs font-normal">
                                    ({isEven ? t('lbl_even_exchange') : isRefund ? t('return_quote_direction_refund') : t('return_quote_direction_charge')})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            {t('btn_cancel')}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    {t('btn_processing')}
                                </span>
                            ) : (
                                t('btn_confirm_and_submit')
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
