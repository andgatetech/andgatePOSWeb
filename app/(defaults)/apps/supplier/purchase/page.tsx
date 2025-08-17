'use client';
import React, { useState } from 'react';
import Head from 'next/head';
import Swal from 'sweetalert2';
import { useGetSupplierPurchaseQuery, useUpdateSupplierPurchaseMutation } from '@/store/features/supplier/supplierApi';

const SupplierPurchaseList = () => {
    const { data, isLoading, error } = useGetSupplierPurchaseQuery();
    const [updatePurchase, { isLoading: isUpdating }] = useUpdateSupplierPurchaseMutation();
    const [filterStatus, setFilterStatus] = useState('all');
    const [updatingId, setUpdatingId] = useState(null); // Track which purchase is updating

    const formatDate = (date) =>
        new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    const statusConfig = {
        draft: { label: 'Awaiting Supplier', bg: 'bg-yellow-50', text: 'text-yellow-700' },
        delivered: { label: 'Delivered by Supplier', bg: 'bg-green-50', text: 'text-green-700' },
        received: { label: 'Received in Store', bg: 'bg-blue-50', text: 'text-blue-700' },
        cancelled: { label: 'Order Cancelled', bg: 'bg-red-50', text: 'text-red-700' },
    };

    const paymentConfig = {
        pending: { label: 'Payment Pending', bg: 'bg-yellow-50', text: 'text-yellow-700' },
        paid: { label: 'Payment Completed', bg: 'bg-green-50', text: 'text-green-700' },
        failed: { label: 'Payment Failed', bg: 'bg-red-50', text: 'text-red-700' },
    };

    const filteredPurchases = data?.data?.filter((p) => (filterStatus === 'all' ? true : p.status === filterStatus)) || [];

    const totalPurchases = data?.data?.length || 0;

    // Toast message helper using SweetAlert2
    const showMessage = (msg = '', type = 'success') => {
        const toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    // Handle status update and show toast messages
    const handleStatusChange = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            await updatePurchase({ id, status: newStatus }).unwrap();
            showMessage(`Order #${id} marked as ${newStatus}`, 'success');
        } catch (err) {
            showMessage('Error updating status', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const canMarkDelivered = (status) => status !== 'delivered' && status !== 'received';
    const canCancel = (status) => status !== 'delivered' && status !== 'received' && status !== 'cancelled';

    if (isLoading)
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
                    <p className="mt-3 text-gray-500">Loading purchases...</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="rounded-lg border border-red-200 bg-white p-6 text-center shadow">
                    <div className="mb-2 text-3xl">❌</div>
                    <p className="font-medium text-red-500">Error loading purchases</p>
                </div>
            </div>
        );

    return (
        <>
            <Head>
                <title>Purchase Orders - Supplier Dashboard</title>
            </Head>

            <div className="min-h-screen bg-gray-50">
                <header className="sticky top-0 z-10 border-b bg-white p-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Purchase Orders</h1>
                            <p className="text-sm text-slate-500">Track and manage purchase orders</p>
                        </div>
                        <div className="rounded bg-gray-100 px-4 py-2 text-sm text-gray-600">
                            {filteredPurchases.length} of {totalPurchases} orders
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl p-6">
                    <div className="mb-6 flex items-center gap-4 rounded-lg border bg-white p-4">
                        <label className="text-sm font-medium">Filter by Status:</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded border px-3 py-1 text-sm">
                            <option value="all">All Status</option>
                            <option value="draft">Awaiting Supplier</option>
                            <option value="delivered">Delivered by Supplier</option>
                            <option value="received">Received in Store</option>
                            <option value="cancelled">Order Cancelled</option>
                        </select>
                    </div>

                    <div className="space-y-6">
                        {filteredPurchases.map((purchase) => {
                            const statusInfo = statusConfig[purchase.status] || {
                                label: purchase.status,
                                bg: 'bg-gray-50',
                                text: 'text-gray-700',
                            };
                            const paymentInfo = paymentConfig[purchase.payment_status] || {
                                label: purchase.payment_status,
                                bg: 'bg-gray-50',
                                text: 'text-gray-700',
                            };

                            const isThisUpdating = updatingId === purchase.id;

                            return (
                                <div key={purchase.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                                    <div className="flex flex-col gap-2 border-b bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-800">Purchase Order #{purchase.id}</h3>
                                            <p className="text-xs text-gray-500">Created: {formatDate(purchase.created_at)}</p>
                                            <p className="text-xs text-gray-500">Updated: {formatDate(purchase.updated_at)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="mb-1 flex justify-end gap-2">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span>
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${paymentInfo.bg} ${paymentInfo.text}`}>{paymentInfo.label}</span>
                                            </div>
                                            <p className="text-lg font-bold text-slate-800">${purchase.grand_total.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-100">
                                                    <tr>
                                                        <th className="p-2 text-left">Product</th>
                                                        <th className="p-2 text-center">Quantity</th>
                                                        <th className="p-2 text-right">Purchase Price</th>
                                                        <th className="p-2 text-right">Tax</th>
                                                        <th className="p-2 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {purchase.items.map((item) => (
                                                        <tr key={item.id} className="border-b last:border-0">
                                                            <td className="p-2 font-medium">{item.product.product_name}</td>
                                                            <td className="p-2 text-center">{item.quantity}</td>
                                                            <td className="p-2 text-right">${item.purchase_price.toLocaleString()}</td>
                                                            <td className="p-2 text-right">${item.tax.toLocaleString()}</td>
                                                            <td className="p-2 text-right font-semibold">${item.total.toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleStatusChange(purchase.id, 'delivered')}
                                                disabled={!canMarkDelivered(purchase.status) || isThisUpdating}
                                                className={`rounded px-3 py-1 text-xs text-white ${
                                                    !canMarkDelivered(purchase.status) || isThisUpdating ? 'cursor-not-allowed bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                                                }`}
                                            >
                                                {isThisUpdating ? (
                                                    <svg className="inline h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                                    </svg>
                                                ) : (
                                                    'Mark Delivered'
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleStatusChange(purchase.id, 'cancelled')}
                                                disabled={!canCancel(purchase.status) || isThisUpdating}
                                                className={`rounded px-3 py-1 text-xs text-white ${
                                                    !canCancel(purchase.status) || isThisUpdating ? 'cursor-not-allowed bg-gray-400' : 'bg-red-500 hover:bg-red-600'
                                                }`}
                                            >
                                                {isThisUpdating ? (
                                                    <svg className="inline h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                                    </svg>
                                                ) : (
                                                    'Cancel Order'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredPurchases.length === 0 && (
                        <div className="rounded-lg border bg-white p-8 text-center shadow">
                            <div className="mb-2 text-4xl">📦</div>
                            <h3 className="font-semibold">No Purchase Orders Found</h3>
                            <p className="text-sm text-gray-500">{filterStatus === 'all' ? 'No purchase orders have been created yet.' : `No purchase orders with status "${filterStatus}".`}</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default SupplierPurchaseList;
