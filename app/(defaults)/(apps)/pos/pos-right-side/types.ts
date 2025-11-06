export type MembershipTier = 'normal' | 'silver' | 'gold' | 'platinum';

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    membership: MembershipTier | string;
    points: number | string;
    balance: string | number;
    is_active: boolean | number;
}

export interface CustomerApiResponse {
    data: Customer[];
}

export const MEMBERSHIP_DISCOUNTS: Record<MembershipTier, number> = {
    normal: 0,
    silver: 5,
    gold: 7,
    platinum: 10,
};

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
}
