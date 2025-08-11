'use client';

import { useState, useRef, useEffect } from 'react';
import { useGetAllPurchasesQuery, useReceivePurchaseMutation } from '@/store/features/purchase/purchase';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

const ComponentsTablesDropdown = () => {
    const isRtl = useSelector((state) => state.themeConfig.rtlClass) === 'rtl';
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRefs = useRef({});

    const { data, isLoading, refetch } = useGetAllPurchasesQuery();
    const [receivePurchase] = useReceivePurchaseMutation();

    const purchases = data?.data || [];

    // Toast message helper
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && dropdownRefs.current[openDropdown] && !dropdownRefs.current[openDropdown].contains(event.target)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'draft':
                return 'bg-orange-500 text-white';
            case 'received':
                return 'bg-blue-500 text-white';
            case 'delivered':
                return 'bg-green-500 text-white';
            case 'canceled':
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getPaymentStatusBadgeClass = (payment_status, method) => {
        if (method?.toLowerCase() === 'cash') {
            return 'bg-green-500 text-white';
        }
        switch (payment_status?.toLowerCase()) {
            case 'pending':
                return 'bg-orange-500 text-white';
            case 'paid':
                return 'bg-green-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const handleReceive = async (purchaseId) => {
        try {
            await receivePurchase(purchaseId).unwrap();
            showMessage('Purchase marked as received', 'success');
            refetch(); // refresh purchases after server updates
        } catch (error) {
            console.error('Error receiving purchase:', error);
            showMessage('Failed to mark as received', 'error');
        } finally {
            setOpenDropdown(null);
        }
    };

    const toggleDropdown = (purchaseId, event) => {
        event.preventDefault();
        event.stopPropagation();
        setOpenDropdown(openDropdown === purchaseId ? null : purchaseId);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading...</span>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Purchase ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product Details</th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Total Qty</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Payment Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {purchases.slice(0, 7).map((purchase) => (
                            <tr key={purchase.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{purchase.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="space-y-2">
                                        {purchase.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between rounded border-l-4 border-blue-500 bg-gray-50 px-3 py-2">
                                                <span className="text-sm font-medium text-gray-800">{item.product?.product_name}</span>
                                                <span className="ml-3 rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="text-center">
                                        <span className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800">
                                            {purchase.items?.reduce((total, item) => total + item.quantity, 0)} items
                                        </span>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPaymentStatusBadgeClass(purchase.payment_status, purchase.payment_method)}`}>
                                        {purchase.payment_status || 'N/A'}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(purchase.status)}`}>{purchase.status}</span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{purchase.grand_total}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-center">
                                    <div className="relative inline-block" ref={(el) => (dropdownRefs.current[purchase.id] = el)}>
                                        <button
                                            type="button"
                                            disabled={purchase.status?.toLowerCase() === 'received'}
                                            onClick={(e) => toggleDropdown(purchase.id, e)}
                                            className={`inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                                                ${purchase.status?.toLowerCase() === 'received' ? 'cursor-not-allowed opacity-50' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                            </svg>
                                        </button>

                                        {openDropdown === purchase.id && (
                                            <div className="absolute right-0 z-50 mt-1 w-36 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                                                <div className="py-1" role="menu">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReceive(purchase.id)}
                                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                                        role="menuitem"
                                                    >
                                                        Mark as Received
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {purchases.length === 0 && (
                <div className="py-8 text-center">
                    <p className="text-gray-500">No purchases found</p>
                </div>
            )}
        </div>
    );
};

export default ComponentsTablesDropdown;
