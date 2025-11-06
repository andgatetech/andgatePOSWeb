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
}) => {
    const canUsePoints = selectedCustomer && Number(selectedCustomer.points) > 0;
    const canUseBalance = selectedCustomer && parseFloat(String(selectedCustomer.balance ?? '0')) > 0;

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
                <select name="paymentStatus" className="form-select w-full sm:w-40" value={formData.paymentStatus} onChange={onInputChange} required>
                    <option value="">Select</option>
                    <option value="paid">Paid</option>
                    <option value="due">Due</option>
                    <option value="partial">Partial</option>
                </select>
            </div>

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
                <span>Total Payable</span>
                <span>৳{totalPayable.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default PaymentSummarySection;
