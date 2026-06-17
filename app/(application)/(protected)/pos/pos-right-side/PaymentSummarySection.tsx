'use client';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { FALLBACK_PAYMENT_STATUSES, PAYMENT_STATUS_CONFIGS, getAllowedStatusesForMethod, getPaymentStatusConfig } from '@/lib/paymentConstants';
import type { Customer, PosFormData } from './types';

interface PaymentSummarySectionProps {
    formData: PosFormData;
    selectedCustomer: Customer | null;
    paymentMethodOptions: any[];
    paymentStatusOptions: any[];
    onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    subtotalWithoutTax: number;
    taxAmount: number;
    discountAmount: number;
    membershipDiscountAmount: number;
    pointsDiscount: number;
    balanceDiscount: number;
    totalPayable: number;
    isWalkInCustomer: boolean;
    isReturnMode?: boolean;
    returnTotal?: number;
    newItemsTotal?: number;
    returnNetAmount?: number;
    onOpenSplitModal?: () => void;
}

// Synthetic event helper so pill buttons can share onInputChange
const makeEvent = (name: string, value: string) =>
    ({ target: { name, value, type: 'select-one' } } as React.ChangeEvent<HTMLSelectElement>);

// Icon for each payment method keyword
const MethodIcon = ({ name }: { name: string }) => {
    const lower = name.toLowerCase();
    if (lower.includes('cash')) return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
    if (lower.includes('card')) return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
    if (lower.includes('bank') || lower.includes('transfer')) return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
    );
    // Mobile banking (bKash, Nagad, Rocket etc.)
    if (lower.includes('bkash') || lower.includes('nagad') || lower.includes('rocket') || lower.includes('mobile') || lower.includes('upay')) return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    );
    return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
};

