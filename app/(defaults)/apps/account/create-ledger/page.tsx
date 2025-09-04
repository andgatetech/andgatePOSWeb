'use client';
import { useCreateLedgerMutation, useGetUserAccountsQuery } from '@/store/features/account/accountApi';
import { ArrowLeft, Building, Coins, Info, RotateCcw, Save, Tag } from 'lucide-react';
import { useState } from 'react';

const CreateLedger = () => {
    const [formData, setFormData] = useState({
        account_id: '',
        name: '',
        type: '',
        balance: '0.00',
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    // RTK Query hooks
    const { data: accountsData, isLoading: accountsLoading, error: accountsError } = useGetUserAccountsQuery();
    const [createLedger, { isLoading: createLoading }] = useCreateLedgerMutation();

    const accounts = accountsData?.data || [];

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        try {
            const result = await createLedger({
                ...formData,
                balance: parseFloat(formData.balance) || 0,
            }).unwrap();

            if (result.success) {
                setSuccess(true);
                setFormData({
                    account_id: '',
                    name: '',
                    type: '',
                    balance: '0.00',
                });
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch (error) {
            console.error('Error creating ledger:', error);
            if (error.data?.errors) {
                setErrors(error.data.errors);
            } else {
                setErrors({ general: error.data?.message || 'Failed to create ledger' });
            }
        }
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            account_id: '',
            name: '',
            type: '',
            balance: '0.00',
        });
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="mb-4 flex items-center gap-4">
                                    <div className="rounded-xl bg-white/20 p-3">
                                        <Tag className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold">Create New Ledger</h1>
                                        <p className="mt-1 text-indigo-100">Add a new ledger to your accounting system</p>
                                    </div>
                                </div>
                            </div>
                            <button className="rounded-xl bg-white/20 p-3 transition-colors hover:bg-white/30">
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mx-8 mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                                    <Save className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-800">Ledger Created Successfully!</h4>
                                    <p className="text-sm text-green-600">Your new ledger has been added to the system.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Messages */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mx-8 mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
                                    <Info className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-red-800">Please fix the following errors:</h4>
                                    <ul className="mt-1 list-inside list-disc text-sm text-red-600">
                                        {Object.entries(errors).map(([field, messages]) =>
                                            Array.isArray(messages) ? messages.map((message, index) => <li key={`${field}-${index}`}>{message}</li>) : <li key={field}>{messages}</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loading State for Accounts */}
                    {accountsLoading && (
                        <div className="mx-8 mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                <p className="text-sm text-blue-600">Loading accounts...</p>
                            </div>
                        </div>
                    )}

                    {/* Form Content */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Account Selection */}
                            <div className="space-y-2">
                                <label htmlFor="account_id" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Building className="h-4 w-4" />
                                    Select Account
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="account_id"
                                    name="account_id"
                                    value={formData.account_id}
                                    onChange={handleInputChange}
                                    disabled={accountsLoading}
                                    className={`w-full rounded-xl border px-4 py-3 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                                        errors.account_id ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    }`}
                                    required
                                >
                                    <option value="">Choose an account...</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.account_id && (
                                    <p className="flex items-center gap-1 text-sm text-red-600">
                                        <Info className="h-3 w-3" />
                                        {Array.isArray(errors.account_id) ? errors.account_id[0] : errors.account_id}
                                    </p>
                                )}
                            </div>

                            {/* Ledger Name - Changed to input */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Tag className="h-4 w-4" />
                                    Ledger Name
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter ledger name (e.g., Cash, Accounts Receivable, Inventory)"
                                    className={`w-full rounded-xl border px-4 py-3 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
                                        errors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    }`}
                                    required
                                />
                                {errors.name && (
                                    <p className="flex items-center gap-1 text-sm text-red-600">
                                        <Info className="h-3 w-3" />
                                        {Array.isArray(errors.name) ? errors.name[0] : errors.name}
                                    </p>
                                )}
                                <p className="flex items-center gap-1 text-xs text-slate-500">
                                    <Info className="h-3 w-3" />
                                    Choose a descriptive name for this ledger
                                </p>
                            </div>

                            {/* Ledger Type - Changed to input */}
                            <div className="space-y-2">
                                <label htmlFor="type" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Tag className="h-4 w-4" />
                                    Ledger Type
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    placeholder="Enter ledger type (e.g., asset, liability, equity, revenue, expense)"
                                    className={`w-full rounded-xl border px-4 py-3 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
                                        errors.type ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                    }`}
                                    required
                                />
                                {errors.type && (
                                    <p className="flex items-center gap-1 text-sm text-red-600">
                                        <Info className="h-3 w-3" />
                                        {Array.isArray(errors.type) ? errors.type[0] : errors.type}
                                    </p>
                                )}
                                <p className="flex items-center gap-1 text-xs text-slate-500">
                                    <Info className="h-3 w-3" />
                                    Common types: asset, liability, equity, revenue, expense
                                </p>
                            </div>

                            {/* Initial Balance */}
                            <div className="space-y-2">
                                <label htmlFor="balance" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Coins className="h-4 w-4" />
                                    Initial Balance
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 transform text-slate-500">৳</span>
                                    <input
                                        type="number"
                                        id="balance"
                                        name="balance"
                                        value={formData.balance}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className={`w-full rounded-xl border py-3 pl-8 pr-4 transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 ${
                                            errors.balance ? 'border-red-300 bg-red-50' : 'border-slate-300'
                                        }`}
                                    />
                                </div>
                                {errors.balance && (
                                    <p className="flex items-center gap-1 text-sm text-red-600">
                                        <Info className="h-3 w-3" />
                                        {Array.isArray(errors.balance) ? errors.balance[0] : errors.balance}
                                    </p>
                                )}
                                <p className="flex items-center gap-1 text-xs text-slate-500">
                                    <Info className="h-3 w-3" />
                                    Optional: Set the starting balance for this ledger
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={createLoading}
                                    className="flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset Form
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading || accountsLoading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {createLoading ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Create Ledger
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateLedger;
