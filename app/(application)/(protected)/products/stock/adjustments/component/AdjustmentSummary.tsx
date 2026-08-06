import { useState } from 'react';
import { AlertCircle, ArrowDown, ArrowUp, ChevronDown, ChevronUp, Info, Save, Sparkles } from 'lucide-react';
import { getTranslation } from '@/i18n';

interface AdjustmentSummaryProps {
    totalItems: number;
    totalIncrease: number;
    totalDecrease: number;
    isSaving: boolean;
    onSubmit: () => void;
    variant?: 'footer' | 'side';
}

/**
 * AdjustmentSummary Component
 * Modern, mobile-first summary with floating action bar & desktop sidebar
 */
const AdjustmentSummary = ({ totalItems, totalIncrease, totalDecrease, isSaving, onSubmit, variant = 'footer' }: AdjustmentSummaryProps) => {
    const { t } = getTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const isSide = variant === 'side';
    const netChange = totalIncrease - totalDecrease;

    if (isSide) {
        return (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-[#046ca9]">
                            <Sparkles className="h-4 w-4" />
                        </span>
                        <span>{t('stock_adjustment_summary_title') || 'Stock Summary'}</span>
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {totalItems} {totalItems === 1 ? t('stock_adjustment_item') : t('stock_adjustment_items')}
                    </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('stock_adjustment_selected_items')}</p>
                        <p className="mt-1 text-xl font-black text-slate-900">{totalItems}</p>
                    </div>

                    <div className={`rounded-xl border p-3 ${netChange > 0 ? 'border-emerald-200 bg-emerald-50/60' : netChange < 0 ? 'border-rose-200 bg-rose-50/60' : 'border-slate-200 bg-slate-50'}`}>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('stock_adjustment_net_change')}</p>
                        <p className={`mt-1 text-xl font-black ${netChange > 0 ? 'text-emerald-700' : netChange < 0 ? 'text-rose-700' : 'text-slate-800'}`}>
                            {netChange > 0 ? `+${netChange}` : netChange}
                        </p>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5">
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>{t('stock_adjustment_add_stock')}</span>
                        </div>
                        <p className="mt-1 text-lg font-extrabold text-emerald-800">+{totalIncrease}</p>
                    </div>

                    <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-2.5">
                        <div className="flex items-center gap-1 text-xs font-bold text-rose-700">
                            <ArrowDown className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>{t('stock_adjustment_remove_stock')}</span>
                        </div>
                        <p className="mt-1 text-lg font-extrabold text-rose-800">-{totalDecrease}</p>
                    </div>
                </div>

                {/* Hint Notice */}
                <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs leading-relaxed text-amber-900">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
                    <span>{t('stock_adjustment_review_hint')}</span>
                </div>

                {/* Primary Action Button */}
                <button
                    onClick={onSubmit}
                    disabled={isSaving || totalItems === 0}
                    className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-[#046ca9] px-6 text-sm font-bold text-white shadow-md shadow-[#046ca9]/20 transition-all hover:bg-[#034d79] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSaving ? (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>{t('stock_adjustment_saving')}</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            <span>{t('stock_adjustment_save_changes')}</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    // Mobile / Floating Bottom Footer
    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-lg shadow-[0_-8px_30px_rgba(15,23,42,0.15)] pb-[max(env(safe-area-inset-bottom),0.5rem)] transition-all">
            {/* Expandable Stats Drawer (Mobile) */}
            {isExpanded && (
                <div className="border-b border-slate-100 bg-slate-50/90 px-4 py-3 sm:px-6">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl border border-slate-200/80 bg-white p-2 text-center">
                            <p className="text-[10px] font-semibold text-slate-500">{t('stock_adjustment_selected_items')}</p>
                            <p className="text-sm font-black text-slate-900">{totalItems}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50 p-2 text-center">
                            <p className="text-[10px] font-semibold text-emerald-700">{t('stock_adjustment_add_stock')}</p>
                            <p className="text-sm font-black text-emerald-800">+{totalIncrease}</p>
                        </div>
                        <div className="rounded-xl border border-rose-200/80 bg-rose-50 p-2 text-center">
                            <p className="text-[10px] font-semibold text-rose-700">{t('stock_adjustment_remove_stock')}</p>
                            <p className="text-sm font-black text-rose-800">-{totalDecrease}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Bar */}
            <div className="px-3 py-2.5 sm:px-6 sm:py-3">
                <div className="flex items-center justify-between gap-3">
                    {/* Left: Net Impact Preview & Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2.5 text-left rounded-xl p-1 -ml-1 transition-colors hover:bg-slate-100/80 active:bg-slate-200/60"
                    >
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-black text-sm ${
                            netChange > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : netChange < 0
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                        }`}>
                            {netChange > 0 ? `+${netChange}` : netChange}
                        </div>

                        <div>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                                <span>{totalItems} {totalItems === 1 ? t('stock_adjustment_item') : t('stock_adjustment_items')}</span>
                                {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronUp className="h-3.5 w-3.5 text-slate-400" />}
                            </div>
                            <p className="text-[11px] font-medium text-slate-500">
                                {netChange > 0
                                    ? `+${totalIncrease} / -${totalDecrease}`
                                    : netChange < 0
                                    ? `-${totalDecrease} / +${totalIncrease}`
                                    : t('stock_adjustment_net_zero') || 'No Net Change'}
                            </p>
                        </div>
                    </button>

                    {/* Right: Primary Save Action Button */}
                    <button
                        onClick={onSubmit}
                        disabled={isSaving || totalItems === 0}
                        className="flex-1 sm:flex-initial sm:min-w-[200px] flex h-11 items-center justify-center gap-2 rounded-xl bg-[#046ca9] px-5 text-sm font-bold text-white shadow-md shadow-[#046ca9]/25 transition-all hover:bg-[#034d79] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {isSaving ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>{t('stock_adjustment_saving')}</span>
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                <span>{t('stock_adjustment_save_changes')}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdjustmentSummary;
