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
    updateStockItemUnit,
} from '@/store/features/StockAdjustment/stockAdjustmentSlice';
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

    const handleUpdateUnit = (itemId: number, unit: string, factor: number) => {
        if (!currentStoreId) return;
        dispatch(updateStockItemUnit({ storeId: currentStoreId, id: itemId, unit, factor }));
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

        // An item whose counted quantity matches current stock (adjustmentQuantity === 0) needs no
        // reason and isn't an error — it's simply confirmed and excluded from the save payload below.
        // Only a *real* discrepancy without a reason is invalid.
        const invalidNormalProducts = cartItems.filter((item) => {
            if (item.has_serial) return false;
            const adj = getAdjustment(item.id);
            if (!adj || adj.adjustmentQuantity <= 0) return false;
            return !adj.reason && !globalConfig.reason;
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
            return adj?.adjustmentType === 'decrease' && (adj.adjustmentQuantity * Number(item.unitFactor || 1)) > currentStock;
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
                const statusSerials = (adj?.serialAdjustments || []).filter((s: any) => s.serial_number && !s.is_new);
                if (statusSerials.length > 0) {
                    batchAdjustments.push({
                        type: 'serial_status',
                        product_id: item.productId,
                        product_stock_id: item.stockId,
                        product_adjustment_reason_id: statusSerials[0]?.product_adjustment_reason_id || null,
                        serials: statusSerials.map((s: any) => ({
                            serial_number: s.serial_number,
                            status: s.status,
                            reason: s.reason,
                            product_adjustment_reason_id: s.product_adjustment_reason_id || null,
                            notes: s.notes || null,
                        })),
                    });
                }

                // Bulk add new serials
                const newSerialsList = (adj?.serialAdjustments || []).filter((s: any) => s.serial_number && s.is_new);
                if (newSerialsList.length > 0) {
                    const firstNew = newSerialsList[0];
                    batchAdjustments.push({
                        type: 'serial_bulk_add',
                        product_id: item.productId,
                        product_stock_id: item.stockId,
                        serial_numbers: newSerialsList.map((s: any) => s.serial_number),
                        status: 'in_stock',
                        reason: firstNew?.reason || adj?.reason || globalConfig.reason || 'New Stock Arrival',
                        product_adjustment_reason_id: firstNew?.product_adjustment_reason_id || null,
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
                    unit: item.unit,
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

        // A full recount where every item already matched produces nothing to send —
        // that's a successful count, not an error, so don't hit the API with an empty batch.
        if (batchAdjustments.length === 0) {
            showSuccessDialog(t('stock_adjustment_all_matched_title'), t('stock_adjustment_all_matched_desc'));
            if (currentStoreId) dispatch(clearStockItems(currentStoreId));
            return;
        }

        try {
            await createBatchAdjustment({
                store_id: currentStore?.id,
                adjustments: batchAdjustments,
            }).unwrap();

            showSuccessDialog(t('msg_success'), t('msg_saved_success'));

            if (currentStoreId) dispatch(clearStockItems(currentStoreId));
        } catch (error: any) {
            showErrorDialog(t('msg_error'), error?.data?.detail || error?.data?.message || error?.message || 'Failed to save stock adjustments');
        }
    };

    // Calculate totals
    const totalItems = cartItems.length;
    const totalIncrease = cartItems.reduce((sum, item) => {
        const adj = getAdjustment(item.id);
        if (item.has_serial) {
            const added = (adj?.serialAdjustments || []).filter((s: any) => s.is_new && s.status === 'in_stock').length;
            return sum + added;
        }
        return sum + (adj?.adjustmentType === 'increase' ? adj.adjustmentQuantity : 0);
    }, 0);
    const totalDecrease = cartItems.reduce((sum, item) => {
        const adj = getAdjustment(item.id);
        if (item.has_serial) {
            const cut = (adj?.serialAdjustments || []).filter((s: any) => s.status !== 'in_stock' || !s.is_new).length;
            return sum + cut;
        }
        return sum + (adj?.adjustmentType === 'decrease' ? adj.adjustmentQuantity : 0);
    }, 0);

    if (cartItems.length === 0) {
        return <EmptyState storeName={currentStore?.store_name} />;
    }

    return (
        <div className="flex h-full flex-col bg-[#f6f8fb]">
            {/* Full Screen Loading Overlay */}
            {isSaving && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#d7e9f5] border-t-[#046ca9]"></div>
                        <p className="mt-4 text-lg font-medium text-gray-700">{t('stock_adjustment_saving')}</p>
                        <p className="mt-1 text-sm text-gray-500">{t('stock_adjustment_saving_hint')}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <AdjustmentHeader storeName={currentStore?.store_name} itemCount={totalItems} onClearAll={handleClearAll} />

            {/* Items List */}
            <div className="flex-1 overflow-auto px-3 pb-28 pt-3 sm:px-5 sm:pb-32 sm:pt-5">
                <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-4">
                        <div className="rounded-lg border border-[#d8e4ec] bg-white p-3 shadow-sm sm:p-4">
                            <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
                                <div className="flex items-start gap-2">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">1</span>
                                    <p>{t('stock_adjustment_step_select')}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">2</span>
                                    <p>{t('stock_adjustment_step_count')}</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">3</span>
                                    <p>{t('stock_adjustment_step_review')}</p>
                                </div>
                            </div>
                        </div>

                        {cartItems.map((item) => (
                        <AdjustmentItem
                                key={item.id}
                                item={item}
                                adjustment={getAdjustment(item.id)}
                                onAdjustmentChange={handleAdjustmentChange}
                                onRemove={handleRemoveItem}
                            onUpdateQuantity={handleUpdateQuantity}
                            onUpdateUnit={handleUpdateUnit}
                        />
                        ))}

                        <GlobalSettings
                            globalReason={globalConfig.reason}
                            globalNotes={globalConfig.notes}
                            onReasonChange={(v) => currentStoreId && dispatch(setGlobalConfig({ storeId: currentStoreId, field: 'reason', value: v }))}
                            onNotesChange={(v) => currentStoreId && dispatch(setGlobalConfig({ storeId: currentStoreId, field: 'notes', value: v }))}
                        />
                    </div>

                    <div className="hidden xl:block">
                        <div className="sticky top-5">
                            <AdjustmentSummary totalItems={totalItems} totalIncrease={totalIncrease} totalDecrease={totalDecrease} isSaving={isSaving} onSubmit={handleSubmit} variant="side" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Footer */}
            <div className="xl:hidden">
                <AdjustmentSummary totalItems={totalItems} totalIncrease={totalIncrease} totalDecrease={totalDecrease} isSaving={isSaving} onSubmit={handleSubmit} />
            </div>
        </div>
    );
};

export default StockAdjustment;
