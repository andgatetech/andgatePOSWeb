import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Layers, Sparkles } from 'lucide-react';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetStoreQuery } from '@/store/features/store/storeApi';

interface GlobalSettingsProps {
    globalReason: string;
    globalNotes: string;
    onReasonChange: (reason: string) => void;
    onNotesChange: (notes: string) => void;
}

/**
 * GlobalSettings Component
 * Collapsible batch settings applying default reason/notes to all items
 */
const GlobalSettings = ({ globalReason, globalNotes, onReasonChange, onNotesChange }: GlobalSettingsProps) => {
    const { t } = getTranslation();
    const [isOpen, setIsOpen] = useState(Boolean(globalReason || globalNotes));
    const { currentStore } = useCurrentStore();
    const { data: storeData } = useGetStoreQuery(currentStore?.id ? { store_id: currentStore.id } : undefined, {
        skip: !currentStore?.id,
    });

    const adjustmentReasons = storeData?.data?.store?.adjustment_reasons || [];
    const selectedReason = adjustmentReasons.find((r: any) => r.id?.toString() === globalReason);

    return (
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden transition-all">
            {/* Header Accordion Toggle */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left hover:bg-slate-50/70 transition-colors"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Layers className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 truncate">{t('stock_adjustment_same_reason_title')}</h3>
                            {Boolean(globalReason || globalNotes) && (
                                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                                    Active
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{t('stock_adjustment_same_reason_desc')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 pl-2">
                    <span className="hidden sm:inline">{isOpen ? 'Hide' : 'Configure'}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
            </button>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="border-t border-slate-100 p-4 sm:p-5 bg-gradient-to-b from-slate-50/40 to-white">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                {t('stock_adjustment_global_reason_label')}
                            </label>
                            {adjustmentReasons.length === 0 ? (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                    <p className="text-xs font-medium text-amber-800">
                                        {t('stock_adjustment_no_reason_found')}{' '}
                                        <Link href="/store/setting?tab=adjustment" className="font-bold text-amber-900 underline hover:text-amber-700">
                                            {t('stock_adjustment_add_common_reasons')}
                                        </Link>
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <select
                                        value={globalReason}
                                        onChange={(e) => onReasonChange(e.target.value)}
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20"
                                    >
                                        <option value="">{t('placeholder_select_reason')}</option>
                                        <option value="default">{t('lbl_default_reason')}</option>
                                        {adjustmentReasons
                                            .filter((r: any) => r.is_active === 1 || r.is_active === true)
                                            .map((r: any) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.name}
                                                </option>
                                            ))}
                                    </select>
                                    {selectedReason?.description && <p className="text-xs italic text-slate-500">{selectedReason.description}</p>}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                {t('stock_adjustment_common_note')}
                            </label>
                            <input
                                type="text"
                                value={globalNotes}
                                onChange={(e) => onNotesChange(e.target.value)}
                                placeholder={t('stock_adjustment_common_note_placeholder')}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition-all focus:border-[#046ca9] focus:ring-2 focus:ring-[#046ca9]/20"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalSettings;
