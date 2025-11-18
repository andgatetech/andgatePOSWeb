/**
 * Stock Adjustment Types
 * Centralized type definitions for the stock adjustment feature
 */

/**
 * Adjustment configuration for a single item
 */
export interface ItemAdjustment {
    itemId: number;
    adjustmentType: 'increase' | 'decrease';
    adjustmentQuantity: number;
    reason: string;
    notes: string;
}

/**
 * Adjustment reason options
 */
export type AdjustmentReason = 'damaged' | 'expired' | 'lost' | 'found' | 'returned' | 'correction' | 'other' | '';

/**
 * Available adjustment reasons with labels
 */
export const ADJUSTMENT_REASONS: Array<{ value: AdjustmentReason; label: string }> = [
    { value: '', label: 'Select reason' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'expired', label: 'Expired' },
    { value: 'lost', label: 'Lost/Stolen' },
    { value: 'found', label: 'Found' },
    { value: 'returned', label: 'Customer Return' },
    { value: 'correction', label: 'Stock Correction' },
    { value: 'other', label: 'Other' },
];

/**
 * API payload for saving stock adjustments
 */
export interface StockAdjustmentPayload {
    product_id?: number;
    stock_id?: number;
    adjustment_type: 'increase' | 'decrease';
    quantity: number;
    reason: string;
    notes?: string;
}
