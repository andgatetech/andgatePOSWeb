'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';

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

    // Get the latest snapshot (before this return happened)
    const beforeReturnSnapshot = orderReturn.order?.snapshots?.[orderReturn.order.snapshots.length - 1]?.order_data;
    const orderBeforeReturn = beforeReturnSnapshot?.order;
    const itemsBeforeReturn = beforeReturnSnapshot?.items || [];

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">{t('lbl_return_number')}</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">{orderReturn.return_number || `#${orderReturn.id}`}</p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">{t('lbl_customer')}</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{orderReturn.is_walk_in ? t('pos_walk_in') : orderReturn.customer?.name || na}</p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">{t('lbl_return_type')}</p>
                    <span className={`mt-1 inline-flex rounded-md px-2 py-1 text-sm font-medium ${orderReturn.return_type === 'return' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {orderReturn.return_type === 'return' ? t('lbl_return') : t('lbl_exchange')}
                    </span>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">{t('lbl_status')}</p>
                    <span
                        className={`mt-1 inline-flex rounded-md px-2 py-1 text-sm font-medium ${
                            orderReturn.payment_status === 'refunded' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                        {orderReturn.payment_status || na}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">{t('lbl_return_reason')}</p>
                    <p className="mt-1 font-semibold text-gray-900">{orderReturn.return_reason?.name || na}</p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">{t('lbl_processed_by')}</p>
                    <p className="mt-1 font-semibold text-gray-900">{orderReturn.processed_by || na}</p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">{t('lbl_return_date')}</p>
                    <p className="mt-1 font-semibold text-gray-900">{orderReturn.created_at || na}</p>
                </div>
            </div>

            {/* 1. Original Order */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{t('lbl_original_order')}</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {t('lbl_invoice')}: {orderReturn.order?.invoice || na} | {t('lbl_order_total')}: {formatCurrency(orderBeforeReturn?.grand_total || 0)}
                            </p>
                        </div>
                    </div>
                </div>
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
                                <td className="px-6 py-4 text-right text-lg font-bold text-gray-900">{formatCurrency(orderBeforeReturn?.grand_total || 0)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* 2. Returned Items */}
            {orderReturn.return_items && orderReturn.return_items.length > 0 && (
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 bg-red-50 px-6 py-4">
                        <h3 className="text-lg font-semibold text-red-900">{t('lbl_returned_items')}</h3>
                        <p className="mt-1 text-sm text-red-700">{t('msg_items_returned_transaction')}</p>
                    </div>
                    <div className="overflow-x-auto">
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
                </div>
            )}

            {/* 3. New Items Added (Exchange) */}
            {orderReturn.new_items && orderReturn.new_items.length > 0 && (
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 bg-green-50 px-6 py-4">
                        <h3 className="text-lg font-semibold text-green-900">{t('lbl_new_items_added')}</h3>
                        <p className="mt-1 text-sm text-green-700">{t('msg_items_taken_exchange')}</p>
                    </div>
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
                                {orderReturn.new_items.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-green-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.sku}</td>
                                        <td className="px-6 py-4 text-center text-sm font-bold text-green-600">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">{formatCurrency(item.new_amount || 0)}</td>
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
                </div>
            )}

            {/* Net Amount */}
            <div className={`rounded-lg p-6 shadow ${isRefund ? 'bg-green-50' : isPayment ? 'bg-orange-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm font-medium ${isRefund ? 'text-green-700' : isPayment ? 'text-orange-700' : 'text-gray-700'}`}>{t('lbl_net_transaction_amount')}</p>
                        <p className={`mt-2 text-3xl font-bold ${isRefund ? 'text-green-900' : isPayment ? 'text-orange-900' : 'text-gray-900'}`}>{formatCurrency(Math.abs(netAmount))}</p>
                        <p className={`mt-2 text-sm font-medium ${isRefund ? 'text-green-800' : isPayment ? 'text-orange-800' : 'text-gray-800'}`}>
                            {isRefund && t('lbl_refunded_to_customer')}
                            {isPayment && t('lbl_customer_paid_extra')}
                            {!isRefund && !isPayment && t('lbl_even_exchange')}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">{t('lbl_payment_method')}</p>
                        <p className="mt-1 text-lg font-semibold capitalize text-gray-900">{orderReturn.payment_method || na}</p>
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
