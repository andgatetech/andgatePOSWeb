'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useConvertDraftToPurchaseOrderMutation, useDeletePurchaseDraftMutation, useGetPurchaseDraftsQuery, useGetPurchaseOrdersQuery } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { ArrowRight, Edit, Eye, FileText, Package, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import Swal from 'sweetalert2';

const PurchaseOrderListPage = () => {
    const { currentStoreId } = useCurrentStore();
    const [activeTab, setActiveTab] = useState<'drafts' | 'orders'>('drafts');

    // Fetch drafts and orders
    const { data: draftsResponse, isLoading: draftsLoading } = useGetPurchaseDraftsQuery({
        store_id: currentStoreId,
        status: 'preparing',
    });

    const { data: ordersResponse, isLoading: ordersLoading } = useGetPurchaseOrdersQuery({
        store_id: currentStoreId,
    });

    const [convertToPO, { isLoading: isConverting }] = useConvertDraftToPurchaseOrderMutation();
    const [deleteDraft] = useDeletePurchaseDraftMutation();

    const drafts = draftsResponse?.data || [];
    const orders = ordersResponse?.data || [];

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
            <div className="panel">
                <div className="mb-5 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Purchase Orders</h1>
                    <Link href="/purchases/create" className="btn btn-primary">
                        <Package className="mr-2 h-5 w-5" />
                        Create Purchase Order
                    </Link>
                </div>

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
                                                        <p className="font-medium">{draft.supplier?.name}</p>
                                                        {draft.supplier?.contact_person && <p className="text-sm text-gray-500">{draft.supplier.contact_person}</p>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <span className="rounded bg-success/20 px-2 py-1 text-xs text-success">{draft.existing_products} Existing</span>
                                                        <span className="rounded bg-info/20 px-2 py-1 text-xs text-info">{draft.new_products} New</span>
                                                    </div>
                                                </td>
                                                <td className="font-semibold">৳{Number(draft.estimated_total || 0).toFixed(2)}</td>
                                                <td>{getStatusBadge(draft.status)}</td>
                                                <td>{new Date(draft.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <Link href={`/purchases/edit/${draft.id}`} className="btn btn-sm btn-outline-primary">
                                                            <Edit className="mr-1 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => handleConvertToPurchaseOrder(draft.id, draft.draft_reference)}
                                                            className="btn btn-sm btn-primary"
                                                            disabled={isConverting}
                                                        >
                                                            <ArrowRight className="mr-1 h-4 w-4" />
                                                            Convert to PO
                                                        </button>
                                                        <button onClick={() => handleDeleteDraft(draft.id, draft.draft_reference)} className="btn btn-sm btn-outline-danger">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
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
                                                    <Link href={`/purchases/receive/${order.id}`} className="btn btn-sm btn-outline-primary">
                                                        <Eye className="mr-1 h-4 w-4" />
                                                        Receive Items
                                                    </Link>
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
        </div>
    );
};

export default PurchaseOrderListPage;
