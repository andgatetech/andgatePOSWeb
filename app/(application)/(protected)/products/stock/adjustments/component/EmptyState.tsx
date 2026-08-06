import { ArrowDown, ArrowUp, FileText, PackageSearch, Search, Sparkles } from 'lucide-react';
import { getTranslation } from '@/i18n';

interface EmptyStateProps {
    storeName?: string;
}

/**
 * EmptyState Component
 * Displays when no products are selected for stock adjustment
 */
const EmptyState = ({ storeName }: EmptyStateProps) => {
    const { t } = getTranslation();
    return (
        <div className="flex h-full w-full max-w-full flex-col items-center justify-center bg-[#f8fafc] px-3 py-6 sm:p-8 overflow-hidden">
            <div className="w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white p-5 text-center shadow-xl shadow-slate-100 sm:p-10 max-w-full">
                {/* Icon */}
                <div className="relative mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-100">
                    <PackageSearch className="h-8 w-8 sm:h-10 sm:w-10 text-[#046ca9]" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#046ca9] text-white shadow-md">
                        <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </span>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-xl sm:text-2xl font-black text-slate-900">{t('stock_adjustment_empty_title')}</h3>
                <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed text-slate-500">{t('stock_adjustment_empty_desc')}</p>
                {storeName && (
                    <div className="mb-8 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{storeName}</span>
                    </div>
                )}

                {/* Feature Cards */}
                <div className="grid gap-3 text-left sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm">
                        <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-[#046ca9]">
                            <Search className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{t('stock_adjustment_empty_search_title')}</h4>
                        <p className="mt-1 text-[11px] leading-normal text-slate-500">{t('stock_adjustment_empty_search_desc')}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm">
                        <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <div className="flex items-center">
                                <ArrowUp className="h-3 w-3" />
                                <ArrowDown className="h-3 w-3" />
                            </div>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{t('stock_adjustment_empty_difference_title')}</h4>
                        <p className="mt-1 text-[11px] leading-normal text-slate-500">{t('stock_adjustment_empty_difference_desc')}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm">
                        <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <FileText className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{t('stock_adjustment_empty_reason_title')}</h4>
                        <p className="mt-1 text-[11px] leading-normal text-slate-500">{t('stock_adjustment_empty_reason_desc')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
