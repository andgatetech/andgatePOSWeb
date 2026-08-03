'use client';

import LegacyAccountingReadOnlyNotice from '@/components/accounting/LegacyAccountingReadOnlyNotice';
import { getTranslation } from '@/i18n';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function CreateLedgerPage() {
    const { t } = getTranslation();
    return (
        <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
            <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-[#046ca9]" />
                <div>
                    <h1 className="text-xl font-bold">{t('lbl_ledgers')}</h1>
                    <p className="text-sm text-gray-500">{t('legacy_accounting_history_desc')}</p>
                </div>
            </div>
            <LegacyAccountingReadOnlyNotice kind="ledger" />
            <Link href="/account/ledger-list" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4" />
                {t('btn_back')}
            </Link>
        </div>
    );
}
