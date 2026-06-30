'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { showMessage } from '@/lib/toast';
import {
    useCancelStockTransferMutation,
    useGetStockTransferQuery,
    useGetStockTransfersQuery,
    useReceiveStockTransferMutation,
    useShipStockTransferMutation,
} from '@/store/features/stockTransfer/stockTransferApi';
import { ArrowRight, CheckCircle2, ClipboardList, PackageCheck, Plus, Send, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

type Tab = 'all' | 'outgoing' | 'incoming';

const formatTransferDateTime = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function TransferHistoryView({ onCreateNew }: { onCreateNew: () => void }) {
    const { t } = useTranslation();
    const { currentStoreId } = useCurrentStore();
    const [tab, setTab] = useState<Tab>('all');
    const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);

    const { data: transfersData, refetch: refetchList } = useGetStockTransfersQuery(
        { store_id: Number(currentStoreId), direction: tab === 'all' ? undefined : tab },
        { skip: !currentStoreId }
    );
    const { data: transferData, refetch: refetchDetail } = useGetStockTransferQuery(
        { id: selectedTransferId as number, store_id: currentStoreId },
        { skip: !selectedTransferId || !currentStoreId }
    );
    const [shipTransfer] = useShipStockTransferMutation();
    const [receiveTransfer] = useReceiveStockTransferMutation();
    const [cancelTransfer] = useCancelStockTransferMutation();

    const transfers = useMemo(() => {
        const data = transfersData?.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.transfers)) return data.transfers;
        if (Array.isArray(data?.items)) return data.items;
        return [];
    }, [transfersData]);
    const transfer = transferData?.data?.transfer;

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

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            received: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            shipped: 'bg-blue-50 text-blue-700 border-blue-100',
            cancelled: 'bg-red-50 text-red-700 border-red-100',
            pending: 'bg-amber-50 text-amber-700 border-amber-100',
        };
        return map[status] || 'bg-gray-50 text-gray-600 border-gray-100';
    };

    return (
        <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    {t('transfer_history')}
                </div>
                <button
                    onClick={onCreateNew}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
                >
                    <Plus className="h-3.5 w-3.5" /> {t('transfer_new')}
                </button>
            </div>

            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                {([
                    { key: 'all' as Tab, label: t('transfer_all_tab') },
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

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm lg:col-span-1">
                    {transfers.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">{t('transfer_no_records')}</p>
                    ) : (
                        <div className="space-y-2">
                            {transfers.map((tr: any) => (
                                <button
                                    key={tr.id}
                                    onClick={() => setSelectedTransferId(tr.id)}
                                    className={`w-full rounded-lg border px-3 py-3 text-left text-sm transition-all ${
                                        selectedTransferId === tr.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-1.5 font-medium text-gray-900">
                                            {tr.from_store?.store_name} <ArrowRight className="h-3 w-3 text-gray-400" /> {tr.to_store?.store_name}
                                        </span>
                                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadge(tr.status)}`}>
                                            {tr.status}
                                        </span>
                                    </div>
                                    <div className="mt-2 space-y-0.5 text-xs text-gray-400">
                                        <p>#{tr.id} · {(tr.items || []).length} {t('lbl_items')}</p>
                                        <p>{t('transfer_created_at')}: {formatTransferDateTime(tr.created_at)}</p>
                                        {tr.shipped_at && <p>{t('transfer_shipped_at')}: {formatTransferDateTime(tr.shipped_at)}</p>}
                                        {tr.received_at && <p>{t('transfer_received_at')}: {formatTransferDateTime(tr.received_at)}</p>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
                    {!transfer ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ClipboardList className="mb-3 h-12 w-12 text-gray-200" />
                            <p className="text-sm font-medium text-gray-500">{t('transfer_select_one')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {transfer.from_store?.store_name} <span className="mx-1 text-gray-400">→</span> {transfer.to_store?.store_name}
                                    </h3>
                                    <p className="text-xs text-gray-400">#{transfer.id}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {transfer.status === 'pending' && Number(transfer.from_store_id) === Number(currentStoreId) && (
                                        <>
                                            <button onClick={() => handleShip(transfer.id)} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                                                <Send className="h-3.5 w-3.5" /> {t('transfer_ship')}
                                            </button>
                                            <button onClick={() => handleCancel(transfer.id)} className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
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

                            <div className="grid gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600 sm:grid-cols-3">
                                <div>
                                    <p className="font-semibold text-gray-500">{t('transfer_created_at')}</p>
                                    <p className="mt-0.5 text-gray-900">{formatTransferDateTime(transfer.created_at)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-500">{t('transfer_shipped_at')}</p>
                                    <p className="mt-0.5 text-gray-900">{formatTransferDateTime(transfer.shipped_at)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-500">{t('transfer_received_at')}</p>
                                    <p className="mt-0.5 text-gray-900">{formatTransferDateTime(transfer.received_at)}</p>
                                </div>
                            </div>

                            {transfer.note && <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">{transfer.note}</p>}

                            <div className="overflow-hidden rounded-lg border border-gray-100">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr className="text-left text-xs font-semibold uppercase text-gray-500">
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
