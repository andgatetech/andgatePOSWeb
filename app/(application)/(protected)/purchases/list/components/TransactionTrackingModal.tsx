'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { AlertCircle, Building2, Calendar, CheckCircle, Clock, CreditCard, FileText, Package, Receipt, ShoppingCart, Wallet, X } from 'lucide-react';
import { useState } from 'react';
import PaymentReceipt from './PaymentReceipt';

interface TransactionTrackingModalProps {
    isOpen: boolean;
    purchaseOrder: any;
    onClose: () => void;
}

const TransactionTrackingModal: React.FC<TransactionTrackingModalProps> = ({ isOpen, purchaseOrder, onClose }) => {
    const { formatCurrency } = useCurrency();
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

    if (!isOpen || !purchaseOrder) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            ordered: 'bg-blue-100 text-blue-800 border-blue-300',
            received: 'bg-green-100 text-green-800 border-green-300',
            partial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300',
            paid: 'bg-green-100 text-green-800 border-green-300',
            unpaid: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getPaymentMethodIcon = (method: string) => {
        const icons: Record<string, JSX.Element> = {
            cash: <Wallet className="h-4 w-4" />,
            card: <CreditCard className="h-4 w-4" />,
            credit: <CreditCard className="h-4 w-4" />,
            debit: <CreditCard className="h-4 w-4" />,
            bank_transfer: <Building2 className="h-4 w-4" />,
            cheque: <FileText className="h-4 w-4" />,
        };
        return icons[method.toLowerCase()] || <Wallet className="h-4 w-4" />;
    };

    const transactions = purchaseOrder.transactions || [];
    const items = purchaseOrder.items || [];
    const paymentProgress = (purchaseOrder.amount_paid / purchaseOrder.grand_total) * 100;

    return (
        <>
            <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="fixed left-1/2 top-1/2 z-[61] w-full max-w-[95vw] -translate-x-1/2 -translate-y-1/2">
                <div className="mx-4 max-h-[95vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-2xl">
                    {/* Header Card */}
                    <div className="rounded-t-2xl border border-slate-200 bg-white p-4 shadow-lg sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg sm:h-16 sm:w-16">
                                    <ShoppingCart className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900 sm:text-2xl">{purchaseOrder.invoice_number}</h1>
                                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">Purchase Order #{purchaseOrder.id}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                        <span className="text-xs font-medium text-gray-700 sm:text-sm">{purchaseOrder.store_name}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-start gap-2">
                                <div
                                    className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${getStatusColor(
                                        purchaseOrder.status
                                    )}`}
                                >
                                    <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
                                </div>
                                <div
                                    className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${getStatusColor(
                                        purchaseOrder.payment_status
                                    )}`}
                                >
                                    <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {purchaseOrder.payment_status.charAt(0).toUpperCase() + purchaseOrder.payment_status.slice(1)}
                                </div>
                                <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 sm:h-10 sm:w-10">
                                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 gap-4 p-4 sm:gap-6 sm:p-6 lg:grid-cols-3">
                        {/* Payment Summary - Left 2 columns */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg lg:col-span-2">
                            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                                <Wallet className="h-6 w-6 text-blue-600" />
                                Payment Summary
                            </h2>

                            <div className="space-y-6">
                                {/* Payment Progress */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Payment Progress</span>
                                        <span className="text-sm font-bold text-blue-600">{paymentProgress.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg transition-all duration-500"
                                            style={{ width: `${paymentProgress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Amount Details */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                                    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4">
                                        <p className="mb-1 text-xs font-medium text-blue-700 sm:text-sm">Grand Total</p>
                                        <p className="text-xl font-bold text-blue-900 sm:text-2xl">{formatCurrency(purchaseOrder.grand_total)}</p>
                                    </div>
                                    <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4">
                                        <p className="mb-1 text-xs font-medium text-green-700 sm:text-sm">Amount Paid</p>
                                        <p className="text-xl font-bold text-green-900 sm:text-2xl">{formatCurrency(purchaseOrder.amount_paid)}</p>
                                    </div>
                                    <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4">
                                        <p className="mb-1 text-xs font-medium text-orange-700 sm:text-sm">Amount Due</p>
                                        <p className="text-xl font-bold text-orange-900 sm:text-2xl">{formatCurrency(purchaseOrder.amount_due)}</p>
                                    </div>
                                </div>

                                {/* Transaction History */}
                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                                        <Clock className="h-5 w-5 text-gray-600" />
                                        Transaction History
                                    </h3>
                                    <div className="space-y-3">
                                        {transactions.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-slate-50 py-12">
                                                <CreditCard className="mb-3 h-12 w-12 text-gray-400" />
                                                <p className="text-sm font-medium text-gray-600">No transactions recorded</p>
                                            </div>
                                        ) : (
                                            transactions.map((transaction: any) => (
                                                <div
                                                    key={transaction.id}
                                                    className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 p-3 transition-all hover:shadow-md sm:p-4"
                                                >
                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-green-300 bg-green-100">
                                                                {getPaymentMethodIcon(transaction.payment_method)}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">Payment #{transaction.id}</p>
                                                                <p className="text-xs capitalize text-gray-500">{transaction.payment_method} Payment</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                                                            <div className="sm:text-right">
                                                                <p className="text-lg font-bold text-green-600 sm:text-xl">{formatCurrency(transaction.amount)}</p>
                                                                <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {formatDate(transaction.paid_at)}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedTransaction(transaction)}
                                                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                                            >
                                                                <Receipt className="h-4 w-4" />
                                                                Receipt
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {transaction.notes && <p className="mt-2 rounded-lg border border-slate-200 bg-white p-2 text-xs text-gray-600 sm:text-sm">{transaction.notes}</p>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items - Right 1 column */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                                <Package className="h-6 w-6 text-purple-600" />
                                Order Items
                            </h2>

                            <div className="space-y-4">
                                {items.map((item: any) => (
                                    <div key={item.id} className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border-2 border-purple-300 bg-white">
                                                <Package className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate font-bold text-gray-900">{item.product_name}</h3>
                                                <p className="text-sm font-medium text-purple-700">{item.variant_name}</p>

                                                {item.variant_data && (
                                                    <div className="mt-2 flex gap-2">
                                                        {Object.entries(item.variant_data).map(([key, value]) => (
                                                            <span key={key} className="rounded-full border border-purple-300 bg-white px-2 py-1 text-xs font-medium text-purple-700">
                                                                {key}: {value as string}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="mt-3 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Ordered:</span>
                                                        <span className="font-bold text-gray-900">{item.quantity_ordered} units</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Received:</span>
                                                        <span className={`font-bold ${item.quantity_received > 0 ? 'text-green-600' : 'text-orange-600'}`}>{item.quantity_received} units</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-600">Price:</span>
                                                        <span className="font-bold text-gray-900">{formatCurrency(item.purchase_price)}</span>
                                                    </div>
                                                    <div className="border-t border-purple-300 pt-2">
                                                        <div className="flex justify-between">
                                                            <span className="font-bold text-gray-700">Total:</span>
                                                            <span className="text-lg font-bold text-purple-700">{formatCurrency(item.total)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(item.status)}`}>
                                                    {item.status === 'ordered' ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="m-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:m-6 sm:p-6">
                        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                            <Clock className="h-6 w-6 text-indigo-600" />
                            Order Timeline
                        </h2>

                        <div className="relative">
                            <div className="absolute bottom-0 left-6 top-0 w-0.5 bg-gradient-to-b from-blue-400 to-green-400"></div>

                            <div className="space-y-6">
                                <div className="relative flex gap-4">
                                    <div className="z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 shadow-lg">
                                        <ShoppingCart className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1 rounded-lg bg-gradient-to-r from-blue-50 to-transparent p-4">
                                        <h3 className="font-bold text-gray-900">Order Created</h3>
                                        <p className="text-sm text-gray-600">{formatDate(purchaseOrder.created_at)}</p>
                                    </div>
                                </div>

                                {transactions.map((transaction: any) => (
                                    <div key={transaction.id} className="relative flex gap-4">
                                        <div className="z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-500 shadow-lg">
                                            <Wallet className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 rounded-lg bg-gradient-to-r from-green-50 to-transparent p-4">
                                            <h3 className="font-bold text-gray-900">Payment Received - {formatCurrency(transaction.amount)}</h3>
                                            <p className="text-sm capitalize text-gray-600">
                                                {transaction.payment_method} • {formatDate(transaction.paid_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <div className="relative flex gap-4">
                                    <div className="z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 shadow-lg">
                                        <Clock className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1 rounded-lg bg-gradient-to-r from-purple-50 to-transparent p-4">
                                        <h3 className="font-bold text-gray-900">Last Updated</h3>
                                        <p className="text-sm text-gray-600">{formatDate(purchaseOrder.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Receipt Modal */}
            {selectedTransaction && <PaymentReceipt purchaseOrder={purchaseOrder} transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />}
        </>
    );
};

export default TransactionTrackingModal;
