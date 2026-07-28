export interface PurchaseOrderDeletionUser {
    role?: string | null;
    permissions?: string[] | null;
}

export interface PurchaseOrderDeletionCandidate {
    status?: string | null;
    payment_status?: string | null;
    amount_paid?: number | string | null;
}

export type PurchaseOrderDeletionAction = 'delete' | 'void' | null;

const hasPositiveAmount = (value: unknown): boolean => Number(value) > 0;

export const canManagePurchaseOrderDeletion = (user?: PurchaseOrderDeletionUser | null): boolean =>
    user?.role === 'business_admin' || user?.permissions?.includes('purchase-orders.delete') === true;

export const getPurchaseOrderDeletionAction = (order: PurchaseOrderDeletionCandidate): PurchaseOrderDeletionAction => {
    if (['cancelled', 'voided'].includes(order.status || '')) return null;

    const hasReceivedStock = ['received', 'partially_received', 'completed'].includes(order.status || '');
    const hasRecordedPayment = ['paid', 'partial'].includes(order.payment_status || '') || hasPositiveAmount(order.amount_paid);

    return hasReceivedStock || hasRecordedPayment ? 'void' : 'delete';
};
