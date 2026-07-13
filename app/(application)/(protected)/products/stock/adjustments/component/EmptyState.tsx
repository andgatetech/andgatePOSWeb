import { ArrowDown, ArrowUp, FileText, Package, Search } from 'lucide-react';
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
        <div className="flex h-full flex-col items-center justify-center bg-[#f6f8fb] p-4 sm:p-6">
            <div className="w-full max-w-2xl rounded-lg border border-[#d8e4ec] bg-white p-5 text-center shadow-sm sm:p-8">
                {/* Icon */}
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-[#eef7fc]">
                    <Package className="h-8 w-8 text-[#046ca9]" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{t('stock_adjustment_empty_title')}</h3>
                <p className="mx-auto mb-2 max-w-lg text-sm leading-6 text-gray-600">{t('stock_adjustment_empty_desc')}</p>
                {storeName && <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-[#046ca9]">{storeName}</p>}

                {/* Feature Cards */}
                <div className="grid gap-3 text-left sm:grid-cols-3">
                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#eef7fc]">
                            <Search className="h-4 w-4 text-[#046ca9]" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{t('stock_adjustment_empty_search_title')}</h4>
                            <p className="text-xs text-gray-600">{t('stock_adjustment_empty_search_desc')}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#fff4e6]">
                            <div className="flex flex-col items-center">
                                <ArrowUp className="h-3 w-3 text-[#e79237]" />
                                <ArrowDown className="h-3 w-3 text-[#e79237]" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{t('stock_adjustment_empty_difference_title')}</h4>
                            <p className="text-xs text-gray-600">{t('stock_adjustment_empty_difference_desc')}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-50">
                            <FileText className="h-4 w-4 text-green-700" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{t('stock_adjustment_empty_reason_title')}</h4>
                            <p className="text-xs text-gray-600">{t('stock_adjustment_empty_reason_desc')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyState;
