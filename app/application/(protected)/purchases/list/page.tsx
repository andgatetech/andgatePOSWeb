'use client';
import TransactionTrackingModal from '@/app/application/(protected)/purchases/list/components/TransactionTrackingModal';

import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useConvertDraftToPurchaseOrderMutation, useDeletePurchaseDraftMutation, useGetPurchaseDraftsQuery, useGetPurchaseOrdersQuery } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { FileText, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Swal from 'sweetalert2';
import DraftsTable from './components/DraftsTable';
import PurchaseOrdersTable from './components/PurchaseOrdersTable';

const PurchaseOrderListPage = () => {
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();
    const [activeTab, setActiveTab] = useState<'drafts' | 'orders'>('drafts');
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [modalTitle, setModalTitle] = useState('');
    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [selectedTransactionOrder, setSelectedTransactionOrder] = useState<any>(null);
    const [draftFilters, setDraftFilters] = useState<Record<string, any>>({});
    const [orderFilters, setOrderFilters] = useState<Record<string, any>>({});

    // Pagination and sorting for drafts
    const [draftPage, setDraftPage] = useState(1);
    const [draftPerPage, setDraftPerPage] = useState(15);
    const [draftSortField, setDraftSortField] = useState('created_at');
    const [draftSortDirection, setDraftSortDirection] = useState<'asc' | 'desc'>('desc');

    // Pagination and sorting for orders
    const [orderPage, setOrderPage] = useState(1);
    const [orderPerPage, setOrderPerPage] = useState(15);
    const [orderSortField, setOrderSortField] = useState('created_at');
    const [orderSortDirection, setOrderSortDirection] = useState<'asc' | 'desc'>('desc');

    // Fetch drafts and orders with filters
    const { data: draftsResponse, isLoading: draftsLoading } = useGetPurchaseDraftsQuery({
        ...draftFilters,
        store_id: currentStoreId,
        page: draftPage,
        per_page: draftPerPage,
        sort_field: draftSortField,
        sort_direction: draftSortDirection,
    });

    const { data: ordersResponse, isLoading: ordersLoading } = useGetPurchaseOrdersQuery({
        exclude_completed: 'false',
        ...orderFilters,
        store_id: currentStoreId,
        page: orderPage,
        per_page: orderPerPage,
        sort_field: orderSortField,
        sort_direction: orderSortDirection,
    });

    const [convertToPO, { isLoading: isConverting }] = useConvertDraftToPurchaseOrderMutation();
    const [deleteDraft] = useDeletePurchaseDraftMutation();

    // Extract data from API responses
    const drafts = draftsResponse?.data?.items || [];
    const draftsPagination = draftsResponse?.data?.pagination;

    const orders = ordersResponse?.data?.items || [];
    const ordersPagination = ordersResponse?.data?.pagination;

    const handleViewItems = (item: any) => {
        const title = item.draft_reference ? `Draft: ${item.draft_reference}` : `Purchase Order: ${item.invoice_number}`;
        console.log('Opening items modal with data:', item.items);
        setSelectedItems(item.items || []);
        setModalTitle(title);
        setViewModalOpen(true);
    };

    const handlePrint = (item: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const isDraft = !!item.draft_reference;
        const title = isDraft ? `Draft: ${item.draft_reference}` : `Purchase Order: ${item.invoice_number}`;
        const items = item.items || [];

        const total = items.reduce((sum: number, itm: any) => {
            const subtotal = parseFloat(itm.estimated_subtotal) || parseFloat(itm.subtotal) || parseFloat(itm.total) || 0;
            return sum + subtotal;
        }, 0);

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print ${title}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 40px;
                        color: #333;
                        background: white;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #2563eb;
                        padding-bottom: 20px;
                    }
                    .header h1 {
                        font-size: 28px;
                        color: #1e40af;
                        margin-bottom: 5px;
                        font-weight: 700;
                    }
                    .header p {
                        color: #6b7280;
                        font-size: 14px;
                    }
                    .info-section {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                        background: #f9fafb;
                        padding: 20px;
                        border-radius: 8px;
                    }
                    .info-box { flex: 1; }
                    .info-box h3 {
                        font-size: 12px;
                        color: #6b7280;
                        text-transform: uppercase;
                        margin-bottom: 8px;
                        font-weight: 600;
                        letter-spacing: 0.5px;
                    }
                    .info-box p {
                        font-size: 16px;
                        color: #111827;
                        font-weight: 500;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                        border: 1px solid #e5e7eb;
                    }
                    thead {
                        background: linear-gradient(to right, #dbeafe, #e0e7ff);
                    }
                    th {
                        padding: 12px;
                        text-align: left;
                        font-size: 13px;
                        font-weight: 600;
                        color: #1e40af;
                        border-bottom: 2px solid #cbd5e1;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }
                    td {
                        padding: 12px;
                        border-bottom: 1px solid #e5e7eb;
                        font-size: 14px;
                    }
                    tbody tr:hover { background: #f9fafb; }
                    tbody tr:last-child td { border-bottom: none; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .total-row {
                        background: #f3f4f6;
                        font-weight: 700;
                        font-size: 16px;
                    }
                    .total-row td {
                        padding: 15px 12px;
                        border-top: 2px solid #2563eb;
                    }
                    .badge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        font-weight: 600;
                        text-transform: uppercase;
                    }
                    .badge-new {
                        background: #fef3c7;
                        color: #92400e;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                        color: #6b7280;
                        font-size: 12px;
                    }
                    @media print {
                        body { padding: 20px; }
                        .info-section { break-inside: avoid; }
                        table { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${isDraft ? '📋 Purchase Draft' : '📦 Purchase Order'}</h1>
                    <p>${item.store_name || 'Store'}</p>
                </div>

                <div class="info-section">
                    <div class="info-box">
                        <h3>${isDraft ? 'Draft Reference' : 'Invoice Number'}</h3>
                        <p>${isDraft ? item.draft_reference : item.invoice_number}</p>
                    </div>
                    ${
                        item.supplier
                            ? `
                        <div class="info-box">
                            <h3>Supplier</h3>
                            <p>${item.supplier.name || item.supplier}</p>
                        </div>
                    `
                            : ''
                    }
                    <div class="info-box">
                        <h3>${isDraft ? 'Estimated Total' : 'Grand Total'}</h3>
                        <p style="color: #2563eb; font-size: 20px;">৳${Number(isDraft ? item.estimated_total : item.grand_total).toFixed(2)}</p>
                    </div>
                    ${
                        !isDraft
                            ? `
                        <div class="info-box">
                            <h3>Payment Status</h3>
                            <p style="text-transform: uppercase; font-weight: 600; color: ${item.payment_status === 'paid' ? '#059669' : item.payment_status === 'partial' ? '#d97706' : '#dc2626'};">
                                ${item.payment_status || 'N/A'}
                            </p>
                        </div>
                    `
                            : ''
                    }
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>Product Name</th>
                            <th class="text-center" style="width: 100px;">Quantity</th>
                            <th class="text-right" style="width: 120px;">Unit Price</th>
                            <th class="text-center" style="width: 80px;">Unit</th>
                            <th class="text-right" style="width: 120px;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items
                            .map((itm: any, idx: number) => {
                                const productName = itm.product_name || itm.product || 'N/A';
                                const variantName = itm.variant_name || null;
                                const isVariant = itm.is_variant || false;
                                const quantity = parseFloat(itm.quantity_ordered) || 0;
                                const unitPrice = parseFloat(itm.purchase_price) || 0;
                                const subtotal = parseFloat(itm.estimated_subtotal) || parseFloat(itm.subtotal) || parseFloat(itm.total) || quantity * unitPrice;
                                const isNew = itm.is_new_product || itm.product_id === null;

                                return `
                                <tr>
                                    <td class="text-center">${idx + 1}</td>
                                    <td>
                                        ${productName}
                                        ${isVariant && variantName ? '<br><span style="font-size: 11px; color: #2563eb; font-weight: 600;">Variant: ' + variantName + '</span>' : ''}
                                        ${isNew ? '<span class="badge badge-new">New</span>' : ''}
                                    </td>
                                    <td class="text-center"><strong>${quantity}</strong></td>
                                    <td class="text-right">৳${Number(unitPrice).toFixed(2)}</td>
                                    <td class="text-center">${itm.unit || 'piece'}</td>
                                    <td class="text-right"><strong>৳${Number(subtotal).toFixed(2)}</strong></td>
                                </tr>
                            `;
                            })
                            .join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="5" class="text-right">TOTAL:</td>
                            <td class="text-right" style="color: #2563eb;">৳${total.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                ${
                    !isDraft && item.amount_paid > 0
                        ? `
                    <div class="info-section">
                        <div class="info-box">
                            <h3>Amount Paid</h3>
                            <p style="color: #059669;">৳${Number(item.amount_paid).toFixed(2)}</p>
                        </div>
                        <div class="info-box">
                            <h3>Amount Due</h3>
                            <p style="color: #dc2626;">৳${Number(item.amount_due).toFixed(2)}</p>
                        </div>
                    </div>
                `
                        : ''
                }

                <div class="footer">
                    <p>Generated on ${new Date().toLocaleString()}</p>
                    <p style="margin-top: 5px;">Thank you for your business!</p>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
    };

    const handleReceiveItems = (order: any) => {
        router.push(`/purchases/receive/${order.id}`);
    };

    const handleViewTransactions = (order: any) => {
        setSelectedTransactionOrder(order);
        setTransactionModalOpen(true);
    };

    const handleConvertToPurchaseOrder = async (draft: any) => {
        const result = await Swal.fire({
            title: 'Convert to Purchase Order?',
            html: `<p>Convert draft <strong>${draft.draft_reference}</strong> to an official purchase order?</p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Convert',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        try {
            const response = await convertToPO({
                id: draft.id,
                notes: 'Converted from draft',
            }).unwrap();

            // API returns: {success: true, message: string, data: {invoice_number, grand_total, ...}}
            const purchaseOrder = response.data || response;
            const invoiceNumber = purchaseOrder.invoice_number || 'N/A';
            const grandTotal = Number(purchaseOrder.grand_total || purchaseOrder.total || 0).toFixed(2);

            Swal.fire({
                icon: 'success',
                title: 'Purchase Order Created!',
                html: `
                    <p>Invoice: <strong>${invoiceNumber}</strong></p>
                    <p>Total: <strong>৳${grandTotal}</strong></p>
                `,
                confirmButtonText: 'View Purchase Orders',
            }).then(() => {
                setActiveTab('orders');
            });
        } catch (error: any) {
            console.error('Error converting draft:', error);
            const errorMsg = error?.data?.error || error?.data?.message || 'Failed to convert draft';

            Swal.fire({
                icon: 'error',
                title: 'Backend Error',
                html: `<div class="text-left"><p><strong>Error:</strong></p><p class="text-sm">${errorMsg}</p></div>`,
                width: 600,
            });
        }
    };

    const handleDeleteDraft = async (draft: any) => {
        const result = await Swal.fire({
            title: 'Delete Draft?',
            text: `Are you sure you want to delete draft ${draft.draft_reference}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            confirmButtonColor: '#d33',
        });

        if (!result.isConfirmed) return;

        try {
            await deleteDraft(draft.id).unwrap();
            Swal.fire('Deleted!', 'Draft has been deleted', 'success');
        } catch (error: any) {
            Swal.fire('Error', error?.data?.message || 'Failed to record payment', 'error');
        }
    };

    // Sorting handlers
    const handleDraftSort = (field: string) => {
        if (draftSortField === field) {
            setDraftSortDirection(draftSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setDraftSortField(field);
            setDraftSortDirection('asc');
        }
    };

    const handleOrderSort = (field: string) => {
        if (orderSortField === field) {
            setOrderSortDirection(orderSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderSortField(field);
            setOrderSortDirection('asc');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <section className="mb-8">
                <div className="rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-md sm:h-12 sm:w-12">
                                <Package className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Purchase Orders</h1>
                                <p className="text-xs text-gray-500 sm:text-sm">Manage your purchase orders and drafts efficiently</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-start sm:flex-shrink-0 sm:justify-end">
                            <Link
                                href="/purchases/create"
                                className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:px-6 sm:py-3"
                            >
                                <Package className="mr-2 h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 sm:h-5 sm:w-5" />
                                <span className="whitespace-nowrap">Create Purchase Order</span>
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <div className="panel">
                {/* Tabs */}
                <div className="mb-5 flex gap-2 border-b">
                    <button
                        className={`px-4 py-2 font-semibold ${activeTab === 'drafts' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('drafts')}
                    >
                        <FileText className="mr-2 inline h-5 w-5" />
                        Drafts ({drafts.length})
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <Package className="mr-2 inline h-5 w-5" />
                        Purchase Orders ({orders.length})
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-5">{activeTab === 'drafts' ? <UniversalFilter onFilterChange={setDraftFilters} /> : <UniversalFilter onFilterChange={setOrderFilters} />}</div>

                {/* Drafts Tab */}
                {activeTab === 'drafts' && (
                    <DraftsTable
                        drafts={drafts}
                        isLoading={draftsLoading}
                        pagination={{
                            currentPage: draftsPagination?.current_page || 1,
                            totalPages: draftsPagination?.last_page || 1,
                            itemsPerPage: draftsPagination?.per_page || 15,
                            totalItems: draftsPagination?.total || 0,
                            onPageChange: setDraftPage,
                            onItemsPerPageChange: setDraftPerPage,
                        }}
                        sorting={{
                            field: draftSortField,
                            direction: draftSortDirection,
                            onSort: handleDraftSort,
                        }}
                        onViewItems={handleViewItems}
                        onConvertToPO={handleConvertToPurchaseOrder}
                        onDelete={handleDeleteDraft}
                    />
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <PurchaseOrdersTable
                        orders={orders}
                        isLoading={ordersLoading}
                        pagination={{
                            currentPage: ordersPagination?.current_page || 1,
                            totalPages: ordersPagination?.last_page || 1,
                            itemsPerPage: ordersPagination?.per_page || 15,
                            totalItems: ordersPagination?.total || 0,
                            onPageChange: setOrderPage,
                            onItemsPerPageChange: setOrderPerPage,
                        }}
                        sorting={{
                            field: orderSortField,
                            direction: orderSortDirection,
                            onSort: handleOrderSort,
                        }}
                        onViewItems={handleViewItems}
                        onPrint={handlePrint}
                        onViewTransactions={handleViewTransactions}
                    />
                )}
            </div>

            {/* View Items Modal */}
            {viewModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-800">{modalTitle}</h2>
                            <button onClick={() => setViewModalOpen(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {selectedItems.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center">
                                    <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                    <p className="text-gray-500">No items found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                                <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                                                <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                                                <th className="border-b border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">Quantity</th>
                                                <th className="border-b border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                                                <th className="border-b border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">Unit</th>
                                                <th className="border-b border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {selectedItems.map((item: any, index: number) => {
                                                // API Response fields:
                                                // - product_name: "iPhone 15 Pro"
                                                // - variant_name: "Red - M" (if variant)
                                                // - variant_data: {"Color": "Red", "Size": "M"} (if variant)
                                                // - is_new_product: true/false
                                                // - is_variant: true/false
                                                // - quantity_ordered: 1
                                                // - purchase_price: 125000
                                                // - subtotal: 125000
                                                // - total: 125000

                                                const productName = item.product_name || item.product || 'N/A';
                                                const variantName = item.variant_name || null;
                                                const isVariant = item.is_variant || false;
                                                const sku = item.sku || null;
                                                const description = item.description || null;
                                                const unitPrice = parseFloat(item.purchase_price) || 0;
                                                const unit = item.unit || 'piece';
                                                const quantity = parseFloat(item.quantity_ordered) || 0;
                                                const subtotal = parseFloat(item.estimated_subtotal) || parseFloat(item.subtotal) || parseFloat(item.total) || quantity * unitPrice;
                                                const isNewProduct = item.is_new_product || item.product_id === null;

                                                return (
                                                    <tr key={item.id || index} className="border-b border-gray-200 hover:bg-blue-50">
                                                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{productName}</p>
                                                                {isVariant && variantName && <p className="text-xs font-medium text-blue-600">Variant: {variantName}</p>}
                                                                {sku && <p className="text-xs text-gray-500">SKU: {sku}</p>}
                                                                {description && <p className="text-xs text-gray-400">{description}</p>}
                                                                {isNewProduct && (
                                                                    <span className="mt-1 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                                        New Product
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">{quantity}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-gray-900">৳{Number(unitPrice).toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{unit}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-gray-900">৳{Number(subtotal).toFixed(2)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-50">
                                                <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                                    Total:
                                                </td>
                                                <td className="px-4 py-3 text-right text-lg font-bold text-primary">
                                                    ৳
                                                    {selectedItems
                                                        .reduce((sum, item) => {
                                                            const unitPrice = parseFloat(item.purchase_price) || 0;
                                                            const quantity = parseFloat(item.quantity_ordered) || 0;
                                                            // Drafts use 'estimated_subtotal', Orders use 'subtotal' or 'total'
                                                            const subtotal = parseFloat(item.estimated_subtotal) || parseFloat(item.subtotal) || parseFloat(item.total) || quantity * unitPrice;
                                                            return sum + subtotal;
                                                        }, 0)
                                                        .toFixed(2)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setViewModalOpen(false)} className="rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction Tracking Modal */}
            <TransactionTrackingModal isOpen={transactionModalOpen} purchaseOrder={selectedTransactionOrder} onClose={() => setTransactionModalOpen(false)} />
        </div>
    );
};

export default PurchaseOrderListPage;
