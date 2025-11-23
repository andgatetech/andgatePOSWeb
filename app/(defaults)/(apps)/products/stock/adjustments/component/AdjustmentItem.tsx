import { ArrowDown, ArrowUp, Eye, Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import ItemPreviewModal from '@/app/(defaults)/(apps)/pos/pos-right-side/ItemPreviewModal';
import SerialAdjustmentModal from './SerialAdjustmentModal';

interface AdjustmentItemProps {
    item: any;
    adjustment?: {
        itemId: number;
        adjustmentType: 'increase' | 'decrease';
        adjustmentQuantity: number;
        reason: string;
        notes: string;
        serialAdjustments?: any[];
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
    const serialAdjustments = adjustment?.serialAdjustments || [];

    const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleSerialSave = (serials: any[]) => {
        onAdjustmentChange(item.id, 'serialAdjustments', serials);
    };

    return (
        <>
            <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md sm:p-6">
                {/* Product Info & Remove Button */}
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsPreviewOpen(true)}
                                className="flex-shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                                title="View details"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                            <h3 className="text-lg font-semibold text-gray-900">{item.title || item.name}</h3>
                            {item.has_serial && <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">Serial Tracked</span>}
                        </div>
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

                {/* Serial Number Management (if product has serials) */}
                {item.has_serial ? (
                    // Serial Product - Different UI
                    <div className="space-y-3">
                        <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <p className="text-sm font-bold text-purple-900">Serial Number Management Required</p>
                                    </div>
                                    <p className="mt-1 text-xs text-purple-700">
                                        {serialAdjustments.length > 0
                                            ? `✅ ${serialAdjustments.length} serial(s) ready to adjust`
                                            : 'Click "Manage Serials" to update statuses or add new serial numbers'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsSerialModalOpen(true)}
                                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-purple-700"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                    Manage Serials
                                </button>
                            </div>

                            {/* Show serial adjustments summary */}
                            {serialAdjustments.length > 0 && (
                                <div className="mt-3 space-y-1 border-t border-purple-200 pt-3">
                                    <p className="text-xs font-semibold text-purple-800">Serials to Adjust:</p>
                                    <div className="max-h-24 space-y-1 overflow-auto">
                                        {serialAdjustments.slice(0, 5).map((serial: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 rounded bg-white px-2 py-1 text-xs">
                                                <span className="font-mono font-medium text-gray-900">{serial.serial_number}</span>
                                                <span className="text-gray-400">→</span>
                                                <span
                                                    className={`rounded px-1.5 py-0.5 font-medium ${
                                                        serial.status === 'in_stock'
                                                            ? 'bg-green-100 text-green-700'
                                                            : serial.status === 'sold'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : serial.status === 'damaged'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                                >
                                                    {serial.status}
                                                </span>
                                                <span className="text-gray-500">({serial.reason})</span>
                                            </div>
                                        ))}
                                        {serialAdjustments.length > 5 && <p className="text-xs text-purple-600">... and {serialAdjustments.length - 5} more</p>}
                                    </div>
                                </div>
                            )}

                            {/* Info box */}
                            <div className="mt-3 rounded-md border border-purple-300 bg-purple-100/50 p-2">
                                <p className="text-xs text-purple-800">
                                    <strong>Note:</strong> This product uses serial numbers. Each serial must be individually managed. You can update existing serial statuses (sold, damaged, returned)
                                    or add new serial numbers in bulk.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Normal Product - Quantity Adjustment UI
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
                )}
            </div>

            {/* Preview Modal */}
            <ItemPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} item={item} />

            {/* Serial Adjustment Modal */}
            <SerialAdjustmentModal
                isOpen={isSerialModalOpen}
                onClose={() => setIsSerialModalOpen(false)}
                productName={item.title || item.name}
                productId={item.productId}
                stockId={item.stockId}
                onSave={handleSerialSave}
            />
        </>
    );
};

export default AdjustmentItem;
