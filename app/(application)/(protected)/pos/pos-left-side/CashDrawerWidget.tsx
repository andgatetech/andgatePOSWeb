'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Banknote, Lock, Unlock } from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import {
    useCloseDrawerMutation,
    useCreateDrawerMutation,
    useGetCurrentDrawerSessionQuery,
    useGetDrawersQuery,
    useOpenDrawerMutation,
    useRecordDrawerMovementMutation,
} from '@/store/features/cashDrawer/cashDrawerApi';

const CashDrawerWidget = () => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const { currentStoreId } = useCurrentStore();

    const [openModalOpen, setOpenModalOpen] = useState(false);
    const [closeModalOpen, setCloseModalOpen] = useState(false);
    const [movementModalOpen, setMovementModalOpen] = useState(false);

    const [openingFloat, setOpeningFloat] = useState('');
    const [actualCash, setActualCash] = useState('');
    const [movementType, setMovementType] = useState<'cash_in' | 'cash_out'>('cash_in');
    const [movementAmount, setMovementAmount] = useState('');
    const [movementNote, setMovementNote] = useState('');

    const { data: drawersData } = useGetDrawersQuery(currentStoreId ? { store_id: currentStoreId } : undefined, { skip: !currentStoreId });
    const [createDrawer] = useCreateDrawerMutation();
    const [openDrawer, { isLoading: isOpening }] = useOpenDrawerMutation();
    const [closeDrawer, { isLoading: isClosing }] = useCloseDrawerMutation();
    const [recordMovement, { isLoading: isRecordingMovement }] = useRecordDrawerMovementMutation();

    const drawers = drawersData?.data?.drawers ?? [];
    const drawer = drawers[0];

    const { data: sessionData, refetch: refetchSession } = useGetCurrentDrawerSessionQuery(
        drawer && currentStoreId ? { drawerId: drawer.id, store_id: currentStoreId } : (undefined as any),
        { skip: !drawer || !currentStoreId, pollingInterval: 60000 }
    );

    const session = sessionData?.data?.session ?? null;
    const runningTotal = session?.running_total ?? null;

    // Auto-provision a default drawer for stores that don't have one yet.
    useEffect(() => {
        if (currentStoreId && drawersData && drawers.length === 0) {
            createDrawer({ store_id: currentStoreId, name: 'Main Drawer' });
        }
    }, [currentStoreId, drawersData, drawers.length, createDrawer]);

    const isOpen = session?.status === 'open';

    const handleOpen = async () => {
        if (!drawer || !currentStoreId) return;
        const value = parseFloat(openingFloat);
        if (isNaN(value) || value < 0) {
            toast.error(t('cash_drawer_invalid_amount') || 'Enter a valid opening amount');
            return;
        }
        try {
            await openDrawer({ drawerId: drawer.id, store_id: currentStoreId, opening_float: value }).unwrap();
            toast.success(t('cash_drawer_opened') || 'Drawer opened');
            setOpeningFloat('');
            setOpenModalOpen(false);
            refetchSession();
        } catch (err: any) {
            toast.error(err?.data?.message || t('cash_drawer_open_failed') || 'Could not open drawer');
        }
    };

    const handleClose = async () => {
        if (!drawer || !currentStoreId) return;
        const value = parseFloat(actualCash);
        if (isNaN(value) || value < 0) {
            toast.error(t('cash_drawer_invalid_amount') || 'Enter a valid counted amount');
            return;
        }
        try {
            await closeDrawer({ drawerId: drawer.id, store_id: currentStoreId, actual_cash: value }).unwrap();
            toast.success(t('cash_drawer_closed') || 'Drawer closed');
            setActualCash('');
            setCloseModalOpen(false);
            refetchSession();
        } catch (err: any) {
            toast.error(err?.data?.message || t('cash_drawer_close_failed') || 'Could not close drawer');
        }
    };

    const handleMovement = async () => {
        if (!drawer || !currentStoreId) return;
        const value = parseFloat(movementAmount);
        if (isNaN(value) || value <= 0) {
            toast.error(t('cash_drawer_invalid_amount') || 'Enter a valid amount');
            return;
        }
        try {
            await recordMovement({
                drawerId: drawer.id,
                store_id: currentStoreId,
                type: movementType,
                amount: value,
                note: movementNote || undefined,
            }).unwrap();
            toast.success(t('cash_drawer_movement_recorded') || 'Recorded');
            setMovementAmount('');
            setMovementNote('');
            setMovementModalOpen(false);
            refetchSession();
        } catch (err: any) {
            toast.error(err?.data?.message || t('cash_drawer_movement_failed') || 'Could not record movement');
        }
    };

    if (!drawer) return null;

    return (
        <>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => (isOpen ? setMovementModalOpen(true) : setOpenModalOpen(true))}
                    title={isOpen ? (t('cash_drawer_running_total') || 'Drawer balance') : t('cash_drawer_closed_status') || 'Drawer closed'}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                        isOpen ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-danger/10 text-danger hover:bg-danger/20'
                    }`}
                >
                    {isOpen ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    {isOpen ? formatCurrency(runningTotal ?? session?.opening_float ?? 0) : t('cash_drawer_closed_status') || 'Drawer Closed'}
                </button>
                {isOpen && (
                    <button
                        onClick={() => setCloseModalOpen(true)}
                        title={t('cash_drawer_close') || 'Close drawer'}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                    >
                        <Banknote className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Open Drawer Modal */}
            <Transition appear show={openModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setOpenModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
                                    <Dialog.Title className="text-base font-bold text-gray-800">{t('cash_drawer_open_title') || 'Open Cash Drawer'}</Dialog.Title>
                                    <p className="mt-1 text-xs text-gray-500">{t('cash_drawer_opening_float_hint') || 'Enter the starting cash amount in the drawer.'}</p>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        autoFocus
                                        value={openingFloat}
                                        onChange={(e) => setOpeningFloat(e.target.value)}
                                        placeholder={t('cash_drawer_opening_float_label') || 'Opening float'}
                                        className="form-input mt-4 w-full"
                                    />
                                    <div className="mt-5 flex justify-end gap-2">
                                        <button onClick={() => setOpenModalOpen(false)} className="btn btn-outline-secondary btn-sm">{t('btn_cancel') || 'Cancel'}</button>
                                        <button onClick={handleOpen} disabled={isOpening} className="btn btn-primary btn-sm">{t('btn_confirm') || 'Open'}</button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Close Drawer Modal */}
            <Transition appear show={closeModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setCloseModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
                                    <Dialog.Title className="text-base font-bold text-gray-800">{t('cash_drawer_close_title') || 'Close Cash Drawer'}</Dialog.Title>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {t('cash_drawer_expected_label') || 'Expected'}: <span className="font-bold text-gray-700">{formatCurrency(runningTotal ?? 0)}</span>
                                    </p>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        autoFocus
                                        value={actualCash}
                                        onChange={(e) => setActualCash(e.target.value)}
                                        placeholder={t('cash_drawer_actual_cash_label') || 'Counted cash amount'}
                                        className="form-input mt-3 w-full"
                                    />
                                    <div className="mt-5 flex justify-end gap-2">
                                        <button onClick={() => setCloseModalOpen(false)} className="btn btn-outline-secondary btn-sm">{t('btn_cancel') || 'Cancel'}</button>
                                        <button onClick={handleClose} disabled={isClosing} className="btn btn-danger btn-sm">{t('btn_confirm') || 'Close'}</button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Cash In / Out Modal */}
            <Transition appear show={movementModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setMovementModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
                                    <Dialog.Title className="text-base font-bold text-gray-800">{t('cash_drawer_movement_title') || 'Cash In / Out'}</Dialog.Title>
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => setMovementType('cash_in')}
                                            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${movementType === 'cash_in' ? 'border-success bg-success/10 text-success' : 'border-gray-200 text-gray-500'}`}
                                        >
                                            {t('cash_drawer_cash_in') || 'Cash In'}
                                        </button>
                                        <button
                                            onClick={() => setMovementType('cash_out')}
                                            className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${movementType === 'cash_out' ? 'border-danger bg-danger/10 text-danger' : 'border-gray-200 text-gray-500'}`}
                                        >
                                            {t('cash_drawer_cash_out') || 'Cash Out'}
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        autoFocus
                                        value={movementAmount}
                                        onChange={(e) => setMovementAmount(e.target.value)}
                                        placeholder={t('cash_drawer_amount_label') || 'Amount'}
                                        className="form-input mt-3 w-full"
                                    />
                                    <input
                                        type="text"
                                        value={movementNote}
                                        onChange={(e) => setMovementNote(e.target.value)}
                                        placeholder={t('cash_drawer_note_label') || 'Note (optional)'}
                                        className="form-input mt-2 w-full"
                                    />
                                    <div className="mt-5 flex justify-end gap-2">
                                        <button onClick={() => setMovementModalOpen(false)} className="btn btn-outline-secondary btn-sm">{t('btn_cancel') || 'Cancel'}</button>
                                        <button onClick={handleMovement} disabled={isRecordingMovement} className="btn btn-primary btn-sm">{t('btn_confirm') || 'Record'}</button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default CashDrawerWidget;
