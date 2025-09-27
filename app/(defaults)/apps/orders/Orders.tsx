'use client';

import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import Dropdown from '@/components/dropdown';
import OrderFilter from '@/components/filters/OrderFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import { AlertCircle, CheckCircle, CreditCard, Eye, Hash, Package, Printer, ShoppingBag, User, X, XCircle } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const Orders: React.FC = () => {
    const { currentStoreId, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    // Memoize query parameters to prevent infinite re-renders
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {};

        if (Object.keys(apiParams).length > 0) {
            // Filter is active - build parameters from filter

            // Handle store filtering
            if (apiParams.storeId === 'all' || apiParams.store_ids === 'all') {
                // "All Stores" selected - send all user's store IDs as comma-separated string
                const allStoreIds = userStores.map((store: any) => store.id);
                params.store_ids = allStoreIds.join(',');
            } else if (apiParams.store_id) {
                // Specific store ID from filter
                params.store_id = apiParams.store_id;
            } else if (apiParams.storeId && apiParams.storeId !== 'all') {
                // Specific store selected in filter dropdown
                params.store_id = apiParams.storeId;
            } else {
                // No specific store in filter - use current store from sidebar
                if (currentStoreId) {
                    params.store_id = currentStoreId;
                }
            }

            // Handle other filters
            if (apiParams.search) params.search = apiParams.search;
            if (apiParams.payment_status && apiParams.payment_status !== 'all') params.payment_status = apiParams.payment_status;
            if (apiParams.min_amount) params.min_amount = apiParams.min_amount;
            if (apiParams.max_amount) params.max_amount = apiParams.max_amount;
            if (apiParams.dateRange?.startDate) params.start_date = apiParams.dateRange.startDate;
            if (apiParams.dateRange?.endDate) params.end_date = apiParams.dateRange.endDate;
        } else {
            // No filter active - use current store from sidebar (default behavior)
            if (currentStoreId) {
                params.store_id = currentStoreId;
            }
        }

        return params;
    }, [apiParams, currentStoreId, userStores]);

    // API calls - RTK Query will auto-refetch when queryParams change
    const { data: ordersData, isLoading } = useGetAllOrdersQuery(queryParams);
    console.log('Orders data:', ordersData);
    const orders = useMemo(() => ordersData?.data || [], [ordersData?.data]);

    // Reset filter when current store changes from sidebar
    useEffect(() => {
        setApiParams({});
    }, [currentStoreId]);

    // Handle filter changes from OrderFilter
    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
    }, []);

    // Payment Status Badge Component
    const PaymentStatusBadge = ({ status }: { status: string }) => {
        const getStatusConfig = (status: string) => {
            switch (status?.toLowerCase()) {
                case 'paid':
                    return {
                        bgColor: 'bg-green-100',
                        textColor: 'text-green-800',
                        icon: CheckCircle,
                        label: 'Paid',
                    };
                case 'pending':
                    return {
                        bgColor: 'bg-yellow-100',
                        textColor: 'text-yellow-800',
                        icon: AlertCircle,
                        label: 'Pending',
                    };
                case 'failed':
                    return {
                        bgColor: 'bg-red-100',
                        textColor: 'text-red-800',
                        icon: XCircle,
                        label: 'Failed',
                    };
                default:
                    return {
                        bgColor: 'bg-gray-100',
                        textColor: 'text-gray-800',
                        icon: AlertCircle,
                        label: status || 'Unknown',
                    };
            }
        };

        const config = getStatusConfig(status);
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </span>
        );
    };

    // Define table columns
    const columns: TableColumn[] = [
        {
            key: 'invoice',
            label: 'Invoice',
            sortable: true,
            render: (invoice: string) => <div className="font-semibold text-gray-900">{invoice || 'N/A'}</div>,
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (customer: any) => (
                <div className="space-y-1">
                    <div className="font-medium text-gray-900">{customer?.name || 'Guest Customer'}</div>
                    {customer?.phone && <div className="text-sm text-gray-500">{customer.phone}</div>}
                </div>
            ),
        },
        {
            key: 'items',
            label: 'Items',
            render: (items: any[]) => (
                <div className="space-y-1">
                    <div className="font-medium text-gray-900">{items?.length || 0} items</div>
                    <div className="text-xs text-gray-400">৳{items?.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0).toFixed(2)}</div>
                </div>
            ),
        },
        {
            key: 'payment_status',
            label: 'Payment Status',
            render: (status: string) => <PaymentStatusBadge status={status} />,
        },
        {
            key: 'transaction',
            label: 'Payment Method',
            render: (transaction: any) => (
                <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-sm capitalize">{transaction?.payment_method || 'N/A'}</span>
                </div>
            ),
        },
        {
            key: 'grand_total',
            label: 'Total Amount',
            render: (amount: number) => (
                <div className="text-right">
                    <span className="font-semibold text-gray-900">৳{Number(amount || 0).toFixed(2)}</span>
                </div>
            ),
            className: 'text-right',
        },
        {
            key: 'created_at',
            label: 'Order Date',
            render: (date: string) => (
                <div className="text-sm text-gray-600">
                    {new Date(date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })}
                    <div className="text-xs text-gray-400">
                        {new Date(date).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>
            ),
        },
    ];

    // Action handlers
    const handleViewDetails = (order: any) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const handleViewInvoice = (order: any) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    const handlePrintOrder = (order: any) => {
        const printWindow = window.open('', '', 'height=800,width=1200');
        if (!printWindow) return;

        // Get store information from current store or userStores
        const currentStore = userStores.find((store) => store.id === currentStoreId) || userStores[0];

        printWindow.document.write('<html><head><title>Order Details - ' + order.invoice + '</title>');
        printWindow.document.write(`
            <style>
                body { font-family: Arial, sans-serif; margin: 15px; color: #333; line-height: 1.4; }
                .store-header {
                    text-align: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #1f2937;
                    padding-bottom: 15px;
                }
                .store-logo {
                    width: 60px;
                    height: 60px;
                    margin: 0 auto 10px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f9fafb;
                }
                .store-name { 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #1f2937; 
                    margin: 8px 0 5px 0;
                }
                .store-tagline {
                    font-size: 14px;
                    color: #6b7280;
                    font-weight: 500;
                    margin: 5px 0;
                }
                .store-details {
                    font-size: 12px;
                    color: #4b5563;
                    margin: 10px 0;
                }
                .store-contact {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    max-width: 500px;
                    margin: 0 auto;
                    text-align: left;
                }
                .contact-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 3px;
                }
                .contact-label {
                    font-weight: bold;
                    margin-right: 6px;
                    min-width: 50px;
                }
                .order-header {
                    background: linear-gradient(135deg, #3b82f6, #1e40af);
                    color: white;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    text-align: center;
                }
                .order-header h1 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: bold;
                }
                .order-header p {
                    margin: 3px 0 0 0;
                    opacity: 0.9;
                    font-size: 13px;
                }
                .order-info { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 15px; 
                    margin-bottom: 20px; 
                }
                .info-section { 
                    padding: 12px; 
                    border: 1px solid #e5e7eb; 
                    border-radius: 6px;
                    background-color: #f9fafb;
                }
                .info-section h3 { 
                    margin-top: 0; 
                    margin-bottom: 8px;
                    color: #1f2937; 
                    font-size: 14px;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 5px;
                }
                .info-item {
                    margin-bottom: 5px;
                    display: flex;
                    font-size: 12px;
                }
                .info-label {
                    font-weight: bold;
                    min-width: 70px;
                    color: #374151;
                }
                .info-value {
                    color: #4b5563;
                    flex: 1;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 20px;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                    page-break-inside: auto;
                }
                th, td { 
                    border: 1px solid #e5e7eb; 
                    padding: 8px; 
                    text-align: left; 
                    font-size: 11px;
                }
                th { 
                    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
                    font-weight: bold;
                    color: #374151;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                    page-break-after: avoid;
                }
                tbody tr {
                    page-break-inside: avoid;
                }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .totals { 
                    margin-top: 20px; 
                    padding: 15px;
                    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                    border: 1px solid #0ea5e9;
                    border-radius: 8px;
                    page-break-inside: avoid;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 12px;
                }
                .total-row.grand {
                    font-size: 16px;
                    font-weight: bold;
                    border-top: 1px solid #0ea5e9;
                    padding-top: 8px;
                    margin-top: 8px;
                    color: #0c4a6e;
                }
                .footer {
                    text-align: center;
                    margin-top: 25px;
                    padding-top: 15px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 10px;
                    page-break-inside: avoid;
                }
                @media print {
                    body { margin: 0; font-size: 12px; }
                    @page { 
                        margin: 0.4in; 
                        size: A4; 
                    }
                    .no-print { display: none; }
                    .store-header { 
                        margin-bottom: 15px; 
                        padding-bottom: 10px; 
                    }
                    .order-header { 
                        margin-bottom: 15px; 
                        padding: 8px; 
                    }
                    .order-info { 
                        margin-bottom: 15px; 
                    }
                    table { 
                        margin-bottom: 15px; 
                        font-size: 10px;
                    }
                    th, td { 
                        padding: 6px; 
                    }
                }
            </style>
        `);
        printWindow.document.write('</head><body>');

        // Store Header with full details
        printWindow.document.write(`
            <div class="store-header">
                <div class="store-logo">
                    ${
                        currentStore?.logo_path
                            ? `<img src="${process.env.NEXT_PUBLIC_BASE_PATH || ''}/${
                                  currentStore.logo_path
                              }" alt="Store Logo" style="max-width: 50px; max-height: 50px; object-fit: contain;" onerror="this.style.display='none';">`
                            : `<div style="font-size: 8px; color: #9ca3af;">LOGO</div>`
                    }
                </div>
                <h1 class="store-name">${currentStore?.store_name || 'Store Name'}</h1>
                <p class="store-tagline">Point of Sale & Management System</p>
                <div class="store-details">
                    <div class="store-contact">
                        <div class="contact-item">
                            <span class="contact-label">Phone:</span>
                            <span>${currentStore?.store_contact || 'N/A'}</span>
                        </div>
                        <div class="contact-item">
                            <span class="contact-label">Address:</span>
                            <span>${currentStore?.store_location || 'N/A'}</span>
                        </div>
                        <div class="contact-item">
                            <span class="contact-label">Status:</span>
                            <span style="color: ${currentStore?.is_active ? '#059669' : '#dc2626'}; font-weight: bold;">
                                ${currentStore?.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div class="contact-item">
                            <span class="contact-label">Printed:</span>
                            <span>${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="order-header">
                <h1>Order Details</h1>
                <p>Invoice: ${order.invoice} | Order Date: ${new Date(order.created_at).toLocaleDateString('en-GB')}</p>
            </div>
            
            <div class="order-info">
                <div class="info-section">
                    <h3>Customer Information</h3>
                    <div class="info-item">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${order.customer?.name || 'Guest Customer'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${order.customer?.email || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone:</span>
                        <span class="info-value">${order.customer?.phone || 'N/A'}</span>
                    </div>
                </div>
                <div class="info-section">
                    <h3>Order Information</h3>
                    <div class="info-item">
                        <span class="info-label">Invoice:</span>
                        <span class="info-value">${order.invoice}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Date:</span>
                        <span class="info-value">${new Date(order.created_at).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span class="info-value" style="text-transform: capitalize; color: ${
                            order.payment_status === 'paid' ? '#059669' : order.payment_status === 'pending' ? '#d97706' : '#dc2626'
                        }; font-weight: bold;">${order.payment_status}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Payment:</span>
                        <span class="info-value" style="text-transform: capitalize;">${order.transaction?.payment_method || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th class="text-right">Quantity</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Tax</th>
                        <th class="text-right">Discount</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items
                        .map(
                            (item: any) => `
                        <tr>
                            <td>${item.product}<br><small style="color: #666;">${item.unit}</small></td>
                            <td class="text-right">${item.quantity}</td>
                            <td class="text-right">৳${parseFloat(item.unit_price).toFixed(2)}</td>
                            <td class="text-right">৳${parseFloat(item.tax).toFixed(2)}</td>
                            <td class="text-right">৳${parseFloat(item.discount).toFixed(2)}</td>
                            <td class="text-right">৳${parseFloat(item.subtotal).toFixed(2)}</td>
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <div class="total-row">
                    <span><strong>Subtotal:</strong></span>
                    <span>৳${parseFloat(order.total).toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span><strong>Tax:</strong></span>
                    <span>৳${parseFloat(order.tax).toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span><strong>Discount:</strong></span>
                    <span>৳${parseFloat(order.discount).toFixed(2)}</span>
                </div>
                <div class="total-row grand">
                    <span>Grand Total:</span>
                    <span>৳${parseFloat(order.grand_total).toFixed(2)}</span>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for your business!</p>
                <p>This is a computer-generated document.</p>
                <p>${currentStore?.store_name || 'Store'} - ${currentStore?.store_contact || ''}</p>
            </div>
        `);

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    // Calculate stats based on filtered orders
    const totalOrders = orders.length;
    const paidOrders = orders.filter((o: any) => o.payment_status === 'paid').length;
    const pendingOrders = orders.filter((o: any) => o.payment_status === 'pending').length;
    const failedOrders = orders.filter((o: any) => o.payment_status === 'failed').length;
    const totalRevenue = orders.filter((o: any) => o.payment_status === 'paid').reduce((sum: number, o: any) => sum + (Number(o.grand_total) || 0), 0);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Paginated orders
    const totalPages = Math.ceil(totalOrders / itemsPerPage);
    const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Add actions to each row
    const ordersWithActions = paginatedOrders.map((order: any) => ({
        ...order,
        actions: (
            <div className="flex justify-center">
                <Dropdown
                    offset={[0, 5]}
                    placement="bottom-end"
                    btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    button={
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                    }
                >
                    <ul className="min-w-[160px] rounded-lg border bg-white shadow-lg">
                        <li>
                            <button
                                onClick={() => handleViewDetails(order)}
                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                            >
                                <Eye className="h-4 w-4" />
                                View Details
                            </button>
                        </li>
                        <li className="border-t">
                            <button
                                onClick={() => handlePrintOrder(order)}
                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-green-600 transition-colors hover:bg-green-50"
                            >
                                <Printer className="h-4 w-4" />
                                Print Order
                            </button>
                        </li>
                    </ul>
                </Dropdown>
            </div>
        ),
    }));

    // Add Actions column
    const columnsWithActions: TableColumn[] = [
        ...columns,
        {
            key: 'actions',
            label: 'Actions',
            render: (value: any) => value,
            className: 'w-20 text-center',
        },
    ];

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [apiParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="">
                {/* Header */}
                <div className="mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                                    <ShoppingBag className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                                    <p className="text-sm text-gray-500">View and manage all your store orders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                            </div>
                            <ShoppingBag className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                                <p className="text-2xl font-bold text-green-600">{paidOrders}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                                <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Failed Orders</p>
                                <p className="text-2xl font-bold text-red-600">{failedOrders}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <OrderFilter key={`order-filter-${currentStoreId}`} onFilterChange={handleFilterChange} />

                {/* Orders Table */}
                <div className="mt-6">
                    <ReusableTable
                        data={ordersWithActions}
                        columns={columnsWithActions}
                        isLoading={isLoading}
                        emptyState={{
                            icon: <ShoppingBag className="h-16 w-16" />,
                            title: 'No orders found',
                            description: Object.keys(apiParams).length > 0 ? 'Try adjusting your search or filter criteria.' : 'No orders have been placed yet.',
                        }}
                        pagination={{
                            currentPage,
                            totalPages,
                            itemsPerPage,
                            totalItems: totalOrders,
                            onPageChange: setCurrentPage,
                            onItemsPerPageChange: setItemsPerPage,
                        }}
                        rowClassName={(row: any, index: number) => {
                            const baseClass = 'transition-colors hover:bg-blue-50';
                            const stripeClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                            return `${baseClass} ${stripeClass}`;
                        }}
                    />
                </div>

                {/* Results Summary */}
                <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
                    <div className="text-sm text-gray-600">
                        Showing <span className="font-medium">{paginatedOrders.length}</span> of <span className="font-medium">{totalOrders}</span> orders
                        {apiParams.search && <span> matching &quot;{apiParams.search}&quot;</span>}
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 p-6">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                                    <p className="text-sm text-gray-500">{selectedOrder.invoice}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePrintOrder(selectedOrder)}
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </button>
                                <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Order Info Grid */}
                            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Customer Information */}
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <h3 className="mb-3 flex items-center text-lg font-medium text-gray-900">
                                        <User className="mr-2 h-5 w-5" />
                                        Customer Information
                                    </h3>
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-medium">Name:</span> {selectedOrder.customer?.name || 'Guest Customer'}
                                        </p>
                                        <p>
                                            <span className="font-medium">Email:</span> {selectedOrder.customer?.email || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-medium">Phone:</span> {selectedOrder.customer?.phone || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Information */}
                                <div className="rounded-lg border border-gray-200 p-4">
                                    <h3 className="mb-3 flex items-center text-lg font-medium text-gray-900">
                                        <Hash className="mr-2 h-5 w-5" />
                                        Order Information
                                    </h3>
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-medium">Invoice:</span> {selectedOrder.invoice}
                                        </p>
                                        <p>
                                            <span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString('en-GB')}
                                        </p>
                                        <p>
                                            <span className="font-medium">Payment Status:</span> <PaymentStatusBadge status={selectedOrder.payment_status} />
                                        </p>
                                        <p>
                                            <span className="font-medium">Payment Method:</span> {selectedOrder.transaction?.payment_method || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">Order Items</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Unit Price</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Tax</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Discount</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {selectedOrder.items?.map((item: any, index: number) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="font-medium text-gray-900">{item.product}</div>
                                                        <div className="text-sm text-gray-500">{item.unit}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">{item.quantity}</td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">৳{parseFloat(item.unit_price).toFixed(2)}</td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">৳{parseFloat(item.tax).toFixed(2)}</td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">৳{parseFloat(item.discount).toFixed(2)}</td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">৳{parseFloat(item.subtotal).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Order Totals */}
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Subtotal:</span>
                                        <span>৳{parseFloat(selectedOrder.total).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Tax:</span>
                                        <span>৳{parseFloat(selectedOrder.tax).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Discount:</span>
                                        <span>৳{parseFloat(selectedOrder.discount).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-300 pt-2">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Grand Total:</span>
                                            <span>৳{parseFloat(selectedOrder.grand_total).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
