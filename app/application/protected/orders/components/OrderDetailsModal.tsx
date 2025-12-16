'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Calendar, CreditCard, Package, Receipt, Store, User, X } from 'lucide-react';
import { Fragment } from 'react';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
    if (!order) return null;

    const paymentStatusConfig: Record<string, { bg: string; text: string }> = {
        paid: { bg: 'bg-green-100', text: 'text-green-800' },
        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
        due: { bg: 'bg-red-100', text: 'text-red-800' },
    };

    const statusStyle = paymentStatusConfig[order.payment_status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

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
                                                <p className="font-medium text-gray-900">{order.store_name || 'N/A'}</p>
                                                <p className="text-gray-600">Served by: {order.user_name || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {/* Date Info */}
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-green-600" />
                                                <h3 className="font-semibold text-gray-900">Order Date</h3>
                                            </div>
                                            <p className="text-sm text-gray-900">{new Date(order.created_at).toLocaleString()}</p>
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
                                                    <span className="font-medium capitalize text-gray-900">{order.payment_method}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-600">Status:</span>
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>{order.payment_status.toUpperCase()}</span>
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
                                        <div className="overflow-hidden rounded-lg border border-gray-200">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Product</th>
                                                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600">Quantity</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">Unit Price</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">Discount</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">Tax</th>
                                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 bg-white">
                                                    {order.items?.map((item: any, index: number) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-gray-900">{item.product_name}</span>
                                                                    {item.sku && <span className="text-xs text-gray-500">SKU: {item.sku}</span>}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center text-gray-900">
                                                                {item.quantity} {item.unit}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-gray-900">৳{Number(item.unit_price).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-right text-red-600">৳{Number(item.discount).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-right text-gray-900">৳{Number(item.tax).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">৳{Number(item.subtotal).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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
                                                <span className="font-medium text-gray-900">৳{Number(order.total).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tax:</span>
                                                <span className="font-medium text-gray-900">৳{Number(order.tax).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Discount:</span>
                                                <span className="font-medium text-red-600">-৳{Number(order.discount).toFixed(2)}</span>
                                            </div>
                                            <div className="border-t border-gray-300 pt-3">
                                                <div className="flex justify-between">
                                                    <span className="text-lg font-semibold text-gray-900">Grand Total:</span>
                                                    <span className="text-2xl font-bold text-blue-600">৳{Number(order.grand_total).toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="border-t border-gray-300 pt-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Amount Paid:</span>
                                                    <span className="font-medium text-green-600">৳{Number(order.amount_paid).toFixed(2)}</span>
                                                </div>
                                                {order.change_amount > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Change:</span>
                                                        <span className="font-medium text-gray-900">৳{Number(order.change_amount).toFixed(2)}</span>
                                                    </div>
                                                )}
                                                {order.due_amount > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Due Amount:</span>
                                                        <span className="font-medium text-red-600">৳{Number(order.due_amount).toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
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
