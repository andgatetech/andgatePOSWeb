'use client';

import { useTranslation } from '@/components/i18n/TranslationProvider';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { showConfirmDialog, showMessage } from '@/lib/toast';
import { useGetAllProductsQuery } from '@/store/features/Product/productApi';
import { useCreateStockTransferMutation } from '@/store/features/stockTransfer/stockTransferApi';
import { ArrowRight, Loader2, Package, PackagePlus, Search, Store, Trash2, Truck, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface DraftItem {
    id: string;
    product_id: number;
    product_stock_id: number;
    product_name: string;
    variant_name?: string;
    sku?: string;
    unit?: string;
    available_quantity: number;
    quantity: number;
}

interface ProductOption {
    product_id: number;
    product_stock_id: number;
    product_name: string;
    variant_name?: string;
    sku?: string;
    unit?: string;
    available_quantity: number;
}

export default function CreateTransferView({ onCreated }: { onCreated: () => void }) {
    const { t } = useTranslation();
    const { currentStoreId, userStores } = useCurrentStore();
    const [fromStoreId, setFromStoreId] = useState<string>(String(currentStoreId || ''));
    const [toStoreId, setToStoreId] = useState('');
    const [note, setNote] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
    const [createTransfer, { isLoading }] = useCreateStockTransferMutation();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handle = setTimeout(() => setDebouncedSearch(search.trim()), 250);
        return () => clearTimeout(handle);
    }, [search]);

    useEffect(() => {
        if (currentStoreId && !fromStoreId) setFromStoreId(String(currentStoreId));
    }, [currentStoreId, fromStoreId]);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const { data: productsData, isFetching: searching } = useGetAllProductsQuery(
        { store_id: Number(fromStoreId), search: debouncedSearch || undefined, per_page: 20, light: true },
        { skip: !fromStoreId || !debouncedSearch }
    );

    const otherStores = useMemo(
        () => userStores.filter((s: any) => String(s.id) !== fromStoreId),
        [userStores, fromStoreId]
    );

    const productOptions = useMemo<ProductOption[]>(() => {
        if (!debouncedSearch) return [];
        const responseData = productsData?.data;
        const raw = Array.isArray(responseData)
            ? responseData
            : Array.isArray(responseData?.items)
                ? responseData.items
                : Array.isArray(responseData?.data)
                    ? responseData.data
                    : [];

        return raw.flatMap((product: any) => {
            const stocks = Array.isArray(product.stocks) ? product.stocks : [];
            return stocks
                .map((stock: any) => {
                    const variantName = stock.variant_data ? Object.values(stock.variant_data).join(' - ') : undefined;
                    return {
                        product_id: Number(product.id),
                        product_stock_id: Number(stock.id),
                        product_name: product.product_name || product.name || t('lbl_unknown_product'),
                        variant_name: variantName,
                        sku: stock.sku || product.sku,
                        unit: stock.unit || product.unit || 'pcs',
                        available_quantity: parseFloat(stock.quantity || '0') || 0,
                    };
                })
                .filter((opt: ProductOption) => opt.product_stock_id > 0 && opt.available_quantity > 0);
        });
    }, [productsData, debouncedSearch, t]);

    const addItem = (option: ProductOption) => {
        setDraftItems((prev) => {
            if (prev.some((i) => i.product_stock_id === option.product_stock_id)) return prev;
            return [
                ...prev,
                {
                    id: `${option.product_stock_id}-${Date.now()}`,
                    product_id: option.product_id,
                    product_stock_id: option.product_stock_id,
                    product_name: option.product_name,
                    variant_name: option.variant_name,
                    sku: option.sku,
                    unit: option.unit,
                    available_quantity: option.available_quantity,
                    quantity: option.available_quantity > 0 ? 1 : 0,
                },
            ];
        });
        setSearch('');
        setDebouncedSearch('');
        setIsDropdownOpen(false);
    };

    const updateQuantity = (id: string, quantity: number) => {
        setDraftItems((prev) =>
            prev.map((item) => {
                if (item.id !== id) return item;
                const valid = Math.max(1, Math.min(quantity, item.available_quantity));
                return { ...item, quantity: valid };
            })
        );
    };

    const removeItem = (id: string) => setDraftItems((prev) => prev.filter((i) => i.id !== id));

    const handleClearAll = async () => {
        if (draftItems.length === 0) return;
        const confirmed = await showConfirmDialog(t('transfer_clear_title'), t('transfer_clear_desc'), t('btn_yes_clear'));
        if (confirmed) setDraftItems([]);
    };

    const handleCreate = async () => {
        if (!fromStoreId || !toStoreId) return showMessage(t('transfer_select_stores'), 'error');
        if (fromStoreId === toStoreId) return showMessage(t('transfer_same_store_error'), 'error');
        if (draftItems.length === 0) return showMessage(t('transfer_add_products'), 'error');

        const invalid = draftItems.filter((i) => i.quantity < 1 || i.quantity > i.available_quantity);
        if (invalid.length > 0) return showMessage(t('transfer_check_quantities'), 'error');

        try {
            await createTransfer({
                store_id: Number(fromStoreId),
                to_store_id: Number(toStoreId),
                note: note || undefined,
                items: draftItems.map((i) => ({
                    product_id: i.product_id,
                    product_stock_id: i.product_stock_id,
                    quantity: i.quantity,
                })),
            }).unwrap();
            setDraftItems([]);
            setNote('');
            setToStoreId('');
            showMessage(t('transfer_created'), 'success');
            onCreated();
        } catch (err: any) {
            showMessage(err?.data?.message || t('msg_error_generic'), 'error');
        }
    };

    const totalQuantity = useMemo(() => draftItems.reduce((sum, i) => sum + i.quantity, 0), [draftItems]);
    const canCreate = fromStoreId && toStoreId && fromStoreId !== toStoreId && draftItems.length > 0 && !isLoading;

    return (
        <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
            {/* Store selection card */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Store className="h-4 w-4 text-primary" />
                    {t('transfer_route')}
                </div>
                <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('transfer_from_store')}</label>
                        <select
                            value={fromStoreId}
                            onChange={(e) => {
                                setFromStoreId(e.target.value);
                                setDraftItems([]);
                            }}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                        >
                            {userStores.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.store_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-center pb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-gray-500">{t('transfer_to_store')}</label>
                        <select
                            value={toStoreId}
                            onChange={(e) => setToStoreId(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                </div>
            </div>

            {/* Product picker */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <PackagePlus className="h-4 w-4 text-primary" />
                    {t('transfer_add_products')}
                </div>
                <div className="relative" ref={searchRef}>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />}
                    {search && !searching && (
                        <button
                            type="button"
                            onClick={() => { setSearch(''); setDebouncedSearch(''); setIsDropdownOpen(false); }}
                            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setIsDropdownOpen(true); }}
                        onFocus={() => debouncedSearch && setIsDropdownOpen(true)}
                        placeholder={t('transfer_search_product')}
                        className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />

                    {isDropdownOpen && (
                        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                            {searching && debouncedSearch ? (
                                <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-500">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('transfer_searching')}
                                </div>
                            ) : productOptions.length === 0 ? (
                                <div className="px-4 py-5 text-center text-sm text-gray-400">{t('msg_no_products_found')}</div>
                            ) : (
                                <ul className="divide-y divide-gray-50">
                                    {productOptions.map((opt) => {
                                        const disabled = opt.available_quantity <= 0 || draftItems.some((i) => i.product_stock_id === opt.product_stock_id);
                                        return (
                                            <li key={opt.product_stock_id}>
                                                <button
                                                    type="button"
                                                    disabled={disabled}
                                                    onClick={() => addItem(opt)}
                                                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${
                                                        disabled ? 'cursor-not-allowed bg-gray-50 text-gray-400' : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-gray-900">{opt.product_name}</p>
                                                        <p className="truncate text-xs text-gray-500">
                                                            {[opt.variant_name, opt.sku ? `SKU: ${opt.sku}` : null].filter(Boolean).join(' · ')}
                                                        </p>
                                                    </div>
                                                    <span className={`ml-3 flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${
                                                        opt.available_quantity > 10 ? 'bg-green-50 text-green-600' :
                                                        opt.available_quantity > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
                                                    }`}>
                                                        {t('transfer_available')}: {opt.available_quantity}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected items */}
                <div className="mt-4">
                    {draftItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
                            <Package className="mb-2 h-8 w-8 text-gray-300" />
                            <p className="text-sm font-medium text-gray-500">{t('transfer_empty_title')}</p>
                            <p className="mt-0.5 text-xs text-gray-400">{t('transfer_empty_desc')}</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr className="text-left text-xs font-semibold uppercase text-gray-500">
                                        <th className="px-3 py-2.5">{t('transfer_product')}</th>
                                        <th className="px-3 py-2.5">{t('transfer_available')}</th>
                                        <th className="px-3 py-2.5">{t('transfer_quantity')}</th>
                                        <th className="px-3 py-2.5 text-right">{t('lbl_action')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {draftItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-3">
                                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {[item.variant_name, item.sku ? `SKU: ${item.sku}` : null].filter(Boolean).join(' · ')}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3 text-gray-600">{item.available_quantity} {item.unit}</td>
                                            <td className="px-3 py-3">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={item.available_quantity}
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                                    className="w-24 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                                />
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                                                    aria-label={t('btn_remove')}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-3 py-2">
                                <span className="text-xs text-gray-500">{draftItems.length} {draftItems.length === 1 ? t('lbl_item') : t('lbl_items')} · {totalQuantity} {t('lbl_qty')}</span>
                                <button onClick={handleClearAll} className="text-xs font-semibold text-red-600 hover:text-red-700">{t('btn_clear')}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create action */}
            <button
                onClick={handleCreate}
                disabled={!canCreate}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Truck className="h-4 w-4" />
                )}
                {isLoading ? t('transfer_creating') : t('transfer_create')}
            </button>
        </div>
    );
}
