'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    ArrowDown,
    ArrowUp,
    Check,
    CheckSquare,
    Minus,
    Package,
    PackageMinus,
    PackagePlus,
    Plus,
    RotateCcw,
    Search,
    Square,
    Trash2,
    X,
} from 'lucide-react';
import { getTranslation } from '@/i18n';
import { showErrorDialog } from '@/lib/toast';
import { useGetProductSerialsQuery } from '@/store/features/warrenty/ProductSerialApi';
import { useGetAdjustmentTypesQuery } from '@/store/features/productStockType/productStockTypeApi';
import { useGetStoreQuery } from '@/store/features/store/storeApi';

export interface SerialData {
    id: number;
    serial_number: string;
    status: 'in_stock' | 'sold' | 'returned' | 'damaged';
    reason: string;
    product_adjustment_reason_id?: number | null;
    notes: string;
    is_new?: boolean;
}

interface SerialAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productId: number;
    stockId: number;
    storeId?: number;
    initialSerials?: SerialData[];
    initialTab?: 'cut' | 'add' | 'staged';
    onSave: (serials: SerialData[]) => void;
}

const SerialAdjustmentModal = ({
    isOpen,
    onClose,
    productName,
    productId,
    stockId,
    storeId,
    initialSerials = [],
    initialTab = 'cut',
    onSave,
}: SerialAdjustmentModalProps) => {
    const { t } = getTranslation();
    const [activeTab, setActiveTab] = useState<'cut' | 'add' | 'staged'>(initialTab);
    const [staged, setStaged] = useState<SerialData[]>(initialSerials);

    // Synchronize initialSerials & initialTab when modal opens
    useEffect(() => {
        if (isOpen) {
            setStaged(initialSerials);
            setActiveTab(initialTab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialTab]);

    // Cut / Remove Tab State
    const [search, setSearch] = useState('');
    const [selectedCutSerials, setSelectedCutSerials] = useState<Set<string>>(new Set());
    const [cutStatus, setCutStatus] = useState<'damaged' | 'sold' | 'returned'>('damaged');
    const [cutReasonId, setCutReasonId] = useState<string>('');
    const [cutCustomReason, setCutCustomReason] = useState('');
    const [cutNotes, setCutNotes] = useState('');

    // Add New Tab State
    const [bulkSerialNumbers, setBulkSerialNumbers] = useState('');
    const [addReasonId, setAddReasonId] = useState<string>('');
    const [addCustomReason, setAddCustomReason] = useState('');
    const [addNotes, setAddNotes] = useState('');

    // Fetch existing serials for this product variant
    const { data: existingData, isFetching: loadingExisting } = useGetProductSerialsQuery(
        { product_id: productId, product_stock_id: stockId, all: true },
        { skip: !isOpen || !productId || !stockId }
    );
    const existingSerials: Array<{ id: number; serial_number: string; status: string }> = existingData?.data?.items || [];

    // Fetch store adjustment reasons for rich dropdowns
    const { data: storeData } = useGetStoreQuery(storeId ? { store_id: storeId } : undefined, {
        skip: !isOpen || !storeId,
    });
    const storeReasons: Array<{ id: number; name: string; direction: string; is_active: boolean }> =
        storeData?.data?.store?.adjustment_reasons || [];

    const decreaseReasons = useMemo(
        () => storeReasons.filter((r) => r.is_active && (!r.direction || r.direction === 'decrease' || r.direction === 'either')),
        [storeReasons]
    );

    const increaseReasons = useMemo(
        () => storeReasons.filter((r) => r.is_active && (!r.direction || r.direction === 'increase' || r.direction === 'either')),
        [storeReasons]
    );

    // Freeform suggestion types fallback
    const { data: typesData } = useGetAdjustmentTypesQuery({ store_id: storeId as number }, { skip: !isOpen || !storeId });
    const reasonSuggestions: string[] = useMemo(() => {
        const types = typesData?.data || [];
        return Array.from(new Set(types.map((type: any) => type.type).filter(Boolean))) as string[];
    }, [typesData]);

    if (!isOpen) return null;

    // Filter available serials (excluding already staged ones)
    const stagedSerialNumbers = new Set(staged.map((s) => s.serial_number.toUpperCase()));

    const inStockSerials = existingSerials.filter((s) => s.status === 'in_stock');
    const availableInStockSerials = inStockSerials.filter((s) => !stagedSerialNumbers.has(s.serial_number.toUpperCase()));

    const filteredCutSerials = availableInStockSerials.filter((s) => {
        if (!search.trim()) return true;
        return s.serial_number.toLowerCase().includes(search.trim().toLowerCase());
    });

    const isAllFilteredSelected = filteredCutSerials.length > 0 && filteredCutSerials.every((s) => selectedCutSerials.has(s.serial_number));

    const toggleSelectAllCut = () => {
        if (isAllFilteredSelected) {
            setSelectedCutSerials(new Set());
        } else {
            const next = new Set(selectedCutSerials);
            filteredCutSerials.forEach((s) => next.add(s.serial_number));
            setSelectedCutSerials(next);
        }
    };

    const toggleCutSerial = (serialNumber: string) => {
        setSelectedCutSerials((prev) => {
            const next = new Set(prev);
            if (next.has(serialNumber)) next.delete(serialNumber);
            else next.add(serialNumber);
            return next;
        });
    };

    // Staged counts & impact
    const cutStagedCount = staged.filter((s) => s.status !== 'in_stock' || !s.is_new).length;
    const addedStagedCount = staged.filter((s) => s.is_new && s.status === 'in_stock').length;
    const netDelta = addedStagedCount - cutStagedCount;

    // Stage Cut Serials
    const handleStageCut = () => {
        if (selectedCutSerials.size === 0) {
            showErrorDialog(t('stock_adjustment_incomplete'), t('stock_adjustment_select_serials_error'));
            return;
        }

        const selectedReasonObj = storeReasons.find((r) => r.id.toString() === cutReasonId);
        const resolvedReason = selectedReasonObj ? selectedReasonObj.name : cutCustomReason.trim() || cutStatus;

        if (!resolvedReason) {
            showErrorDialog(t('stock_adjustment_incomplete'), t('stock_adjustment_serial_required_error'));
            return;
        }

        const newlyStaged: SerialData[] = Array.from(selectedCutSerials).map((sn, idx) => ({
            id: Date.now() + idx,
            serial_number: sn,
            status: cutStatus,
            reason: resolvedReason,
            product_adjustment_reason_id: selectedReasonObj ? selectedReasonObj.id : null,
            notes: cutNotes.trim(),
            is_new: false,
        }));

        setStaged((prev) => [...prev, ...newlyStaged]);
        setSelectedCutSerials(new Set());
        setCutCustomReason('');
        setCutNotes('');
        setActiveTab('staged');
    };

    // Stage Add Serials
    const parseEnteredSerials = (raw: string) => {
        return Array.from(
            new Set(
                raw
                    .split(/[\n,;]+/)
                    .map((s) => s.trim())
                    .filter(Boolean)
            )
        );
    };

    const parsedAddSerials = parseEnteredSerials(bulkSerialNumbers);

    const handleStageAdd = () => {
        if (parsedAddSerials.length === 0) {
            showErrorDialog(t('stock_adjustment_incomplete'), t('stock_adjustment_bulk_serial_required_error'));
            return;
        }

        const selectedReasonObj = storeReasons.find((r) => r.id.toString() === addReasonId);
        const resolvedReason = selectedReasonObj ? selectedReasonObj.name : addCustomReason.trim() || 'New Stock Arrival';

        // Check for duplicates with existing database serials
        const existingSet = new Set(existingSerials.map((s) => s.serial_number.toUpperCase()));
        const duplicates = parsedAddSerials.filter((s) => existingSet.has(s.toUpperCase()) || stagedSerialNumbers.has(s.toUpperCase()));

        if (duplicates.length > 0) {
            showErrorDialog('Duplicate Serial Number', `The following serial(s) already exist or are staged: ${duplicates.slice(0, 3).join(', ')}`);
            return;
        }

        const newlyStaged: SerialData[] = parsedAddSerials.map((sn, idx) => ({
            id: Date.now() + idx,
            serial_number: sn,
            status: 'in_stock',
            reason: resolvedReason,
            product_adjustment_reason_id: selectedReasonObj ? selectedReasonObj.id : null,
            notes: addNotes.trim(),
            is_new: true,
        }));

        setStaged((prev) => [...prev, ...newlyStaged]);
        setBulkSerialNumbers('');
        setAddCustomReason('');
        setAddNotes('');
        setActiveTab('staged');
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm transition-all sm:items-center sm:p-4">
            <div className="flex h-[92vh] max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-3xl">
                {/* Header */}
                <div className="border-b border-slate-200 bg-slate-50/90 px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800 sm:text-xs">
                                    <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    {t('stock_adjustment_serial_tracked')}
                                </span>
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 sm:text-xs">
                                    {t('stock_adjustment_in_stock_count', { count: inStockSerials.length })}
                                </span>
                            </div>
                            <h2 className="mt-1 truncate text-base font-bold text-slate-900 sm:text-xl">{productName}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 active:scale-95"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Segmented Navigation Tabs */}
                    <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/70 p-1 text-xs font-semibold sm:text-sm">
                        <button
                            onClick={() => setActiveTab('cut')}
                            className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 transition-all ${
                                activeTab === 'cut'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'text-slate-700 hover:bg-white/60 hover:text-rose-700'
                            }`}
                        >
                            <PackageMinus className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="truncate">{t('stock_adjustment_cut_serial_tab')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 transition-all ${
                                activeTab === 'add'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-slate-700 hover:bg-white/60 hover:text-emerald-700'
                            }`}
                        >
                            <PackagePlus className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="truncate">{t('stock_adjustment_add_serial_tab')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('staged')}
                            className={`relative flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1 transition-all ${
                                activeTab === 'staged'
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-slate-700 hover:bg-white/60 hover:text-primary'
                            }`}
                        >
                            <span className="truncate">{t('stock_adjustment_staged_summary')}</span>
                            {staged.length > 0 && (
                                <span
                                    className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-extrabold ${
                                        activeTab === 'staged' ? 'bg-white text-primary' : 'bg-primary text-white'
                                    }`}
                                >
                                    {staged.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-3.5 sm:p-6">
                    {/* TAB 1: CUT / REDUCE SERIALS */}
                    {activeTab === 'cut' && (
                        <div className="space-y-3.5 sm:space-y-4">
                            <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-3 text-xs text-rose-900 sm:text-sm">
                                <p className="font-medium">{t('stock_adjustment_cut_serial_desc')}</p>
                            </div>

                            {/* Search & Bulk Select Controls */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative min-w-0 flex-1">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={t('stock_adjustment_search_serial_placeholder')}
                                        className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 text-xs sm:text-sm placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                {filteredCutSerials.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={toggleSelectAllCut}
                                        className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-98"
                                    >
                                        {isAllFilteredSelected ? (
                                            <>
                                                <Square className="h-4 w-4 text-slate-400" />
                                                <span>{t('stock_adjustment_deselect_all')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckSquare className="h-4 w-4 text-rose-600" />
                                                <span>{t('stock_adjustment_select_all')} ({filteredCutSerials.length})</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Serials List */}
                            {loadingExisting ? (
                                <div className="py-10 text-center text-xs sm:text-sm text-slate-500">{t('lbl_loading')}...</div>
                            ) : filteredCutSerials.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center sm:p-8">
                                    <Package className="mx-auto h-8 w-8 text-slate-300" />
                                    <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600">
                                        {availableInStockSerials.length === 0
                                            ? t('stock_adjustment_no_existing_serials')
                                            : t('stock_adjustment_no_matching_serials')}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid max-h-[36vh] sm:max-h-60 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                                    {filteredCutSerials.map((s) => {
                                        const isSelected = selectedCutSerials.has(s.serial_number);
                                        return (
                                            <div
                                                key={s.id}
                                                onClick={() => toggleCutSerial(s.serial_number)}
                                                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all active:scale-[0.99] ${
                                                    isSelected
                                                        ? 'border-rose-500 bg-rose-50/80 shadow-sm'
                                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                                }`}
                                            >
                                                <div className="flex min-w-0 items-center gap-2.5">
                                                    <div
                                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                                                            isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300 bg-white'
                                                        }`}
                                                    >
                                                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                                    </div>
                                                    <span className="truncate font-mono text-xs sm:text-sm font-bold text-slate-900">{s.serial_number}</span>
                                                </div>
                                                <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                                    {t('status_in_stock')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Cut Reason & Configuration Panel (Active when items selected) */}
                            {selectedCutSerials.size > 0 && (
                                <div className="animate-fadeIn rounded-2xl border-2 border-rose-200 bg-rose-50/60 p-3.5 sm:p-4 shadow-sm">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h4 className="text-xs sm:text-sm font-bold text-rose-950">
                                            {t('stock_adjustment_selected_count', { count: selectedCutSerials.size })}
                                        </h4>
                                        <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white">
                                            -{selectedCutSerials.size} {t('stock_adjustment_unit')}
                                        </span>
                                    </div>

                                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-slate-700">
                                                {t('stock_adjustment_new_status')} *
                                            </label>
                                            <select
                                                value={cutStatus}
                                                onChange={(e) => setCutStatus(e.target.value as any)}
                                                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                                            >
                                                <option value="damaged">{t('lbl_damaged')}</option>
                                                <option value="sold">{t('lbl_sold')}</option>
                                                <option value="returned">{t('status_returned')}</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-slate-700">{t('reason')} *</label>
                                            {decreaseReasons.length > 0 ? (
                                                <select
                                                    value={cutReasonId}
                                                    onChange={(e) => setCutReasonId(e.target.value)}
                                                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                                                >
                                                    <option value="">{t('placeholder_select_reason')}</option>
                                                    {decreaseReasons.map((r) => (
                                                        <option key={r.id} value={r.id}>
                                                            {r.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    list="serial-stock-reasons"
                                                    value={cutCustomReason}
                                                    onChange={(e) => setCutCustomReason(e.target.value)}
                                                    placeholder={t('stock_adjustment_reason_placeholder')}
                                                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs sm:text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                                                />
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-slate-700">
                                                {t('stock_adjustment_notes')}
                                            </label>
                                            <input
                                                type="text"
                                                value={cutNotes}
                                                onChange={(e) => setCutNotes(e.target.value)}
                                                placeholder={t('optional')}
                                                className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs sm:text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleStageCut}
                                        className="mt-3.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-rose-700 active:scale-[0.99] sm:w-auto"
                                    >
                                        <Minus className="h-4 w-4 stroke-[3]" />
                                        <span>{t('stock_adjustment_cut_btn', { count: selectedCutSerials.size })}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: ADD / INCREASE SERIALS */}
                    {activeTab === 'add' && (
                        <div className="space-y-3.5 sm:space-y-4">
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-emerald-900 sm:text-sm">
                                <p className="font-medium">{t('stock_adjustment_add_serial_desc')}</p>
                            </div>

                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 sm:text-sm">
                                        {t('stock_adjustment_serial_numbers_one_line')} *
                                    </label>
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                        {t('stock_adjustment_serial_numbers_entered', { count: parsedAddSerials.length })}
                                    </span>
                                </div>
                                <textarea
                                    value={bulkSerialNumbers}
                                    onChange={(e) => setBulkSerialNumbers(e.target.value)}
                                    placeholder={'SN-1001\nSN-1002\nSN-1003'}
                                    rows={4}
                                    className="w-full rounded-2xl border border-slate-300 bg-white p-3 font-mono text-xs sm:text-sm leading-relaxed placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">{t('reason')} *</label>
                                    {increaseReasons.length > 0 ? (
                                        <select
                                            value={addReasonId}
                                            onChange={(e) => setAddReasonId(e.target.value)}
                                            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            <option value="">{t('placeholder_select_reason')}</option>
                                            {increaseReasons.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            list="serial-stock-reasons"
                                            value={addCustomReason}
                                            onChange={(e) => setAddCustomReason(e.target.value)}
                                            placeholder={t('stock_adjustment_new_stock_placeholder')}
                                            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        {t('stock_adjustment_notes')}
                                    </label>
                                    <input
                                        type="text"
                                        value={addNotes}
                                        onChange={(e) => setAddNotes(e.target.value)}
                                        placeholder={t('optional')}
                                        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleStageAdd}
                                disabled={parsedAddSerials.length === 0}
                                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                <Plus className="h-4 w-4 stroke-[3]" />
                                <span>{t('stock_adjustment_add_btn', { count: Math.max(1, parsedAddSerials.length) })}</span>
                            </button>
                        </div>
                    )}

                    {/* TAB 3: STAGED SUMMARY */}
                    {activeTab === 'staged' && (
                        <div className="space-y-3.5 sm:space-y-4">
                            {/* Net Impact Card */}
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 sm:p-4">
                                <div className="text-center">
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-500">{t('stock_adjustment_current_stock')}</span>
                                    <p className="mt-0.5 text-sm sm:text-lg font-black text-slate-800">{inStockSerials.length}</p>
                                </div>
                                <div className="border-x border-slate-200 text-center">
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-500">{t('stock_adjustment_net_stock_impact')}</span>
                                    <p
                                        className={`mt-0.5 flex items-center justify-center gap-0.5 text-sm sm:text-lg font-black ${
                                            netDelta > 0 ? 'text-emerald-600' : netDelta < 0 ? 'text-rose-600' : 'text-slate-700'
                                        }`}
                                    >
                                        {netDelta > 0 ? <ArrowUp className="h-3.5 w-3.5" /> : netDelta < 0 ? <ArrowDown className="h-3.5 w-3.5" /> : null}
                                        {netDelta > 0 ? `+${netDelta}` : netDelta}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <span className="text-[10px] sm:text-xs font-bold text-slate-500">{t('stock_adjustment_after_save')}</span>
                                    <p className="mt-0.5 text-sm sm:text-lg font-black text-primary">
                                        {Math.max(0, inStockSerials.length + netDelta)}
                                    </p>
                                </div>
                            </div>

                            {staged.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 sm:p-8 text-center">
                                    <p className="text-xs sm:text-sm text-slate-500">{t('stock_adjustment_serial_manage_hint')}</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[40vh] sm:max-h-64 overflow-y-auto">
                                    {staged.map((item) => {
                                        const isAddition = item.is_new && item.status === 'in_stock';
                                        return (
                                            <div
                                                key={item.id}
                                                className={`flex items-center justify-between rounded-xl border p-2.5 sm:p-3 transition-all ${
                                                    isAddition ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'
                                                }`}
                                            >
                                                <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                                                    <span
                                                        className={`flex h-5.5 w-5.5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${
                                                            isAddition ? 'bg-emerald-600' : 'bg-rose-600'
                                                        }`}
                                                    >
                                                        {isAddition ? '+' : '-'}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                                            <span className="truncate font-mono text-xs sm:text-sm font-bold text-slate-900">{item.serial_number}</span>
                                                            <span
                                                                className={`rounded px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold ${
                                                                    isAddition
                                                                        ? 'bg-emerald-100 text-emerald-800'
                                                                        : item.status === 'damaged'
                                                                        ? 'bg-rose-100 text-rose-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }`}
                                                            >
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                        <p className="truncate text-[11px] sm:text-xs text-slate-500">
                                                            {item.reason}
                                                            {item.notes ? ` • ${item.notes}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeStaged(item.id)}
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-rose-600 active:scale-95"
                                                    title={t('stock_adjustment_remove_staged')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Action Bar */}
                <div className="border-t border-slate-200 bg-slate-50/90 px-4 py-3 sm:px-6 sm:py-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-semibold text-slate-700 sm:text-sm">
                            <span>{t('stock_adjustment_staged_changes', { count: staged.length })}</span>
                            {staged.length > 0 && (
                                <button
                                    onClick={() => setStaged([])}
                                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-600"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    {t('btn_reset')}
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-10 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 active:scale-98 sm:flex-none sm:px-4 sm:text-sm"
                            >
                                {t('btn_cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={staged.length === 0}
                                className="h-10 flex-1 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-md transition-all hover:bg-primary/90 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-5 sm:text-sm"
                            >
                                {t('stock_adjustment_save_serial_adjustments')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <datalist id="serial-stock-reasons">
                {reasonSuggestions.map((r) => (
                    <option key={r} value={r} />
                ))}
            </datalist>
        </div>
    );
};

export default SerialAdjustmentModal;
