/**
 * Purchase Order Utility Functions
 * Helper functions for working with purchase orders and drafts
 */

import type { PurchaseDraftItem, PurchaseOrderItem, ReceiveItemData } from '@/types/purchaseOrder.types';

/**
 * Calculate total amount for purchase items
 */
export const calculatePurchaseTotal = (items: Array<{ purchase_price: number; quantity_ordered: number }>): number => {
    return items.reduce((total, item) => total + item.purchase_price * item.quantity_ordered, 0);
};

/**
 * Check if all items in purchase order are fully received
 */
export const isFullyReceived = (items: PurchaseOrderItem[]): boolean => {
    return items.every((item) => item.quantity_received >= item.quantity_ordered);
};

/**
 * Check if any items in purchase order are partially received
 */
export const isPartiallyReceived = (items: PurchaseOrderItem[]): boolean => {
    return items.some((item) => item.quantity_received > 0 && item.quantity_received < item.quantity_ordered);
};

/**
 * Calculate total received value
 */
export const calculateReceivedTotal = (items: PurchaseOrderItem[]): number => {
    return items.reduce((total, item) => total + item.quantity_received * item.purchase_price, 0);
};

/**
 * Calculate pending quantity (ordered but not received)
 */
export const calculatePendingQuantity = (items: PurchaseOrderItem[]): number => {
    return items.reduce((total, item) => total + (item.quantity_ordered - item.quantity_received), 0);
};

/**
 * Group items by type (existing vs new products)
 */
export const groupItemsByType = (items: PurchaseOrderItem[]) => {
    const existing = items.filter((item) => item.product_id !== null);
    const newProducts = items.filter((item) => item.product_id === null);

    return {
        existing,
        newProducts,
        existingCount: existing.length,
        newProductsCount: newProducts.length,
    };
};

/**
 * Validate purchase draft before saving
 */
export const validatePurchaseDraft = (data: { store_id?: number; supplier_id?: number; items: PurchaseDraftItem[] }): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.store_id) {
        errors.push('Store is required');
    }

    if (!data.supplier_id) {
        errors.push('Supplier is required');
    }

    if (!data.items || data.items.length === 0) {
        errors.push('At least one item is required');
    }

    data.items.forEach((item, index) => {
        if (!item.product_id && !item.product_name) {
            errors.push(`Item ${index + 1}: Either product_id or product_name is required`);
        }

        if (!item.quantity_ordered || item.quantity_ordered <= 0) {
            errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Validate receive items data
 */
export const validateReceiveItems = (items: ReceiveItemData[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!items || items.length === 0) {
        errors.push('At least one item is required');
    }

    items.forEach((item, index) => {
        if (item.quantity_received < 0) {
            errors.push(`Item ${index + 1}: Quantity received cannot be negative`);
        }

        if (item.purchase_price < 0) {
            errors.push(`Item ${index + 1}: Purchase price cannot be negative`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

/**
 * Get status badge color
 */
export const getStatusBadgeColor = (
    status: string
): {
    bg: string;
    text: string;
    label: string;
} => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
        preparing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Preparing' },
        ordered: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Ordered' },
        partially_received: {
            bg: 'bg-orange-100',
            text: 'text-orange-800',
            label: 'Partially Received',
        },
        received: { bg: 'bg-green-100', text: 'text-green-800', label: 'Received' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
        pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pending' },
        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partial' },
        paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
    };

    return (
        statusMap[status] || {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            label: status,
        }
    );
};

/**
 * Get payment status badge color
 */
export const getPaymentStatusBadgeColor = (
    paymentStatus: string
): {
    bg: string;
    text: string;
    label: string;
} => {
    return getStatusBadgeColor(paymentStatus);
};

/**
 * Calculate payment progress percentage
 */
export const calculatePaymentProgress = (amountPaid: number, grandTotal: number): number => {
    if (grandTotal === 0) return 0;
    return Math.min(100, (amountPaid / grandTotal) * 100);
};

/**
 * Generate receive suggestions based on ordered quantities
 */
export const generateReceiveSuggestions = (items: PurchaseOrderItem[]): ReceiveItemData[] => {
    return items.map((item) => ({
        id: item.id,
        quantity_received: item.quantity_ordered - item.quantity_received,
        purchase_price: item.purchase_price,
    }));
};

/**
 * Check if item needs price update (for new products)
 */
export const needsPriceUpdate = (item: PurchaseOrderItem): boolean => {
    return item.product_id === null && item.purchase_price === 0;
};

/**
 * Filter items that need attention (missing prices, pending receipt, etc.)
 */
export const getItemsNeedingAttention = (items: PurchaseOrderItem[]): PurchaseOrderItem[] => {
    return items.filter((item) => needsPriceUpdate(item) || item.quantity_received < item.quantity_ordered);
};

/**
 * Export purchase order to CSV format
 */
export const exportToCsv = (items: PurchaseOrderItem[], filename: string = 'purchase_order.csv'): void => {
    const headers = ['Product Name', 'Quantity Ordered', 'Quantity Received', 'Purchase Price', 'Subtotal', 'Status'];

    const rows = items.map((item) => [item.product_name_snapshot || item.product_name_temp || '', item.quantity_ordered, item.quantity_received, item.purchase_price, item.subtotal, item.status]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};

/**
 * Calculate statistics for purchase order
 */
export const calculatePurchaseStats = (items: PurchaseOrderItem[]) => {
    const totalOrdered = items.reduce((sum, item) => sum + item.quantity_ordered, 0);
    const totalReceived = items.reduce((sum, item) => sum + item.quantity_received, 0);
    const totalValue = items.reduce((sum, item) => sum + item.subtotal, 0);
    const receivedValue = items.reduce((sum, item) => sum + item.quantity_received * item.purchase_price, 0);

    return {
        totalOrdered,
        totalReceived,
        totalPending: totalOrdered - totalReceived,
        totalValue,
        receivedValue,
        pendingValue: totalValue - receivedValue,
        completionPercentage: totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0,
    };
};
