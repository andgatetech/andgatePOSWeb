export interface OrderDeletionUser {
    role?: string | null;
    permissions?: string[] | null;
}

export interface OrderVoidCandidate {
    status?: string | null;
    return_status?: string | null;
    has_returns?: boolean | null;
    returns?: {
        has_returns?: boolean | null;
        total_returned?: number | string | null;
        count?: number | string | null;
    } | unknown[] | null;
}

const hasPositiveAmount = (value: unknown): boolean => Number(value) > 0;

export const canManageOrderDeletion = (user?: OrderDeletionUser | null): boolean =>
    user?.role === 'business_admin' || user?.permissions?.includes('orders.delete') === true;

export const canVoidOrder = (order: OrderVoidCandidate): boolean => {
    if (['voided', 'cancelled', 'fully_returned', 'partially_returned'].includes(order.status || '')) return false;
    if (['full', 'partial'].includes(order.return_status || '')) return false;
    if (order.has_returns) return false;
    if (Array.isArray(order.returns)) return order.returns.length === 0;

    return !(
        order.returns?.has_returns ||
        hasPositiveAmount(order.returns?.total_returned) ||
        hasPositiveAmount(order.returns?.count)
    );
};
