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
import { CheckCircle2, PackageCheck, Plus, Send, XCircle } from 'lucide-react';
import { useState } from 'react';

type Tab = 'outgoing' | 'incoming';

export default function TransferHistoryView({ onCreateNew }: { onCreateNew: () => void }) {
    const { t } = useTranslation();
    const { currentStoreId } = useCurrentStore();
    const [tab, setTab] = useState<Tab>('outgoing');
    const [selectedTransferId, setSelectedTransferId] = useState<number | null>(null);

    const { data: transfersData, refetch: refetchList } = useGetStockTransfersQuery(
        { store_id: currentStoreId, direction: tab },
        { skip: !currentStoreId }
    );
    const { data: transferData, refetch: refetchDetail } = useGetStockTransferQuery(
        { id: selectedTransferId as number, store_id: currentStoreId },
        { skip: !selectedTransferId || !currentStoreId }
    );
    const [shipTransfer] = useShipStockTransferMutation();
    const [receiveTransfer] = useReceiveStockTransferMutation();
    const [cancelTransfer] = useCancelStockTransferMutation();

    const transfers = transfersData?.data?.transfers || [];
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

    return (
        <div className="space-y-4 p-4 sm:p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{t('transfer_history')}</h2>
                <button
                    onClick={onCreateNew}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
                >
                    <Plus className="h-3.5 w-3.5" /> {t('transfer_new')}
                </button>
            </div>

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
