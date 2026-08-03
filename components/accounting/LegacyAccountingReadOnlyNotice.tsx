'use client';

import { getTranslation } from '@/i18n';
import { RootState } from '@/store';
import { History, Landmark } from 'lucide-react';
import Link from 'next/link';
import { useSelector } from 'react-redux';

type LegacyAccountingKind = 'journal' | 'ledger';

export default function LegacyAccountingReadOnlyNotice({ kind }: { kind: LegacyAccountingKind }) {
    const { t } = getTranslation();
    const user = useSelector((state: RootState) => state.auth.user);
    const isBusinessAdmin = user?.role === 'business_admin';
    const canViewModernJournals = isBusinessAdmin || user?.permissions?.includes('accounting.journals.index') === true;
    const canViewAccounts = isBusinessAdmin || user?.permissions?.includes('accounting.accounts.index') === true;
    const isJournal = kind === 'journal';

    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <div className="flex gap-3">
                <History className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                    <h2 className="font-semibold">{t('legacy_accounting_read_only_title')}</h2>
                    <p className="mt-1 leading-6">{isJournal ? t('legacy_journal_immutable_desc') : t('legacy_ledger_read_only_desc')}</p>
                    <p className="mt-1 leading-6">{t('legacy_accounting_correction_unavailable')}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {canViewModernJournals && (
                            <Link
                                href="/accounting/journals"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-medium text-amber-900 hover:bg-amber-100"
                            >
                                <History className="h-4 w-4" /> {t('legacy_accounting_view_modern_journals')}
                            </Link>
                        )}
                        {canViewAccounts && (
                            <Link
                                href="/accounting/chart-of-accounts"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-medium text-amber-900 hover:bg-amber-100"
                            >
                                <Landmark className="h-4 w-4" /> {t('legacy_accounting_view_chart_of_accounts')}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
