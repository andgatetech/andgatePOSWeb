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
        <div className="border-b border-[#d8e4ec] bg-white">
            <div className="px-3 py-3 sm:px-5 sm:py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#046ca9] text-white shadow-sm">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">{t('stock_adjustment_title')}</h2>
                            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                {storeName && (
                                    <span className="inline-flex items-center gap-1 font-medium">
                                        <Store className="h-3.5 w-3.5" />
                                        {storeName}
                                    </span>
                                )}
                                <span className="font-semibold text-[#034d79]">
                                    {itemCount} {itemCount === 1 ? t('stock_adjustment_item') : t('stock_adjustment_items')}
                                </span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClearAll}
                        disabled={itemCount === 0}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        {t('stock_adjustment_clear_draft')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdjustmentHeader;
