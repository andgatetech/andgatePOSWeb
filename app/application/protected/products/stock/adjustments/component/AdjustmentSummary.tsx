import { ArrowDown, ArrowUp, Save } from 'lucide-react';

interface AdjustmentSummaryProps {
    totalItems: number;
    totalIncrease: number;
    totalDecrease: number;
    isSaving: boolean;
    onSubmit: () => void;
}

/**
 * AdjustmentSummary Component
 * Summary footer with totals and save button
 */
const AdjustmentSummary = ({ totalItems, totalIncrease, totalDecrease, isSaving, onSubmit }: AdjustmentSummaryProps) => {
    return (
        <div className="border-t border-gray-200 bg-white shadow-lg">
            <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Summary Stats */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="rounded-lg bg-gray-100 px-4 py-2">
                            <div className="text-xs text-gray-600">Total Items</div>
                            <div className="text-lg font-bold text-gray-900">{totalItems}</div>
                        </div>
                        <div className="rounded-lg bg-green-100 px-4 py-2">
                            <div className="flex items-center gap-1 text-xs text-green-700">
                                <ArrowUp className="h-3 w-3" />
                                Increase
                            </div>
                            <div className="text-lg font-bold text-green-700">+{totalIncrease}</div>
                        </div>
                        <div className="rounded-lg bg-red-100 px-4 py-2">
                            <div className="flex items-center gap-1 text-xs text-red-700">
                                <ArrowDown className="h-3 w-3" />
                                Decrease
                            </div>
                            <div className="text-lg font-bold text-red-700">-{totalDecrease}</div>
                        </div>
                        <div className="rounded-lg bg-blue-100 px-4 py-2">
                            <div className="text-xs text-blue-700">Net Change</div>
                            <div className={`text-lg font-bold ${totalIncrease - totalDecrease >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {totalIncrease - totalDecrease >= 0 ? '+' : ''}
                                {totalIncrease - totalDecrease}
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={onSubmit}
                        disabled={isSaving || totalItems === 0}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[160px]"
                    >
                        {isSaving ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Adjustments
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdjustmentSummary;
