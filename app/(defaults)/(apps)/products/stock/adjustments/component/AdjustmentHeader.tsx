import { ClipboardList, Trash2 } from 'lucide-react';

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
    return (
        <div className="border-b border-gray-200 bg-white shadow-sm">
            <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                            <ClipboardList className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Stock Adjustment</h2>
                            <p className="text-sm text-gray-600">
                                {storeName && <span className="font-medium">{storeName}</span>}
                                {storeName && <span className="mx-2">•</span>}
                                <span className="font-semibold text-blue-600">
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
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdjustmentHeader;
