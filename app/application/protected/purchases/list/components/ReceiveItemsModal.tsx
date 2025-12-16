'use client';

import { useUpdatePurchaseOrderMutation } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { Check, Package, Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface ReceiveItem {
    id: number;
    product_id: number | null;
    product_name: string;
    variant_name: string | null;
    variant_data: any;
    is_new_product: boolean;
    is_variant: boolean;
    quantity_ordered: number;
    quantity_received: number;
    purchase_price: number;
    selling_price?: number;
    tax_rate?: number;
    tax_included?: boolean;
    low_stock_quantity?: number;
    unit?: string;
}

interface ReceiveItemsModalProps {
    isOpen: boolean;
    purchaseOrder: any;
    onClose: () => void;
    onSuccess?: () => void;
}

const ReceiveItemsModal: React.FC<ReceiveItemsModalProps> = ({ isOpen, purchaseOrder, onClose, onSuccess }) => {
    const [items, setItems] = useState<ReceiveItem[]>([]);
    const [updatePurchaseOrder, { isLoading }] = useUpdatePurchaseOrderMutation();

    useEffect(() => {
        if (isOpen && purchaseOrder?.items) {
            // Initialize items with current data
            const initialItems = purchaseOrder.items.map((item: any) => ({
                id: item.id,
                product_id: item.product_id,
                product_name: item.product_name || item.product_name_temp || 'Unknown Product',
                variant_name: item.variant_name,
                variant_data: item.variant_data,
                is_new_product: item.is_new_product || !item.product_id,
                is_variant: item.is_variant || false,
                quantity_ordered: parseFloat(item.quantity_ordered) || 0,
                quantity_received: parseFloat(item.quantity_received) || 0,
                purchase_price: parseFloat(item.purchase_price) || 0,
                selling_price: parseFloat(item.selling_price) || parseFloat(item.purchase_price) * 1.3 || 0,
                tax_rate: parseFloat(item.tax_rate) || 0,
                tax_included: item.tax_included || false,
                low_stock_quantity: parseFloat(item.low_stock_quantity) || 5,
                unit: item.unit || 'piece',
            }));
            setItems(initialItems);
        }
    }, [isOpen, purchaseOrder]);

    const handleItemChange = (index: number, field: keyof ReceiveItem, value: any) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };

        // Auto-calculate selling price if purchase price changes (30% markup default)
        if (field === 'purchase_price' && !updatedItems[index].selling_price) {
            updatedItems[index].selling_price = parseFloat(value) * 1.3;
        }

        setItems(updatedItems);
    };

    const handleReceiveAll = () => {
        const updatedItems = items.map((item) => ({
            ...item,
            quantity_received: item.quantity_ordered,
        }));
        setItems(updatedItems);
    };

    const handleReceiveItem = (index: number) => {
        const updatedItems = [...items];
        updatedItems[index].quantity_received = updatedItems[index].quantity_ordered;
        setItems(updatedItems);
    };

    const handleClearItem = (index: number) => {
        const updatedItems = [...items];
        updatedItems[index].quantity_received = 0;
        setItems(updatedItems);
    };

    const handleSubmit = async () => {
        // Validate all items
        const invalidItems = items.filter(
            (item) => item.quantity_received > item.quantity_ordered || item.purchase_price <= 0 || (item.selling_price || 0) <= 0
        );

        if (invalidItems.length > 0) {
            Swal.fire('Validation Error', 'Please check all quantities and prices are valid', 'error');
            return;
        }

        const totalReceiving = items.reduce((sum, item) => sum + item.quantity_received, 0);

        if (totalReceiving === 0) {
            Swal.fire('No Items', 'Please specify quantity to receive for at least one item', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: 'Confirm Receipt',
            html: `
                <div class="text-left">
                    <p class="mb-3">You are about to receive <strong>${totalReceiving} items</strong></p>
                    <p class="text-sm text-gray-600">This will update inventory and create new stock batches.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Receive Items',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        try {
            const response = await updatePurchaseOrder({
                id: purchaseOrder.id,
                items: items.map((item) => ({
                    id: item.id,
                    quantity_received: item.quantity_received,
                    purchase_price: item.purchase_price,
                    selling_price: item.selling_price,
                    tax_rate: item.tax_rate,
                    tax_included: item.tax_included,
                    low_stock_quantity: item.low_stock_quantity,
                    variant_data: item.variant_data,
                })),
            }).unwrap();

            const processedItems = response?.data?.processed_items || [];
            const newProducts = processedItems.filter((p: any) => p.action === 'created_new_product').length;
            const newBatches = processedItems.filter((p: any) => p.action === 'created_new_batch').length;

            await Swal.fire({
                icon: 'success',
                title: 'Items Received Successfully!',
                html: `
                    <div class="text-left space-y-2">
                        <p><strong>Invoice:</strong> ${response?.data?.invoice_number || 'N/A'}</p>
                        <p><strong>Status:</strong> ${response?.data?.status || 'N/A'}</p>
                        ${newProducts > 0 ? `<p class="text-green-600">✓ ${newProducts} new product(s) created</p>` : ''}
                        ${newBatches > 0 ? `<p class="text-blue-600">✓ ${newBatches} new batch(es) created</p>` : ''}
                    </div>
                `,
            });

            onSuccess?.();
            onClose();
        } catch (error: any) {
            Swal.fire('Error', error?.data?.message || 'Failed to receive items', 'error');
        }
    };

    if (!isOpen) return null;

    const totalOrdered = items.reduce((sum, item) => sum + item.quantity_ordered, 0);
    const totalReceived = items.reduce((sum, item) => sum + item.quantity_received, 0);
    const totalPending = totalOrdered - totalReceived;
    const receivedPercentage = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative max-h-[95vh] w-full max-w-7xl overflow-auto rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Receive Items</h2>
                                <p className="text-sm text-blue-100">
                                    Purchase Order: <span className="font-semibold">{purchaseOrder?.invoice_number || 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-white transition-colors hover:bg-white/20"
                            disabled={isLoading}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="mb-2 flex justify-between text-sm">
                            <span>Progress: {receivedPercentage}%</span>
                            <span>
                                {totalReceived} / {totalOrdered} items
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/20">
                            <div
                                className="h-full rounded-full bg-green-400 transition-all duration-500"
                                style={{ width: `${receivedPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <p className="text-sm text-gray-600">Total Ordered</p>
                            <p className="text-2xl font-bold text-blue-600">{totalOrdered}</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <p className="text-sm text-gray-600">Receiving Now</p>
                            <p className="text-2xl font-bold text-green-600">{totalReceived}</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-orange-600">{totalPending}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="border-b border-gray-200 bg-white px-6 py-3">
                    <button
                        onClick={handleReceiveAll}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        disabled={isLoading}
                    >
                        <Check className="h-4 w-4" />
                        Receive All Items
                    </button>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto px-6 py-4">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-700">Product</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700">Ordered</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700">Already Received</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700">Receive Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700">Purchase Price</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-700">Selling Price</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700">Low Stock</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => {
                                const remainingToReceive = item.quantity_ordered - item.quantity_received;
                                const isFullyReceived = item.quantity_received >= item.quantity_ordered;
                                const currentReceiving = item.quantity_received;

                                return (
                                    <tr key={item.id} className={`border-b border-gray-100 hover:bg-blue-50 ${isFullyReceived ? 'bg-green-50' : ''}`}>
                                        <td className="px-4 py-3 text-sm">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                                {item.is_variant && item.variant_name && (
                                                    <p className="text-xs font-medium text-blue-600">Variant: {item.variant_name}</p>
                                                )}
                                                {item.is_new_product && (
                                                    <span className="mt-1 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                                        <Plus className="mr-1 h-3 w-3" />
                                                        New Product
                                                    </span>
                                                )}
                                                <p className="text-xs text-gray-500">Unit: {item.unit || 'piece'}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                                                {item.quantity_ordered}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm font-medium text-gray-600">
                                                {item.quantity_received - currentReceiving}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                max={item.quantity_ordered}
                                                step="0.01"
                                                value={currentReceiving}
                                                onChange={(e) => handleItemChange(index, 'quantity_received', parseFloat(e.target.value) || 0)}
                                                className={`form-input w-24 text-center ${
                                                    currentReceiving > item.quantity_ordered
                                                        ? 'border-red-500 bg-red-50'
                                                        : currentReceiving === item.quantity_ordered
                                                        ? 'border-green-500 bg-green-50'
                                                        : ''
                                                }`}
                                                disabled={isLoading}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.purchase_price}
                                                onChange={(e) => handleItemChange(index, 'purchase_price', parseFloat(e.target.value) || 0)}
                                                className="form-input w-28 text-right"
                                                disabled={isLoading}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.selling_price}
                                                onChange={(e) => handleItemChange(index, 'selling_price', parseFloat(e.target.value) || 0)}
                                                className="form-input w-28 text-right"
                                                disabled={isLoading}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={item.low_stock_quantity}
                                                onChange={(e) => handleItemChange(index, 'low_stock_quantity', parseFloat(e.target.value) || 0)}
                                                className="form-input w-20 text-center"
                                                disabled={isLoading}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => handleReceiveItem(index)}
                                                    className="rounded p-1.5 text-green-600 hover:bg-green-100"
                                                    title="Receive all"
                                                    disabled={isLoading}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleClearItem(index)}
                                                    className="rounded p-1.5 text-red-600 hover:bg-red-100"
                                                    title="Clear"
                                                    disabled={isLoading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="text-sm text-gray-600">
                            <p>
                                <span className="font-semibold text-gray-900">{items.filter((i) => i.quantity_received > 0).length}</span> of{' '}
                                <span className="font-semibold text-gray-900">{items.length}</span> items will be received
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                disabled={isLoading || totalReceived === 0}
                            >
                                <Save className="h-4 w-4" />
                                {isLoading ? 'Processing...' : 'Confirm Receipt'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiveItemsModal;
