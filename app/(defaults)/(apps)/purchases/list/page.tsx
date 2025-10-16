'use client';
import Dropdown from '@/components/dropdown';
import PurchaseFilter from '@/components/filters/PurchaseFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import {
    useConvertDraftToPurchaseOrderMutation,
    useDeletePurchaseDraftMutation,
    useGetPurchaseDraftsQuery,
    useGetPurchaseOrdersQuery,
    useUpdatePurchaseOrderMutation,
} from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { ArrowRight, CreditCard, Edit, Eye, FileText, Package, Printer, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Swal from 'sweetalert2';

const PurchaseOrderListPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [activeTab, setActiveTab] = useState<'drafts' | 'orders'>('drafts');
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);
    const [modalTitle, setModalTitle] = useState('');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [draftFilters, setDraftFilters] = useState<Record<string, any>>({});
    const [orderFilters, setOrderFilters] = useState<Record<string, any>>({});

    // Fetch drafts and orders with filters
    const { data: draftsResponse, isLoading: draftsLoading } = useGetPurchaseDraftsQuery({
        ...draftFilters,
    });

    const { data: ordersResponse, isLoading: ordersLoading } = useGetPurchaseOrdersQuery({
        ...orderFilters,
    });

    const [convertToPO, { isLoading: isConverting }] = useConvertDraftToPurchaseOrderMutation();
    const [deleteDraft] = useDeletePurchaseDraftMutation();
    const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation();

    // Backend handles filtering now
    const drafts = draftsResponse?.data || [];
    const orders = ordersResponse?.data || [];

    // Debug: Check draft structure
    console.log('Drafts from backend:', draftsResponse?.data);
    console.log('Filtered drafts:', drafts);
    console.log('Orders from backend:', ordersResponse?.data);

    const handleViewItems = (items: any[], title: string) => {
        console.log('Opening items modal with data:', items);
        setSelectedItems(items || []);
        setModalTitle(title);
        setViewModalOpen(true);
    };

    const handlePrint = (item: any, type: 'draft' | 'order') => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const isDraft = type === 'draft';
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
                                const productName = itm.product || 'N/A';
                                const quantity = parseFloat(itm.quantity_ordered) || 0;
                                const unitPrice = parseFloat(itm.purchase_price) || 0;
                                const subtotal = parseFloat(itm.estimated_subtotal) || parseFloat(itm.subtotal) || parseFloat(itm.total) || quantity * unitPrice;
                                const isNew = itm.product_id === null || itm.item_type === 'new';

                                return `
                                <tr>
                                    <td class="text-center">${idx + 1}</td>
                                    <td>
                                        ${productName}
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

    const handleOpenPaymentModal = (order: any) => {
        setSelectedOrder(order);
        setPaymentAmount(order.amount_due || '');
        setPaymentMethod('cash');
        setPaymentNotes('');
        setPaymentModalOpen(true);
    };

    const handleSubmitPayment = async () => {
        if (!selectedOrder || !paymentAmount || parseFloat(paymentAmount) <= 0) {
            Swal.fire('Error', 'Please enter a valid payment amount', 'error');
            return;
        }

        try {
            await updatePurchaseOrder({
                id: selectedOrder.id,
                payment_method: paymentMethod,
                payment_amount: parseFloat(paymentAmount),
                payment_notes: paymentNotes,
            }).unwrap();

            Swal.fire('Success!', 'Payment recorded successfully', 'success');
            setPaymentModalOpen(false);
            setSelectedOrder(null);
        } catch (error: any) {
            Swal.fire('Error', error?.data?.message || 'Failed to record payment', 'error');
        }
    };

    const handleConvertToPurchaseOrder = async (draftId: number, draftRef: string) => {
        const result = await Swal.fire({
            title: 'Convert to Purchase Order?',
            html: `<p>Convert draft <strong>${draftRef}</strong> to an official purchase order?</p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Convert',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        try {
            const response = await convertToPO({
                id: draftId,
                notes: 'Converted from draft',
            }).unwrap();

            Swal.fire({
                icon: 'success',
                title: 'Purchase Order Created!',
                html: `
                    <p>Invoice: <strong>${response.data.invoice_number}</strong></p>
                    <p>Total: <strong>৳${Number(response.data.grand_total || response.data.total || 0).toFixed(2)}</strong></p>
                `,
                confirmButtonText: 'View Purchase Orders',
            }).then(() => {
                setActiveTab('orders');
            });
        } catch (error: any) {
            console.error('Error converting draft:', error);
            console.error('Full error details:', {
                message: error?.data?.message,
                backendError: error?.data?.error,
                status: error?.status,
                fullData: error?.data,
            });

            const errorMsg = error?.data?.error || error?.data?.message || 'Failed to convert draft';

            Swal.fire({
                icon: 'error',
                title: 'Backend Error',
                html: `<div class="text-left"><p><strong>Error:</strong></p><p class="text-sm">${errorMsg}</p></div>`,
                width: 600,
            });
        }
    };

    const handleDeleteDraft = async (draftId: number, draftRef: string) => {
        const result = await Swal.fire({
            title: 'Delete Draft?',
            text: `Are you sure you want to delete draft ${draftRef}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete',
            confirmButtonColor: '#d33',
        });

        if (!result.isConfirmed) return;

        try {
            await deleteDraft(draftId).unwrap();
            Swal.fire('Deleted!', 'Draft has been deleted', 'success');
        } catch (error: any) {
            Swal.fire('Error', error?.data?.message || 'Failed to delete draft', 'error');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { bg: string; text: string }> = {
            preparing: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            ordered: { bg: 'bg-blue-100', text: 'text-blue-800' },
            partially_received: { bg: 'bg-orange-100', text: 'text-orange-800' },
            received: { bg: 'bg-green-100', text: 'text-green-800' },
            pending: { bg: 'bg-gray-100', text: 'text-gray-800' },
            partial: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            paid: { bg: 'bg-green-100', text: 'text-green-800' },
        };

        const config = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>{status.replace('_', ' ').toUpperCase()}</span>;
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
                <div className="mb-5">
                    <PurchaseFilter onFilterChange={activeTab === 'drafts' ? setDraftFilters : setOrderFilters} showDraftFilters={activeTab === 'drafts'} />
                </div>

                {/* Drafts Tab */}
                {activeTab === 'drafts' && (
                    <div>
                        {draftsLoading ? (
                            <div className="py-8 text-center">
                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                            </div>
                        ) : drafts.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center">
                                <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="text-gray-500">No drafts found</p>
                                <Link href="/purchases/create" className="mt-3 inline-block text-primary hover:underline">
                                    Create your first purchase draft
                                </Link>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table-hover">
                                    <thead>
                                        <tr>
                                            <th>Draft Ref</th>
                                            <th>Supplier</th>
                                            <th>Items</th>
                                            <th>Estimated Total</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {drafts.map((draft: any) => (
                                            <tr key={draft.id}>
                                                <td className="font-semibold">{draft.draft_reference}</td>
                                                <td>
                                                    <div>
                                                        <p className="font-medium">{draft.supplier?.name || <span className="text-gray-400">Walk-in / Own Purchase</span>}</p>
                                                        {draft.supplier?.contact_person && <p className="text-sm text-gray-500">{draft.supplier.contact_person}</p>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <span className="rounded bg-success/20 px-2 py-1 text-xs text-success">{draft.existing_products_count || 0} Existing</span>
                                                        <span className="rounded bg-info/20 px-2 py-1 text-xs text-info">{draft.new_products_count || 0} New</span>
                                                    </div>
                                                </td>
                                                <td className="font-semibold">৳{Number(draft.estimated_total || 0).toFixed(2)}</td>
                                                <td>{getStatusBadge(draft.status)}</td>
                                                <td>{new Date(draft.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="flex justify-center">
                                                        <Dropdown
                                                            offset={[0, 5]}
                                                            placement="bottom-end"
                                                            btnClassName="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                                                            button={
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <circle cx="12" cy="5" r="2" fill="currentColor" />
                                                                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                                                                    <circle cx="12" cy="19" r="2" fill="currentColor" />
                                                                </svg>
                                                            }
                                                        >
                                                            <ul className="min-w-[180px] rounded-lg border border-gray-200 bg-white shadow-lg">
                                                                <li>
                                                                    <button
                                                                        onClick={() => handleViewItems(draft.items || [], `Draft: ${draft.draft_reference}`)}
                                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        View Items
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        onClick={() => handlePrint(draft, 'draft')}
                                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50"
                                                                    >
                                                                        <Printer className="h-4 w-4" />
                                                                        Print Draft
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={`/purchases/edit/${draft.id}`}
                                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                        Edit Draft
                                                                    </Link>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        onClick={() => handleConvertToPurchaseOrder(draft.id, draft.draft_reference)}
                                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-blue-50"
                                                                        disabled={isConverting}
                                                                    >
                                                                        <ArrowRight className="h-4 w-4" />
                                                                        Convert to PO
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        onClick={() => handleDeleteDraft(draft.id, draft.draft_reference)}
                                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        Delete Draft
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </Dropdown>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div>
                        {ordersLoading ? (
                            <div className="py-8 text-center">
                                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center">
                                <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <p className="text-gray-500">No purchase orders found</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table-hover">
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Supplier</th>
                                            <th>Items</th>
                                            <th>Grand Total</th>
                                            <th>Status</th>
                                            <th>Payment</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order: any) => (
                                            <tr key={order.id}>
                                                <td className="font-semibold">{order.invoice_number}</td>
                                                <td>{order.supplier?.name}</td>
                                                <td>{order.items?.length || 0}</td>
                                                <td className="font-semibold">৳{Number(order.grand_total || 0).toFixed(2)}</td>
                                                <td>{getStatusBadge(order.status)}</td>
                                                <td>{getStatusBadge(order.payment_status)}</td>
                                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="flex justify-center">
                                                        <Dropdown
                                                            offset={[0, 5]}
                                                            placement="bottom-end"
                                                            btnClassName="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                                                            button={
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <circle cx="12" cy="5" r="2" fill="currentColor" />
                                                                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                                                                    <circle cx="12" cy="19" r="2" fill="currentColor" />
                                                                </svg>
                                                            }
                                                        >
                                                            <ul className="min-w-[180px] rounded-lg border border-gray-200 bg-white shadow-lg">
                                                                <li>
                                                                    <button
                                                                        onClick={() => handleViewItems(order.items || [], `Purchase Order: ${order.invoice_number}`)}
                                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        View Items
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        onClick={() => handlePrint(order, 'order')}
                                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50"
                                                                    >
                                                                        <Printer className="h-4 w-4" />
                                                                        Print Order
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button
                                                                        onClick={() => handleOpenPaymentModal(order)}
                                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                                                                        disabled={order.payment_status === 'paid'}
                                                                    >
                                                                        <CreditCard className="h-4 w-4" />
                                                                        {order.payment_status === 'paid' ? 'Fully Paid' : 'Add Payment'}
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <Link
                                                                        href={`/purchases/receive/${order.id}`}
                                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                                                    >
                                                                        <Package className="h-4 w-4" />
                                                                        Receive Items
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </Dropdown>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
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
                                                // Backend field mapping
                                                // Both drafts and orders now use similar simplified structure
                                                // Draft: { product: "name", quantity_ordered: "1.000", purchase_price: 200, estimated_subtotal: 200 }
                                                // Order: { product: "name", quantity_ordered: "1.0000", purchase_price: "132.0000", subtotal: "132.0000" }

                                                const productName = item.product || 'N/A';

                                                const sku = item.sku || null;

                                                const description = item.description || null;

                                                const unitPrice = parseFloat(item.purchase_price) || 0;

                                                const unit = item.unit || 'piece';

                                                const quantity = parseFloat(item.quantity_ordered) || 0;

                                                // Drafts use 'estimated_subtotal', Orders use 'subtotal' or 'total'
                                                const subtotal = parseFloat(item.estimated_subtotal) || parseFloat(item.subtotal) || parseFloat(item.total) || quantity * unitPrice;

                                                return (
                                                    <tr key={item.id || index} className="border-b border-gray-200 hover:bg-blue-50">
                                                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{productName}</p>
                                                                {sku && <p className="text-xs text-gray-500">SKU: {sku}</p>}
                                                                {description && <p className="text-xs text-gray-400">{description}</p>}
                                                                {(item.product_id === null || item.item_type === 'new') && (
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

            {/* Payment Modal */}
            {paymentModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">Add Payment</h3>
                            <p className="text-sm text-gray-500">Purchase Order: {selectedOrder.invoice_number}</p>
                        </div>

                        <div className="space-y-4 px-6 py-4">
                            {/* Order Summary */}
                            <div className="rounded-lg bg-gray-50 p-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Grand Total:</span>
                                    <span className="font-semibold">৳{Number(selectedOrder.grand_total || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Amount Paid:</span>
                                    <span className="font-semibold text-green-600">৳{Number(selectedOrder.amount_paid || 0).toFixed(2)}</span>
                                </div>
                                <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base">
                                    <span className="font-semibold text-gray-900">Amount Due:</span>
                                    <span className="font-bold text-red-600">৳{Number(selectedOrder.amount_due || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Amount */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Payment Amount <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-input w-full"
                                    placeholder="Enter amount"
                                    min="0"
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                />
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Payment Method <span className="text-red-500">*</span>
                                </label>
                                <select className="form-select w-full" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                    <option value="cash">Cash</option>
                                    <option value="debit">Debit Card</option>
                                    <option value="credit">Credit Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Payment Notes */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Notes (Optional)</label>
                                <textarea className="form-textarea w-full" rows={3} placeholder="Add payment notes..." value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                            <button onClick={() => setPaymentModalOpen(false)} className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={handleSubmitPayment} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                                <CreditCard className="mr-2 inline h-4 w-4" />
                                Record Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrderListPage;
