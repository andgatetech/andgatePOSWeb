'use client';

import OrderFilter from '@/components/filters/OrderFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showErrorDialog } from '@/lib/toast';
import { useGetAllOrdersQuery } from '@/store/features/Order/Order';
import { useLazyGetStoreQuery } from '@/store/features/store/storeApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import OrderDetailsModal from './components/OrderDetailsModal';
import OrderStats from './components/OrderStats';
import OrdersTable from './components/OrdersTable';

const Orders = () => {
    const { formatCurrency, code, symbol } = useCurrency();
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null);

    // Lazy fetch store details - only load when needed for invoice generation
    const [fetchStore, { data: storeData }] = useLazyGetStoreQuery();
    const currentStore = useMemo(() => storeData?.data || {}, [storeData]);

    // Build query parameters
    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            page: currentPage,
            per_page: itemsPerPage,
            sort_field: sortField,
            sort_direction: sortDirection,
        };

        // Add filter params
        if (apiParams.store_id) params.store_id = apiParams.store_id;
        if (apiParams.store_ids) params.store_ids = apiParams.store_ids;
        if (apiParams.search) params.search = apiParams.search;
        if (apiParams.payment_status) params.payment_status = apiParams.payment_status;
        if (apiParams.payment_method) params.payment_method = apiParams.payment_method;
        if (apiParams.customer_id) params.customer_id = apiParams.customer_id;
        if (apiParams.start_date) params.start_date = apiParams.start_date;
        if (apiParams.end_date) params.end_date = apiParams.end_date;

        // Default to current store if not explicitly provided
        if (!params.store_id && !params.store_ids && currentStoreId) {
            params.store_id = currentStoreId;
        }

        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    // Fetch orders
    const { data: ordersData, isLoading } = useGetAllOrdersQuery(queryParams);

    // Extract orders and pagination
    const orders = useMemo(() => {
        return ordersData?.data?.items || [];
    }, [ordersData]);

    const paginationMeta = useMemo(() => {
        return ordersData?.data?.pagination;
    }, [ordersData]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalOrders = paginationMeta?.total || 0;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.grand_total || 0), 0);
        const paidOrders = orders.filter((order: any) => order.payment_status === 'paid' || order.payment_status === 'completed').length;
        const partialOrders = orders.filter((order: any) => order.payment_status === 'partial').length;
        const dueOrders = orders.filter((order: any) => order.payment_status === 'due' || order.payment_status === 'unpaid').length;
        const pendingOrders = orders.filter((order: any) => order.payment_status === 'pending').length;

        return { totalOrders, totalRevenue, paidOrders, partialOrders, dueOrders, pendingOrders };
    }, [orders, paginationMeta]);

    // Handle filter changes
    const handleFilterChange = useCallback((newApiParams: Record<string, any>) => {
        setApiParams(newApiParams);
        setCurrentPage(1);
    }, []);

    // Handle sorting
    const handleSort = useCallback(
        (field: string) => {
            if (sortField === field) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
                setSortField(field);
                setSortDirection('asc');
            }
            setCurrentPage(1);
        },
        [sortField]
    );

    // Handle pagination
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleItemsPerPageChange = useCallback((items: number) => {
        setItemsPerPage(items);
        setCurrentPage(1);
    }, []);

    // Handle view details
    const handleViewDetails = useCallback((order: any) => {
        setSelectedOrder(order);
        setIsDetailsModalOpen(true);
    }, []);

    // Handle download invoice (full A4 PDF)
    const handleDownloadInvoice = useCallback(
        async (order: any) => {
            // Fetch store data if not already loaded
            if (!storeData && currentStoreId) {
                await fetchStore({ store_id: currentStoreId });
            }

            setSelectedOrder(order);
            setTimeout(() => {
                if (!invoiceRef.current) {
                    showErrorDialog('Error', 'Invoice element not found');
                    return;
                }

                html2canvas(invoiceRef.current, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 1200,
                    windowHeight: 1600,
                })
                    .then((canvas) => {
                        if (!canvas || canvas.width === 0 || canvas.height === 0) {
                            throw new Error('Canvas generation failed');
                        }

                        const imgData = canvas.toDataURL('image/png');

                        if (!imgData || imgData === 'data:,') {
                            throw new Error('Invalid image data');
                        }

                        const pdf = new jsPDF('p', 'mm', 'a4');
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                        pdf.save(`invoice-${order.invoice || order.id}.pdf`);
                    })
                    .catch((error) => {
                        console.error('PDF generation error:', error);
                        showErrorDialog('Error', 'Failed to generate PDF. Please try again.');
                    });
            }, 500);
        },
        [storeData, currentStoreId, fetchStore]
    );

    // Generate receipt HTML for printing (58mm thermal receipt) - defined before usage
    const generateReceiptHTML = useCallback(
        (order: any) => {
            const storeName = currentStore?.store_name || 'AndGatePOS';
            const storeLocation = currentStore?.store_location || 'Dhaka, Bangladesh, 1212';
            const storeContact = currentStore?.store_contact || '+8601600000';

            const currentDate = new Date(order.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });

            const currentTime = new Date(order.created_at).toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });

            let itemsHTML = '';
            order.items?.forEach((item: any, index: number) => {
                itemsHTML += `
                <div class="item-row">
                    <div class="item-name">${index + 1}. ${item.product_name}</div>
                    <div class="item-qty">${item.quantity}</div>
                    <div class="item-price">${symbol}${Number(item.subtotal).toFixed(2)}</div>
                </div>
                <div class="item-details">${item.quantity} x ${symbol}${Number(item.unit_price).toFixed(2)}</div>
            `;
            });

            const subtotal = Number(order.total || 0);
            const tax = Number(order.tax || 0);
            const discount = Number(order.discount || 0);
            const grandTotal = Number(order.grand_total || 0);
            const amountPaid = Number(order.amount_paid || 0);
            const amountDue = Number(order.due_amount || 0);

            return `
<!DOCTYPE html>
<html>
<head>
    <title>Receipt - ${order.invoice}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: 58mm auto; margin: 0; }
        body { font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.3; width: 58mm; margin: 0 auto; padding: 5mm; background: white; color: black; }
        .receipt-container { width: 100%; }
        .center { text-align: center; }
        .store-name { font-size: 16px; font-weight: bold; margin-bottom: 3px; }
        .store-info { font-size: 10px; margin-bottom: 2px; }
        .divider { border-top: 1px dashed #000; margin: 4mm 0; }
        .invoice-info { margin-bottom: 3mm; font-size: 10px; }
        .invoice-info div { margin-bottom: 2px; }
        .items-header { font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 3px; font-size: 10px; }
        .item-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 10px; }
        .item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 5px; }
        .item-qty { width: 40px; text-align: center; }
        .item-price { width: 70px; text-align: right; }
        .item-details { font-size: 9px; color: #666; margin-bottom: 3px; padding-left: 3px; }
        .totals-section { margin-top: 3mm; border-top: 1px solid #000; padding-top: 2mm; font-size: 10px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
        .grand-total { font-weight: bold; font-size: 13px; border-top: 2px solid #000; padding-top: 2mm; margin-top: 2mm; }
        .footer { margin-top: 4mm; font-size: 10px; }
        .thank-you { font-size: 12px; font-weight: bold; margin-bottom: 2px; }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: 58mm auto; margin: 0mm; }
        }
        @media screen {
            body { padding-top: 60px; }
            .print-toolbar { position: fixed; top: 0; left: 0; right: 0; background: #f3f4f6; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 1000; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
            .print-btn, .close-btn { padding: 10px 24px; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s; }
            .print-btn { background: #10b981; color: white; }
            .print-btn:active { transform: scale(0.98); }
            .close-btn { background: #6b7280; color: white; }
            .close-btn:active { transform: scale(0.98); }
        }
        @media print {
            .print-toolbar { display: none !important; }
            body { padding-top: 0; }
        }
    </style>
</head>
<body>
    <div class="print-toolbar">
        <button class="print-btn" onclick="window.print()">🖨️ Print Receipt</button>
        <button class="close-btn" onclick="window.close()">✕ Close</button>
    </div>
    
    <div class="receipt-container">
        <div class="center">
            <div class="store-name">${storeName}</div>
            <div class="store-info">${storeLocation}</div>
            <div class="store-info">${storeContact}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="invoice-info">
            <div><strong>Receipt:</strong> ${order.invoice}</div>
            <div><strong>Date:</strong> ${currentDate} ${currentTime}</div>
            ${order.is_walk_in ? '' : `<div><strong>Customer:</strong> ${order.customer?.name || 'N/A'}</div>`}
        </div>
        
        <div class="divider"></div>
        
        <div class="items-header">
            <div class="item-row">
                <div class="item-name">ITEM</div>
                <div class="item-qty">QTY</div>
                <div class="item-price">AMOUNT</div>
            </div>
        </div>
        
        ${itemsHTML}
        
        <div class="totals-section">
            <div class="total-row">
                <div>Subtotal:</div>
                <div>${symbol}${subtotal.toFixed(2)}</div>
            </div>
            ${tax > 0 ? `<div class="total-row"><div>Tax:</div><div>${symbol}${tax.toFixed(2)}</div></div>` : ''}
            ${discount > 0 ? `<div class="total-row"><div>Discount:</div><div>-${symbol}${discount.toFixed(2)}</div></div>` : ''}
            <div class="total-row grand-total">
                <div>TOTAL:</div>
                <div>${symbol}${grandTotal.toFixed(2)}</div>
            </div>
            ${
                (order.payment_status === 'partial' || order.payment_status === 'due') && amountPaid > 0
                    ? `
            <div class="total-row" style="color: #059669;">
                <div>Amount Paid:</div>
                <div>${symbol}${amountPaid.toFixed(2)}</div>
            </div>`
                    : ''
            }
            ${
                (order.payment_status === 'partial' || order.payment_status === 'due') && amountDue > 0
                    ? `
            <div class="total-row" style="color: #dc2626; font-weight: bold;">
                <div>Amount Due:</div>
                <div>${symbol}${amountDue.toFixed(2)}</div>
            </div>`
                    : ''
            }
        </div>
        
        <div class="divider"></div>
        
        <div class="center">
            <div><strong>Payment Method:</strong> ${order.payment_method === 'due' ? 'Due' : order.payment_method || 'Cash'}</div>
            <div><strong>Status:</strong> <span style="color: ${
                order.payment_status === 'paid' || order.payment_status === 'completed' ? '#059669' : order.payment_status === 'due' || order.payment_status === 'pending' ? '#ca8a04' : '#dc2626'
            }; font-weight: bold; text-transform: uppercase;">${order.payment_status || 'Pending'}</span></div>
            ${
                (order.payment_status === 'partial' || order.payment_status === 'due') && amountDue > 0
                    ? `
            <div style="margin-top: 2mm; padding: 2mm; background: #fee2e2; border-radius: 2mm;">
                <div style="color: #dc2626; font-weight: bold;">⚠ Amount Due: ${symbol}${amountDue.toFixed(2)}</div>
            </div>`
                    : ''
            }
        </div>
        
        <div class="divider"></div>
        
        <div class="footer center">
            <div class="thank-you">THANK YOU!</div>
            <div>Please come again</div>
            <div style="margin-top: 2mm; font-size: 9px;">Powered by AndGate POS</div>
        </div>
    </div>
    
    <script>
        window.addEventListener('load', function() {
            setTimeout(function() {
                // Auto-print can be enabled if needed
                // window.print();
            }, 500);
        });
    </script>
</body>
</html>`;
        },
        [currentStore, symbol]
    );

    // Handle print invoice (58mm thermal receipt) - uses generateReceiptHTML
    const handlePrintInvoice = useCallback(
        async (order: any) => {
            if (isPrinting) return;
            setIsPrinting(true);

            try {
                // Fetch store data if not already loaded
                if (!storeData && currentStoreId) {
                    await fetchStore({ store_id: currentStoreId });
                }

                const receiptHTML = generateReceiptHTML(order);
                const blob = new Blob([receiptHTML], { type: 'text/html' });
                const blobUrl = URL.createObjectURL(blob);
                const printWindow = window.open(blobUrl, '_blank');

                if (!printWindow) {
                    alert('Please allow popups to print receipts.');
                    URL.revokeObjectURL(blobUrl);
                    setIsPrinting(false);
                    return;
                }

                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                    setIsPrinting(false);
                }, 2000);
            } catch (error) {
                console.error('Print error:', error);
                showErrorDialog('Error', 'Failed to open print window');
                setIsPrinting(false);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [isPrinting, generateReceiptHTML, storeData, currentStoreId, fetchStore]
    );

    // Reset page when store changes
    useEffect(() => {
        setCurrentPage(1);
        setApiParams({});
    }, [currentStoreId]);

    const totalPages = paginationMeta?.last_page || 1;
    const totalItems = paginationMeta?.total || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
            <div className="mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
                                    <p className="text-sm text-gray-500">View and manage all your orders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <OrderStats
                    totalOrders={stats.totalOrders}
                    totalRevenue={stats.totalRevenue}
                    paidOrders={stats.paidOrders}
                    partialOrders={stats.partialOrders}
                    dueOrders={stats.dueOrders}
                    pendingOrders={stats.pendingOrders}
                />

                {/* Filters */}
                <div className="mb-6">
                    <OrderFilter onFilterChange={handleFilterChange} />
                </div>

                {/* Orders Table */}
                <OrdersTable
                    orders={orders}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages,
                        itemsPerPage,
                        totalItems,
                        onPageChange: handlePageChange,
                        onItemsPerPageChange: handleItemsPerPageChange,
                    }}
                    sorting={{
                        field: sortField,
                        direction: sortDirection,
                        onSort: handleSort,
                    }}
                    onViewDetails={handleViewDetails}
                    onDownloadInvoice={handleDownloadInvoice}
                    onPrintInvoice={handlePrintInvoice}
                />

                {/* Order Details Modal */}
                <OrderDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} order={selectedOrder} />

                {/* Hidden Invoice for Download (Full A4 Format) */}
                {selectedOrder && (
                    <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
                        <div ref={invoiceRef} style={{ width: '210mm', backgroundColor: 'white', padding: '32px', fontFamily: 'Arial, sans-serif' }}>
                            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h1 style={{ fontSize: '30px', fontWeight: 'bold', textTransform: 'uppercase' }}>Invoice</h1>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '600' }}>{currentStore?.store_name || 'AndGate POS'}</div>
                                    <div style={{ fontSize: '14px' }}>{currentStore?.store_location || 'Dhaka, Bangladesh'}</div>
                                    <div style={{ fontSize: '14px' }}>{currentStore?.store_contact || '+8801600000'}</div>
                                </div>
                            </div>

                            <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #d1d5db' }} />

                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ marginBottom: '4px', fontWeight: '600' }}>Issue For:</div>
                                    <div>{selectedOrder.is_walk_in ? 'Walk-in Customer' : selectedOrder.customer?.name || 'N/A'}</div>
                                    {!selectedOrder.is_walk_in && selectedOrder.customer?.phone && <div style={{ fontSize: '14px' }}>{selectedOrder.customer.phone}</div>}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '600' }}>Invoice:</span> {selectedOrder.invoice}
                                    </div>
                                    <div style={{ marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '600' }}>Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString('en-GB')}
                                    </div>
                                    <div style={{ marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '600' }}>Store:</span> {selectedOrder.store_name}
                                    </div>
                                </div>
                            </div>

                            <table style={{ marginBottom: '24px', width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #d1d5db', backgroundColor: '#f9fafb' }}>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>S.NO</th>
                                        <th style={{ padding: '12px', textAlign: 'left' }}>ITEMS</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>QTY</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>PRICE</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>AMOUNT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items?.map((item: any, idx: number) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={{ padding: '12px' }}>{idx + 1}</td>
                                            <td style={{ padding: '12px' }}>{item.product_name}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <div style={{ width: '256px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(selectedOrder.total)}</span>
                                    </div>
                                    {Number(selectedOrder.tax || 0) > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span>Tax:</span>
                                            <span>{formatCurrency(selectedOrder.tax)}</span>
                                        </div>
                                    )}
                                    {Number(selectedOrder.discount || 0) > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#dc2626' }}>
                                            <span>Discount:</span>
                                            <span>-{formatCurrency(selectedOrder.discount)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #d1d5db', paddingTop: '8px', fontSize: '20px', fontWeight: 'bold' }}>
                                        <span>Grand Total:</span>
                                        <span>{formatCurrency(selectedOrder.grand_total)}</span>
                                    </div>
                                    {(selectedOrder.payment_status === 'partial' || selectedOrder.payment_status === 'due') && (
                                        <>
                                            {Number(selectedOrder.amount_paid || 0) > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #bbf7d0', paddingTop: '8px', color: '#15803d' }}>
                                                    <span>Amount Paid:</span>
                                                    <span style={{ fontWeight: '600' }}>{formatCurrency(selectedOrder.amount_paid)}</span>
                                                </div>
                                            )}
                                            {Number(selectedOrder.due_amount || 0) > 0 && (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', borderRadius: '8px', backgroundColor: '#fef2f2', padding: '8px', color: '#b91c1c' }}>
                                                    <span style={{ fontWeight: '600' }}>Amount Due:</span>
                                                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(selectedOrder.due_amount)}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '14px', color: '#4b5563' }}>Thank you for your business!</div>
                                <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                                    Payment Method: {selectedOrder.payment_method || 'Cash'} | Status: {selectedOrder.payment_status || 'Pending'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
