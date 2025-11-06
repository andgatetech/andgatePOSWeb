import type { PosFormData } from './types';

interface CashPaymentSectionProps {
    formData: PosFormData;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    totalPayable: number;
    isWalkInCustomer: boolean;
}

const CashPaymentSection: React.FC<CashPaymentSectionProps> = ({ formData, onInputChange, totalPayable, isWalkInCustomer }) => {
    // Only show for Cash payment method and Paid status
    // For partial/due, the amount is handled in PaymentSummarySection
    if (!formData.paymentMethod || formData.paymentMethod.toLowerCase() !== 'cash') {
        return null;
    }

    // Don't show for due status (no payment at all)
    if (formData.paymentStatus === 'due') {
        return null;
    }

    // For partial payment, the amount is handled in PaymentSummarySection
    if (formData.paymentStatus === 'partial') {
        return null;
    }

    const insufficientAmount = formData.amountPaid > 0 && formData.amountPaid < totalPayable;

    return (
        <div className="mt-4 rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-md">
            <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-green-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                Cash Payment Details
            </h4>

            <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="text-sm font-semibold text-green-700">Amount Received:</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-green-600">৳</span>
                        <input
                            type="number"
                            name="amountPaid"
                            step="0.01"
                            min="0"
                            className="form-input w-full border-green-300 pl-8 pr-4 text-lg font-semibold focus:border-green-500 focus:ring-green-500 sm:w-48"
                            placeholder="0.00"
                            value={formData.amountPaid || ''}
                            onChange={onInputChange}
                        />
                    </div>
                </div>

                {formData.amountPaid > 0 && (
                    <div className="flex flex-col gap-2 rounded-md border-2 border-yellow-300 bg-yellow-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="text-sm font-bold text-yellow-800">Change to Return:</label>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-yellow-900">৳{formData.changeAmount.toFixed(2)}</span>
                            {formData.changeAmount > 0 && (
                                <svg className="h-6 w-6 animate-bounce text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 8 8 0 0118 0z"
                                    />
                                </svg>
                            )}
                        </div>
                    </div>
                )}

                {insufficientAmount && (
                    <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-700">
                        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Insufficient amount! Still need: ৳{(totalPayable - formData.amountPaid).toFixed(2)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashPaymentSection;
