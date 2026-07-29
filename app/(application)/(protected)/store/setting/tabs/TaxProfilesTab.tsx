'use client';
import React from 'react';
import { useArchiveTaxProfileMutation, useGetTaxProfilesQuery, useSafeDeleteTaxProfileMutation } from '@/store/features/store/storeApi';
import TaxProfileLifecycleControls from './TaxProfileLifecycleControls';

export default function TaxProfilesTab({ storeId, permissions = [], isBusinessAdmin = false }: { storeId: number; permissions?: string[]; isBusinessAdmin?: boolean }) {
  const { data, isLoading } = useGetTaxProfilesQuery({ store_id: storeId, include_archived: true } as any);
  const [archive] = useArchiveTaxProfileMutation(); const [safeDelete] = useSafeDeleteTaxProfileMutation();
  const profiles = data?.data || [];
  const canArchive = isBusinessAdmin || permissions.includes('tax-profiles.archive');
  const canSafeDelete = isBusinessAdmin || permissions.includes('tax-profiles.delete');
  return <section className="rounded-lg bg-white p-5 shadow-sm"><h3 className="text-lg font-semibold">VAT / Tax profiles</h3><p className="mb-4 text-sm text-slate-500">Archived profiles are unavailable for new selection. Issued invoices and tax reports preserve their recorded values.</p>{isLoading ? <p>Loading…</p> : <div className="space-y-3">{profiles.map((profile: any) => <div key={profile.id} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"><div><p className="font-medium">{profile.profile_name} · {profile.rate}%</p><p className="text-xs text-slate-500">{profile.tax_label} {profile.archived_at ? '· Archived' : ''}</p></div><TaxProfileLifecycleControls profile={profile} canArchive={canArchive} canSafeDelete={canSafeDelete} onArchive={(archive_reason) => archive({ id: profile.id, store_id: storeId, archive_reason })} onSafeDelete={() => safeDelete({ id: profile.id, store_id: storeId })} /></div>)}</div>}</section>;
}
