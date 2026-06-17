'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import type { RootState } from '@/store';
import { useCreateBatchAdjustmentMutation } from '@/store/features/Product/productApi';
import {
    clearStockItems,
    removeStockItem,
    selectConfigsForStore,
    selectGlobalConfigForStore,
    setAdjustmentConfig,
    setGlobalConfig,
    updateStockItemQuantity,
} from '@/store/features/StockAdjustment/stockAdjustmentSlice';
import { useDispatch, useSelector } from 'react-redux';
import { closeReservedPdfWindow, reservePdfWindow } from '@/lib/pdf-mobile-download';
import { printStockAdjustmentSlip } from './printStockAdjustmentSlip';
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
    const { t } = getTranslation();
    const dispatch = useDispatch();
    const { currentStore, currentStoreId } = useCurrentStore();
    // Use per-store items
    const cartItems = useSelector((state: RootState) => (currentStoreId && state.stockAdjustment.itemsByStore ? state.stockAdjustment.itemsByStore[currentStoreId] || [] : []));
    const configsByItem = useSelector(selectConfigsForStore(currentStoreId));
    const globalConfig = useSelector(selectGlobalConfigForStore(currentStoreId));
    const [createBatchAdjustment, { isLoading: isSaving }] = useCreateBatchAdjustmentMutation();

    const handleAdjustmentChange = (itemId: number, field: string, value: any) => {
        if (!currentStoreId) return;
        dispatch(setAdjustmentConfig({ storeId: currentStoreId, itemId, field, value }));
    };

    const getAdjustment = (itemId: number) => configsByItem[itemId];

    const handleRemoveItem = (itemId: number) => {
        if (!currentStoreId) return;
        dispatch(removeStockItem({ storeId: currentStoreId, id: itemId }));
    };

    // Update item quantity in cart
    const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1 || !currentStoreId) return;
        dispatch(updateStockItemQuantity({ storeId: currentStoreId, id: itemId, quantity: newQuantity }));
    };

    // Clear all adjustments
    const handleClearAll = async () => {
        if (cartItems.length === 0) return;

        const confirmed = await showConfirmDialog('Clear selected products?', 'This will remove all products from this stock adjustment draft.', 'Yes, clear all');

        if (confirmed && currentStoreId) {
            dispatch(clearStockItems(currentStoreId));
        }
    };

    // Submit all adjustments as a single atomic batch request
    const handleSubmit = async () => {
        if (cartItems.length === 0) {
            showErrorDialog('No products selected', 'Search or scan products from the left side, then enter the stock change.');
            return;
        }

        const invalidNormalProducts = cartItems.filter((item) => {
            if (item.has_serial) return false;
            const adj = getAdjustment(item.id);
            return !adj || adj.adjustmentQuantity <= 0 || (!adj.reason && !globalConfig.reason);
        });

        const invalidSerialProducts = cartItems.filter((item) => {
            if (!item.has_serial) return false;
            const adj = getAdjustment(item.id);
            return !adj || !adj.serialAdjustments || adj.serialAdjustments.length === 0;
        });

        if (invalidNormalProducts.length > 0) {
            showErrorDialog('Check quantity and reason', `Please enter quantity and reason for: ${invalidNormalProducts.map((i) => i.title || i.name).join(', ')}`);
            return;
        }

        if (invalidSerialProducts.length > 0) {
            showErrorDialog('Missing serial details', `Please manage serial numbers for: ${invalidSerialProducts.map((i) => i.title || i.name).join(', ')}`);
            return;
        }

        const overDecreaseProducts = cartItems.filter((item) => {
            if (item.has_serial) return false;
            const adj = getAdjustment(item.id);
            const currentStock = Number(item.PlaceholderQuantity ?? item.quantity ?? 0);
            return adj?.adjustmentType === 'decrease' && adj.adjustmentQuantity > currentStock;
        });

        if (overDecreaseProducts.length > 0) {
            showErrorDialog('Stock cannot go below zero', `Decrease quantity is higher than current stock for: ${overDecreaseProducts.map((i) => i.title || i.name).join(', ')}`);
            return;
        }

        // Build single batch payload — all types in one array
        const batchAdjustments: any[] = [];

        for (const item of cartItems) {
            const adj = getAdjustment(item.id);

            if (item.has_serial) {
                // Serial status updates
                const statusSerials = (adj?.serialAdjustments || []).filter(
                    (s: any) => s.serial_number && s.status && s.reason
                );
                if (statusSerials.length > 0) {
                    batchAdjustments.push({
                        type: 'serial_status',
                        product_id: item.productId,
                        product_stock_id: item.stockId,
                        serials: statusSerials.map((s: any) => ({
                            serial_number: s.serial_number,
                            status: s.status,
                            reason: s.reason,
                            notes: s.notes || null,
                        })),
                    });
                }

                // Bulk add new serials (no existing id)
                const newSerials = (adj?.serialAdjustments || [])
                    .filter((s: any) => s.serial_number && !s.id)
                    .map((s: any) => s.serial_number);
                if (newSerials.length > 0) {
                    batchAdjustments.push({
                        type: 'serial_bulk_add',
                        product_id: item.productId,
                        product_stock_id: item.stockId,
                        serial_numbers: newSerials,
                        status: 'in_stock',
                        reason: adj?.reason || globalConfig.reason || 'bulk_add',
                        notes: adj?.notes || globalConfig.notes || null,
                    });
                }
            } else if (adj && adj.adjustmentQuantity > 0) {
                const reasonValue = adj.reason || globalConfig.reason;
                const qtyAdj: any = {
                    type: 'quantity',
                    product_id: item.productId,
                    product_stock_id: item.stockId,
                    direction: adj.adjustmentType,
                    quantity: adj.adjustmentQuantity,
                    notes: adj.notes || globalConfig.notes || null,
                };
                if (reasonValue && !isNaN(Number(reasonValue))) {
                    qtyAdj.product_adjustment_reason_id = Number(reasonValue);
                } else {
                    qtyAdj.reason = reasonValue || null;
                }
                batchAdjustments.push(qtyAdj);
            }
        }

        // Snapshot before clearing (Redux state wiped after clearStockItems)
        const itemsSnapshot = [...cartItems];
        const configsSnapshot = { ...configsByItem };
        const globalSnapshot = { ...globalConfig };

        // Reserve PDF window synchronously before any await — mobile popup blocker fires after async gaps
        const slipWindow = reservePdfWindow(`stock-adjustment-${new Date().toISOString().slice(0, 10)}.pdf`);

        try {
            await createBatchAdjustment({
                store_id: currentStore?.id,
                adjustments: batchAdjustments,
            }).unwrap();

            showSuccessDialog(t('msg_success'), t('msg_saved_success'));

            if (currentStoreId) dispatch(clearStockItems(currentStoreId));

            printStockAdjustmentSlip(itemsSnapshot, configsSnapshot, globalSnapshot, {
                store_name: currentStore?.store_name,
                store_location: currentStore?.store_location,
                store_contact: currentStore?.store_contact,
                store_email: currentStore?.store_email,
            }, {}, slipWindow).catch(() => { closeReservedPdfWindow(slipWindow); });
        } catch (error: any) {
            closeReservedPdfWindow(slipWindow);
            showErrorDialog(
                t('msg_error'),
                error?.data?.detail || error?.data?.message || error?.message || 'Failed to save stock adjustments'
            );
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
            {/* Full Screen Loading Overlay */}
            {isSaving && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                        <p className="mt-4 text-lg font-medium text-gray-700">Saving stock changes...</p>
                        <p className="mt-1 text-sm text-gray-500">Please wait. Do not close this page.</p>
                    </div>
                </div>
            )}

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
                <GlobalSettings
                    globalReason={globalConfig.reason}
                    globalNotes={globalConfig.notes}
                    onReasonChange={(v) => currentStoreId && dispatch(setGlobalConfig({ storeId: currentStoreId, field: 'reason', value: v }))}
                    onNotesChange={(v) => currentStoreId && dispatch(setGlobalConfig({ storeId: currentStoreId, field: 'notes', value: v }))}
                />
            </div>

            {/* Summary Footer */}
            <AdjustmentSummary totalItems={totalItems} totalIncrease={totalIncrease} totalDecrease={totalDecrease} isSaving={isSaving} onSubmit={handleSubmit} />
        </div>
    );
};

export default StockAdjustment;
