'use client';

import React from 'react';
import { Archive, Trash2 } from 'lucide-react';
import { getTranslation } from '@/i18n';

/** Permission flags come from the authenticated store response; lifecycle enforcement remains server-side. */
export default function AdjustmentReasonLifecycleControls({ reason, canArchive, canSafeDelete, onArchive, onSafeDelete }: { reason: any; canArchive: boolean; canSafeDelete: boolean; onArchive: (note: string) => void; onSafeDelete: () => void }) {
    const { t } = getTranslation();
    const protectedReason = reason.is_system || reason.is_default || reason.code === 'default' || String(reason.name || '').toLowerCase() === 'default';

    return <div className="flex flex-wrap items-center gap-2">
        {reason.archived_at && <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{t('adjustment_reason_archived')}</span>}
        {canArchive && !reason.archived_at && <button type="button" title={protectedReason ? t('adjustment_reason_replacement_required') : t('adjustment_reason_history_retained')} onClick={() => { const note = window.prompt(t('adjustment_reason_archive_reason')); if (note !== null) onArchive(note); }} className="inline-flex items-center gap-1 rounded border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-800"><Archive className="h-3.5 w-3.5" />{t('adjustment_reason_archive_action')}</button>}
        {canSafeDelete && !reason.is_system && !reason.is_default && !reason.archived_at && <button type="button" title={t('adjustment_reason_history_retained')} onClick={() => { if (window.confirm(t('adjustment_reason_safe_delete_confirm'))) onSafeDelete(); }} className="inline-flex items-center gap-1 rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-700"><Trash2 className="h-3.5 w-3.5" />{t('adjustment_reason_safe_delete_action')}</button>}
    </div>;
}
