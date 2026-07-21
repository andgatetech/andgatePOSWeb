'use client';

import { useTranslation } from '@/components/i18n/TranslationProvider';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showMessage } from '@/lib/toast';
import type { RootState } from '@/store';
import {
    clearTransferItems,
    removeTransferItem,
    updateTransferItemQuantity,
    updateTransferItemUnit,
} from '@/store/features/stockTransfer/stockTransferDraftSlice';
import { useCreateStockTransferMutation } from '@/store/features/stockTransfer/stockTransferApi';
import { ArrowRight, Loader2, Package, Store, Trash2, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function CreateTransferView({ onCreated }: { onCreated: () => void }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { currentStore, currentStoreId, userStores } = useCurrentStore();
    const [toStoreId, setToStoreId] = useState('');
    const [note, setNote] = useState('');
    const [createTransfer, { isLoading }] = useCreateStockTransferMutation();

    const draftItems = useSelector((state: RootState) => (
        currentStoreId && state.stockTransferDraft.itemsByStore
            ? state.stockTransferDraft.itemsByStore[currentStoreId] || []
            : []
    ));

    const otherStores = useMemo(
        () => userStores.filter((s: any) => Number(s.id) !== Number(currentStoreId)),
        [userStores, currentStoreId]
    );

    const updateQuantity = (id: number, quantity: number) => {
        if (!currentStoreId) return;
        const item = draftItems.find((draft: any) => draft.id === id);
        const factor = Number(item?.unitFactor || 1);
        const available = factor > 0 ? Number(item?.PlaceholderQuantity ?? item?.quantity ?? 0) / factor : Number(item?.PlaceholderQuantity ?? item?.quantity ?? 0);
        const valid = Math.max(1, Math.min(Number.isFinite(quantity) ? quantity : 1, available || 1));
        dispatch(updateTransferItemQuantity({ storeId: currentStoreId, id, quantity: valid }));
    };

    const updateUnit = (id: number, unit: string) => {
        if (!currentStoreId) return;
        const item = draftItems.find((draft: any) => draft.id === id);
        const next = (item?.availableUnits || []).find((u: any) => String(u.unit).toLowerCase() === unit.toLowerCase());
        if (!next) return;
        dispatch(updateTransferItemUnit({ storeId: currentStoreId, id, unit: next.unit, factor: Number(next.factor || 1) }));
    };

    const removeItem = (id: number) => {
        if (!currentStoreId) return;
        dispatch(removeTransferItem({ storeId: currentStoreId, id }));
    };

    const handleClearAll = async () => {
        if (!currentStoreId || draftItems.length === 0) return;
        const confirmed = await showConfirmDialog(t('transfer_clear_title'), t('transfer_clear_desc'), t('btn_yes_clear'));
        if (confirmed) dispatch(clearTransferItems(currentStoreId));
    };

    const handleCreate = async () => {
        if (!currentStoreId || !toStoreId) return showMessage(t('transfer_select_stores'), 'error');
        if (Number(currentStoreId) === Number(toStoreId)) return showMessage(t('transfer_same_store_error'), 'error');
        if (draftItems.length === 0) return showMessage(t('transfer_add_products'), 'error');

        const invalid = draftItems.filter((item: any) => {
            const available = Number(item.PlaceholderQuantity ?? 0);
            return Number(item.quantity) < 1 || (Number(item.quantity) * Number(item.unitFactor || 1)) > available || !item.stockId;
        });
        if (invalid.length > 0) return showMessage(t('transfer_check_quantities'), 'error');

        try {
            await createTransfer({
                store_id: Number(currentStoreId),
                to_store_id: Number(toStoreId),
                note: note || undefined,
                items: draftItems.map((item: any) => ({
                    product_id: item.productId,
                    product_stock_id: item.stockId,
                    quantity: item.quantity,
                    unit: item.unit,
                })),
            }).unwrap();

            dispatch(clearTransferItems(currentStoreId));
            setNote('');
            setToStoreId('');
            showMessage(t('transfer_created'), 'success');
            onCreated();
        } catch (err: any) {
            showMessage(err?.data?.message || t('msg_error_generic'), 'error');
        }
    };

    const totalQuantity = useMemo(() => draftItems.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0), [draftItems]);
    const canCreate = Boolean(currentStoreId && toStoreId && Number(currentStoreId) !== Number(toStoreId) && draftItems.length > 0 && !isLoading);

    return (
        <div className="flex h-full flex-col bg-[#f6f9fc]">
            <div className="border-b border-[#d7e6f2] bg-white p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                            <Truck className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{t('transfer_new')}</h2>
                            <p className="mt-1 text-sm text-gray-500">{t('transfer_step_search_desc')}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClearAll}
                        disabled={draftItems.length === 0}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        {t('btn_clear')}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto px-4 pb-4 sm:px-6">
                <div className="mx-auto max-w-5xl space-y-4">
                    <section className="rounded-xl border border-[#d7e6f2] bg-white p-4 shadow-sm sm:p-5">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Store className="h-4 w-4 text-[#046ca9]" />
                            {t('transfer_route')}
                        </div>
                        <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('transfer_from_store')}</label>
                                <div className="rounded-lg border border-[#d7e6f2] bg-[#f6f9fc] px-3 py-2.5 text-sm font-semibold text-gray-800">
                                    {currentStore?.store_name || t('lbl_current_store')}
                                </div>
                            </div>
                            <div className="flex justify-center pb-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7f3fb] text-[#046ca9]">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('transfer_to_store')}</label>
                                <select
                                    value={toStoreId}
                                    onChange={(e) => setToStoreId(e.target.value)}
                                    className="w-full rounded-lg border border-[#d7e6f2] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/10"
                                >
                                    <option value="">{t('transfer_select_destination')}</option>
                                    {otherStores.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.store_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('transfer_note')}</label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={t('transfer_note_placeholder')}
                                className="w-full rounded-lg border border-[#d7e6f2] px-3 py-2.5 text-sm outline-none focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/10"
                            />
                        </div>
                    </section>

                    {draftItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d7e6f2] bg-white px-4 py-12 text-center shadow-sm">
                            <Package className="mb-3 h-10 w-10 text-gray-300" />
                            <p className="text-sm font-semibold text-gray-500">{t('transfer_empty_title')}</p>
                            <p className="mt-1 max-w-md text-xs text-gray-400">{t('transfer_empty_desc')}</p>
                        </div>
                    ) : (
                        <section className="overflow-hidden rounded-xl border border-[#d7e6f2] bg-white shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-[#f6f9fc]">
                                    <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                                        <th className="px-3 py-2.5">{t('transfer_product')}</th>
                                        <th className="px-3 py-2.5">{t('transfer_available')}</th>
                                        <th className="px-3 py-2.5">{t('transfer_quantity')}</th>
                                        <th className="px-3 py-2.5 text-right">{t('lbl_action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {draftItems.map((item: any) => {
                                        const available = Number(item.PlaceholderQuantity ?? 0);
                                        const unitOptions = Array.isArray(item.availableUnits) && item.availableUnits.length > 0 ? item.availableUnits : [{ unit: item.unit, factor: item.unitFactor || 1 }];
                                        const displayAvailable = Number(item.unitFactor || 1) > 0 ? available / Number(item.unitFactor || 1) : available;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-3">
                                                    <p className="font-medium text-gray-900">{item.variantName ? `${item.title || item.name} / ${item.variantName}` : (item.title || item.name)}</p>
                                                    <p className="text-xs text-gray-500">{item.sku ? `SKU: ${item.sku}` : ''}</p>
                                                </td>
                                                <td className="px-3 py-3 text-gray-600">{Number(displayAvailable.toFixed(4))} {item.unit}</td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            step="0.0001"
                                                            max={displayAvailable}
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                                            className="w-24 rounded-lg border border-[#d7e6f2] px-2 py-1.5 text-sm outline-none focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/10"
                                                        />
                                                        {unitOptions.length > 1 ? (
                                                            <select
                                                                value={item.unit || unitOptions[0]?.unit || ''}
                                                                onChange={(e) => updateUnit(item.id, e.target.value)}
                                                                className="rounded-lg border border-[#d7e6f2] bg-white px-2 py-1.5 text-sm outline-none focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/10"
                                                            >
                                                                {unitOptions.map((u: any) => (
                                                                    <option key={u.unit} value={u.unit}>{u.unit}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <span className="text-xs font-medium text-gray-500">{item.unit}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        className="inline-flex items-center gap-1 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                                        aria-label={t('btn_remove')}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </section>
                    )}
                </div>
            </div>

            <div className="border-t border-[#d7e6f2] bg-white shadow-lg">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-lg bg-gray-100 px-4 py-2">
                            <div className="text-xs text-gray-600">{t('stock_count_selected_items')}</div>
                            <div className="text-lg font-bold text-gray-900">{draftItems.length}</div>
                        </div>
                        <div className="rounded-lg bg-blue-100 px-4 py-2">
                            <div className="text-xs text-blue-700">{t('transfer_quantity')}</div>
                            <div className="text-lg font-bold text-blue-700">{totalQuantity}</div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreate}
                        disabled={!canCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#046ca9] to-[#034d79] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-[#035f95] hover:to-[#023d61] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[180px]"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                        {isLoading ? t('transfer_creating') : t('transfer_create')}
                    </button>
                </div>
            </div>
        </div>
    );
}
