'use client';

import { Dialog, Transition } from '@headlessui/react';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { canSettleClosedDrawerSession, getEligibleSettlementAccounts } from '@/lib/cashDrawerSettlement';
import { hasAnyPermission } from '@/lib/permissions';
import { RootState } from '@/store';
import { useGetAccountsQuery } from '@/store/features/accounting/accountingApi';
import { useGetBankAccountsQuery } from '@/store/features/bank/bankApi';
import { useGetDrawerSessionsQuery, useGetDrawersQuery, useReverseDrawerMovementMutation, useSettleDrawerSessionMutation } from '@/store/features/cashDrawer/cashDrawerApi';
import { AlertTriangle, ArrowDownUp, CheckCircle2, Lock, RotateCcw, Unlock, Vault } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

export default function CashDrawerHistoryPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const [page, setPage] = useState(1);
    const [movementToReverse, setMovementToReverse] = useState<any | null>(null);
    const [reverseReason, setReverseReason] = useState('');
    const [sessionToSettle, setSessionToSettle] = useState<any | null>(null);
    const [destinationAccountId, setDestinationAccountId] = useState('');
    const [settlementReason, setSettlementReason] = useState('');
    const [settlementError, setSettlementError] = useState('');
    const [settlementResult, setSettlementResult] = useState<any | null>(null);
    const user = useSelector((state: RootState) => state.auth?.user);
    const canReverse = hasAnyPermission(user, ['cash-drawer.movement.reverse']);
    const canSettle = hasAnyPermission(user, ['cash-drawer.settle']);
    const [reverseMovement, { isLoading: isReversing }] = useReverseDrawerMovementMutation();
    const [settleDrawerSession, { isLoading: isSettling }] = useSettleDrawerSessionMutation();

    const { data: drawersData } = useGetDrawersQuery(currentStoreId ? { store_id: currentStoreId } : undefined, { skip: !currentStoreId });
    const drawer = drawersData?.data?.drawers?.[0];

    const { data: sessionsData, isFetching, refetch: refetchSessions } = useGetDrawerSessionsQuery(
        drawer && currentStoreId ? { drawerId: drawer.id, store_id: currentStoreId, page, per_page: 20 } : (undefined as any),
        { skip: !drawer || !currentStoreId }
    );

    const { data: accountsData, isFetching: isFetchingAccounts, isError: isAccountsError } = useGetAccountsQuery(
        currentStoreId ? { store_id: currentStoreId } : undefined,
        { skip: !currentStoreId || !canSettle }
    );
    const { data: bankAccountsData, isFetching: isFetchingBankAccounts, isError: isBankAccountsError } = useGetBankAccountsQuery(
        currentStoreId ? { store_id: currentStoreId } : undefined,
        { skip: !currentStoreId || !canSettle }
    );

    const eligibleDestinationAccounts = useMemo(() => {
        const accounts = Array.isArray(accountsData?.data) ? accountsData.data : [];
        const bankAccounts = Array.isArray(bankAccountsData?.data?.accounts) ? bankAccountsData.data.accounts : [];
        return getEligibleSettlementAccounts(accounts, bankAccounts);
    }, [accountsData, bankAccountsData]);

    const paginator = sessionsData?.data?.sessions;
    const sessions = paginator?.data || [];
    const lastPage = paginator?.last_page || 1;

    const handleReverse = async () => {
        if (!drawer || !currentStoreId || !movementToReverse || !reverseReason.trim()) return;
        try {
            await reverseMovement({ drawerId: drawer.id, movementId: movementToReverse.id, store_id: currentStoreId, reason: reverseReason.trim() }).unwrap();
            toast.success(t('cash_drawer_reverse_success') || 'Movement reversed');
            setMovementToReverse(null);
            setReverseReason('');
        } catch (error: any) {
            toast.error(error?.data?.message || t('cash_drawer_reverse_failed') || 'Could not reverse movement');
        }
    };

    const openSettlement = (session: any) => {
        setSessionToSettle(session);
        setDestinationAccountId('');
        setSettlementReason('');
        setSettlementError('');
        setSettlementResult(null);
    };

    const closeSettlement = () => {
        if (isSettling) return;
        setSessionToSettle(null);
        setSettlementError('');
        setSettlementResult(null);
    };

    const handleSettlement = async () => {
        if (!drawer || !currentStoreId || !sessionToSettle || !destinationAccountId || !settlementReason.trim()) return;
        try {
            const response = await settleDrawerSession({
                drawerId: drawer.id,
                sessionId: sessionToSettle.id,
                store_id: currentStoreId,
                destination_account_id: Number(destinationAccountId),
                reason: settlementReason.trim(),
            }).unwrap();
            const settlement = response?.data?.settlement;
            setSettlementResult(settlement);
            setSettlementError('');
            toast.success(t('cash_drawer_settlement_success') || 'Drawer settlement posted');
            refetchSessions();
        } catch (error: any) {
            const message = error?.data?.message || t('cash_drawer_settlement_failed') || 'Could not settle drawer session';
            setSettlementError(message);
            toast.error(message);
        }
    };

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
                            const canSettleSession = canSettleClosedDrawerSession(session, canSettle);
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
                                    {canSettleSession && (
                                        <button onClick={() => openSettlement(session)} className="btn btn-outline-primary btn-sm shrink-0">
                                            {t('cash_drawer_settle') || 'Settle clearing'}
                                        </button>
                                    )}
                                    <div className="mt-2 border-t border-gray-100 pt-2">
                                        <div className="mb-1 text-xs font-semibold text-gray-500">{t('cash_drawer_movements') || 'Movements'}</div>
                                        {(session.movements || []).map((movement: any) => {
                                            const reversible = isOpen && canReverse && movement.status !== 'voided' && !movement.reverses_movement_id && !movement.reversal_movement_id;
                                            return <div key={movement.id} className="flex items-center justify-between gap-2 py-1 text-xs">
                                                <span className={movement.status === 'voided' ? 'text-gray-400 line-through' : 'text-gray-700'}>{movement.type} · {formatCurrency(movement.amount)}</span>
                                                <span className="flex items-center gap-2">
                                                    {movement.status === 'voided' && <span className="text-amber-700">{t('cash_drawer_reversed_status') || 'Reversed'}</span>}
                                                    {reversible && <button onClick={() => setMovementToReverse(movement)} className="inline-flex items-center gap-1 rounded border border-danger/30 px-2 py-1 font-semibold text-danger hover:bg-danger/5"><RotateCcw className="h-3 w-3" />{t('cash_drawer_reverse') || 'Reverse'}</button>}
                                                </span>
                                            </div>;
                                        })}
                                        {!isOpen && <p className="mt-1 text-xs text-gray-400">{t('cash_drawer_reverse_closed_blocked') || 'Closed-session movements cannot be reversed.'}</p>}
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

            <Transition appear show={!!movementToReverse} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => !isReversing && setMovementToReverse(null)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/60" /></Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4"><Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
                            <Dialog.Title className="text-base font-bold text-gray-900">{t('cash_drawer_reverse_title') || 'Reverse cash movement'}</Dialog.Title>
                            <p className="mt-2 text-sm text-gray-600">{t('cash_drawer_reverse_effect') || 'This preserves the original record, marks it reversed, and creates an immutable opposite cash movement. It changes the open drawer balance by the opposite amount.'}</p>
                            <p className="mt-2 text-xs text-amber-700">{t('cash_drawer_reverse_audit') || 'Your name, time, and required reason are permanently recorded. This action cannot be undone.'}</p>
                            <textarea value={reverseReason} onChange={(event) => setReverseReason(event.target.value)} maxLength={1000} placeholder={t('cash_drawer_reverse_reason') || 'Reason for reversal (required)'} className="form-textarea mt-4 w-full" rows={3} autoFocus />
                            <div className="mt-5 flex justify-end gap-2"><button onClick={() => setMovementToReverse(null)} disabled={isReversing} className="btn btn-outline-secondary btn-sm">{t('btn_cancel') || 'Cancel'}</button><button onClick={handleReverse} disabled={isReversing || !reverseReason.trim()} className="btn btn-danger btn-sm">{t('cash_drawer_reverse') || 'Reverse'}</button></div>
                        </Dialog.Panel>
                    </Transition.Child></div></div>
                </Dialog>
            </Transition>

            <Transition appear show={!!sessionToSettle} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeSettlement}>
                    <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/60" /></Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4"><Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
                            <Dialog.Title className="text-base font-bold text-gray-900">{t('cash_drawer_settlement_title') || 'Settle closed drawer'}</Dialog.Title>
                            <p className="mt-2 text-sm text-gray-600">{t('cash_drawer_settlement_hint') || 'Move the authoritative cash-sale clearing balance to a same-store cash or bank account. Counted cash and variance are not used for this settlement.'}</p>

                            {settlementResult ? (
                                <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-4">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" />{t('cash_drawer_settlement_success') || 'Drawer settlement posted'}</div>
                                    <div className="mt-2 text-xs text-gray-500">{t('cash_drawer_settlement_authoritative_amount') || 'Authoritative clearing settlement amount'}</div>
                                    <div className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(Number(settlementResult.amount || 0))}</div>
                                </div>
                            ) : (
                                <>
                                    {(isAccountsError || isBankAccountsError) && <div className="mt-4 rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs text-danger">{t('cash_drawer_settlement_accounts_error') || 'Eligible same-store destination accounts could not be loaded. Settlement is blocked.'}</div>}
                                    {!isFetchingAccounts && !isFetchingBankAccounts && !isAccountsError && !isBankAccountsError && eligibleDestinationAccounts.length === 0 && <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">{t('cash_drawer_settlement_no_destination') || 'No eligible same-store Cash-in-Hand or active Bank account is available.'}</div>}
                                    <label className="mt-4 block text-xs font-semibold text-gray-700">{t('cash_drawer_settlement_destination') || 'Destination account'}</label>
                                    <select value={destinationAccountId} onChange={(event) => setDestinationAccountId(event.target.value)} disabled={isFetchingAccounts || isFetchingBankAccounts || eligibleDestinationAccounts.length === 0} className="form-select mt-1 w-full text-sm">
                                        <option value="">{isFetchingAccounts || isFetchingBankAccounts ? (t('loading') || 'Loading...') : (t('cash_drawer_settlement_select_destination') || 'Select a destination account')}</option>
                                        {eligibleDestinationAccounts.map((account: any) => <option key={account.id} value={account.id}>{account.name}{account.subtype === 'bank' ? ` · ${t('cash_drawer_settlement_bank') || 'Bank'}` : ` · ${t('cash_drawer_settlement_cash') || 'Cash'}`}</option>)}
                                    </select>
                                    <label className="mt-3 block text-xs font-semibold text-gray-700">{t('cash_drawer_settlement_reason') || 'Reason'}</label>
                                    <textarea value={settlementReason} onChange={(event) => setSettlementReason(event.target.value)} maxLength={1000} rows={3} className="form-textarea mt-1 w-full text-sm" placeholder={t('cash_drawer_settlement_reason_placeholder') || 'Reason for settlement (required)'} />
                                    {settlementError && <div className="mt-3 flex gap-2 rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs text-danger"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{settlementError}</span></div>}
                                    <p className="mt-3 text-xs text-gray-500">{t('cash_drawer_settlement_authoritative_notice') || 'The backend will calculate and return the authoritative clearing amount. Manual counted cash is not a settlement amount.'}</p>
                                </>
                            )}
                            <div className="mt-5 flex justify-end gap-2"><button onClick={closeSettlement} disabled={isSettling} className="btn btn-outline-secondary btn-sm">{t('btn_cancel') || 'Cancel'}</button>{!settlementResult && <button onClick={handleSettlement} disabled={isSettling || !destinationAccountId || settlementReason.trim().length < 3 || eligibleDestinationAccounts.length === 0} className="btn btn-primary btn-sm">{isSettling ? (t('processing') || 'Processing...') : (t('cash_drawer_settle') || 'Settle clearing')}</button>}</div>
                        </Dialog.Panel>
                    </Transition.Child></div></div>
                </Dialog>
            </Transition>
        </div>
    );
}
