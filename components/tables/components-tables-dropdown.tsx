'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Filter, ShoppingCart, Clock, CheckCircle, XCircle, Package, DollarSign, MoreVertical, Eye, Download, Truck } from 'lucide-react';
import { useGetAllPurchasesQuery, useReceivePurchaseMutation } from '@/store/features/purchase/purchase';
import { useSelector } from 'react-redux';

const PurchaseManagement = () => {
    const isRtl = useSelector((state) => state.themeConfig.rtlClass) === 'rtl';

    // API calls
    const { data, isLoading, refetch } = useGetAllPurchasesQuery();
    const [receivePurchase] = useReceivePurchaseMutation();
    const purchases = data?.data || [];

    // State management
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRefs = useRef({});

    // Toast notification
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-0 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && dropdownRefs.current[openDropdown] && !dropdownRefs.current[openDropdown].contains(event.target)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    // Get status badge styling
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'draft':
                return {
                    bg: 'bg-orange-100',
                    text: 'text-orange-800',
                    icon: Clock,
                    label: 'Draft',
                };
            case 'received':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    icon: CheckCircle,
                    label: 'Received',
                };
            case 'delivered':
                return {
                    bg: 'bg-blue-100',
                    text: 'text-blue-800',
                    icon: Truck,
                    label: 'Delivered',
                };
            case 'canceled':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    icon: XCircle,
                    label: 'Canceled',
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: Clock,
                    label: status || 'Unknown',
                };
        }
    };

    // Get payment status badge styling
    const getPaymentBadge = (paymentStatus, method) => {
        if (method?.toLowerCase() === 'cash') {
            return {
                bg: 'bg-green-100',
                text: 'text-green-800',
                icon: DollarSign,
                label: 'Cash',
            };
        }
        switch (paymentStatus?.toLowerCase()) {
            case 'pending':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    icon: Clock,
                    label: 'Pending',
                };
            case 'paid':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    icon: CheckCircle,
                    label: 'Paid',
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    icon: Clock,
                    label: paymentStatus || 'N/A',
                };
        }
    };

    // Handle receive purchase
    const handleReceive = async (purchaseId) => {
        try {
            await receivePurchase(purchaseId).unwrap();
            showToast('Purchase marked as received', 'success');
            refetch();
        } catch (error) {
            console.error('Error receiving purchase:', error);
            showToast('Failed to mark as received', 'error');
        } finally {
            setOpenDropdown(null);
        }
    };

    // Toggle dropdown
    const toggleDropdown = (purchaseId, event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpenDropdown(openDropdown === purchaseId ? null : purchaseId);
    };

    // Filter and search purchases
    const filteredPurchases = useMemo(() => {
        return purchases.filter((purchase) => {
            const matchesSearch = purchase.id?.toString().includes(searchTerm) || purchase.items?.some((item) => item.product?.product_name.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
            const matchesPayment = paymentFilter === 'all' || purchase.payment_status === paymentFilter;

            return matchesSearch && matchesStatus && matchesPayment;
        });
    }, [purchases, searchTerm, statusFilter, paymentFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
    const currentPurchases = filteredPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, paymentFilter]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading purchases...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-7xl">
                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                                <p className="text-3xl font-bold text-gray-900">{purchases.length}</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Received</p>
                                <p className="text-3xl font-bold text-green-600">{purchases.filter((p) => p.status === 'received').length}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-orange-600">{purchases.filter((p) => p.status === 'draft').length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-lg border bg-white shadow-sm">
                    <div className="p-6">
                        <div className="flex flex-col gap-4 lg:flex-row">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by purchase ID or product name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="received">Received</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="canceled">Canceled</option>
                                </select>
                            </div>

                            {/* Payment Filter */}
                            <div>
                                <select
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Payments</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>

                            {/* Items per page */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Purchase ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product Details</th>
                                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Total Items</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payment Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Order Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total Amount</th>
                                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {currentPurchases.map((purchase) => {
                                    const statusBadge = getStatusBadge(purchase.status);
                                    const paymentBadge = getPaymentBadge(purchase.payment_status, purchase.payment_method);
                                    const StatusIcon = statusBadge.icon;
                                    const PaymentIcon = paymentBadge.icon;

                                    return (
                                        <tr key={purchase.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                                        <Package className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">#{purchase.id}</div>
                                                        <div className="text-xs text-gray-500">Purchase Order</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="max-w-sm space-y-2">
                                                    {purchase.items?.slice(0, 3).map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between rounded-lg border-l-4 border-blue-500 bg-blue-50 px-3 py-2">
                                                            <span className="truncate text-sm font-medium text-gray-800">{item.product?.product_name}</span>
                                                            <span className="ml-2 flex-shrink-0 rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                                                        <Package className="mr-1 h-4 w-4" />
                                                        {purchase.items?.reduce((total, item) => total + item.quantity, 0) || 0}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge.bg} ${paymentBadge.text}`}>
                                                    <PaymentIcon className="mr-1 h-3 w-3" />
                                                    {paymentBadge.label}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                                                    <StatusIcon className="mr-1 h-3 w-3" />
                                                    {statusBadge.label}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">${Number(purchase.grand_total || 0).toFixed(2)}</div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                <div className="relative inline-block" ref={(el) => (dropdownRefs.current[purchase.id] = el)}>
                                                    <button
                                                        type="button"
                                                        disabled={purchase.status?.toLowerCase() === 'received'}
                                                        onClick={(e) => toggleDropdown(purchase.id, e)}
                                                        className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-colors duration-200 ${
                                                            purchase.status?.toLowerCase() === 'received'
                                                                ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500'
                                                        }`}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>

                                                    {openDropdown === purchase.id && (
                                                        <div className="absolute right-0 z-50 mt-1 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                                            <div className="py-1" role="menu">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleReceive(purchase.id)}
                                                                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    role="menuitem"
                                                                >
                                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                    Mark as Received
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t border-gray-200 bg-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredPurchases.length)} of {filteredPurchases.length} purchases
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`rounded-md px-3 py-1 text-sm font-medium ${
                                                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {currentPurchases.length === 0 && (
                        <div className="py-12 text-center">
                            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No purchases found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Get started by creating your first purchase order.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseManagement;
