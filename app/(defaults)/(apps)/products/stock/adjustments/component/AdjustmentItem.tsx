import { ArrowDown, ArrowUp, Minus, Plus, Trash2 } from 'lucide-react';

interface AdjustmentItemProps {
    item: any;
    adjustment?: {
        itemId: number;
        adjustmentType: 'increase' | 'decrease';
        adjustmentQuantity: number;
        reason: string;
        notes: string;
    };
    onAdjustmentChange: (itemId: number, field: string, value: any) => void;
    onRemove: (itemId: number) => void;
    onUpdateQuantity: (itemId: number, quantity: number) => void;
}

/**
 * AdjustmentItem Component
 * Individual product item with adjustment controls
 */
const AdjustmentItem = ({ item, adjustment, onAdjustmentChange, onRemove, onUpdateQuantity }: AdjustmentItemProps) => {
    const adjustmentType = adjustment?.adjustmentType || 'increase';
    const adjustmentQuantity = adjustment?.adjustmentQuantity || 0;
    const reason = adjustment?.reason || '';
    const notes = adjustment?.notes || '';

    return (
        <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
            {/* Product Info & Remove Button */}
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title || item.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        {item.sku && <span className="rounded-md bg-gray-100 px-2 py-1 font-medium">SKU: {item.sku}</span>}
                        <span className="rounded-md bg-blue-100 px-2 py-1 font-medium text-blue-700">Current Stock: {item.PlaceholderQuantity || item.quantity || 0}</span>
                        {item.rate && <span className="text-gray-400">•</span>}
                        {item.rate && <span className="font-medium text-gray-700">৳{parseFloat(item.rate).toFixed(2)}</span>}
                    </div>
                </div>
                <button onClick={() => onRemove(item.id)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600" title="Remove item">
                    <Trash2 className="h-5 w-5" />
                </button>
            </div>

            {/* Adjustment Controls */}
            <div className="grid gap-4 sm:grid-cols-4 lg:grid-cols-8">
                {/* Adjustment Type */}
                <div className="sm:col-span-4 lg:col-span-3">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Adjustment Type *</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onAdjustmentChange(item.id, 'adjustmentType', 'increase')}
                            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border-2 px-2 py-2.5 text-sm font-medium transition-all ${
                                adjustmentType === 'increase' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                            }`}
                        >
                            <ArrowUp className="h-4 w-4 flex-shrink-0" />
                            <span>Increase</span>
                        </button>
                        <button
                            onClick={() => onAdjustmentChange(item.id, 'adjustmentType', 'decrease')}
                            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border-2 px-2 py-2.5 text-sm font-medium transition-all ${
                                adjustmentType === 'decrease' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'
                            }`}
                        >
                            <ArrowDown className="h-4 w-4 flex-shrink-0" />
                            <span>Decrease</span>
                        </button>
                    </div>
                </div>

                {/* Adjustment Quantity */}
                <div className="sm:col-span-4 lg:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Quantity *</label>
                    <div className="flex items-stretch gap-1">
                        <button
                            type="button"
                            onClick={() => onAdjustmentChange(item.id, 'adjustmentQuantity', Math.max(0, adjustmentQuantity - 1))}
                            className="flex w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <input
                            type="number"
                            min="0"
                            value={adjustmentQuantity}
                            onChange={(e) => onAdjustmentChange(item.id, 'adjustmentQuantity', Math.max(0, parseInt(e.target.value) || 0))}
                            className="h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-2 text-center text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => onAdjustmentChange(item.id, 'adjustmentQuantity', adjustmentQuantity + 1)}
                            className="flex w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Reason */}
                <div className="sm:col-span-2 lg:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Reason *</label>
                    <select
                        value={reason}
                        onChange={(e) => onAdjustmentChange(item.id, 'reason', e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select reason</option>
                        <option value="damaged">Damaged</option>
                        <option value="expired">Expired</option>
                        <option value="lost">Lost/Stolen</option>
                        <option value="found">Found</option>
                        <option value="returned">Customer Return</option>
                        <option value="correction">Stock Correction</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2 lg:col-span-1">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Notes</label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => onAdjustmentChange(item.id, 'notes', e.target.value)}
                        placeholder="Optional..."
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default AdjustmentItem;
