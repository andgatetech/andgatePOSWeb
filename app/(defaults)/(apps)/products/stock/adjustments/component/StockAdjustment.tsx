'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import type { RootState } from '@/store';
import { useBulkAddSerialsMutation, useCreateStockAdjustmentMutation, useUpdateSerialStatusMutation } from '@/store/features/Product/productApi';
import { clearStockItems, removeStockItem } from '@/store/features/StockAdjustment/stockAdjustmentSlice';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdjustmentHeader from './AdjustmentHeader';
import AdjustmentItem from './AdjustmentItem';
import AdjustmentSummary from './AdjustmentSummary';
import EmptyState from './EmptyState';
import GlobalSettings from './GlobalSettings';

/**
 * Stock Adjustment Component
 *
 * Used with PosLeftSide (disableSerialSelection={true}) to manage stock adjustments.
 * - Variant selection modal: ✅ Enabled (needed to select specific variants)
 * - Serial selection modal: ❌ Disabled (not needed for quantity adjustments)
 *
 * Serial numbers are unique identifiers for individual items, not relevant for
 * stock quantity adjustments. Variants are needed because different variants
 * (e.g., "Red-Large" vs "Blue-Small") have separate stock levels.
 */
const StockAdjustment = () => {
    const dispatch = useDispatch();
    const { currentStore } = useCurrentStore();
    const cartItems = useSelector((state: RootState) => state.stockAdjustment.items);
    const [createStockAdjustment, { isLoading: isSaving }] = useCreateStockAdjustmentMutation();
    const [updateSerialStatus] = useUpdateSerialStatusMutation();
    const [bulkAddSerials] = useBulkAddSerialsMutation();

    const [adjustments, setAdjustments] = useState<
        Array<{
            itemId: number;
            adjustmentType: 'increase' | 'decrease';
            adjustmentQuantity: number;
            reason: string;
            notes: string;
            serialAdjustments?: any[];
        }>
    >([]);

    const [globalReason, setGlobalReason] = useState('');
    const [globalNotes, setGlobalNotes] = useState('');

    // Handle adjustment type change
    const handleAdjustmentChange = (itemId: number, field: string, value: any) => {
        setAdjustments((prev) => {
            const existing = prev.find((a) => a.itemId === itemId);
            if (existing) {
                return prev.map((a) => (a.itemId === itemId ? { ...a, [field]: value } : a));
            } else {
                return [
                    ...prev,
                    {
                        itemId,
                        adjustmentType: 'increase',
                        adjustmentQuantity: 0,
                        reason: '',
                        notes: '',
                        [field]: value,
                    },
                ];
            }
        });
    };

    // Get adjustment for specific item
    const getAdjustment = (itemId: number) => {
        return adjustments.find((a) => a.itemId === itemId);
    };

    // Remove item from cart
    const handleRemoveItem = (itemId: number) => {
        dispatch(removeStockItem(itemId));
        setAdjustments((prev) => prev.filter((a) => a.itemId !== itemId));
    };

    // Update item quantity in cart
    const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        dispatch(updateItemQuantityRedux({ id: itemId, quantity: newQuantity }));
    };

    // Clear all adjustments
    const handleClearAll = async () => {
        if (cartItems.length === 0) return;

        const confirmed = await showConfirmDialog('Clear All Items?', 'Are you sure you want to remove all items from stock adjustment?', 'Yes, clear all!');

        if (confirmed) {
            dispatch(clearStockItems());
            setAdjustments([]);
            setGlobalReason('');
            setGlobalNotes('');
        }
    };

    // Submit adjustments
    const handleSubmit = async () => {
        if (cartItems.length === 0) {
            showErrorDialog('No Items', 'Please add products to adjust stock');
            return;
        }

        // Validate adjustments - different rules for serial vs normal products
        const invalidNormalProducts = cartItems.filter((item) => {
            // Skip serial products from normal validation
            if (item.has_serial) return false;

            const adj = getAdjustment(item.id);
            return !adj || adj.adjustmentQuantity <= 0 || (!adj.reason && !globalReason);
        });

        const invalidSerialProducts = cartItems.filter((item) => {
            // Only validate serial products
            if (!item.has_serial) return false;

            const adj = getAdjustment(item.id);
            return !adj || !adj.serialAdjustments || adj.serialAdjustments.length === 0;
        });

        if (invalidNormalProducts.length > 0) {
            showErrorDialog('Incomplete Data', 'Please set adjustment quantity and reason for all non-serial products');
            return;
        }

        if (invalidSerialProducts.length > 0) {
            const productNames = invalidSerialProducts.map((item) => item.title).join(', ');
            showErrorDialog('Missing Serial Data', `Please manage serial numbers for: ${productNames}`);
            return;
        }

        try {
            // 1. Handle serial adjustments first (if any)
            const serialAdjustmentPromises = cartItems
                .map((item) => {
                    const adj = getAdjustment(item.id);
                    if (!adj?.serialAdjustments || adj.serialAdjustments.length === 0) {
                        return null;
                    }

                    // Separate update status vs bulk add serials
                    const updateStatusSerials = adj.serialAdjustments.filter((s: any) => s.serial_number && s.status && s.reason);
                    const bulkAddData = adj.serialAdjustments.filter((s: any) => s.serial_number && !s.id);

                    const promises = [];

                    // Update serial statuses
                    if (updateStatusSerials.length > 0) {
                        promises.push(
                            updateSerialStatus({
                                store_id: currentStore?.id,
                                product_id: item.productId,
                                product_stock_id: item.stockId,
                                serials: updateStatusSerials.map((s: any) => ({
                                    serial_number: s.serial_number,
                                    status: s.status,
                                    reason: s.reason,
                                    notes: s.notes || '',
                                })),
                            }).unwrap()
                        );
                    }

                    // Bulk add serials (if multiple serials for same product)
                    if (bulkAddData.length > 0) {
                        promises.push(
                            bulkAddSerials({
                                store_id: currentStore?.id,
                                product_id: item.productId,
                                product_stock_id: item.stockId,
                                serial_numbers: bulkAddData.map((s: any) => s.serial_number),
                                status: bulkAddData[0].status,
                                reason: bulkAddData[0].reason,
                                notes: bulkAddData[0].notes || '',
                            }).unwrap()
                        );
                    }

                    return promises.length > 0 ? Promise.all(promises) : null;
                })
                .filter(Boolean);

            if (serialAdjustmentPromises.length > 0) {
                await Promise.all(serialAdjustmentPromises);
            }

            // 2. Handle regular quantity adjustments
            const regularAdjustments = cartItems.filter((item) => {
                const adj = getAdjustment(item.id);
                return adj && adj.adjustmentQuantity > 0;
            });

            if (regularAdjustments.length > 0) {
                const adjustmentData = {
                    store_id: currentStore?.id,
                    adjustments: regularAdjustments.map((item) => {
                        const adj = getAdjustment(item.id);
                        return {
                            product_id: item.productId,
                            product_stock_id: item.stockId,
                            direction: adj!.adjustmentType,
                            quantity: adj!.adjustmentQuantity,
                            reason: adj!.reason || globalReason,
                            notes: adj!.notes || globalNotes,
                        };
                    }),
                };

                await createStockAdjustment(adjustmentData).unwrap();
            }

            showSuccessDialog('Success!', 'Stock adjustments saved successfully');

            // Clear all after successful save
            dispatch(clearStockItems());
            setAdjustments([]);
            setGlobalReason('');
            setGlobalNotes('');
        } catch (error: any) {
            showErrorDialog('Error', error?.data?.message || error?.message || 'Failed to save stock adjustments');
        }
    };

    // Calculate totals
    const totalItems = cartItems.length;
    const totalIncrease = cartItems.reduce((sum, item) => {
        const adj = getAdjustment(item.id);
        return sum + (adj?.adjustmentType === 'increase' ? adj.adjustmentQuantity : 0);
    }, 0);
    const totalDecrease = cartItems.reduce((sum, item) => {
        const adj = getAdjustment(item.id);
        return sum + (adj?.adjustmentType === 'decrease' ? adj.adjustmentQuantity : 0);
    }, 0);

    if (cartItems.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="flex h-full flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <AdjustmentHeader storeName={currentStore?.store_name} itemCount={totalItems} onClearAll={handleClearAll} />

            {/* Items List */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="mx-auto max-w-4xl space-y-4">
                    {cartItems.map((item) => (
                        <AdjustmentItem
                            key={item.id}
                            item={item}
                            adjustment={getAdjustment(item.id)}
                            onAdjustmentChange={handleAdjustmentChange}
                            onRemove={handleRemoveItem}
                            onUpdateQuantity={handleUpdateQuantity}
                        />
                    ))}
                </div>

                {/* Global Settings */}
                <GlobalSettings globalReason={globalReason} globalNotes={globalNotes} onReasonChange={setGlobalReason} onNotesChange={setGlobalNotes} />
            </div>

            {/* Summary Footer */}
            <AdjustmentSummary totalItems={totalItems} totalIncrease={totalIncrease} totalDecrease={totalDecrease} isSaving={isSaving} onSubmit={handleSubmit} />
        </div>
    );
};

export default StockAdjustment;
