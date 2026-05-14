'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { ArrowRightLeft, BanknoteArrowDown, BanknoteArrowUp, Box, CircleCheck, ExternalLink, FileText, PackageCheck, ReceiptText, RotateCcw, UserRound } from 'lucide-react';
import Link from 'next/link';

interface OrderReturnDetailsProps {
    orderReturn: any;
}

const OrderReturnDetails: React.FC<OrderReturnDetailsProps> = ({ orderReturn }) => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();

    const netAmount = Number(orderReturn.net_amount || 0);
    const isRefund = netAmount < 0;
    const isPayment = netAmount > 0;
    const na = t('lbl_na');
    const returnItems = Array.isArray(orderReturn.return_items) ? orderReturn.return_items : [];
    const newItems = Array.isArray(orderReturn.new_items) ? orderReturn.new_items : [];
    const returnedQty = returnItems.reduce((sum: number, item: any) => sum + Number(item.quantity_returned || 0), 0);
    const newQty = newItems.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);

    // Get the latest snapshot (before this return happened)
    const snapshots = Array.isArray(orderReturn.order?.snapshots) ? orderReturn.order.snapshots : [];
    const beforeReturnSnapshot = [...snapshots].reverse().find((snapshot: any) => snapshot.snapshot_type === 'before_return')?.order_data || snapshots[snapshots.length - 1]?.order_data;
    const orderBeforeReturn = beforeReturnSnapshot?.order;
    const itemsBeforeReturn = beforeReturnSnapshot?.items || [];
    const originalTotal = orderBeforeReturn?.grand_total ?? orderReturn.order?.grand_total ?? 0;
    const paymentStatusClass =
        orderReturn.payment_status === 'refunded' || orderReturn.payment_status === 'paid' || orderReturn.payment_status === 'completed'
            ? 'bg-emerald-100 text-emerald-800'
            : orderReturn.payment_status === 'pending'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-gray-100 text-gray-800';

    const moneyDirection = isRefund ? t('lbl_refunded_to_customer') : isPayment ? t('lbl_customer_paid_extra') : t('lbl_even_exchange');
    const MoneyIcon = isRefund ? BanknoteArrowDown : isPayment ? BanknoteArrowUp : ArrowRightLeft;

    return (
        <div className="space-y-6">
            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr]">
                    <div className="p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#046ca9]/10 px-3 py-1 text-xs font-semibold text-[#034d79]">
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    {orderReturn.return_type === 'return' ? t('lbl_return') : t('lbl_exchange')}
                                </div>
                                <h2 className="mt-3 text-2xl font-bold text-gray-950">{orderReturn.return_number || `#${orderReturn.id}`}</h2>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                    <span>{t('lbl_invoice')}: {orderReturn.order?.invoice || na}</span>
                                    {orderReturn.order?.id && (
                                        <Link href={`/orders?orderId=${orderReturn.order.id}`} className="print:hidden inline-flex items-center gap-1 font-semibold text-[#046ca9] hover:text-[#034d79]">
                                            {t('lbl_order')} <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <span className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold capitalize ${paymentStatusClass}`}>{orderReturn.payment_status || na}</span>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs font-semibold uppercase text-gray-500">{t('lbl_total_return_amount')}</p>
                                <p className="mt-2 text-xl font-bold text-red-700">{formatCurrency(orderReturn.total_return_amount || 0)}</p>
                                <p className="mt-1 text-xs text-gray-500">{returnedQty} {t('lbl_units')}</p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                <p className="text-xs font-semibold uppercase text-gray-500">{t('lbl_total_new_items')}</p>
                                <p className="mt-2 text-xl font-bold text-emerald-700">{formatCurrency(orderReturn.total_new_amount || 0)}</p>
                                <p className="mt-1 text-xs text-gray-500">{newQty} {t('lbl_units')}</p>
                            </div>
                            <div className={`rounded-lg border p-4 ${isRefund ? 'border-emerald-100 bg-emerald-50' : isPayment ? 'border-amber-100 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                                <p className="text-xs font-semibold uppercase text-gray-500">{t('lbl_net_transaction_amount')}</p>
                                <p className={`mt-2 text-xl font-bold ${isRefund ? 'text-emerald-800' : isPayment ? 'text-amber-800' : 'text-gray-800'}`}>{formatCurrency(Math.abs(netAmount))}</p>
                                <p className="mt-1 text-xs font-semibold text-gray-600">{moneyDirection}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 bg-gray-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <UserRound className="mt-0.5 h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-500">{t('lbl_customer')}</p>
                                    <p className="font-semibold text-gray-950">{orderReturn.is_walk_in ? t('pos_walk_in') : orderReturn.customer?.name || na}</p>
                                    {!orderReturn.is_walk_in && orderReturn.customer?.phone && <p className="text-sm text-gray-500">{t('lbl_phone')}: {orderReturn.customer.phone}</p>}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <FileText className="mt-0.5 h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-500">{t('lbl_return_reason')}</p>
                                    <p className="font-semibold text-gray-950">{orderReturn.return_reason?.name || na}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <ReceiptText className="mt-0.5 h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-xs font-semibold uppercase text-gray-500">{t('lbl_processed_by')}</p>
                                    <p className="font-semibold text-gray-950">{orderReturn.processed_by || na}</p>
                                    <p className="text-sm text-gray-500">{orderReturn.created_at || na}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. Original Order */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{t('lbl_original_order')}</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {t('lbl_invoice')}: {orderReturn.order?.invoice || na} | {t('lbl_order_total')}: {formatCurrency(originalTotal)}
                            </p>
                        </div>
                    </div>
                </div>
                {itemsBeforeReturn.length > 0 ? (
                    <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_product')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_sku')}</th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_quantity')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_unit_price')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_subtotal')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {itemsBeforeReturn.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.sku}</td>
                                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">{item.quantity}</td>
                                    <td className="px-6 py-4 text-right text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{formatCurrency(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                    {t('lbl_order_total')}:
                                </td>
                                <td className="px-6 py-4 text-right text-lg font-bold text-gray-900">{formatCurrency(originalTotal)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    </div>
                ) : (
                    <div className="p-6 text-sm text-gray-500">{t('msg_no_data_available')}</div>
                )}
            </div>

            {/* 2. Returned Items */}
            {orderReturn.return_items && orderReturn.return_items.length > 0 && (
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 bg-red-50 px-6 py-4">
                        <h3 className="text-lg font-semibold text-red-900">{t('lbl_returned_items')}</h3>
                        <p className="mt-1 text-sm text-red-700">{t('msg_items_returned_transaction')}</p>
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_product')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_sku')}</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_qty_returned')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_unit_price')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_return_amount')}</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_stock_status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {orderReturn.return_items.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-red-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.sku}</td>
                                        <td className="px-6 py-4 text-center text-sm font-bold text-red-600">{item.quantity_returned}</td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">{formatCurrency(item.return_amount)}</td>
                                        <td className="px-6 py-4 text-center">
                                            {item.return_to_stock ? (
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                        item.stock_restored ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {item.stock_restored ? t('status_restored') : t('status_pending')}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">{na}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-red-50">
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-right text-sm font-semibold text-red-900">
                                        {t('lbl_total_return_amount')}:
                                    </td>
                                    <td className="px-6 py-4 text-right text-lg font-bold text-red-900">{formatCurrency(orderReturn.total_return_amount || 0)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div className="divide-y divide-red-100 md:hidden">
                        {returnItems.map((item: any, idx: number) => (
                            <div key={idx} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-950">{item.product_name}</p>
                                        <p className="mt-1 text-xs text-gray-500">{item.sku || na} · {item.unit || t('lbl_unit')}</p>
                                    </div>
                                    <p className="font-bold text-red-700">{formatCurrency(item.return_amount)}</p>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                    <span className="rounded-md bg-red-50 px-3 py-2 text-red-700">{t('lbl_qty_returned')}: {item.quantity_returned}</span>
                                    <span className="rounded-md bg-gray-50 px-3 py-2 text-gray-700">{t('lbl_unit_price')}: {formatCurrency(item.unit_price)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. New Items Added (Exchange) */}
            {orderReturn.new_items && orderReturn.new_items.length > 0 && (
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 bg-green-50 px-6 py-4">
                        <h3 className="text-lg font-semibold text-green-900">{t('lbl_new_items_added')}</h3>
                        <p className="mt-1 text-sm text-green-700">{t('msg_items_taken_exchange')}</p>
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_product')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_sku')}</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_quantity')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_unit_price')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">{t('lbl_subtotal')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {orderReturn.new_items.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-green-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.sku}</td>
                                        <td className="px-6 py-4 text-center text-sm font-bold text-green-600">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">{formatCurrency(item.new_amount ?? item.subtotal ?? 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-green-50">
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-right text-sm font-semibold text-green-900">
                                        {t('lbl_total_new_items')}:
                                    </td>
                                    <td className="px-6 py-4 text-right text-lg font-bold text-green-900">{formatCurrency(orderReturn.total_new_amount || 0)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <div className="divide-y divide-emerald-100 md:hidden">
                        {newItems.map((item: any, idx: number) => (
                            <div key={idx} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-950">{item.product_name}</p>
                                        <p className="mt-1 text-xs text-gray-500">{item.sku || na}</p>
                                    </div>
                                    <p className="font-bold text-emerald-700">{formatCurrency(item.new_amount ?? item.subtotal ?? 0)}</p>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                    <span className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">{t('lbl_quantity')}: {item.quantity}</span>
                                    <span className="rounded-md bg-gray-50 px-3 py-2 text-gray-700">{t('lbl_unit_price')}: {formatCurrency(item.unit_price)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Net Amount */}
            <div className={`rounded-lg p-6 shadow ${isRefund ? 'bg-green-50' : isPayment ? 'bg-orange-50' : 'bg-gray-50'}`}>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-4">
                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${isRefund ? 'bg-green-100 text-green-700' : isPayment ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                            <MoneyIcon className="h-6 w-6" />
                        </div>
                        <div>
                        <p className={`text-sm font-medium ${isRefund ? 'text-green-700' : isPayment ? 'text-orange-700' : 'text-gray-700'}`}>{t('lbl_net_transaction_amount')}</p>
                        <p className={`mt-2 text-3xl font-bold ${isRefund ? 'text-green-900' : isPayment ? 'text-orange-900' : 'text-gray-900'}`}>{formatCurrency(Math.abs(netAmount))}</p>
                        <p className={`mt-2 text-sm font-medium ${isRefund ? 'text-green-800' : isPayment ? 'text-orange-800' : 'text-gray-800'}`}>
                            {isRefund && t('lbl_refunded_to_customer')}
                            {isPayment && t('lbl_customer_paid_extra')}
                            {!isRefund && !isPayment && t('lbl_even_exchange')}
                        </p>
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-600">{t('lbl_payment_method')}</p>
                        <p className="mt-1 text-lg font-semibold capitalize text-gray-900">{orderReturn.payment_method || na}</p>
                        {orderReturn.transaction && (
                            <p className="mt-1 text-xs text-gray-500">
                                {t('lbl_transaction')}: {orderReturn.transaction.type || na} · {formatCurrency(orderReturn.transaction.amount || 0)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 print:hidden">
                <div className="rounded-lg bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <PackageCheck className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-semibold text-gray-950">{t('lbl_stock_status')}</h3>
                    </div>
                    <div className="space-y-3">
                        {returnItems.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{item.product_name}</p>
                                    <p className="text-xs text-gray-500">{item.quantity_returned} {item.unit || t('lbl_units')}</p>
                                </div>
                                {item.return_to_stock ? (
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.stock_restored ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                        {item.stock_restored ? t('status_restored') : t('status_pending')}
                                    </span>
                                ) : (
                                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{na}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Box className="h-5 w-5 text-[#046ca9]" />
                        <h3 className="font-semibold text-gray-950">{t('lbl_summary')}</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between gap-3">
                            <span className="text-gray-500">{t('lbl_original_order')}</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(originalTotal)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-gray-500">{t('lbl_returned_items')}</span>
                            <span className="font-semibold text-red-700">{formatCurrency(orderReturn.total_return_amount || 0)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-gray-500">{t('lbl_new_items_added')}</span>
                            <span className="font-semibold text-emerald-700">{formatCurrency(orderReturn.total_new_amount || 0)}</span>
                        </div>
                        <div className="flex justify-between gap-3 border-t border-gray-100 pt-3">
                            <span className="font-semibold text-gray-900">{moneyDirection}</span>
                            <span className="font-bold text-gray-950">{formatCurrency(Math.abs(netAmount))}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {orderReturn.notes && (
                <div className="rounded-lg bg-white p-6 shadow">
                    <p className="text-sm font-semibold text-gray-900">{t('lbl_additional_notes')}</p>
                    <p className="mt-2 text-sm text-gray-600">{orderReturn.notes}</p>
                </div>
            )}
        </div>
    );
};

export default OrderReturnDetails;
