import { Check, Loader2, MoreVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

export interface PaymentMethodForm {
    payment_method_name: string;
    payment_details_number: string;
    description: string;
    notes: string;
    is_active: boolean;
}

interface PaymentMethodsTabProps {
    paymentMethods: any[];
    isLoading?: boolean;
    newPaymentMethod: PaymentMethodForm;
    setNewPaymentMethodField: (field: keyof PaymentMethodForm, value: string | boolean) => void;
    handleCreatePaymentMethod: () => void;
    editingPaymentMethodId: number | null;
    editingPaymentMethod: PaymentMethodForm;
    setEditingPaymentMethodField: (field: keyof PaymentMethodForm, value: string | boolean) => void;
    startEditingPaymentMethod: (method: any) => void;
    cancelEditingPaymentMethod: () => void;
    handleUpdatePaymentMethod: (id: number) => void;
    handleDeletePaymentMethod: (id: number, name: string) => void;
    handleTogglePaymentMethodActive: (id: number, isActive: boolean) => void;
}

const PaymentMethodsTab: React.FC<PaymentMethodsTabProps> = ({
    paymentMethods,
    isLoading,
    newPaymentMethod,
    setNewPaymentMethodField,
    handleCreatePaymentMethod,
    editingPaymentMethodId,
    editingPaymentMethod,
    setEditingPaymentMethodField,
    startEditingPaymentMethod,
    cancelEditingPaymentMethod,
    handleUpdatePaymentMethod,
    handleDeletePaymentMethod,
    handleTogglePaymentMethodActive,
}) => {
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    const renderActiveToggle = (isActive: boolean, onToggle: () => void, labelId: string) => (
        <label className="relative inline-flex cursor-pointer items-center" htmlFor={labelId}>
            <input id={labelId} type="checkbox" checked={isActive} onChange={onToggle} className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
        </label>
    );

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                    <p className="text-sm text-gray-500">Configure the tender types available to your staff during checkout.</p>
                </div>

                {/* Add New Payment Method */}
                <div className="mb-6 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-800">Add Payment Method</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Method Name *</label>
                            <input
                                type="text"
                                value={newPaymentMethod.payment_method_name}
                                onChange={(e) => setNewPaymentMethodField('payment_method_name', e.target.value)}
                                placeholder="e.g., Cash, Card, Mobile Wallet"
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Reference / Number (Optional)</label>
                            <input
                                type="text"
                                value={newPaymentMethod.payment_details_number}
                                onChange={(e) => setNewPaymentMethodField('payment_details_number', e.target.value)}
                                placeholder="e.g., POS-TERM-002"
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Description</label>
                            <textarea
                                value={newPaymentMethod.description}
                                onChange={(e) => setNewPaymentMethodField('description', e.target.value)}
                                placeholder="Where or how this payment method is used"
                                rows={2}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Notes</label>
                            <textarea
                                value={newPaymentMethod.notes}
                                onChange={(e) => setNewPaymentMethodField('notes', e.target.value)}
                                placeholder="Special instructions or limitations"
                                rows={2}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleCreatePaymentMethod}
                            className="inline-flex items-center rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Method
                        </button>
                    </div>
                </div>

                {/* Payment Methods Table */}
                <div className="relative overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Method</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Reference</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Notes</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Active</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                    </td>
                                </tr>
                            ) : paymentMethods && paymentMethods.length > 0 ? (
                                paymentMethods.map((method: any, index: number) => {
                                    const isEditing = editingPaymentMethodId === method.id;
                                    const activeValue = method.is_active === true || method.is_active === 1 || method.is_active === '1';

                                    return (
                                        <tr key={method.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">{method.id}</td>
                                            <td className="px-4 py-3 align-top">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editingPaymentMethod.payment_method_name}
                                                        onChange={(e) => setEditingPaymentMethodField('payment_method_name', e.target.value)}
                                                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-900">{method.payment_method_name}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editingPaymentMethod.payment_details_number}
                                                        onChange={(e) => setEditingPaymentMethodField('payment_details_number', e.target.value)}
                                                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-700">{method.payment_details_number}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                {isEditing ? (
                                                    <textarea
                                                        value={editingPaymentMethod.description}
                                                        onChange={(e) => setEditingPaymentMethodField('description', e.target.value)}
                                                        rows={2}
                                                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-600">{method.description || '—'}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                {isEditing ? (
                                                    <textarea
                                                        value={editingPaymentMethod.notes}
                                                        onChange={(e) => setEditingPaymentMethodField('notes', e.target.value)}
                                                        rows={2}
                                                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-600">{method.notes || '—'}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {isEditing
                                                    ? renderActiveToggle(
                                                          editingPaymentMethod.is_active,
                                                          () => setEditingPaymentMethodField('is_active', !editingPaymentMethod.is_active),
                                                          `edit-payment-method-active-${method.id}`
                                                      )
                                                    : renderActiveToggle(activeValue, () => handleTogglePaymentMethodActive(method.id, !activeValue), `payment-method-active-${method.id}`)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {isEditing ? (
                                                    <div className="inline-flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdatePaymentMethod(method.id)}
                                                            className="rounded bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                                                            title="Save"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button type="button" onClick={cancelEditingPaymentMethod} className="rounded bg-gray-400 p-1.5 text-white hover:bg-gray-500" title="Cancel">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="relative inline-flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenDropdown(openDropdown === method.id ? null : method.id)}
                                                            className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                                                        >
                                                            <MoreVertical className="h-5 w-5" />
                                                        </button>

                                                        {openDropdown === method.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-[100]" onClick={() => setOpenDropdown(null)} />
                                                                <div
                                                                    className={`absolute right-0 z-[101] min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl ${
                                                                        index > paymentMethods.length / 2 ? 'bottom-8' : 'top-8'
                                                                    }`}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            startEditingPaymentMethod(method);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-emerald-50"
                                                                    >
                                                                        <Pencil className="h-4 w-4 text-emerald-600" />
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleDeletePaymentMethod(method.id, method.payment_method_name);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-red-50"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No payment methods added yet. Use the form above to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Total Count */}
                {paymentMethods && paymentMethods.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                        Total: <span className="font-semibold">{paymentMethods.length}</span> payment method(s)
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentMethodsTab;
