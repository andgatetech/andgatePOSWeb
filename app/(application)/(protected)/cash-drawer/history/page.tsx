'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetDrawerSessionsQuery, useGetDrawersQuery } from '@/store/features/cashDrawer/cashDrawerApi';
import { ArrowDownUp, Lock, Unlock, Vault } from 'lucide-react';
import { useState } from 'react';

export default function CashDrawerHistoryPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const [page, setPage] = useState(1);

    const { data: drawersData } = useGetDrawersQuery(currentStoreId ? { store_id: currentStoreId } : undefined, { skip: !currentStoreId });
    const drawer = drawersData?.data?.drawers?.[0];

    const { data: sessionsData, isFetching } = useGetDrawerSessionsQuery(
        drawer && currentStoreId ? { drawerId: drawer.id, store_id: currentStoreId, page, per_page: 20 } : (undefined as any),
        { skip: !drawer || !currentStoreId }
    );

    const paginator = sessionsData?.data?.sessions;
    const sessions = paginator?.data || [];
    const lastPage = paginator?.last_page || 1;

    return (
        <div className="space-y-5 p-4 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                    <Vault className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('cash_drawer_history_title') || 'Cash Drawer History'}</h1>
                    <p className="text-sm text-gray-500">{drawer?.name}</p>
                </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                {!drawer ? (
                    <div className="py-10 text-center text-sm text-gray-400">{t('lbl_loading') || 'Loading...'}</div>
                ) : sessions.length === 0 && !isFetching ? (
                    <div className="py-10 text-center text-sm text-gray-400">{t('closing_empty') || 'No records yet'}</div>
                ) : (
                    <div className="space-y-2">
                        {sessions.map((session: any) => {
                            const isOpen = session.status === 'open';
                            const variance = parseFloat(session.variance || 0);
                            return (
                                <div key={session.id} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            {isOpen ? <Unlock className="h-4 w-4 text-success" /> : <Lock className="h-4 w-4 text-gray-400" />}
                                            <span className="font-semibold text-gray-900">{formatCurrency(session.opening_float || 0)}</span>
                                            {!isOpen && (
                                                <span className={`text-xs font-medium ${variance < 0 ? 'text-danger' : variance > 0 ? 'text-success' : 'text-gray-400'}`}>
                                                    ({variance > 0 ? '+' : ''}{formatCurrency(variance)})
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                            <span>{t('cash_drawer_opening_float_label') || 'Opened'}: {new Date(session.opened_at).toLocaleString('en-BD')}</span>
                                            {session.closed_at && <span>· {t('cash_drawer_close') || 'Closed'}: {new Date(session.closed_at).toLocaleString('en-BD')}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-right text-xs text-gray-500">
                                        {!isOpen && (
                                            <>
                                                <div>
                                                    <div className="flex items-center justify-end gap-1 text-gray-400"><ArrowDownUp className="h-3 w-3" /> {t('closing_expected') || 'Expected'}</div>
                                                    <div className="font-semibold text-gray-700">{formatCurrency(session.expected_cash || 0)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-400">{t('cash_drawer_actual_cash_label') || 'Counted'}</div>
                                                    <div className="font-semibold text-gray-700">{formatCurrency(session.actual_cash || 0)}</div>
                                                </div>
                                            </>
                                        )}
                                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${isOpen ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-600'}`}>
                                            {isOpen ? t('cash_drawer_running_total') || 'Open' : t('closing_status_submitted') || 'Closed'}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {lastPage > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40">
                            {t('btn_prev') || 'Prev'}
                        </button>
                        <span className="text-xs text-gray-500">{page} / {lastPage}</span>
                        <button disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40">
                            {t('btn_next') || 'Next'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
