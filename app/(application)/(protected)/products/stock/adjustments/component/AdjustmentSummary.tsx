import { AlertCircle, ArrowDown, ArrowUp, Save } from 'lucide-react';
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
 * Summary footer with totals and save button
 */
const AdjustmentSummary = ({ totalItems, totalIncrease, totalDecrease, isSaving, onSubmit, variant = 'footer' }: AdjustmentSummaryProps) => {
    const { t } = getTranslation();
    const isSide = variant === 'side';
    return (
        <div
            className={`${
                isSide
                    ? 'rounded-lg border border-[#d8e4ec] bg-white shadow-sm'
                    : 'fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-gray-200 bg-white shadow-[0_-10px_30px_rgba(15,23,42,0.12)] lg:bottom-0'
            }`}
        >
            <div className={`${isSide ? 'p-4' : 'p-3 sm:p-4'}`}>
                <div className={`flex gap-4 ${isSide ? 'flex-col' : 'flex-col sm:flex-row sm:items-center sm:justify-between'}`}>
                    {/* Summary Stats */}
                    <div className={`grid gap-2 ${isSide ? 'grid-cols-2' : 'grid-cols-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3'}`}>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                            <div className="text-xs text-gray-600">{t('stock_adjustment_selected_items')}</div>
                            <div className="text-lg font-bold text-gray-900">{totalItems}</div>
                        </div>
                        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                            <div className="flex items-center gap-1 text-xs text-green-700">
                                <ArrowUp className="h-3 w-3" />
                                {t('stock_adjustment_add_stock')}
                            </div>
                            <div className="text-lg font-bold text-green-700">+{totalIncrease}</div>
                        </div>
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                            <div className="flex items-center gap-1 text-xs text-red-700">
                                <ArrowDown className="h-3 w-3" />
                                {t('stock_adjustment_remove_stock')}
                            </div>
                            <div className="text-lg font-bold text-red-700">-{totalDecrease}</div>
                        </div>
                        <div className="rounded-lg border border-[#cde2ef] bg-[#eef7fc] px-3 py-2">
                            <div className="text-xs text-[#034d79]">{t('stock_adjustment_net_change')}</div>
                            <div className={`text-lg font-bold ${totalIncrease - totalDecrease >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {totalIncrease - totalDecrease >= 0 ? '+' : ''}
                                {totalIncrease - totalDecrease}
                            </div>
                        </div>
                    </div>

                    {isSide && (
                        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span>{t('stock_adjustment_review_hint')}</span>
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={onSubmit}
                        disabled={isSaving || totalItems === 0}
                        className={`${
                            isSide ? 'w-full' : 'sm:min-w-[190px]'
                        } inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#046ca9] px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#034d79] disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                        {isSaving ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                {t('stock_adjustment_saving')}
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                {t('stock_adjustment_save_changes')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdjustmentSummary;
