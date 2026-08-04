export type MembershipTier = 'normal' | 'silver' | 'gold' | 'platinum';

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    membership: MembershipTier | string;
    points: number | string;
    balance: string | number;
    credit_limit?: string | number;
    is_active: boolean | number;
}

export interface CustomerApiResponse {
    data: Customer[] | { items: Customer[]; pagination?: any };
}

export const MEMBERSHIP_DISCOUNTS: Record<MembershipTier, number> = {
    normal: 0,
    silver: 5,
    gold: 7,
    platinum: 10,
};

export interface SplitPayment {
    payment_type: string;
    amount: number;
}

export interface PosFormData {
    customerId: number | string | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    discount: number;
    membershipDiscount: number;
    paymentMethod: string;
    paymentStatus: string;
    usePoints: boolean;
    useBalance: boolean;
    pointsToUse: number;
    balanceToUse: number;
    useWholesale: boolean;
    amountPaid: number;
    changeAmount: number;
    partialPaymentAmount: number; // Amount paid for partial payment
    dueAmount: number; // Remaining amount for due/partial
    isSplitPayment: boolean;
    splitPayments: SplitPayment[];
    couponCode: string;
    couponDiscount: number;
    couponId: number | null;
    drawerSessionId?: number | null;
}

/**
 * Credit-limit helpers for POS soft enforcement.
 * In this system a negative `balance` means the customer owes money (due).
 */
export const getCustomerDue = (customer?: Customer | null): number => {
    if (!customer) return 0;
    const balance = Number(customer.balance || 0);
    return balance < 0 ? Math.abs(balance) : 0;
};

export const getCustomerCreditLimit = (customer?: Customer | null): number => {
    if (!customer) return 0;
    const limit = Number(customer.credit_limit ?? 0);
    return limit > 0 ? limit : 0;
};

export const getAvailableCredit = (customer?: Customer | null): number => {
    const limit = getCustomerCreditLimit(customer);
    if (!limit) return 0;
    return Math.max(0, limit - getCustomerDue(customer));
};

export interface CreditLimitCheckResult {
    wouldExceed: boolean;
    currentDue: number;
    creditLimit: number;
    availableCredit: number;
    projectedDue: number;
    overBy: number;
}

export const checkCreditLimit = (
    customer: Customer | null | undefined,
    newDueAmount: number
): CreditLimitCheckResult => {
    const currentDue = getCustomerDue(customer);
    const creditLimit = getCustomerCreditLimit(customer);
    const availableCredit = getAvailableCredit(customer);
    const projectedDue = currentDue + newDueAmount;

    if (!creditLimit) {
        return { wouldExceed: false, currentDue, creditLimit: 0, availableCredit: 0, projectedDue, overBy: 0 };
    }

    const wouldExceed = projectedDue > creditLimit;
    return {
        wouldExceed,
        currentDue,
        creditLimit,
        availableCredit,
        projectedDue,
        overBy: wouldExceed ? projectedDue - creditLimit : 0,
    };
};
