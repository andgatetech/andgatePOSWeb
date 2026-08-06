import { ArrowDown, ArrowUp, Eye, Minus, Package, PackageCheck, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import ItemPreviewModal from '@/app/(application)/(protected)/pos/pos-right-side/ItemPreviewModal';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetStoreQuery } from '@/store/features/store/storeApi';
import SerialAdjustmentModal from './SerialAdjustmentModal';

interface AdjustmentItemProps {
    item: any;
    adjustment?: {
        adjustmentType: 'increase' | 'decrease';
        adjustmentQuantity: number;
        reason: string;
        notes: string;
        serialAdjustments?: any[];
    };
    onAdjustmentChange: (itemId: number, field: string, value: any) => void;
    onRemove: (itemId: number) => void;
    onUpdateQuantity: (itemId: number, quantity: number) => void;
    onUpdateUnit: (itemId: number, unit: string, factor: number) => void;
}

const unitOptionsFor = (item: any) => {
    const seen = new Set<string>();
    return [...(Array.isArray(item.availableUnits) ? item.availableUnits : []), { unit: item.unit || '', factor: item.unitFactor || 1 }]
        .filter((option: any) => option?.unit)
        .filter((option: any) => {
            const key = String(option.unit).trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
};

/**
 * AdjustmentItem Component
 * Individual product item with adjustment controls
 */
const AdjustmentItem = ({ item, adjustment, onAdjustmentChange, onRemove, onUpdateQuantity, onUpdateUnit }: AdjustmentItemProps) => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const { currentStore } = useCurrentStore();
    const { data: storeData } = useGetStoreQuery(currentStore?.id ? { store_id: currentStore.id } : undefined, {
        skip: !currentStore?.id,
    });

    const adjustmentReasons = storeData?.data?.store?.adjustment_reasons || [];
    const adjustmentType = adjustment?.adjustmentType || 'increase';
    const adjustmentQuantity = adjustment?.adjustmentQuantity || 0;
    const reason = adjustment?.reason || '';
    const notes = adjustment?.notes || '';
    const serialAdjustments = adjustment?.serialAdjustments || [];
    const unitOptions = unitOptionsFor(item);
    const selectedFactor = Number(item.unitFactor || unitOptions.find((u: any) => String(u.unit).toLowerCase() === String(item.unit).toLowerCase())?.factor || 1);
    const currentStockBase = Number(item.PlaceholderQuantity ?? item.quantity ?? 0);
    const currentStock = selectedFactor > 0 ? currentStockBase / selectedFactor : currentStockBase;

    // The shopkeeper types what they actually counted on the shelf, not a delta —
    // direction/quantity (what the save payload and backend still expect) are derived
    // from it so no API change is needed. Reconstruct the counted value from stored
    // direction+quantity so it survives navigating away and back.
    const countedQuantity = adjustment ? (adjustmentType === 'increase' ? currentStock + adjustmentQuantity : currentStock - adjustmentQuantity) : currentStock;
    const delta = countedQuantity - currentStock;
    const hasDiscrepancy = delta !== 0;

    const updateCountedQuantity = (nextCounted: number) => {
        const clean = Number.isFinite(nextCounted) ? Math.max(0, nextCounted) : currentStock;
        const nextDelta = clean - currentStock;
        onAdjustmentChange(item.id, 'adjustmentType', nextDelta >= 0 ? 'increase' : 'decrease');
        onAdjustmentChange(item.id, 'adjustmentQuantity', Math.abs(nextDelta));
    };

    // Find selected reason details
    const selectedReason = adjustmentReasons.find((r: any) => r.id?.toString() === reason);

    const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
    const [serialModalTab, setSerialModalTab] = useState<'cut' | 'add' | 'staged'>('cut');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const openSerialModal = (tab: 'cut' | 'add' | 'staged') => {
        setSerialModalTab(tab);
        setIsSerialModalOpen(true);
    };

    const handleSerialSave = (serials: any[]) => {
        onAdjustmentChange(item.id, 'serialAdjustments', serials);
        const cutCount = serials.filter((s: any) => s.status !== 'in_stock' || !s.is_new).length;
        const addCount = serials.filter((s: any) => s.is_new && s.status === 'in_stock').length;
        const net = addCount - cutCount;
        if (net !== 0) {
            onAdjustmentChange(item.id, 'adjustmentType', net > 0 ? 'increase' : 'decrease');
            onAdjustmentChange(item.id, 'adjustmentQuantity', Math.abs(net));
        } else if (serials.length > 0) {
            onAdjustmentChange(item.id, 'adjustmentType', 'increase');
            onAdjustmentChange(item.id, 'adjustmentQuantity', 0);
        }
    };

    // A misclick on remove shouldn't silently discard a count someone already entered —
    // only confirm when there's actual work to lose (quantity, reason, notes, or serials set).
    const hasUnsavedWork = adjustmentQuantity > 0 || Boolean(reason) || Boolean(notes) || serialAdjustments.length > 0;
    const handleRemove = () => {
        if (hasUnsavedWork && !window.confirm(t('stock_adjustment_remove_confirm'))) return;
        onRemove(item.id);
    };

    const cutSerialsCount = serialAdjustments.filter((s: any) => s.status !== 'in_stock' || !s.is_new).length;
    const addSerialsCount = serialAdjustments.filter((s: any) => s.is_new && s.status === 'in_stock').length;
    const serialNetImpact = addSerialsCount - cutSerialsCount;

    return (
        <>
            <div className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-slate-300 sm:p-4">
                {/* Product Info & Remove Button */}
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsPreviewOpen(true)}
                                className="flex-shrink-0 rounded-lg bg-[#eef7fc] p-1.5 text-[#046ca9] transition-colors hover:bg-[#d7e9f5] hover:text-[#034d79]"
                                title={t('btn_view_details')}
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <h3 className="min-w-0 truncate text-base font-semibold text-gray-900 sm:text-lg">{item.title || item.name}</h3>
                            {item.has_serial && <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">{t('stock_adjustment_serial_tracked')}</span>}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            {item.sku && <span className="rounded-md bg-gray-100 px-2 py-1 font-medium">SKU: {item.sku}</span>}
                            <span className="rounded-md bg-[#eef7fc] px-2 py-1 font-medium text-[#034d79]">
                                {t('stock_adjustment_current_stock')}: {Number(currentStock.toFixed(4))}
                            </span>
                            {item.unit && (
                                <span className="rounded-md bg-gray-100 px-2 py-1 font-medium">
                                    {t('stock_adjustment_unit')}: {item.unit}
                                </span>
                            )}
                            {item.rate && <span className="text-gray-400">•</span>}
                            {item.rate && <span className="font-medium text-gray-700">{formatCurrency(item.rate)}</span>}
                        </div>
                    </div>
                    <button onClick={handleRemove} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600" title={t('stock_adjustment_remove_item')}>
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>

                {/* Serial Number Management (if product has serials) */}
                {item.has_serial ? (
                    <div className="space-y-3">
                        <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-purple-700" />
                                        <p className="text-sm font-bold text-purple-950">{t('stock_adjustment_serial_required')}</p>
                                    </div>
                                    <p className="mt-1 text-xs text-purple-700">
                                        {serialAdjustments.length > 0
                                            ? t('stock_adjustment_serials_ready', { count: serialAdjustments.length })
                                            : t('stock_adjustment_serial_manage_hint')}
                                    </p>
                                </div>

                                {/* Direct Quick Actions */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openSerialModal('cut')}
                                        className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 shadow-sm transition-all hover:bg-rose-100 active:scale-[0.98]"
                                    >
                                        <Minus className="h-3.5 w-3.5 stroke-[3]" />
                                        <span>{t('stock_adjustment_quick_cut')}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openSerialModal('add')}
                                        className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-100 active:scale-[0.98]"
                                    >
                                        <Plus className="h-3.5 w-3.5 stroke-[3]" />
                                        <span>{t('stock_adjustment_quick_add')}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openSerialModal('staged')}
                                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-purple-700 active:scale-[0.98]"
                                    >
                                        <Package className="h-3.5 w-3.5" />
                                        <span>{t('stock_adjustment_manage_serials')}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Show serial adjustments summary with net impact */}
                            {serialAdjustments.length > 0 && (
                                <div className="mt-3 space-y-2 border-t border-purple-200/80 pt-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold text-purple-900">{t('stock_adjustment_staged_summary')}</p>
                                        <div className="flex items-center gap-2 text-xs font-extrabold">
                                            {cutSerialsCount > 0 && (
                                                <span className="rounded-md bg-rose-100 px-2 py-0.5 text-rose-700">
                                                    -{cutSerialsCount} Cut
                                                </span>
                                            )}
                                            {addSerialsCount > 0 && (
                                                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-emerald-700">
                                                    +{addSerialsCount} Added
                                                </span>
                                            )}
                                            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-purple-800">
                                                Net: {serialNetImpact > 0 ? `+${serialNetImpact}` : serialNetImpact}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
                                        {serialAdjustments.map((serial: any, idx: number) => {
                                            const isAdd = serial.is_new && serial.status === 'in_stock';
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium ${
                                                        isAdd ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'
                                                    }`}
                                                >
                                                    <span className="font-bold">{isAdd ? '+' : '-'}</span>
                                                    <span className="font-mono">{serial.serial_number}</span>
                                                    <span className="text-[10px] opacity-75">({serial.reason})</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Normal Product - count what's actually on the shelf; direction/delta are derived, not typed.
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="text-sm font-medium text-gray-700">{t('stock_adjustment_counted_quantity')} *</label>
                            {unitOptions.length > 1 && (
                                <select
                                    value={item.unit || unitOptions[0]?.unit || ''}
                                    onChange={(e) => {
                                        const next = unitOptions.find((u: any) => String(u.unit).toLowerCase() === e.target.value.toLowerCase());
                                        if (next) onUpdateUnit(item.id, next.unit, Number(next.factor || 1));
                                    }}
                                    className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary"
                                >
                                    {unitOptions.map((u: any) => (
                                        <option key={u.unit} value={u.unit}>{u.unit}</option>
                                    ))}
                                </select>
                            )}
                            <div className="flex items-stretch gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateCountedQuantity(countedQuantity - 1)}
                                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    min="0"
                                    step="0.0001"
                                    value={countedQuantity}
                                    onChange={(e) => updateCountedQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
                                    className={`h-11 w-24 min-w-0 rounded-lg border bg-white px-2 text-center text-lg font-semibold focus:ring-2 ${
                                        hasDiscrepancy ? 'border-primary text-gray-900 focus:border-primary focus:ring-primary' : 'border-green-300 text-green-700 focus:border-primary focus:ring-primary'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => updateCountedQuantity(countedQuantity + 1)}
                                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            {hasDiscrepancy ? (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${delta > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                    {delta > 0 ? '+' : ''}
                                    {delta}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                                    <PackageCheck className="h-3 w-3" />
                                    {t('stock_adjustment_matches')}
                                </span>
                            )}
                        </div>

                        {hasDiscrepancy && (
                            <div className="grid gap-3 border-t border-dashed border-[#d8e4ec] pt-3 sm:grid-cols-[minmax(220px,1fr)_minmax(180px,0.75fr)]">
                                {/* Reason */}
                                <div className="min-w-0">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('reason')} *</label>
                                    {adjustmentReasons.length === 0 ? (
                                        <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-3">
                                            <p className="text-xs font-medium text-yellow-800">
                                                {t('stock_adjustment_no_reason_found')}{' '}
                                                <Link href="/store/setting?tab=adjustment" className="font-semibold text-yellow-900 underline hover:text-yellow-700">
                                                    {t('stock_adjustment_add_common_reasons')}
                                                </Link>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <select
                                                value={reason}
                                                onChange={(e) => onAdjustmentChange(item.id, 'reason', e.target.value)}
                                                className="h-11 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">{t('placeholder_select_reason')}</option>
                                                {adjustmentReasons
                                                    .filter((r: any) => r.is_active === 1 || r.is_active === true)
                                                    .filter((r: any) => !r.direction || r.direction === 'either' || r.direction === (delta > 0 ? 'increase' : 'decrease'))
                                                    .map((r: any) => (
                                                        <option key={r.id} value={r.id}>
                                                            {r.name}
                                                        </option>
                                                    ))}
                                            </select>
                                            {selectedReason?.description && <p className="text-xs italic text-gray-500">{selectedReason.description}</p>}
                                        </div>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="min-w-0">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('stock_adjustment_notes')}</label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={(e) => onAdjustmentChange(item.id, 'notes', e.target.value)}
                                        placeholder={t('optional')}
                                        className="h-11 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            <ItemPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} item={item} />

            {/* Serial Adjustment Modal */}
            <SerialAdjustmentModal
                isOpen={isSerialModalOpen}
                onClose={() => setIsSerialModalOpen(false)}
                productName={item.title || item.name}
                productId={item.productId}
                stockId={item.stockId}
                storeId={currentStore?.id}
                initialSerials={serialAdjustments}
                initialTab={serialModalTab}
                onSave={handleSerialSave}
            />
        </>
    );
};

export default AdjustmentItem;
