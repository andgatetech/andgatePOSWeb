'use client';

import { useTranslation } from '@/components/i18n/TranslationProvider';
import PosLeftSide from '../pos/PosLeftSide';
import TransferBuilder from './components/TransferBuilder';
import TransferHistoryView from './components/TransferHistoryView';
import { Package, Truck } from 'lucide-react';
import { useState } from 'react';

type View = 'create' | 'history';

export default function StockTransfersPage() {
    const { t } = useTranslation();
    const [view, setView] = useState<View>('create');

    return (
        <div className="flex h-[calc(100vh-64px)] flex-col">
            {/* Page header with view switcher */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('transfer_title')}</h1>
                        <p className="text-sm text-gray-500">{t('transfer_desc')}</p>
                    </div>
                </div>
                <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                    <button
                        onClick={() => setView('create')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                            view === 'create' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Package className="h-3.5 w-3.5" /> {t('transfer_new')}
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                            view === 'history' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {t('transfer_history')}
                    </button>
                </div>
            </div>

            {view === 'create' ? (
                <div className="flex-1 overflow-hidden">
                    <PosLeftSide
                        reduxSlice="transfer"
                        disableSerialSelection={true}
                        mobileButtonConfig={{
                            showIcon: <Truck className="h-6 w-6" />,
                            hideIcon: <Package className="h-6 w-6" />,
                            label: t('transfer_cart'),
                        }}
                        enableOfflinePrefetch={false}
                    >
                        <TransferBuilder onViewHistory={() => setView('history')} />
                    </PosLeftSide>
                </div>
            ) : (
                <div className="flex-1 overflow-auto">
                    <TransferHistoryView onCreateNew={() => setView('create')} />
                </div>
            )}
        </div>
    );
}
