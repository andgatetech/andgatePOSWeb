import { ClipboardList, Store, Trash2 } from 'lucide-react';
import { getTranslation } from '@/i18n';

interface AdjustmentHeaderProps {
    storeName?: string;
    itemCount: number;
    onClearAll: () => void;
}

/**
 * AdjustmentHeader Component
 * Header section with store name, item count, and clear all button
 */
const AdjustmentHeader = ({ storeName, itemCount, onClearAll }: AdjustmentHeaderProps) => {
    const { t } = getTranslation();
    return (
        <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md max-w-full overflow-hidden">
            <div className="px-3 py-2.5 sm:px-6 sm:py-3.5">
                <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm shadow-[#046ca9]/20">
                            <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-sm sm:text-base md:text-lg font-bold text-slate-900">{t('stock_adjustment_title')}</h2>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-500">
                                {storeName && (
                                    <span className="inline-flex items-center gap-1 font-medium text-slate-700 min-w-0">
                                        <Store className="h-3 w-3 shrink-0 text-slate-400" />
                                        <span className="truncate max-w-[100px] sm:max-w-[200px]">{storeName}</span>
                                    </span>
                                )}
                                <span className="text-slate-300">•</span>
                                <span className="font-semibold text-[#034d79] bg-[#eef7fc] px-1.5 py-0.5 rounded-md shrink-0">
                                    {itemCount} {itemCount === 1 ? t('stock_adjustment_item') : t('stock_adjustment_items')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClearAll}
                        disabled={itemCount === 0}
                        title={t('stock_adjustment_clear_draft')}
                        className="inline-flex h-8 sm:h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-2.5 sm:px-3 text-xs font-semibold text-rose-600 shadow-sm transition-all hover:bg-rose-50 hover:border-rose-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="hidden sm:inline">{t('stock_adjustment_clear_draft')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdjustmentHeader;