const PaymentSummarySection: React.FC<PaymentSummarySectionProps> = ({
    formData,
    selectedCustomer,
    paymentMethodOptions,
    paymentStatusOptions,
    onInputChange,
    subtotalWithoutTax,
    taxAmount,
    discountAmount,
    membershipDiscountAmount,
    pointsDiscount,
    balanceDiscount,
    totalPayable,
    isWalkInCustomer,
    isReturnMode = false,
    returnTotal = 0,
    newItemsTotal = 0,
    returnNetAmount = 0,
    onOpenSplitModal,
}) => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();
    const { currentStore } = useCurrentStore();
    const taxLabel = currentStore?.tax_label || t('lbl_tax');
    const canUsePoints = !!selectedCustomer && Number(selectedCustomer.points) > 0;
    const canUseBalance = !!selectedCustomer && parseFloat(String(selectedCustomer.balance ?? '0')) > 0;

    const emit = (name: string, value: string) => onInputChange(makeEvent(name, value));

    const defaultStatuses = FALLBACK_PAYMENT_STATUSES.map((s) => ({
        ...s,
        status_name: t(PAYMENT_STATUS_CONFIGS[s.value].labelKey),
        status_color: PAYMENT_STATUS_CONFIGS[s.value].hex,
    }));

    const getAvailablePaymentStatuses = () => {
        const baseStatuses = paymentStatusOptions.length > 0 ? paymentStatusOptions : defaultStatuses;
        const mappedStatuses = baseStatuses.map((s: any) => ({
            ...s,
            value: s.value || s.status_name?.toLowerCase(),
            label: s.status_name || s.label,
            color: s.status_color || '#6b7280',
        }));
        if (isWalkInCustomer) {
            const paidStatus = mappedStatuses.find((s: any) => s.value === 'paid');
            return paidStatus ? [paidStatus] : [{ value: 'paid', label: t('status_paid'), color: '#22c55e' }];
        }
        const allowedByMethod = getAllowedStatusesForMethod(formData.paymentMethod);
        return mappedStatuses.filter((s: any) =>
            ['paid', 'partial', 'due'].includes(s.value) && allowedByMethod.includes(s.value)
        );
    };

    const availablePaymentStatuses = getAvailablePaymentStatuses();
    const getSelectedStatusColor = () => getPaymentStatusConfig(formData.paymentStatus).hex || '#6b7280';

    const methodLabel = (name: string) => {
        const lower = name.toLowerCase();
        if (lower === 'cash') return t('lbl_cash');
        if (lower === 'card') return t('lbl_card');
        if (lower === 'bank' || lower === 'bank_transfer') return t('lbl_bank_transfer');
        return name;
    };

    return (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">

            {/* ── Loyalty Points ── */}
            {canUsePoints && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                            <input type="checkbox" name="usePoints" className="rounded" checked={formData.usePoints} onChange={onInputChange} />
                            {t('lbl_use_loyalty_points')}
                        </span>
                        <span className="text-xs text-orange-600">{Number(selectedCustomer!.points) || 0} {t('lbl_points')}</span>
                    </label>
                    {formData.usePoints && (
                        <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-xs text-orange-600">{t('lbl_points_to_use')}:</span>
                            <input type="number" name="pointsToUse" className="form-input w-24 py-1 text-sm"
                                min={0} max={Number(selectedCustomer!.points) || 0}
                                value={formData.pointsToUse} onChange={onInputChange} />
                        </div>
                    )}
                    {formData.usePoints && formData.pointsToUse > 0 && (
                        <p className="mt-1 text-right text-xs text-orange-600">−{formatCurrency(pointsDiscount)}</p>
                    )}
                </div>
            )}

            {/* ── Account Balance ── */}
            {canUseBalance && (
                <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                            <input type="checkbox" name="useBalance" className="rounded" checked={formData.useBalance} onChange={onInputChange} />
                            {t('lbl_use_account_balance')}
                        </span>
                        <span className="text-xs text-teal-600">{formatCurrency(selectedCustomer!.balance)}</span>
                    </label>
                    {formData.useBalance && (
                        <div className="mt-2 flex items-center justify-between gap-3">
                            <span className="text-xs text-teal-600">{t('lbl_balance_to_use')}:</span>
                            <input type="number" name="balanceToUse" className="form-input w-24 py-1 text-sm"
                                min={0} max={parseFloat(String(selectedCustomer!.balance ?? '0'))} step={0.01}
                                value={formData.balanceToUse} onChange={onInputChange} />
                        </div>
                    )}
                    {formData.useBalance && formData.balanceToUse > 0 && (
                        <p className="mt-1 text-right text-xs text-teal-600">−{formatCurrency(balanceDiscount)}</p>
                    )}
                </div>
            )}

            {/* ── Order Totals ── */}
            {!isReturnMode && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 space-y-1.5">
                    {taxAmount > 0 && (
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{t('lbl_subtotal_no_tax')}</span>
                            <span className="font-medium text-gray-700">{formatCurrency(subtotalWithoutTax)}</span>
                        </div>
                    )}
                    {taxAmount > 0 && (
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{taxLabel}</span>
                            <span className="font-medium text-gray-700">{formatCurrency(taxAmount)}</span>
                        </div>
                    )}
                    {discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-red-500">
                            <span>{t('lbl_discount')}</span>
                            <span className="font-medium">−{formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                    {selectedCustomer && membershipDiscountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>{t('pos_membership_discount')} ({selectedCustomer.membership})</span>
                            <span className="font-medium">−{formatCurrency(membershipDiscountAmount)}</span>
                        </div>
                    )}
                    {selectedCustomer && formData.usePoints && pointsDiscount > 0 && (
                        <div className="flex justify-between text-sm text-orange-500">
                            <span>{t('pos_points_payment', { pts: formData.pointsToUse })}</span>
                            <span className="font-medium">−{formatCurrency(pointsDiscount)}</span>
                        </div>
                    )}
                    {selectedCustomer && formData.useBalance && balanceDiscount > 0 && (
                        <div className="flex justify-between text-sm text-teal-600">
                            <span>{t('pos_balance_payment')}</span>
                            <span className="font-medium">−{formatCurrency(balanceDiscount)}</span>
                        </div>
                    )}
                    {/* Grand Total bar */}
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-primary px-3 py-2.5">
                        <span className="text-sm font-semibold text-white/80">{t('lbl_grand_total')}</span>
                        <span className="text-xl font-black tracking-tight text-white">{formatCurrency(totalPayable)}</span>
                    </div>
                </div>
            )}

            {/* ── Payment Method ── */}
            {!isReturnMode && (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {t('lbl_payment_method')} <span className="text-red-400">*</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {paymentMethodOptions.map((method: any) => {
                            const name = method.payment_method_name || '';
                            const selected = !formData.isSplitPayment && formData.paymentMethod === name;
                            return (
                                <button
                                    key={method.id ?? name}
                                    type="button"
                                    onClick={() => emit('paymentMethod', name)}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                        selected
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'border border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
                                    }`}
                                >
                                    <MethodIcon name={name} />
                                    <span>{methodLabel(name)}</span>
                                </button>
                            );
                        })}
                        {onOpenSplitModal && (
                            <button
                                type="button"
                                onClick={onOpenSplitModal}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                    formData.isSplitPayment
                                        ? 'bg-warning text-white shadow-sm'
                                        : 'border border-gray-200 bg-white text-gray-600 hover:border-warning/40 hover:bg-warning/5 hover:text-warning'
                                }`}
                            >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                                <span>Split</span>
                                {formData.isSplitPayment && formData.splitPayments.length > 0 && (
                                    <span className="rounded-full bg-white/30 px-1.5 text-xs">
                                        {formData.splitPayments.length}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Payment Status ── */}
            {!isReturnMode && (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {t('lbl_payment_status')} <span className="text-red-400">*</span>
                    </p>
                    {isWalkInCustomer ? (
                        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-sm font-semibold text-green-700">{t('status_paid')}</span>
                            <span className="text-xs text-green-500">· {t('pos_walk_in_customer')}</span>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {availablePaymentStatuses.map((status: any) => {
                                const selected = formData.paymentStatus === status.value;
                                return (
                                    <button
                                        key={status.value}
                                        type="button"
                                        onClick={() => emit('paymentStatus', status.value)}
                                        style={selected ? { backgroundColor: status.color, borderColor: status.color } : { borderColor: status.color + '60' }}
                                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                                            selected ? 'text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: selected ? 'rgba(255,255,255,0.6)' : status.color }}
                                        />
                                        {status.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Partial Payment Input ── */}
            {!isReturnMode && formData.paymentStatus === 'partial' && !isWalkInCustomer && (
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-semibold text-blue-700">{t('lbl_partial_payment_amount')}</label>
                        <span className="text-xs text-blue-500">{t('lbl_grand_total')}: {formatCurrency(totalPayable)}</span>
                    </div>
                    <input
                        type="number" name="partialPaymentAmount" step="0.01" min="0" max={totalPayable}
                        className="form-input w-full border-blue-300 text-base font-semibold focus:border-primary focus:ring-primary"
                        placeholder={t('lbl_enter_amount')}
                        value={formData.partialPaymentAmount || ''}
                        onChange={onInputChange}
                    />
                    {formData.partialPaymentAmount > 0 && formData.partialPaymentAmount < totalPayable && (
                        <div className="mt-2 flex justify-between text-xs">
                            <span className="text-blue-600">{t('lbl_remaining_due')}:</span>
                            <span className="font-bold text-red-600">{formatCurrency(totalPayable - formData.partialPaymentAmount)}</span>
                        </div>
                    )}
                    {formData.partialPaymentAmount >= totalPayable && (
                        <p className="mt-1 text-xs text-amber-600">⚠ {t('msg_amount_exceeds_total')}</p>
                    )}
                </div>
            )}

            {/* ── Due Info ── */}
            {!isReturnMode && formData.paymentStatus === 'due' && selectedCustomer && (
                <div className="flex items-center justify-between rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3">
                    <div>
                        <p className="text-sm font-semibold text-red-700">{t('lbl_full_amount_due')}</p>
                        <p className="text-xs text-red-500">{selectedCustomer.name}</p>
                    </div>
                    <span className="text-lg font-black text-red-700 sm:text-xl">{formatCurrency(totalPayable)}</span>
                </div>
            )}

            {/* ── Partial Breakdown ── */}
            {!isReturnMode && formData.paymentStatus === 'partial' && formData.partialPaymentAmount > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-green-700">{t('lbl_amount_paying_now')}</span>
                        <span className="font-bold text-green-800">{formatCurrency(formData.partialPaymentAmount)}</span>
                    </div>
                    <div className="mt-1 flex justify-between text-sm">
                        <span className="text-red-600">{t('lbl_amount_due_later')}</span>
                        <span className="font-bold text-red-700">{formatCurrency(totalPayable - formData.partialPaymentAmount)}</span>
                    </div>
                </div>
            )}

            {/* ── Return Mode Summary ── */}
            {isReturnMode && (
                <div className="space-y-3">
                    <div className="flex justify-center">
                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                            </svg>
                            {t('pos_return_mode')}
                        </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-0">
                        <div className="flex items-center justify-between py-2">
                            <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
                                    </svg>
                                </span>
                                {t('pos_returned_items')}
                            </span>
                            <span className="font-bold text-red-600">−{formatCurrency(returnTotal)}</span>
                        </div>

                        {newItemsTotal > 0 && (
                            <div className="flex items-center justify-between border-t border-slate-200 py-2">
                                <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </span>
                                    {t('pos_exchange_items')}
                                </span>
                                <span className="font-bold text-emerald-600">+{formatCurrency(newItemsTotal)}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t-2 border-slate-300 pt-2">
                            <span className="text-sm font-bold text-slate-700">{t('lbl_net_amount')}</span>
                            <span className={`text-lg font-black ${returnNetAmount < 0 ? 'text-emerald-600' : returnNetAmount > 0 ? 'text-primary' : 'text-slate-600'}`}>
                                {formatCurrency(returnNetAmount)}
                            </span>
                        </div>
                    </div>

                    {returnNetAmount < 0 ? (
                        <div className="flex items-center justify-between rounded-xl bg-success p-4 shadow-sm">
                            <div>
                                <p className="font-bold text-white">{t('pos_refund_customer')}</p>
                                <p className="text-xs text-white/70">{t('pos_cash_card_refund')}</p>
                            </div>
                            <p className="text-xl font-black text-white sm:text-2xl">{formatCurrency(Math.abs(returnNetAmount))}</p>
                        </div>
                    ) : returnNetAmount > 0 ? (
                        <div className="flex items-center justify-between rounded-xl bg-primary p-4 shadow-sm">
                            <div>
                                <p className="font-bold text-white">{t('pos_collect_payment')}</p>
                                <p className="text-xs text-white/70">{t('pos_additional_amount')}</p>
                            </div>
                            <p className="text-xl font-black text-white sm:text-2xl">{formatCurrency(returnNetAmount)}</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between rounded-xl bg-slate-500 p-4 shadow-sm">
                            <div>
                                <p className="font-bold text-white">{t('pos_even_exchange')}</p>
                                <p className="text-xs text-white/70">{t('pos_no_payment_needed')}</p>
                            </div>
                            <p className="text-xl font-black text-white sm:text-2xl">{formatCurrency(0)}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentSummarySection;
