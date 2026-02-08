'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OrderReturnDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderReturn: any;
}

const OrderReturnDetailsModal: React.FC<OrderReturnDetailsModalProps> = ({ isOpen, onClose, orderReturn }) => {
    const { formatCurrency } = useCurrency();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    if (!orderReturn) {
        return null;
    }

    const netAmount = Number(orderReturn.net_amount || 0);
    const isRefund = netAmount < 0;
    const isPayment = netAmount > 0;
    const isEvenExchange = netAmount === 0;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative z-10 w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Return Details</h2>
                        <p className="text-sm text-gray-600">Return #{orderReturn.return_number || orderReturn.id}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[70vh] overflow-y-auto p-6">
                    {/* Basic Info */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-gray-600">Original Order</p>
                            <p className="font-semibold text-gray-900">{orderReturn.order_invoice || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="font-semibold text-gray-900">{orderReturn.is_walk_in ? 'Walk-in Customer' : orderReturn.customer?.name || 'N/A'}</p>
                            {!orderReturn.is_walk_in && orderReturn.customer?.phone && <p className="text-sm text-gray-500">{orderReturn.customer.phone}</p>}
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Return Type</p>
                            <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                    orderReturn.return_type === 'return' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                }`}
                            >
                                {orderReturn.return_type === 'return' ? 'Pure Return' : 'Exchange'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Return Reason</p>
                            <p className="font-semibold text-gray-900">{orderReturn.return_reason || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Processed By</p>
                            <p className="font-semibold text-gray-900">{orderReturn.processed_by || orderReturn.user?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Return Date</p>
                            <p className="font-semibold text-gray-900">{orderReturn.created_at || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Returned Items */}
                    {orderReturn.return_items && orderReturn.return_items.length > 0 && (
                        <div className="mb-6">
                            <h3 className="mb-3 text-lg font-semibold text-gray-900">Returned Items</h3>
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {orderReturn.return_items.map((item: any, index: number) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                                                <td className="px-4 py-3 text-center text-sm text-gray-900">{item.quantity_returned || item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.return_amount || item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-red-50">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-red-700">
                                                Total Return Amount:
                                            </td>
                                            <td className="px-4 py-3 text-right text-lg font-bold text-red-700">{formatCurrency(orderReturn.total_return_amount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* New Items (Exchange) */}
                    {orderReturn.new_items && orderReturn.new_items.length > 0 && (
                        <div className="mb-6">
                            <h3 className="mb-3 text-lg font-semibold text-gray-900">New Items (Exchange)</h3>
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {orderReturn.new_items.map((item: any, index: number) => (
                                            <tr key={index}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                                                <td className="px-4 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.new_amount || item.subtotal || 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-green-50">
                                        <tr>
                                            <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-green-700">
                                                Total New Items Amount:
                                            </td>
                                            <td className="px-4 py-3 text-right text-lg font-bold text-green-700">{formatCurrency(orderReturn.total_new_amount || 0)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Net Amount Summary */}
                    <div className={`rounded-lg border-2 p-6 ${isRefund ? 'border-emerald-200 bg-emerald-50' : isPayment ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-lg font-semibold text-gray-700">Net Transaction:</span>
                            <span className={`text-3xl font-bold ${isRefund ? 'text-emerald-700' : isPayment ? 'text-amber-700' : 'text-gray-700'}`}>{formatCurrency(Math.abs(netAmount))}</span>
                        </div>

                        {isRefund && (
                            <div className="flex items-center gap-2 rounded-md bg-emerald-100 p-3">
                                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-medium text-emerald-800">Customer Refunded: {formatCurrency(Math.abs(netAmount))}</span>
                            </div>
                        )}

                        {isPayment && (
                            <div className="flex items-center gap-2 rounded-md bg-amber-100 p-3">
                                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="font-medium text-amber-800">Customer Paid Extra: {formatCurrency(netAmount)}</span>
                            </div>
                        )}

                        {isEvenExchange && (
                            <div className="flex items-center gap-2 rounded-md bg-gray-100 p-3">
                                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium text-gray-800">Even Exchange - No Payment Required</span>
                            </div>
                        )}

                        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-300 pt-4">
                            <div>
                                <p className="text-sm text-gray-600">Payment Method</p>
                                <p className="font-semibold capitalize text-gray-900">{orderReturn.payment_method || 'Cash'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                        orderReturn.payment_status === 'refunded'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : orderReturn.payment_status === 'completed' || orderReturn.payment_status === 'paid'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-orange-100 text-orange-800'
                                    }`}
                                >
                                    {orderReturn.payment_status || 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <button onClick={onClose} className="w-full rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-gray-800">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderReturnDetailsModal;
