'use client';

import { useCurrency } from '@/hooks/useCurrency';

interface OrderReturnDetailsProps {
    orderReturn: any;
}

const OrderReturnDetails: React.FC<OrderReturnDetailsProps> = ({ orderReturn }) => {
    const { formatCurrency } = useCurrency();

    const netAmount = Number(orderReturn.net_amount || 0);
    const isRefund = netAmount < 0;
    const isPayment = netAmount > 0;

    // Get the latest snapshot (before this return happened)
    const beforeReturnSnapshot = orderReturn.order?.snapshots?.[orderReturn.order.snapshots.length - 1]?.order_data;
    const orderBeforeReturn = beforeReturnSnapshot?.order;
    const itemsBeforeReturn = beforeReturnSnapshot?.items || [];

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Return Number</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">{orderReturn.return_number || `#${orderReturn.id}`}</p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{orderReturn.is_walk_in ? 'Walk-in' : orderReturn.customer?.name || 'N/A'}</p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Return Type</p>
                    <span className={`mt-1 inline-flex rounded-md px-2 py-1 text-sm font-medium ${orderReturn.return_type === 'return' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                        {orderReturn.return_type === 'return' ? 'Return' : 'Exchange'}
                    </span>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`mt-1 inline-flex rounded-md px-2 py-1 text-sm font-medium ${orderReturn.payment_status === 'refunded' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {orderReturn.payment_status || 'N/A'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Return Reason</p>
                    <p className="mt-1 font-semibold text-gray-900">{orderReturn.return_reason?.name || 'N/A'}</p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Processed By</p>
                    <p className="mt-1 font-semibold text-gray-900">{orderReturn.processed_by || 'N/A'}</p>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Return Date</p>
                    <p className="mt-1 font-semibold text-gray-900">{orderReturn.created_at ? new Date(orderReturn.created_at).toLocaleString('en-GB') : 'N/A'}</p>
                </div>
            </div>

            {/* 1. Original Order */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Original Order</h3>
                            <p className="mt-1 text-sm text-gray-500">Invoice: {orderReturn.order?.invoice || 'N/A'} | Order Total: {formatCurrency(orderBeforeReturn?.grand_total || 0)}</p>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">SKU</th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Unit Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Subtotal</th>
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
                                    Order Total:
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
                        <h3 className="text-lg font-semibold text-red-900">Returned Items</h3>
                        <p className="mt-1 text-sm text-red-700">Items customer returned in this transaction</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">SKU</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Qty Returned</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Unit Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Return Amount</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Stock Status</th>
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
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.stock_restored ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {item.stock_restored ? 'Restored' : 'Pending'}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-red-50">
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-right text-sm font-semibold text-red-900">
                                        Total Return Amount:
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
                        <h3 className="text-lg font-semibold text-green-900">New Items Added</h3>
                        <p className="mt-1 text-sm text-green-700">Items customer took in exchange</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">SKU</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Unit Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Subtotal</th>
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
                                        Total New Items:
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
                        <p className={`text-sm font-medium ${isRefund ? 'text-green-700' : isPayment ? 'text-orange-700' : 'text-gray-700'}`}>Net Transaction Amount</p>
                        <p className={`mt-2 text-3xl font-bold ${isRefund ? 'text-green-900' : isPayment ? 'text-orange-900' : 'text-gray-900'}`}>{formatCurrency(Math.abs(netAmount))}</p>
                        <p className={`mt-2 text-sm font-medium ${isRefund ? 'text-green-800' : isPayment ? 'text-orange-800' : 'text-gray-800'}`}>
                            {isRefund && `Refunded to Customer`}
                            {isPayment && `Customer Paid Extra`}
                            {!isRefund && !isPayment && 'Even Exchange'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="mt-1 text-lg font-semibold capitalize text-gray-900">{orderReturn.payment_method || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {orderReturn.notes && (
                <div className="rounded-lg bg-white p-6 shadow">
                    <p className="text-sm font-semibold text-gray-900">Additional Notes</p>
                    <p className="mt-2 text-sm text-gray-600">{orderReturn.notes}</p>
                </div>
            )}
        </div>
    );
};

export default OrderReturnDetails;

