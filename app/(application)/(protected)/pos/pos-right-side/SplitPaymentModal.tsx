'use client';
import { useState, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import type { SplitPayment } from './types';

interface SplitPaymentModalProps {
    isOpen: boolean;
    totalPayable: number;
    paymentMethodOptions: any[];
    initialSplitPayments: SplitPayment[];
    onConfirm: (payments: SplitPayment[]) => void;
    onClose: () => void;
}

const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
    isOpen,
    totalPayable,
    paymentMethodOptions,
    initialSplitPayments,
    onConfirm,
    onClose,
}) => {
    const { t } = getTranslation();
    const { formatCurrency } = useCurrency();

    const defaultMethod = paymentMethodOptions[0]?.payment_method_name ?? 'Cash';

    const [rows, setRows] = useState<SplitPayment[]>(
        initialSplitPayments.length >= 2
            ? initialSplitPayments
            : [
                { payment_type: defaultMethod, amount: 0 },
                { payment_type: paymentMethodOptions[1]?.payment_method_name ?? defaultMethod, amount: 0 },
              ]
    );

    useEffect(() => {
        if (isOpen) {
            setRows(
                initialSplitPayments.length >= 2
                    ? initialSplitPayments
                    : [
                        { payment_type: defaultMethod, amount: 0 },
                        { payment_type: paymentMethodOptions[1]?.payment_method_name ?? defaultMethod, amount: 0 },
                      ]
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    const allocatedTotal = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const remaining = Math.round((totalPayable - allocatedTotal) * 100) / 100;
    const isBalanced = Math.abs(remaining) < 0.005;

    const updateRow = (idx: number, field: keyof SplitPayment, value: string | number) => {
        setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
    };

    const addRow = () => {
        setRows((prev) => [...prev, { payment_type: defaultMethod, amount: 0 }]);
    };

    const removeRow = (idx: number) => {
        if (rows.length <= 2) return;
        setRows((prev) => prev.filter((_, i) => i !== idx));
    };

    const fillRemaining = (idx: number) => {
        const others = rows.reduce((sum, r, i) => (i === idx ? sum : sum + (Number(r.amount) || 0)), 0);
        const fill = Math.max(0, Math.round((totalPayable - others) * 100) / 100);
        updateRow(idx, 'amount', fill);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-800">Split Payment</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Total: {formatCurrency(totalPayable)}</p>
                    </div>
                    <button type="button" onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Rows */}
                <div className="space-y-2.5 px-5 py-4">
                    {rows.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <select
                                value={row.payment_type}
                                onChange={(e) => updateRow(idx, 'payment_type', e.target.value)}
                                className="form-select flex-1 rounded-lg border-gray-200 py-2 text-sm"
                            >
                                {paymentMethodOptions.map((m: any) => (
                                    <option key={m.id ?? m.payment_method_name} value={m.payment_method_name}>
                                        {m.payment_method_name}
                                    </option>
                                ))}
                            </select>
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={row.amount || ''}
                                    onChange={(e) => updateRow(idx, 'amount', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="form-input w-full rounded-lg border-gray-200 py-2 text-sm"
                                />
                                {remaining !== 0 && (
                                    <button
                                        type="button"
                                        onClick={() => fillRemaining(idx)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
                                    >
                                        Fill
                                    </button>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeRow(idx)}
                                disabled={rows.length <= 2}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-danger disabled:opacity-30"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5" />
                                </svg>
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addRow}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-primary/50 hover:text-primary"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Payment Method
                    </button>
                </div>

                {/* Balance indicator */}
                <div className={`mx-5 mb-4 flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    isBalanced ? 'bg-success/10 text-success' : remaining > 0 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                }`}>
                    <span>{isBalanced ? 'Balanced' : remaining > 0 ? 'Remaining' : 'Exceeds total'}</span>
                    <span>{isBalanced ? '✓' : formatCurrency(Math.abs(remaining))}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-gray-100 px-5 py-4">
                    <button type="button" onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={!isBalanced}
                        onClick={() => onConfirm(rows.map((r) => ({ ...r, amount: Number(r.amount) })))}
                        className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50 hover:bg-primary/90"
                    >
                        Confirm Split
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SplitPaymentModal;
