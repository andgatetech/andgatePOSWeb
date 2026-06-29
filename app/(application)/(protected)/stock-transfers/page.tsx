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
import { ArrowRightLeft, CheckCircle2, PackageCheck, Plus, Send, Trash2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

type Tab = 'outgoing' | 'incoming';

interface DraftItem {
    product_id: number;
    product_stock_id: number;
    product_name: string;
    variant_name?: string;
    available_quantity: number;
    quantity: number;
}

export default function StockTransfersPage() {
    const { t } = getTranslation();
    const { currentStoreId, userStores } = useCurrentStore();
    const [tab, setTab] = useState<Tab>('outgoing');
    const [showForm, setShowForm] = useState(false);
    const [toStoreId, setToStoreId] = useState('');
    const [note, setNote] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
    const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);

    const { data: transfersData, refetch: refetchList } = useGetStockTransfersQuery(
        { store_id: currentStoreId, direction: tab }, { skip: !currentStoreId }
    );
    const { data: transferData, refetch: refetchDetail } = useGetStockTransferQuery(
        { id: selectedTransferId as number, store_id: currentStoreId },
        { skip: !selectedTransferId || !currentStoreId }
    );
    const { data: productsData } = useGetAllProductsQuery(
        { store_id: currentStoreId, search: productSearch || undefined, per_page: 10, light: true },
        { skip: !currentStoreId || !productSearch.trim() }
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
    const searchResults = productsData?.data?.data || productsData?.data || [];

    const addItem = (product: any, stock: any) => {
        if (draftItems.some((d) => d.product_stock_id === stock.id)) return;
        setDraftItems((prev) => [
            ...prev,
            {
                product_id: product.id,
                product_stock_id: stock.id,
                product_name: product.product_name,
                variant_name: stock.variant_data ? Object.values(stock.variant_data).join(' - ') : undefined,
                available_quantity: parseFloat(stock.quantity || '0'),
                quantity: 1,
            },
        ]);
        setProductSearch('');
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

                    <div className="relative">
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder={t('transfer_search_product')}
                        />
                        {productSearch.trim() && searchResults.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-56 overflow-y-auto">
                                {searchResults.map((p: any) => (
                                    (p.stocks || []).map((s: any) => (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => addItem(p, s)}
                                            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50"
                                        >
                                            <span>{p.product_name} {s.variant_data ? `(${Object.values(s.variant_data).join(' - ')})` : ''}</span>
                                            <span className="text-xs text-gray-400">{t('transfer_available')}: {s.quantity}</span>
                                        </button>
                                    ))
                                ))}
                            </div>
                        )}
                    </div>

                    {draftItems.length > 0 && (
                        <div className="space-y-1.5">
                            {draftItems.map((item) => (
                                <div key={item.product_stock_id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-900">{item.product_name}</span>
                                        {item.variant_name && <span className="ml-1 text-xs text-gray-400">({item.variant_name})</span>}
                                        <span className="ml-2 text-xs text-gray-400">{t('transfer_available')}: {item.available_quantity}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min={0.01}
                                            max={item.available_quantity}
                                            className="w-20 rounded border border-gray-200 px-2 py-1 text-sm"
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
