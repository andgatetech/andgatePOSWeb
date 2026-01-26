import { useCurrency } from '@/hooks/useCurrency';
import type { PosFormData } from './types';

interface CashPaymentSectionProps {
    formData: PosFormData;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    totalPayable: number;
    isWalkInCustomer: boolean;
    // Return mode props
    isReturnMode?: boolean;
    returnNetAmount?: number;
}

const CashPaymentSection: React.FC<CashPaymentSectionProps> = ({ formData, onInputChange, totalPayable, isWalkInCustomer, isReturnMode = false, returnNetAmount = 0 }) => {
    const { formatCurrency, symbol } = useCurrency();

    const handleQuickAmount = (amount: number) => {
        const event = {
            target: {
                name: 'amountPaid',
                value: amount.toString(),
            },
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(event);
    };

    // Only show for Cash payment method
    if (!formData.paymentMethod || formData.paymentMethod.toLowerCase() !== 'cash') {
        return null;
    }

    // Don't show for due status (no payment at all) - only in normal mode
    if (!isReturnMode && formData.paymentStatus === 'due') {
        return null;
    }

    // For partial payment, the amount is handled in PaymentSummarySection - only in normal mode
    if (!isReturnMode && formData.paymentStatus === 'partial') {
        return null;
    }

    // Return Mode - Refund scenario (customer gets money back)
    if (isReturnMode && returnNetAmount < 0) {
        const refundAmount = Math.abs(returnNetAmount);
        return (
            <div className="mt-4 rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-md">
                <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-emerald-800">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    Refund Details
                </h4>

                <div className="space-y-3">
                    {/* Refund Amount Display */}
                    <div className="flex flex-col gap-2 rounded-md border-2 border-emerald-300 bg-emerald-100 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="text-sm font-bold text-emerald-800">Refund Amount:</label>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-emerald-700">{formatCurrency(refundAmount)}</span>
                            <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    {/* Refund Method Info */}
                    <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-white p-2 text-sm text-emerald-700">
                        <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Cash refund will be processed</span>
                    </div>
                </div>
            </div>
        );
    }

    // Return Mode - Customer pays extra scenario
    if (isReturnMode && returnNetAmount > 0) {
        const insufficientAmount = formData.amountPaid > 0 && formData.amountPaid < returnNetAmount;
        return (
            <div className="mt-4 rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-md">
                <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-blue-800">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    Additional Payment
                </h4>

                <div className="space-y-3">
                    {/* Amount Due */}
                    <div className="flex flex-col gap-2 rounded-md border border-blue-200 bg-blue-100 p-2 sm:flex-row sm:items-center sm:justify-between">
                        <label className="text-sm font-semibold text-blue-700">Amount Due:</label>
                        <span className="text-lg font-bold text-blue-800">{formatCurrency(returnNetAmount)}</span>
                    </div>

                    {/* Amount Received Input */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <label className="text-sm font-semibold text-blue-700">Amount Received:</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-blue-600">{symbol}</span>
                            <input
                                type="number"
                                name="amountPaid"
                                step="0.01"
                                min="0"
                                className="form-input w-full border-blue-300 pl-8 pr-4 text-lg font-semibold focus:border-blue-500 focus:ring-blue-500 sm:w-48"
                                placeholder="0.00"
                                value={formData.amountPaid || ''}
                                onChange={onInputChange}
                            />
                        </div>
                    </div>

                    {/* Change Display */}
                    {formData.amountPaid > returnNetAmount && (
                        <div className="flex flex-col gap-2 rounded-md border-2 border-yellow-300 bg-yellow-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                            <label className="text-sm font-bold text-yellow-800">Change to Return:</label>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-yellow-900">{formatCurrency(formData.amountPaid - returnNetAmount)}</span>
                            </div>
                        </div>
                    )}

                    {/* Insufficient Warning */}
                    {insufficientAmount && (
                        <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-700">
                            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Insufficient amount! Still need: {formatCurrency(returnNetAmount - formData.amountPaid)}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Return Mode - Even exchange (no payment section needed)
    if (isReturnMode && returnNetAmount === 0) {
        return null;
    }

    // Normal POS Mode - Original logic
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
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-green-600">{symbol}</span>
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
                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {[100, 500, 1000].map((amount) => (
                        <button
                            key={amount}
                            type="button"
                            onClick={() => handleQuickAmount(amount)}
                            className="rounded-md border border-green-200 bg-white px-3 py-1.5 text-xs font-bold text-green-700 shadow-sm transition-all hover:border-green-400 hover:bg-green-50 hover:shadow active:scale-95"
                        >
                            {amount}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleQuickAmount(totalPayable)}
                        className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-100 hover:shadow active:scale-95"
                    >
                        Exact
                    </button>
                </div>

                {formData.amountPaid > 0 && (
                    <div className="flex flex-col gap-2 rounded-md border-2 border-yellow-300 bg-yellow-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="text-sm font-bold text-yellow-800">Change to Return:</label>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-yellow-900">{formatCurrency(formData.changeAmount)}</span>
                        </div>
                    </div>
                )}

                {insufficientAmount && (
                    <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-700">
                        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Insufficient amount! Still need: {formatCurrency(totalPayable - formData.amountPaid)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashPaymentSection;
