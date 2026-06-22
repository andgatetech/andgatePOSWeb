import { baseApi } from '@/store/api/baseApi';

export interface Coupon {
    id: number;
    store_id: number;
    code: string;
    name: string;
    type: 'percent' | 'fixed';
    value: string;
    min_order_amount: string | null;
    max_discount_amount: string | null;
    usage_limit: number | null;
    usage_count: number;
    per_customer_limit: number | null;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CouponPayload {
    code: string;
    name: string;
    type: 'percent' | 'fixed';
    value: number;
    min_order_amount?: number | null;
    max_discount_amount?: number | null;
    usage_limit?: number | null;
    per_customer_limit?: number | null;
    starts_at?: string | null;
    expires_at?: string | null;
    is_active?: boolean;
}

const couponApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCoupons: builder.query<{ success: boolean; data: Coupon[] }, void>({
            query: () => ({ url: '/coupons', method: 'GET' }),
            providesTags: [{ type: 'Coupons', id: 'LIST' }],
        }),
        createCoupon: builder.mutation<{ success: boolean; data: Coupon }, CouponPayload>({
            query: (body) => ({ url: '/coupons', method: 'POST', body }),
            invalidatesTags: [{ type: 'Coupons', id: 'LIST' }],
        }),
        updateCoupon: builder.mutation<{ success: boolean; data: Coupon }, { id: number; body: Partial<CouponPayload> }>({
            query: ({ id, body }) => ({ url: `/coupons/${id}`, method: 'PUT', body }),
            invalidatesTags: [{ type: 'Coupons', id: 'LIST' }],
        }),
        deleteCoupon: builder.mutation<{ success: boolean }, number>({
            query: (id) => ({ url: `/coupons/${id}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Coupons', id: 'LIST' }],
        }),
    }),
});

export const { useGetCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } = couponApi;
