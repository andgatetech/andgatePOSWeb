'use client';
import React, { useState } from 'react';
import { getTranslation } from '@/i18n';
import { useArchiveTaxProfileMutation, useGetTaxProfilesQuery, useSafeDeleteTaxProfileMutation } from '@/store/features/store/storeApi';
import TaxProfileLifecycleControls from './TaxProfileLifecycleControls';

export default function TaxProfilesTab({ storeId, permissions = [], isBusinessAdmin = false }: { storeId: number; permissions?: string[]; isBusinessAdmin?: boolean }) {
  const { t } = getTranslation();
  const { data, isLoading, refetch } = useGetTaxProfilesQuery({ store_id: storeId, include_archived: true } as any);
  const [archive] = useArchiveTaxProfileMutation(); const [safeDelete] = useSafeDeleteTaxProfileMutation();
  const [error, setError] = useState('');
  const profiles = data?.data || [];
  const canArchive = isBusinessAdmin || permissions.includes('tax-profiles.archive');
  const canSafeDelete = isBusinessAdmin || permissions.includes('tax-profiles.delete');
  const runLifecycleAction = async (action: () => any) => {
    setError('');
    try { await action().unwrap(); await refetch(); } catch (failure: any) { setError(failure?.data?.message || t('tax_profile_lifecycle_failed')); }
  };
  return <section className="rounded-lg bg-white p-5 shadow-sm"><h3 className="text-lg font-semibold">{t('tax_profiles_title')}</h3><p className="mb-4 text-sm text-slate-500">{t('tax_profile_history_retained')}</p>{error && <p role="alert" className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}{isLoading ? <p>{t('lbl_loading')}</p> : <div className="space-y-3">{profiles.map((profile: any) => <div key={profile.id} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"><div><p className="font-medium">{profile.profile_name} · {profile.rate}%</p><p className="text-xs text-slate-500">{profile.tax_label} {profile.archived_at ? `· ${t('tax_profile_archived')}` : ''}</p></div><TaxProfileLifecycleControls profile={profile} canArchive={canArchive} canSafeDelete={canSafeDelete} onArchive={(archive_reason) => runLifecycleAction(() => archive({ id: profile.id, store_id: storeId, archive_reason }))} onSafeDelete={() => runLifecycleAction(() => safeDelete({ id: profile.id, store_id: storeId }))} /></div>)}</div>}</section>;
}
