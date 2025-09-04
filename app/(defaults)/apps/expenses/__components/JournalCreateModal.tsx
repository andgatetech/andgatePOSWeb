'use client';

import { useCreateJournalMutation, useGetJournalsQuery } from '@/store/features/journals/journals';
import { useGetLedgersQuery } from '@/store/features/ledger/ledger';
import { BookOpen, DollarSign, FileText, Loader2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const JournalCreateModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        ledger_id: '',
        notes: '',
        debit: '',
        credit: '',
    });
    const [ledgers, setLedgers] = useState([]);
    const [errors, setErrors] = useState({});
    const [transactionType, setTransactionType] = useState('debit'); // 'debit' or 'credit'
    const { data: ledgersData } = useGetLedgersQuery();
    console.log(ledgersData);
    const token = useSelector((state) => state.auth.token);
    const [createJournal, { isLoading }] = useCreateJournalMutation();

    // Fetch ledgers for dropdown
    // const fetchLedgers = async () => {
    //     try {
    //         const response = await fetch('http://127.0.0.1:8000/api/ledgers', {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //                 Accept: 'application/json',
    //             },
    //         });
    //         const data = await response.json();

    //         if (data.data) {
    //             setLedgers(data.data);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching ledgers:', error);
    //     }
    // };

    // useEffect(() => {
    //     fetchLedgers();
    // }, []);

    // console.log(ledgers);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;

        // Clear both debit and credit first
        setFormData({
            ...formData,
            debit: transactionType === 'debit' ? value : '',
            credit: transactionType === 'credit' ? value : '',
        });

        // Clear amount errors
        setErrors({
            ...errors,
            debit: '',
            credit: '',
        });
    };

    const handleTransactionTypeChange = (type) => {
        setTransactionType(type);
        // Clear amounts when switching type
        setFormData({
            ...formData,
            debit: '',
            credit: '',
        });
        setErrors({
            ...errors,
            debit: '',
            credit: '',
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.ledger_id) {
            newErrors.ledger_id = 'Please select a ledger';
        }

        const amount = transactionType === 'debit' ? formData.debit : formData.credit;
        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // Prepare data with proper debit/credit values
        const submitData = {
            ledger_id: formData.ledger_id,
            notes: formData.notes,
            debit: transactionType === 'debit' ? parseFloat(formData.debit || 0) : 0,
            credit: transactionType === 'credit' ? parseFloat(formData.credit || 0) : 0,
        };

        try {
            const result = await createJournal(submitData).unwrap();

            if (result.success) {
                onSuccess();
                // Reset form
                setFormData({
                    ledger_id: '',
                    notes: '',
                    debit: '',
                    credit: '',
                });
                setErrors({});
            }
        } catch (error) {
            console.error('Error creating journal:', error);

            // Handle validation errors from server
            if (error.data && error.data.errors) {
                setErrors(error.data.errors);
            } else {
                setErrors({
                    general: error.data?.message || 'Failed to create journal entry',
                });
            }
        }
    };

    const selectedLedger = ledgers.find((ledger) => ledger.id == formData.ledger_id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="rounded-t-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-white/20 p-2">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Create Journal Entry</h3>
                                <p className="text-emerald-100">Add a new accounting transaction</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* General Error */}
                    {errors.general && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                <p className="text-sm font-medium text-red-700">{errors.general}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Ledger Selection */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <BookOpen size={16} />
                                Select Ledger *
                            </label>
                            <select
                                name="ledger_id"
                                value={formData.ledger_id}
                                onChange={handleInputChange}
                                className={`w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:ring-2 focus:ring-emerald-500/20 ${
                                    errors.ledger_id ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-emerald-500'
                                }`}
                            >
                                <option value="">Choose a ledger...</option>
                                {ledgers.map((ledger) => (
                                    <option key={ledger.id} value={ledger.id}>
                                        {ledger.name || ledger.title}
                                        {ledger.account && ` (${ledger.account.name})`}
                                        {ledger.type && ` - ${ledger.type.charAt(0).toUpperCase() + ledger.type.slice(1)}`}
                                    </option>
                                ))}
                            </select>
                            {errors.ledger_id && <p className="mt-1 text-xs text-red-600">{errors.ledger_id}</p>}

                            {/* Ledger Info Display */}
                            {selectedLedger && (
                                <div className="mt-2 rounded-lg bg-slate-50 p-3">
                                    <div className="flex items-center justify-between text-xs text-slate-600">
                                        <span>Type: {selectedLedger.type?.charAt(0).toUpperCase() + selectedLedger.type?.slice(1)}</span>
                                        {selectedLedger.balance !== undefined && (
                                            <span className={`font-medium ${selectedLedger.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                Balance: ৳{Number(selectedLedger.balance).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Transaction Type */}
                        <div>
                            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <DollarSign size={16} />
                                Transaction Type *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleTransactionTypeChange('debit')}
                                    className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                                        transactionType === 'debit' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`h-2 w-2 rounded-full ${transactionType === 'debit' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                                    Debit (Expense/Asset)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTransactionTypeChange('credit')}
                                    className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                                        transactionType === 'credit' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className={`h-2 w-2 rounded-full ${transactionType === 'credit' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                    Credit (Income/Liability)
                                </button>
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <DollarSign size={16} />
                                Amount *
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-3 text-slate-500">৳</div>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={transactionType === 'debit' ? formData.debit : formData.credit}
                                    onChange={handleAmountChange}
                                    className={`w-full rounded-lg border px-4 py-3 pl-8 text-sm transition-colors focus:ring-2 focus:ring-emerald-500/20 ${
                                        errors.amount ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-emerald-500'
                                    }`}
                                />
                            </div>
                            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <FileText size={16} />
                                Notes (Optional)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Add description or reference for this entry..."
                                rows={3}
                                className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Create Entry
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JournalCreateModal;
