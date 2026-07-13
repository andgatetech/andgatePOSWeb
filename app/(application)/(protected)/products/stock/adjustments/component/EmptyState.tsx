import { ArrowDown, ArrowUp, FileText, Package, Search } from 'lucide-react';
import { getTranslation } from '@/i18n';

/**
 * EmptyState Component
 * Displays when no products are selected for stock adjustment
 */
const EmptyState = () => {
    const { t } = getTranslation();
    return (
        <div className="flex h-full flex-col items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md text-center">
                {/* Icon */}
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                    <Package className="h-10 w-10 text-gray-600" />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{t('stock_adjustment_empty_title')}</h3>
                <p className="mb-8 text-sm text-gray-600">{t('stock_adjustment_empty_desc')}</p>

                {/* Feature Cards */}
                <div className="space-y-3 text-left">
                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <Search className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{t('stock_adjustment_empty_search_title')}</h4>
                            <p className="text-xs text-gray-600">{t('stock_adjustment_empty_search_desc')}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <div className="flex flex-col items-center">
                                <ArrowUp className="h-3 w-3 text-gray-600" />
                                <ArrowDown className="h-3 w-3 text-gray-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{t('stock_adjustment_empty_difference_title')}</h4>
                            <p className="text-xs text-gray-600">{t('stock_adjustment_empty_difference_desc')}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <FileText className="h-4 w-4 text-gray-600" />
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
