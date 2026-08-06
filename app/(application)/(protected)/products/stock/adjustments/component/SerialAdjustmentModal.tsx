'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { getTranslation } from '@/i18n';
import { showErrorDialog } from '@/lib/toast';
import { useGetProductSerialsQuery } from '@/store/features/warrenty/ProductSerialApi';
import { useGetAdjustmentTypesQuery } from '@/store/features/productStockType/productStockTypeApi';

interface SerialData {
    id: number;
    serial_number: string;
    status: 'in_stock' | 'sold' | 'returned' | 'damaged';
    reason: string;
    notes: string;
}

interface SerialAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productId: number;
    stockId: number;
    storeId?: number;
    /** This item's already-saved serial changes — re-shown on open so reopening the
     * modal to add more never silently discards what was staged in a previous pass. */
    initialSerials?: SerialData[];
    onSave: (serials: SerialData[]) => void;
}

const STATUS_OPTIONS = ['in_stock', 'sold', 'returned', 'damaged'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

const SerialAdjustmentModal = ({ isOpen, onClose, productName, productId, stockId, storeId, initialSerials = [], onSave }: SerialAdjustmentModalProps) => {
    const { t } = getTranslation();
    const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');

    // Changes staged for this item — seeded from whatever was already saved, plus
    // anything added in this session. Replacing the old "always starts empty" behavior
    // that silently wiped previously entered serials every time the modal reopened.
    const [staged, setStaged] = useState<SerialData[]>(initialSerials);

    // Re-seed only when the modal transitions to open, not on every parent re-render —
    // otherwise in-progress staging this session would keep getting reset.
    useEffect(() => {
        if (isOpen) {
            setStaged(initialSerials);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // "Update Existing" tab state
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [newStatus, setNewStatus] = useState<StatusOption>('sold');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');

    // "Add New" tab state
    const [bulkSerialNumbers, setBulkSerialNumbers] = useState('');
    const [bulkStatus, setBulkStatus] = useState<StatusOption>('in_stock');
    const [bulkReason, setBulkReason] = useState('');
    const [bulkNotes, setBulkNotes] = useState('');

    // The product's real serial numbers for this variant — replaces free-text entry of
    // an existing serial number (which required memorizing it) with an actual pick list.
    const { data: existingData, isFetching: loadingExisting } = useGetProductSerialsQuery(
        { product_id: productId, product_stock_id: stockId, all: true },
        { skip: !isOpen || !productId || !stockId }
    );
    const existingSerials: Array<{ id: number; serial_number: string; status: string }> = existingData?.data?.items || [];

    // "reason" here is a freeform stock-type label (matched against pos_product_stock_types
    // on save), not the product_adjustment_reason_id used for quantity adjustments — so this
    // stays a text field, just with autocomplete from labels already used in this store.
    const { data: typesData } = useGetAdjustmentTypesQuery({ store_id: storeId as number }, { skip: !isOpen || !storeId });
    const reasonSuggestions: string[] = useMemo(() => {
        const types = typesData?.data || [];
        return Array.from(new Set(types.map((type: any) => type.type).filter(Boolean))) as string[];
    }, [typesData]);

    if (!isOpen) return null;

    const statusLabel = (status: string) => {
        switch (status) {
            case 'in_stock':
                return t('status_in_stock');
            case 'sold':
                return t('lbl_sold');
            case 'returned':
                return t('status_returned');
            case 'damaged':
                return t('lbl_damaged');
            default:
                return status;
        }
    };

    const statusBadgeClass = (status: string) =>
        status === 'in_stock' ? 'bg-green-100 text-green-700' : status === 'sold' ? 'bg-blue-100 text-blue-700' : status === 'damaged' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

    const stagedSerialNumbers = new Set(staged.map((s) => s.serial_number.toUpperCase()));

    const pickableSerials = existingSerials.filter((s) => {
        if (stagedSerialNumbers.has(s.serial_number.toUpperCase())) return false;
        if (!search.trim()) return true;
        return s.serial_number.toLowerCase().includes(search.trim().toLowerCase());
    });

    const toggleSelected = (serialNumber: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(serialNumber)) next.delete(serialNumber);
            else next.add(serialNumber);
            return next;
        });
    };

    const handleStageExisting = () => {
        if (selected.size === 0) {
            showErrorDialog(t('stock_adjustment_incomplete'), t('stock_adjustment_select_serials_error'));
            return;
        }
        if (!reason.trim()) {
            showErrorDialog(t('stock_adjustment_incomplete'), t('stock_adjustment_serial_required_error'));
            return;
        }

        const newlyStaged: SerialData[] = Array.from(selected).map((sn, index) => ({
            id: Date.now() + index,
            serial_number: sn,
            status: newStatus,
            reason: reason.trim(),
            notes,
        }));

        setStaged((prev) => [...prev, ...newlyStaged]);
        setSelected(new Set());
        setReason('');
        setNotes('');
    };

    const handleStageNew = () => {
        const serialNumbers = bulkSerialNumbers
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);

        if (serialNumbers.length === 0 || !bulkReason.trim()) {
            showErrorDialog(t('stock_adjustment_incomplete'), t('stock_adjustment_bulk_serial_required_error'));
            return;
        }

        const newlyStaged: SerialData[] = serialNumbers.map((sn, index) => ({
            id: Date.now() + index,
            serial_number: sn,
            status: bulkStatus,
            reason: bulkReason.trim(),
            notes: bulkNotes,
        }));

        setStaged((prev) => [...prev, ...newlyStaged]);
        setBulkSerialNumbers('');
        setBulkReason('');
        setBulkNotes('');
    };

    const removeStaged = (id: number) => {
        setStaged((prev) => prev.filter((s) => s.id !== id));
    };

    const handleSave = () => {
        if (staged.length === 0) {
            showErrorDialog(t('stock_adjustment_incomplete'), t('stock_adjustment_serial_required_error'));
            return;
        }
        onSave(staged);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-lg">
                {/* Header */}
                <div className="border-b border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{t('stock_adjustment_serial_title')}</h2>
                            <p className="mt-1 text-sm text-gray-600">{productName}</p>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 flex gap-4">
                        <button
                            onClick={() => setActiveTab('existing')}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'existing' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {t('stock_adjustment_update_serial_status')}
                        </button>
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'new' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {t('stock_adjustment_bulk_add_serials')}
                        </button>
                    </div>
                </div>

                {/* Staged changes — carried across tab switches and reopen */}
                {staged.length > 0 && (
                    <div className="border-b border-gray-200 bg-primary/5 px-6 py-3">
                        <p className="mb-2 text-xs font-semibold text-gray-800">{t('stock_adjustment_staged_changes', { count: staged.length })}</p>
                        <div className="flex max-h-20 flex-wrap gap-2 overflow-auto">
                            {staged.map((s) => (
                                <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs shadow-sm">
                                    <span className="font-mono font-medium text-gray-900">{s.serial_number}</span>
                                    <span className="text-gray-400">→</span>
                                    <span className={`rounded px-1.5 py-0.5 font-medium ${statusBadgeClass(s.status)}`}>{statusLabel(s.status)}</span>
                                    <button onClick={() => removeStaged(s.id)} className="text-gray-400 hover:text-red-600" title={t('stock_adjustment_remove_staged')}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'existing' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">{t('stock_adjustment_update_serial_desc')}</p>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('stock_adjustment_search_serial_placeholder')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />

                            {loadingExisting ? (
                                <p className="py-8 text-center text-sm text-gray-500">{t('lbl_loading')}...</p>
                            ) : pickableSerials.length === 0 ? (
                                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                    <p className="text-sm text-gray-500">{existingSerials.length === 0 ? t('stock_adjustment_no_existing_serials') : t('stock_adjustment_no_matching_serials')}</p>
                                </div>
                            ) : (
                                <div className="max-h-48 space-y-1 overflow-auto rounded-lg border border-gray-200 p-2">
                                    {pickableSerials.map((s) => (
                                        <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-gray-50">
                                            <input type="checkbox" checked={selected.has(s.serial_number)} onChange={() => toggleSelected(s.serial_number)} className="h-4 w-4" />
                                            <span className="font-mono text-sm font-medium text-gray-900">{s.serial_number}</span>
                                            <span className={`ml-auto rounded px-1.5 py-0.5 text-xs font-medium ${statusBadgeClass(s.status)}`}>{statusLabel(s.status)}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {selected.size > 0 && (
                                <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                                    <p className="mb-3 text-sm font-semibold text-gray-800">{t('stock_adjustment_selected_count', { count: selected.size })}</p>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-700">{t('stock_adjustment_new_status')} *</label>
                                            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as StatusOption)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s} value={s}>
                                                        {statusLabel(s)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-700">{t('reason')} *</label>
                                            <input
                                                type="text"
                                                list="stock-type-suggestions"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder={t('stock_adjustment_reason_placeholder')}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-700">{t('stock_adjustment_notes')}</label>
                                            <input
                                                type="text"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder={t('optional')}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <button onClick={handleStageExisting} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                                        {t('stock_adjustment_stage_button', { count: selected.size })}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Bulk Add Mode — for serial numbers that don't exist in the system yet
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">{t('stock_adjustment_bulk_add_desc')}</p>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">{t('stock_adjustment_serial_numbers_one_line')} *</label>
                                <textarea
                                    value={bulkSerialNumbers}
                                    onChange={(e) => setBulkSerialNumbers(e.target.value)}
                                    placeholder={'SN001\nSN002\nSN003'}
                                    rows={6}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm"
                                />
                                <p className="mt-1 text-xs text-gray-500">{t('stock_adjustment_serial_numbers_entered', { count: bulkSerialNumbers.split('\n').filter((s) => s.trim()).length })}</p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('status')} *</label>
                                    <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as StatusOption)} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>
                                                {statusLabel(s)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('reason')} *</label>
                                    <input
                                        type="text"
                                        list="stock-type-suggestions"
                                        value={bulkReason}
                                        onChange={(e) => setBulkReason(e.target.value)}
                                        placeholder={t('stock_adjustment_new_stock_placeholder')}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('stock_adjustment_notes')}</label>
                                    <input
                                        type="text"
                                        value={bulkNotes}
                                        onChange={(e) => setBulkNotes(e.target.value)}
                                        placeholder={t('stock_adjustment_optional_notes')}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>
                            </div>

                            <button onClick={handleStageNew} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
                                {t('stock_adjustment_stage_new_button')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                            {t('btn_cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={staged.length === 0}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t('stock_adjustment_save_serial_adjustments')}
                        </button>
                    </div>
                </div>
            </div>

            <datalist id="stock-type-suggestions">
                {reasonSuggestions.map((r) => (
                    <option key={r} value={r} />
                ))}
            </datalist>
        </div>
    );
};

export default SerialAdjustmentModal;
