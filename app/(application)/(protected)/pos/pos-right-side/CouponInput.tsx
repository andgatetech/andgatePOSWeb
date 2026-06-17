'use client';
import { useState } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';

interface CouponResult {
    coupon_id: number;
    code: string;
    name: string;
    discount_amount: number;
}

interface CouponInputProps {
    storeId: number | null;
    orderTotal: number;
    customerId?: number | null;
    appliedCode: string;
    couponDiscount: number;
    onApply: (result: CouponResult) => void;
    onRemove: () => void;
}

const CouponInput: React.FC<CouponInputProps> = ({
    storeId,
    orderTotal,
    customerId,
    appliedCode,
    couponDiscount,
    onApply,
    onRemove,
}) => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

    const handleApply = async () => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;
        setLoading(true);
        setError('');

        try {
            const token = typeof window !== 'undefined'
                ? JSON.parse(localStorage.getItem('persist:auth') ?? '{}')?.token?.replace(/"/g, '')
                : null;

            const res = await fetch(`${apiBase}/api/coupons/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code: trimmed,
                    store_id: storeId,
                    order_total: orderTotal,
                    customer_id: customerId ?? null,
                }),
            });

            const json = await res.json();

            if (!res.ok) {
                const msg = json?.errors?.code?.[0] ?? json?.message ?? 'Invalid coupon.';
                setError(msg);
                return;
            }

            onApply(json.data);
            setCode('');
        } catch {
            setError('Failed to validate coupon. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (appliedCode) {
        return (
            <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <div>
                        <p className="text-xs font-bold text-green-700">{appliedCode}</p>
                        <p className="text-xs text-green-600">−{formatCurrency(couponDiscount)}</p>
                    </div>
                </div>
                <button type="button" onClick={onRemove}
                    className="text-xs font-semibold text-red-500 hover:text-red-700">
                    Remove
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    placeholder="Coupon code"
                    className="form-input flex-1 rounded-lg border-gray-200 py-2 text-sm uppercase placeholder:normal-case"
                    disabled={loading}
                />
                <button
                    type="button"
                    onClick={handleApply}
                    disabled={loading || !code.trim()}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-primary/90"
                >
                    {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : 'Apply'}
                </button>
            </div>
            {error && <p className="text-xs text-danger">{error}</p>}
        </div>
    );
};

export default CouponInput;
