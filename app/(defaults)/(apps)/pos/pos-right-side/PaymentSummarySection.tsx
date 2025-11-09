import type { Customer, PosFormData } from './types';

interface PaymentSummarySectionProps {
    formData: PosFormData;
    selectedCustomer: Customer | null;
    paymentMethodOptions: any[];
    onInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    subtotalWithoutTax: number;
    taxAmount: number;
    discountAmount: number;
    membershipDiscountAmount: number;
    pointsDiscount: number;
    balanceDiscount: number;
    totalPayable: number;
    isWalkInCustomer: boolean; // New prop to determine if walk-in customer
}

const PaymentSummarySection: React.FC<PaymentSummarySectionProps> = ({
    formData,
    selectedCustomer,
    paymentMethodOptions,
    onInputChange,
    subtotalWithoutTax,
    taxAmount,
    discountAmount,
    membershipDiscountAmount,
    pointsDiscount,
    balanceDiscount,
    totalPayable,
    isWalkInCustomer,
}) => {
    const canUsePoints = selectedCustomer && Number(selectedCustomer.points) > 0;
    const canUseBalance = selectedCustomer && parseFloat(String(selectedCustomer.balance ?? '0')) > 0;

    // Determine available payment statuses based on customer type
    const getAvailablePaymentStatuses = () => {
        if (isWalkInCustomer) {
            // Walk-in customers can only pay fully
            return [{ value: 'paid', label: 'Paid' }];
        }

        if (selectedCustomer) {
            // Selected customers can have due or partial payments
            return [
                { value: 'paid', label: 'Paid' },
                { value: 'partial', label: 'Partial' },
                { value: 'due', label: 'Due' },
            ];
        }

        // Manual entry customers (new customers) - only paid
        return [{ value: 'paid', label: 'Paid' }];
    };

    const availablePaymentStatuses = getAvailablePaymentStatuses();

    return (
        <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:gap-3">
            {selectedCustomer && formData.membershipDiscount > 0 && (
                <div className="flex justify-between rounded bg-green-50 p-2">
                    <label className="text-sm font-semibold text-green-700 sm:text-base">Membership Discount ({selectedCustomer.membership})</label>
                    <span className="text-sm font-semibold text-green-700 sm:text-base">{formData.membershipDiscount}%</span>
                </div>
            )}

            {canUsePoints && (
                <div className="rounded border border-orange-200 bg-orange-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" name="usePoints" className="mr-2" checked={formData.usePoints} onChange={onInputChange} />
                            <span className="font-semibold text-orange-700">Use Loyalty Points</span>
                        </label>
                        <span className="text-sm text-orange-600">Available: {Number(selectedCustomer.points) || 0} points</span>
                    </div>
                    {formData.usePoints && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-orange-600">Points to use:</span>
                            <input
                                type="number"
                                name="pointsToUse"
                                className="form-input w-24"
                                min={0}
                                max={Number(selectedCustomer.points) || 0}
                                value={formData.pointsToUse}
                                onChange={onInputChange}
                            />
                        </div>
                    )}
                    {formData.usePoints && formData.pointsToUse > 0 && <div className="mt-2 text-sm text-orange-600">Points discount: -৳{pointsDiscount.toFixed(2)}</div>}
                </div>
            )}

            {canUseBalance && (
                <div className="rounded border border-teal-200 bg-teal-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" name="useBalance" className="mr-2" checked={formData.useBalance} onChange={onInputChange} />
                            <span className="font-semibold text-teal-700">Use Account Balance</span>
                        </label>
                        <span className="text-sm text-teal-600">Available:৳{selectedCustomer?.balance}</span>
                    </div>
                    {formData.useBalance && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-teal-600">Balance to use:</span>
                            <input
                                type="number"
                                name="balanceToUse"
                                className="form-input w-24"
                                min={0}
                                max={parseFloat(String(selectedCustomer?.balance ?? '0'))}
                                step={0.01}
                                value={formData.balanceToUse}
                                onChange={onInputChange}
                            />
                        </div>
                    )}
                    {formData.useBalance && formData.balanceToUse > 0 && <div className="mt-2 text-sm text-teal-600">Balance discount: -৳{balanceDiscount.toFixed(2)}</div>}
                </div>
            )}

            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <label className="text-sm font-semibold sm:text-base">
                    Payment Method <span className="text-red-500">*</span>
                </label>
                <select name="paymentMethod" className="form-select w-full sm:w-40" value={formData.paymentMethod} onChange={onInputChange} required>
                    <option value="">Select</option>
                    {formData.paymentStatus === 'due' && <option value="due">Due</option>}
                    {paymentMethodOptions.map((method) => {
                        const optionValue = method.payment_method_name?.toLowerCase() === 'cash' ? 'cash' : method.payment_method_name;
                        return (
                            <option key={method.id} value={optionValue || ''}>
                                {method.payment_method_name || 'Unnamed Method'}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <label className="text-sm font-semibold sm:text-base">
                    Payment Status <span className="text-red-500">*</span>
                </label>
                <select name="paymentStatus" className="form-select w-full sm:w-40" value={formData.paymentStatus} onChange={onInputChange} required disabled={isWalkInCustomer}>
                    <option value="">Select</option>
                    {availablePaymentStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Show partial payment input for partial status */}
            {formData.paymentStatus === 'partial' && selectedCustomer && (
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-semibold text-blue-700">Partial Payment Amount:</label>
                        <span className="text-xs text-blue-600">Total: ৳{totalPayable.toFixed(2)}</span>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-blue-600">৳</span>
                        <input
                            type="number"
                            name="partialPaymentAmount"
                            step="0.01"
                            min="0"
                            max={totalPayable}
                            className="form-input w-full border-blue-300 pl-8 pr-4 text-lg font-semibold focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Enter amount"
                            value={formData.partialPaymentAmount || ''}
                            onChange={onInputChange}
                        />
                    </div>
                    {formData.partialPaymentAmount > 0 && formData.partialPaymentAmount < totalPayable && (
                        <div className="mt-2 flex justify-between text-sm">
                            <span className="text-blue-600">Remaining Due:</span>
                            <span className="font-semibold text-red-600">৳{(totalPayable - formData.partialPaymentAmount).toFixed(2)}</span>
                        </div>
                    )}
                    {formData.partialPaymentAmount >= totalPayable && <div className="mt-2 text-sm text-amber-600">⚠️ Amount equals or exceeds total. Consider selecting &quot;Paid&quot; status.</div>}
                </div>
            )}

            {/* Show due amount info for due status */}
            {formData.paymentStatus === 'due' && selectedCustomer && (
                <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-red-700">Full Amount Due</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-red-200 pt-2">
                        <span className="text-sm text-red-600">Total Due Amount:</span>
                        <span className="text-lg font-bold text-red-700">৳{totalPayable.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 text-xs text-red-600">This amount will be recorded as due for customer: {selectedCustomer.name}</div>
                </div>
            )}

            <div className="flex justify-between border-t border-gray-300 pt-3 text-sm font-semibold sm:pt-4 sm:text-lg">
                <span>Subtotal (without tax)</span>
                <span>৳{subtotalWithoutTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
                <span>Tax (from items)</span>
                <span>৳{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
                <span>Discount</span>
                <span>৳-{discountAmount.toFixed(2)}</span>
            </div>
            {selectedCustomer && formData.membershipDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600 sm:text-base">
                    <span>Membership Discount</span>
                    <span>৳-{membershipDiscountAmount.toFixed(2)}</span>
                </div>
            )}
            {selectedCustomer && formData.usePoints && formData.pointsToUse > 0 && (
                <div className="flex justify-between text-sm text-orange-600 sm:text-base">
                    <span>Points Payment ({formData.pointsToUse} pts)</span>
                    <span>৳-{pointsDiscount.toFixed(2)}</span>
                </div>
            )}
            {selectedCustomer && formData.useBalance && formData.balanceToUse > 0 && (
                <div className="flex justify-between text-sm text-teal-600 sm:text-base">
                    <span>Balance Payment</span>
                    <span>৳-{balanceDiscount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between border-t border-gray-300 pt-3 text-lg font-bold sm:pt-4 sm:text-xl">
                <span>Grand Total</span>
                <span>৳{totalPayable.toFixed(2)}</span>
            </div>

            {/* Payment Breakdown Summary for Partial/Due */}
            {formData.paymentStatus === 'partial' && formData.partialPaymentAmount > 0 && (
                <>
                    <div className="mt-3 rounded-lg border-2 border-blue-300 bg-blue-50 p-3">
                        <div className="mb-2 text-center text-sm font-semibold text-blue-800">Payment Breakdown</div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-green-700">Amount Paying Now:</span>
                                <span className="font-semibold text-green-800">৳{formData.partialPaymentAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-blue-200 pt-1 text-sm">
                                <span className="text-red-700">Amount Due Later:</span>
                                <span className="font-bold text-red-800">৳{(totalPayable - formData.partialPaymentAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 p-3 text-blue-900 shadow-sm">
                        <span className="text-lg font-bold">Total Payable Now</span>
                        <span className="text-2xl font-black">৳{formData.partialPaymentAmount.toFixed(2)}</span>
                    </div>
                </>
            )}

            {formData.paymentStatus === 'due' && selectedCustomer && (
                <>
                    <div className="mt-3 rounded-lg border-2 border-red-300 bg-red-50 p-3">
                        <div className="mb-2 text-center text-sm font-semibold text-red-800">Payment Summary</div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-700">Amount Paying Now:</span>
                                <span className="font-semibold text-gray-800">৳0.00</span>
                            </div>
                            <div className="flex justify-between border-t border-red-200 pt-1">
                                <span className="text-red-700">Full Amount Due:</span>
                                <span className="text-lg font-bold text-red-800">৳{totalPayable.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between rounded-lg bg-gradient-to-r from-red-100 to-red-50 p-3 text-red-900 shadow-sm">
                        <span className="text-lg font-bold">Total Payable Now</span>
                        <span className="text-2xl font-black">৳0.00</span>
                    </div>
                </>
            )}

            {formData.paymentStatus === 'paid' && (
                <div className="flex justify-between rounded-lg bg-gradient-to-r from-green-100 to-green-50 p-3 text-green-900 shadow-sm">
                    <span className="text-lg font-bold">Total Payable Now</span>
                    <span className="text-2xl font-black">৳{totalPayable.toFixed(2)}</span>
                </div>
            )}
        </div>
    );
};

export default PaymentSummarySection;
