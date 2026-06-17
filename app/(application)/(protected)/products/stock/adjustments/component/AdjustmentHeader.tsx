import { ClipboardList, Trash2 } from 'lucide-react';
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
        <div className="bg-transparent">
            <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Stock Count Adjustment</h2>
                            <p className="text-sm text-gray-500">
                                {storeName && <span className="font-medium">{storeName}</span>}
                                {storeName && <span className="mx-2">•</span>}
                                <span className="font-semibold text-[#034d79]">
                                    {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClearAll}
                        disabled={itemCount === 0}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear Draft
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdjustmentHeader;
