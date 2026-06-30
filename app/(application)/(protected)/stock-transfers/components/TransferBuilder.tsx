'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { showConfirmDialog, showMessage } from '@/lib/toast';
import type { RootState } from '@/store';
import { useCreateStockTransferMutation } from '@/store/features/stockTransfer/stockTransferApi';
import {
    clearTransferItems,
    removeTransferItem,
    selectTransferItemsForStore,
    updateTransferItemQuantity,
} from '@/store/features/StockTransfer/stockTransferSlice';
import { ArrowRightLeft, Package, Search, Store, Trash2, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function TransferBuilder({ onViewHistory }: { onViewHistory: () => void }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { currentStoreId, userStores } = useCurrentStore();
    const items = useSelector((state: RootState) => selectTransferItemsForStore(currentStoreId)(state));
    const [toStoreId, setToStoreId] = useState('');
    const [note, setNote] = useState('');
    const [createTransfer, { isLoading: isCreating }] = useCreateStockTransferMutation();

    const destinationStores = useMemo(
        () => userStores.filter((s: any) => Number(s.id) !== Number(currentStoreId)),
        [userStores, currentStoreId]
    );

    const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0), [items]);

    const updateQuantity = (id: number, quantity: number) => {
        if (!currentStoreId) return;
        const item = items.find((i) => i.id === id);
        if (!item) return;
        const max = Number(item.PlaceholderQuantity ?? item.quantity ?? 0);
        if (quantity < 1) return;
        if (quantity > max) {
            showMessage(t('transfer_qty_exceeds_stock'), 'error');
            return;
        }
        dispatch(updateTransferItemQuantity({ storeId: currentStoreId, id, quantity }));
    };

    const removeItem = (id: number) => {
        if (!currentStoreId) return;
        dispatch(removeTransferItem({ storeId: currentStoreId, id }));
    };

    const handleClearAll = async () => {
        if (items.length === 0 || !currentStoreId) return;
        const confirmed = await showConfirmDialog(t('transfer_clear_title'), t('transfer_clear_desc'), t('btn_yes_clear'));
        if (confirmed) dispatch(clearTransferItems(currentStoreId));
    };

    const handleCreate = async () => {
        if (!toStoreId) return showMessage(t('transfer_select_destination'), 'error');
        if (items.length === 0) return showMessage(t('transfer_add_products'), 'error');
        if (!currentStoreId) return;

        const invalid = items.filter((item) => {
            const qty = Number(item.quantity) || 0;
            const max = Number(item.PlaceholderQuantity ?? item.quantity ?? 0);
            return qty < 1 || qty > max;
        });
        if (invalid.length > 0) return showMessage(t('transfer_check_quantities'), 'error');

        try {
            await createTransfer({
                store_id: currentStoreId,
                to_store_id: Number(toStoreId),
                note: note || undefined,
                items: items.map((item) => ({
                    product_id: item.productId,
                    product_stock_id: item.stockId,
                    quantity: item.quantity,
                })),
            }).unwrap();
            dispatch(clearTransferItems(currentStoreId));
            setToStoreId('');
            setNote('');
            showMessage(t('transfer_created'), 'success');
            onViewHistory();
        } catch (err: any) {
            showMessage(err?.data?.message || t('msg_error_generic'), 'error');
        }
    };

    return (
        <div className="flex h-full flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">{t('transfer_new')}</h2>
                        <p className="text-xs text-gray-500">{items.length} {items.length === 1 ? t('lbl_item') : t('lbl_items')} · {totalQuantity} {t('lbl_qty')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {items.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            <Trash2 className="h-3.5 w-3.5" /> {t('btn_clear')}
                        </button>
                    )}
                    <button
                        onClick={onViewHistory}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                        {t('transfer_history')}
                    </button>
                </div>
            </div>

            {/* Empty state */}
            {items.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                        <ArrowRightLeft className="h-9 w-9 text-primary/70" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('transfer_empty_title')}</h3>
                    <p className="mt-2 max-w-sm text-sm text-gray-500">{t('transfer_empty_desc')}</p>

                    <div className="mt-6 w-full max-w-md space-y-3 text-left">
                        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <Store className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">{t('transfer_step_destination')}</h4>
                                <p className="text-xs text-gray-600">{t('transfer_step_destination_desc')}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <Search className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">{t('transfer_step_search')}</h4>
                                <p className="text-xs text-gray-600">{t('transfer_step_search_desc')}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <Package className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-900">{t('transfer_step_create')}</h4>
                                <p className="text-xs text-gray-600">{t('transfer_step_create_desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Items list */}
            {items.length > 0 && (
                <div className="flex-1 overflow-auto p-4 sm:p-6">
                    <div className="mx-auto max-w-4xl space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-900">{item.title}</p>
                                    {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        {item.sku && <span className="mr-2">SKU: {item.sku}</span>}
                                        <span>{t('transfer_available')}: {item.PlaceholderQuantity ?? item.quantity}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{t('transfer_quantity')}:</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={item.PlaceholderQuantity ?? item.quantity}
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                            className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                        />
                                        <span className="text-xs text-gray-400">{item.unit || 'pcs'}</span>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                        aria-label={t('btn_remove')}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer controls */}
            <div className="border-t border-gray-200 bg-white p-4 sm:p-6">
                <div className="mx-auto max-w-4xl space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <select
                            value={toStoreId}
                            onChange={(e) => setToStoreId(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            <option value="">{t('transfer_select_destination')}</option>
                            {destinationStores.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.store_name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t('transfer_note_placeholder')}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={isCreating || items.length === 0 || !toStoreId}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isCreating ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <ArrowRightLeft className="h-4 w-4" />
                        )}
                        {isCreating ? t('transfer_creating') : t('transfer_create')}
                    </button>
                </div>
            </div>
        </div>
    );
}
