'use client';

import React from 'react';
import { Archive, Trash2 } from 'lucide-react';
import { getTranslation } from '@/i18n';

/** Controls intentionally receive permissions from the authenticated store context; backend remains authoritative. */
export default function TaxProfileLifecycleControls({ profile, canArchive, canSafeDelete, onArchive, onSafeDelete }: { profile: any; canArchive: boolean; canSafeDelete: boolean; onArchive: (reason: string) => void; onSafeDelete: () => void }) {
    const { t } = getTranslation();
    const blocked = profile.is_active || profile.is_system || profile.is_default;

    return <div className="flex flex-wrap items-center gap-2">
        {profile.archived_at && <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{t('tax_profile_archived')}</span>}
        {canArchive && !profile.archived_at && <button type="button" disabled={blocked} title={blocked ? t('tax_profile_archive_blocked') : t('tax_profile_history_retained')} onClick={() => { const reason = window.prompt(t('tax_profile_archive_reason')); if (reason !== null) onArchive(reason); }} className="inline-flex items-center gap-1 rounded border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50"><Archive className="h-3.5 w-3.5" />{t('tax_profile_archive_action')}</button>}
        {canSafeDelete && !profile.is_active && !profile.is_system && !profile.is_default && <button type="button" title={t('tax_profile_history_retained')} onClick={() => { if (window.confirm(t('tax_profile_safe_delete_confirm'))) onSafeDelete(); }} className="inline-flex items-center gap-1 rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-700"><Trash2 className="h-3.5 w-3.5" />{t('tax_profile_safe_delete_action')}</button>}
    </div>;
}
