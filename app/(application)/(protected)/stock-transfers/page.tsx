'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import { useGetAllProductsQuery } from '@/store/features/Product/productApi';
import {
    useCancelStockTransferMutation,
    useCreateStockTransferMutation,
    useGetStockTransferQuery,
    useGetStockTransfersQuery,
    useReceiveStockTransferMutation,
    useShipStockTransferMutation,
} from '@/store/features/stockTransfer/stockTransferApi';
import { ArrowRightLeft, CheckCircle2, Loader2, Package, PackageCheck, Plus, Search, Send, Trash2, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Tab = 'outgoing' | 'incoming';

interface DraftItem {
    product_id: number;
    product_stock_id: number;
    product_name: string;
    variant_name?: string;
    available_quantity: number;
    quantity: number;
}

interface ProductOption {
    product_id: number;
    product_stock_id: number;
    product_name: string;
    variant_name?: string;
    sku?: string;
    available_quantity: number;
    selected: boolean;
}

export default function StockTransfersPage() {
    const { t } = getTranslation();
    const { currentStoreId, userStores } = useCurrentStore();
    const [tab, setTab] = useState<Tab>('outgoing');
    const [showForm, setShowForm] = useState(false);
    const [toStoreId, setToStoreId] = useState('');
    const [note, setNote] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [debouncedProductSearch, setDebouncedProductSearch] = useState('');
    const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
    const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);

    useEffect(() => {
        const handle = setTimeout(() => setDebouncedProductSearch(productSearch.trim()), 300);
        return () => clearTimeout(handle);
    }, [productSearch]);

    const { data: transfersData, refetch: refetchList } = useGetStockTransfersQuery(
        { store_id: currentStoreId, direction: tab }, { skip: !currentStoreId }
    );
    const { data: transferData, refetch: refetchDetail } = useGetStockTransferQuery(
        { id: selectedTransferId as number, store_id: currentStoreId },
        { skip: !selectedTransferId || !currentStoreId }
    );
    const { data: productsData, isFetching: searchingProducts } = useGetAllProductsQuery(
        { store_id: currentStoreId, search: debouncedProductSearch || undefined, per_page: 24, light: true },
        { skip: !currentStoreId || !debouncedProductSearch }
    );
    const [createTransfer] = useCreateStockTransferMutation();
    const [shipTransfer] = useShipStockTransferMutation();
    const [receiveTransfer] = useReceiveStockTransferMutation();
    const [cancelTransfer] = useCancelStockTransferMutation();

    const transfers = transfersData?.data?.transfers || [];
    const transfer = transferData?.data?.transfer;
    const destinationStores = useMemo(
        () => userStores.filter((s: any) => Number(s.id) !== Number(currentStoreId)),
        [userStores, currentStoreId]
    );
    const searchResults = useMemo<ProductOption[]>(() => {
        if (!debouncedProductSearch) return [];
        const rawProducts = productsData?.data?.data || productsData?.data || [];
        if (!Array.isArray(rawProducts)) return [];

        return rawProducts.flatMap((product: any) => {
            const stocks = Array.isArray(product.stocks) ? product.stocks : [];
            return stocks
                .map((stock: any) => {
                    const variantName = stock.variant_data ? Object.values(stock.variant_data).join(' - ') : undefined;
                    const availableQuantity = parseFloat(stock.quantity || '0') || 0;
                    const productStockId = Number(stock.id);

                    return {
                        product_id: Number(product.id),
                        product_stock_id: productStockId,
                        product_name: product.product_name || product.name || 'Unknown product',
                        variant_name: variantName,
                        sku: stock.sku || product.sku,
                        available_quantity: availableQuantity,
                        selected: draftItems.some((item) => item.product_stock_id === productStockId),
                    };
                })
                .filter((stock: ProductOption) => stock.product_stock_id > 0);
        });
    }, [productsData, debouncedProductSearch, draftItems]);

    const addSearchResult = (product: ProductOption) => {
        if (product.selected || product.available_quantity <= 0) return;
        setDraftItems((prev) => [
            ...prev,
            {
                product_id: product.product_id,
                product_stock_id: product.product_stock_id,
                product_name: product.product_name,
                variant_name: product.variant_name,
                available_quantity: product.available_quantity,
                quantity: 1,
            },
        ]);
        setProductSearch('');
        setDebouncedProductSearch('');
    };

    const updateQuantity = (productStockId: number, quantity: number) => {
        setDraftItems((prev) => prev.map((d) => (d.product_stock_id === productStockId ? { ...d, quantity } : d)));
    };

    const removeItem = (productStockId: number) => {
        setDraftItems((prev) => prev.filter((d) => d.product_stock_id !== productStockId));
    };

    const handleCreate = async () => {
        if (!toStoreId || draftItems.length === 0) return showMessage(t('transfer_fields_required'), 'error');
        try {
            await createTransfer({
                store_id: currentStoreId,
                to_store_id: Number(toStoreId),
                note: note || undefined,
                items: draftItems.map((d) => ({ product_id: d.product_id, product_stock_id: d.product_stock_id, quantity: d.quantity })),
            }).unwrap();
            setToStoreId('');
            setNote('');
            setDraftItems([]);
            setShowForm(false);
            refetchList();
            showMessage(t('transfer_created'), 'success');
        } catch (err: any) {
            showMessage(err?.data?.message || t('msg_error_generic'), 'error');
        }
    };

    const handleShip = async (id: number) => {
        try {
            await shipTransfer({ id, store_id: currentStoreId }).unwrap();
            refetchDetail();
            refetchList();
            showMessage(t('transfer_shipped'), 'success');
        } catch (err: any) {
            showMessage(err?.data?.message || t('msg_error_generic'), 'error');
        }
    };

    const handleReceive = async (id: number) => {
        try {
            await receiveTransfer({ id, store_id: currentStoreId }).unwrap();
            refetchDetail();
            refetchList();
            showMessage(t('transfer_received'), 'success');
        } catch (err: any) {
            showMessage(err?.data?.message || t('msg_error_generic'), 'error');
        }
    };

    const handleCancel = async (id: number) => {
        try {
            await cancelTransfer({ id, store_id: currentStoreId }).unwrap();
            refetchDetail();
            refetchList();
            showMessage(t('transfer_cancelled'), 'success');
        } catch (err: any) {
            showMessage(err?.data?.message || t('msg_error_generic'), 'error');
        }
    };

    return (
        <div className="space-y-5 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                        <ArrowRightLeft className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('transfer_title')}</h1>
                        <p className="text-sm text-gray-500">{t('transfer_desc')}</p>
                    </div>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90">
                    <Plus className="h-3.5 w-3.5" /> {t('transfer_new')}
                </button>
            </div>

            {showForm && (
                <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <select className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={toStoreId} onChange={(e) => setToStoreId(e.target.value)}>
                            <option value="">{t('transfer_select_destination')}</option>
                            {destinationStores.map((s: any) => <option key={s.id} value={s.id}>{s.store_name}</option>)}
                        </select>
                        <input type="text" className="rounded-lg border border-gray-200 px-3 py-2 text-sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('transfer_note_placeholder')} />
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">{t('transfer_product')}</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            {searchingProducts ? (
                                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
                            ) : productSearch ? (
                                <button
                                    type="button"
                                    aria-label="Clear product search"
                                    onClick={() => {
                                        setProductSearch('');
                                        setDebouncedProductSearch('');
                                    }}
                                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            ) : null}
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                placeholder={t('transfer_search_product')}
                            />
                        </div>

                        {debouncedProductSearch && !searchingProducts && searchResults.length === 0 && (
                            <p className="mt-3 rounded-lg border border-dashed border-gray-200 px-4 py-5 text-center text-sm text-gray-400">{t('msg_no_products_found')}</p>
                        )}

                        {searchResults.length > 0 && (
                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                {searchResults.map((product) => {
                                    const disabled = product.selected || product.available_quantity <= 0;
                                    return (
                                        <button
                                            key={product.product_stock_id}
                                            type="button"
                                            onClick={() => addSearchResult(product)}
                                            disabled={disabled}
                                            className={`group flex min-h-[118px] flex-col rounded-lg border p-3 text-left transition ${
                                                disabled
                                                    ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-70'
                                                    : 'border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-slate-50">
                                                    <Package className="h-4 w-4 text-slate-400" />
                                                </div>
                                                <span
                                                    className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                                                        product.available_quantity > 10
                                                            ? 'bg-green-50 text-green-600'
                                                            : product.available_quantity > 0
                                                            ? 'bg-amber-50 text-amber-600'
                                                            : 'bg-red-50 text-red-500'
                                                    }`}
                                                >
                                                    {t('transfer_available')}: {product.available_quantity}
                                                </span>
                                            </div>
                                            <p className="line-clamp-2 text-sm font-semibold text-gray-900">{product.product_name}</p>
                                            <div className="mt-1 min-h-[18px] text-xs text-gray-400">
                                                {[product.variant_name, product.sku ? `SKU: ${product.sku}` : null].filter(Boolean).join(' · ')}
                                            </div>
                                            <div className="mt-auto pt-2 text-xs font-semibold text-primary">
                                                {product.selected ? t('msg_item_added_to_order') : product.available_quantity <= 0 ? t('lbl_out_of_stock') : t('btn_add')}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {draftItems.length > 0 && (
                        <div className="space-y-2">
                            {draftItems.map((item) => (
                                <div key={item.product_stock_id} className="flex flex-col gap-3 rounded-lg bg-white px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <span className="font-medium text-gray-900">{item.product_name}</span>
                                        {item.variant_name && <span className="ml-1 text-xs text-gray-400">({item.variant_name})</span>}
                                        <span className="mt-0.5 block text-xs text-gray-400">{t('transfer_available')}: {item.available_quantity}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                                        <input
                                            type="number"
                                            min={0.01}
                                            max={item.available_quantity}
                                            className="w-24 rounded border border-gray-200 px-2 py-1.5 text-sm"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.product_stock_id, Number(e.target.value))}
                                        />
                                        <button onClick={() => removeItem(item.product_stock_id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button onClick={handleCreate} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{t('transfer_create')}</button>
                </div>
            )}

            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                {([
                    { key: 'outgoing' as Tab, label: t('transfer_outgoing_tab') },
                    { key: 'incoming' as Tab, label: t('transfer_incoming_tab') },
                ]).map((tb) => (
                    <button
                        key={tb.key}
                        onClick={() => { setTab(tb.key); setSelectedTransferId(null); }}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                            tab === tb.key ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tb.label}
                    </button>
                ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-1">
                    {transfers.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400">{t('transfer_no_records')}</p>
                    ) : (
                        <div className="space-y-2">
                            {transfers.map((tr: any) => (
                                <button
                                    key={tr.id}
                                    onClick={() => setSelectedTransferId(tr.id)}
                                    className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                                        selectedTransferId === tr.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">{tr.from_store?.store_name} → {tr.to_store?.store_name}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                            tr.status === 'received' ? 'bg-emerald-100 text-emerald-700' :
                                            tr.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                            tr.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                        }`}>{tr.status}</span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-400">#{tr.id}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-2">
                    {!transfer ? (
                        <p className="py-10 text-center text-sm text-gray-400">{t('transfer_select_one')}</p>
                    ) : (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700">
                                    {transfer.from_store?.store_name} → {transfer.to_store?.store_name}
                                </h3>
                                <div className="flex gap-2">
                                    {transfer.status === 'pending' && Number(transfer.from_store_id) === Number(currentStoreId) && (
                                        <>
                                            <button onClick={() => handleShip(transfer.id)} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                                                <Send className="h-3.5 w-3.5" /> {t('transfer_ship')}
                                            </button>
                                            <button onClick={() => handleCancel(transfer.id)} className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
                                                <XCircle className="h-3.5 w-3.5" /> {t('transfer_cancel')}
                                            </button>
                                        </>
                                    )}
                                    {transfer.status === 'shipped' && Number(transfer.to_store_id) === Number(currentStoreId) && (
                                        <button onClick={() => handleReceive(transfer.id)} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                                            <PackageCheck className="h-3.5 w-3.5" /> {t('transfer_receive')}
                                        </button>
                                    )}
                                    {transfer.status === 'received' && (
                                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> {t('transfer_received_label')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {transfer.note && <p className="mb-3 text-xs text-gray-400">{transfer.note}</p>}

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase">
                                            <th className="px-3 py-2">{t('transfer_product')}</th>
                                            <th className="px-3 py-2">{t('transfer_quantity')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(transfer.items || []).map((item: any) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2.5 font-medium text-gray-900">{item.source_product?.product_name}</td>
                                                <td className="px-3 py-2.5">{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
