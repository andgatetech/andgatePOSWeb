'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import type { RootState } from '@/store';
import { removeItemRedux, updateItemQuantityRedux } from '@/store/features/Order/OrderSlice';
import { useCreateStockAdjustmentMutation } from '@/store/features/Product/productApi';
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
    const cartItems = useSelector((state: RootState) => state.invoice.items);
    const [createStockAdjustment, { isLoading: isSaving }] = useCreateStockAdjustmentMutation();

    const [adjustments, setAdjustments] = useState<
        Array<{
            itemId: number;
            adjustmentType: 'increase' | 'decrease';
            adjustmentQuantity: number;
            reason: string;
            notes: string;
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
        dispatch(removeItemRedux(itemId));
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
            cartItems.forEach((item) => {
                dispatch(removeItemRedux(item.id));
            });
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

        // Validate adjustments
        const invalidItems = cartItems.filter((item) => {
            const adj = getAdjustment(item.id);
            return !adj || adj.adjustmentQuantity <= 0 || (!adj.reason && !globalReason);
        });

        if (invalidItems.length > 0) {
            showErrorDialog('Incomplete Data', 'Please set adjustment quantity and reason for all items');
            return;
        }

        try {
            // Prepare adjustment data for API
            const adjustmentData = {
                store_id: currentStore?.id,
                adjustments: cartItems.map((item) => {
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

            // Call API
            const response = await createStockAdjustment(adjustmentData).unwrap();

            if (response.success) {
                showSuccessDialog('Success!', response.message || 'Stock adjustments saved successfully');

                // Clear all after successful save
                cartItems.forEach((item) => {
                    dispatch(removeItemRedux(item.id));
                });
                setAdjustments([]);
                setGlobalReason('');
                setGlobalNotes('');
            } else {
                showErrorDialog('Error', response.message || 'Failed to save stock adjustments');
            }
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
