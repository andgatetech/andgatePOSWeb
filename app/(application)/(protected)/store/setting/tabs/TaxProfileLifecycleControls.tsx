'use client';

import React from 'react';
import { Archive, Trash2 } from 'lucide-react';
import { getTranslation } from '@/i18n';

/** Controls intentionally receive permissions from the authenticated store context; backend remains authoritative. */
export default function TaxProfileLifecycleControls({ profile, canArchive, canSafeDelete, onArchive, onSafeDelete }: { profile: any; canArchive: boolean; canSafeDelete: boolean; onArchive: (reason: string) => void; onSafeDelete: () => void }) {
    const { i18n } = getTranslation();
    const bn = i18n.language?.startsWith('bn');
    const historical = bn ? 'পুরোনো ইনভয়েস/রিপোর্টের VAT অপরিবর্তিত থাকবে।' : 'Historical invoices and reports keep their VAT snapshots.';
    const archiveLabel = bn ? 'আর্কাইভ' : 'Archive';
    const deleteLabel = bn ? 'নিরাপদে মুছুন' : 'Safe delete';
    const blocked = profile.is_active || profile.is_system || profile.is_default;
    return <div className="flex flex-wrap items-center gap-2">
        {profile.archived_at && <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{bn ? 'আর্কাইভ করা' : 'Archived'}</span>}
        {canArchive && !profile.archived_at && <button type="button" disabled={blocked} title={blocked ? (bn ? 'সক্রিয়/ডিফল্ট/সিস্টেম প্রোফাইল আর্কাইভ করা যাবে না।' : 'Active/default/system profiles cannot be archived.') : historical} onClick={() => { const reason = window.prompt(bn ? 'আর্কাইভের কারণ' : 'Archive reason'); if (reason !== null) onArchive(reason); }} className="inline-flex items-center gap-1 rounded border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50"><Archive className="h-3.5 w-3.5" />{archiveLabel}</button>}
        {canSafeDelete && !profile.is_active && !profile.is_system && !profile.is_default && <button type="button" title={historical} onClick={() => { if (window.confirm(bn ? 'শুধু অব্যবহৃত কাস্টম প্রোফাইল মুছবেন?' : 'Delete only this unused custom profile?')) onSafeDelete(); }} className="inline-flex items-center gap-1 rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-700"><Trash2 className="h-3.5 w-3.5" />{deleteLabel}</button>}
    </div>;
}
