'use client';

import DateColumn from '@/components/common/DateColumn';
import { useCurrency } from '@/hooks/useCurrency';
import { Dialog, Transition } from '@headlessui/react';
import { AlertCircle, Calendar, Clock, CreditCard, Hash, Package, Receipt, RotateCcw, Shield, Store, TrendingUp, User, X } from 'lucide-react';
import { Fragment } from 'react';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
    const { formatCurrency } = useCurrency();
    if (!order) return null;

    const paymentStatusConfig: Record<string, { bg: string; text: string }> = {
        paid: { bg: 'bg-green-100', text: 'text-green-800' },
        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        due: { bg: 'bg-red-100', text: 'text-red-800' },
    };

    const paymentStatus = order.payment?.status ?? order.payment_status ?? 'paid';
    const statusStyle = paymentStatusConfig[paymentStatus] || { bg: 'bg-gray-100', text: 'text-gray-800' };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[60]" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                                    <div>
                                        <Dialog.Title className="text-2xl font-bold text-gray-900">Order Details</Dialog.Title>
                                        <p className="mt-1 text-sm text-gray-600">Invoice: {order.invoice}</p>
                                    </div>
                                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white hover:text-gray-600">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="max-h-[70vh] overflow-y-auto p-6">
                                    {/* Status Badges */}
                                    <div className="mb-6 flex flex-wrap gap-3">
                                        {/* Order Status */}
                                        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
                                            <TrendingUp className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-900">
                                                Status: <span className="capitalize">{order.status?.replace('_', ' ') || 'N/A'}</span>
                                            </span>
                                        </div>
                                        {/* Return Status */}
                                        {order.return_status && order.return_status !== 'none' && (
                                            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2">
                                                <RotateCcw className="h-4 w-4 text-red-600" />
                                                <span className="text-sm font-medium text-red-900">
                                                    Return: <span className="capitalize">{order.return_status?.replace('_', ' ')}</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Info Grid */}
                                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                        {/* Customer Info */}
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <User className="h-5 w-5 text-blue-600" />
                                                <h3 className="font-semibold text-gray-900">Customer Information</h3>
                                            </div>
                                            {order.is_walk_in ? (
                                                <p className="text-gray-600">Walk-in Customer</p>
                                            ) : (
                                                <div className="space-y-2 text-sm">
                                                    <p className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</p>
                                                    {order.customer?.phone && <p className="text-gray-600">Phone: {order.customer.phone}</p>}
                                                    {order.customer?.email && <p className="text-gray-600">Email: {order.customer.email}</p>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Store Info */}
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Store className="h-5 w-5 text-purple-600" />
                                                <h3 className="font-semibold text-gray-900">Store Information</h3>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <p className="font-medium text-gray-900">{order.store?.name || order.store_name || 'N/A'}</p>
                                                <p className="text-gray-600">Served by: {order.user?.name || order.user_name || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {/* Date Info */}
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-green-600" />
                                                <h3 className="font-semibold text-gray-900">Timeline</h3>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Created</p>
                                                    <div className="text-gray-900">
                                                        {order.created_at ? (
                                                            <>
                                                                <div className="font-medium">{order.created_at.split(' ')[0]}</div>
                                                                <div className="text-xs text-gray-500">{order.created_at.split(' ').slice(1).join(' ')}</div>
                                                            </>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Updated</p>
                                                    <div className="text-gray-900">
                                                        {order.updated_at ? (
                                                            <>
                                                                <div className="font-medium">{order.updated_at.split(' ')[0]}</div>
                                                                <div className="text-xs text-gray-500">{order.updated_at.split(' ').slice(1).join(' ')}</div>
                                                            </>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <CreditCard className="h-5 w-5 text-orange-600" />
                                                <h3 className="font-semibold text-gray-900">Payment Details</h3>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Method:</span>
                                                    <span className="font-medium capitalize text-gray-900">{order.payment?.method ?? order.payment_method ?? 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Status:</span>
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>{paymentStatus.toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="mb-6">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Package className="h-5 w-5 text-indigo-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">Order Items ({order.items_count})</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {order.items?.map((item: any, index: number) => (
                                                <div key={index} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                                                    {/* Product Header */}
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-semibold text-gray-900">{item.snapshot?.product_name ?? item.product?.name ?? 'N/A'}</h4>
                                                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                                                {(item.snapshot?.sku ?? item.product?.sku) && (
                                                                    <span className="rounded bg-gray-100 px-2 py-1 text-gray-600">SKU: {item.snapshot?.sku ?? item.product?.sku}</span>
                                                                )}
                                                                {item.product?.category && <span className="rounded bg-blue-100 px-2 py-1 text-blue-700">{item.product.category}</span>}
                                                                {item.product?.brand && <span className="rounded bg-purple-100 px-2 py-1 text-purple-700">{item.product.brand}</span>}
                                                                {item.snapshot?.variant_data &&
                                                                    Object.entries(item.snapshot.variant_data).map(([key, val]) => (
                                                                        <span key={key} className="rounded bg-indigo-100 px-2 py-1 text-indigo-700">
                                                                            {key}: {String(val)}
                                                                        </span>
                                                                    ))}
                                                            </div>
                                                        </div>
                                                        {/* Return Status Badge */}
                                                        {item.return_status && item.return_status !== 'none' && (
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                    item.return_status === 'full'
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : item.return_status === 'partial'
                                                                        ? 'bg-orange-100 text-orange-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}
                                                            >
                                                                {item.return_status === 'full' ? 'Fully Returned' : 'Partially Returned'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Item Details Grid */}
                                                    <div className="mb-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                                                        <div>
                                                            <p className="mb-1 text-xs text-gray-500">Quantity</p>
                                                            <p className="font-semibold text-gray-900">
                                                                {item.quantity ?? 0} {item.unit ?? 'Piece'}
                                                            </p>
                                                            {item.quantity_returned > 0 && <p className="text-xs text-red-600">Returned: {item.quantity_returned}</p>}
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-xs text-gray-500">Unit Price</p>
                                                            <p className="font-semibold text-gray-900">{formatCurrency(item.unit_price ?? 0)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-xs text-gray-500">Discount</p>
                                                            <p className="font-semibold text-red-600">{formatCurrency(item.discount ?? 0)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="mb-1 text-xs text-gray-500">Subtotal</p>
                                                            <p className="font-bold text-gray-900">{formatCurrency(item.subtotal ?? 0)}</p>
                                                        </div>
                                                    </div>

                                                    {/* Stock Info */}
                                                    {item.stock && (
                                                        <div className="mb-3 rounded-md bg-gray-50 p-3">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-gray-600" />
                                                                <span className="text-xs font-semibold text-gray-700">Stock Information</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
                                                                <div>
                                                                    <span className="text-gray-500">Current Stock:</span>
                                                                    <span className={`ml-1 font-semibold ${item.stock.is_low_stock ? 'text-red-600' : 'text-green-600'}`}>
                                                                        {item.stock.current_quantity}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Cost at Sale:</span>
                                                                    <span className="ml-1 font-semibold text-gray-700">{formatCurrency(item.snapshot?.purchase_price ?? 0)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-gray-500">Barcode:</span>
                                                                    <span className="ml-1 font-semibold text-gray-700">{item.snapshot?.barcode ?? '-'}</span>
                                                                </div>
                                                                {item.stock.is_low_stock && (
                                                                    <div>
                                                                        <span className="rounded bg-red-100 px-2 py-0.5 font-semibold text-red-700">Low Stock!</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Serials */}
                                                    {item.has_serials && item.serials && item.serials.length > 0 && (
                                                        <div className="mb-3 rounded-md bg-blue-50 p-3">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <Hash className="h-4 w-4 text-blue-600" />
                                                                <span className="text-xs font-semibold text-blue-900">Serial Numbers</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.serials.map((serial: any) => (
                                                                    <span key={serial.id} className="rounded border border-blue-200 bg-white px-2 py-1 font-mono text-xs text-gray-700">
                                                                        {serial.serial_number}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Warranty */}
                                                    {item.warranty && (
                                                        <div className="rounded-md bg-green-50 p-3">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <Shield className="h-4 w-4 text-green-600" />
                                                                <span className="text-xs font-semibold text-green-900">Warranty Information</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                                <div>
                                                                    <span className="text-green-700">Type:</span>
                                                                    <span className="ml-1 font-semibold text-green-900">{item.warranty.warranty_type_name}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-green-700">Duration:</span>
                                                                    <span className="ml-1 font-semibold text-green-900">
                                                                        {item.warranty.duration_months
                                                                            ? `${item.warranty.duration_months} months`
                                                                            : item.warranty.duration_days
                                                                            ? `${item.warranty.duration_days} days`
                                                                            : 'Lifetime'}
                                                                    </span>
                                                                </div>
                                                                {item.warranty.start_date && (
                                                                    <div>
                                                                        <span className="text-green-700">Start:</span>
                                                                        <span className="ml-1 font-semibold text-green-900">{item.warranty.start_date.split(' ')[0]}</span>
                                                                    </div>
                                                                )}
                                                                {item.warranty.end_date && (
                                                                    <div>
                                                                        <span className="text-green-700">End:</span>
                                                                        <span className="ml-1 font-semibold text-green-900">{item.warranty.end_date.split(' ')[0]}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Receipt className="h-5 w-5 text-blue-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-medium text-gray-900">{formatCurrency(order.financial?.total ?? order.total ?? 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tax:</span>
                                                <span className="font-medium text-gray-900">{formatCurrency(order.financial?.tax ?? order.tax ?? 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Discount:</span>
                                                <span className="font-medium text-red-600">-{formatCurrency(order.financial?.discount ?? order.discount ?? 0)}</span>
                                            </div>
                                            <div className="border-t border-gray-300 pt-3">
                                                <div className="flex justify-between">
                                                    <span className="text-lg font-semibold text-gray-900">Grand Total:</span>
                                                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(order.financial?.grand_total ?? order.grand_total ?? 0)}</span>
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-300 pt-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Amount Paid:</span>
                                                    <span className="font-medium text-green-600">{formatCurrency(order.financial?.amount_paid ?? order.amount_paid ?? 0)}</span>
                                                </div>
                                                {(order.financial?.change_amount ?? order.change_amount ?? 0) > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Change:</span>
                                                        <span className="font-medium text-gray-900">{formatCurrency(order.financial?.change_amount ?? order.change_amount ?? 0)}</span>
                                                    </div>
                                                )}
                                                {(order.financial?.due_amount ?? order.due_amount ?? 0) > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Due Amount:</span>
                                                        <span className="font-medium text-red-600">{formatCurrency(order.financial?.due_amount ?? order.due_amount ?? 0)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Returns/Refunds Section */}
                                    {order.returns?.has_returns && (
                                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6">
                                            <div className="mb-4 flex items-center gap-2">
                                                <RotateCcw className="h-5 w-5 text-red-600" />
                                                <h3 className="text-lg font-semibold text-red-900">Return & Refund Information</h3>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-red-700">Total Returned Amount:</span>
                                                    <span className="font-bold text-red-900">{formatCurrency(order.returns.total_returned ?? 0)}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-red-700">Number of Returns:</span>
                                                    <span className="font-medium text-red-900">{order.returns.count ?? 0}</span>
                                                </div>
                                                {order.returns.items && order.returns.items.length > 0 && (
                                                    <div className="mt-4 border-t border-red-200 pt-3">
                                                        <h4 className="mb-2 text-sm font-semibold text-red-900">Return Details:</h4>
                                                        <div className="space-y-2">
                                                            {order.returns.items.map((returnItem: any) => (
                                                                <div key={returnItem.id} className="rounded bg-white p-3 text-sm">
                                                                    <div className="flex justify-between">
                                                                        <span className="font-medium text-gray-900">{returnItem.return_number}</span>
                                                                        <span className="font-bold text-red-600">{formatCurrency(returnItem.return_amount ?? 0)}</span>
                                                                    </div>
                                                                    <div className="mt-1 flex justify-between text-xs text-gray-600">
                                                                        <span>
                                                                            {returnItem.items_count} item{returnItem.items_count !== 1 ? 's' : ''}
                                                                        </span>
                                                                        <span>
                                                                            <DateColumn date={returnItem.return_date} />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Transactions History */}
                                    {order.transactions && order.transactions.length > 0 && (
                                        <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-6">
                                            <div className="mb-4 flex items-center gap-2">
                                                <CreditCard className="h-5 w-5 text-indigo-600" />
                                                <h3 className="text-lg font-semibold text-indigo-900">Transaction History</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {order.transactions.map((transaction: any) => (
                                                    <div key={transaction.id} className="rounded-lg bg-white p-4 shadow-sm">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Hash className="h-4 w-4 text-gray-400" />
                                                                    <span className="font-semibold text-gray-900">Transaction #{transaction.id}</span>
                                                                    <span
                                                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                            transaction.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                        }`}
                                                                    >
                                                                        {transaction.type?.toUpperCase()}
                                                                    </span>
                                                                    <span
                                                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                            transaction.payment_status === 'paid'
                                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                                : transaction.payment_status === 'refunded'
                                                                                ? 'bg-orange-100 text-orange-800'
                                                                                : 'bg-gray-100 text-gray-800'
                                                                        }`}
                                                                    >
                                                                        {transaction.payment_status?.toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                                                                    <div className="flex items-center gap-1">
                                                                        <CreditCard className="h-3.5 w-3.5" />
                                                                        <span className="capitalize">{transaction.payment_method}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="h-3.5 w-3.5" />
                                                                        <span>
                                                                            {transaction.created_at ? (
                                                                                <>
                                                                                    {transaction.created_at.split(' ')[0]}{' '}
                                                                                    <span className="text-gray-400">{transaction.created_at.split(' ').slice(1).join(' ')}</span>
                                                                                </>
                                                                            ) : (
                                                                                'N/A'
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className={`text-xl font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {transaction.amount >= 0 ? '+' : ''}
                                                                    {formatCurrency(transaction.amount)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                    <button onClick={onClose} className="w-full rounded-lg bg-gray-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-gray-700">
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default OrderDetailsModal;
