import { Check, ChevronLeft, ChevronRight, Loader2, MoreVertical, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import Dropdown from './Dropdown';

export interface PaymentStatusForm {
    status_name: string;
    status_color: string;
    description: string;
    is_default: boolean;
    is_active: boolean;
}

interface PaymentStatusTabProps {
    paymentStatuses: any[];
    isLoading?: boolean;
    newPaymentStatus: PaymentStatusForm;
    setNewPaymentStatusField: (field: keyof PaymentStatusForm, value: string | boolean) => void;
    handleCreatePaymentStatus: () => void;
    editingPaymentStatusId: number | null;
    editingPaymentStatus: PaymentStatusForm;
    setEditingPaymentStatusField: (field: keyof PaymentStatusForm, value: string | boolean) => void;
    startEditingPaymentStatus: (status: any) => void;
    cancelEditingPaymentStatus: () => void;
    handleUpdatePaymentStatus: (id: number) => void;
    handleDeletePaymentStatus: (id: number, name: string) => void;
    handleTogglePaymentStatusActive: (id: number, isActive: boolean) => void;
    handleSetDefaultPaymentStatus: (id: number) => void;
}

const predefinedColors = [
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Gray', value: '#6b7280' },
];

const PaymentStatusTab: React.FC<PaymentStatusTabProps> = ({
    paymentStatuses,
    isLoading,
    newPaymentStatus,
    setNewPaymentStatusField,
    handleCreatePaymentStatus,
    editingPaymentStatusId,
    editingPaymentStatus,
    setEditingPaymentStatusField,
    startEditingPaymentStatus,
    cancelEditingPaymentStatus,
    handleUpdatePaymentStatus,
    handleDeletePaymentStatus,
    handleTogglePaymentStatusActive,
    handleSetDefaultPaymentStatus,
}) => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calculate pagination
    const totalItems = paymentStatuses?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = paymentStatuses?.slice(startIndex, endIndex) || [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderActiveToggle = (isActive: boolean, onToggle: () => void, labelId: string) => (
        <label className="relative inline-flex cursor-pointer items-center" htmlFor={labelId}>
            <input id={labelId} type="checkbox" checked={isActive} onChange={onToggle} className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
        </label>
    );

    const StatusBadge = ({ name, color }: { name: string; color: string }) => (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white" style={{ backgroundColor: color }}>
            <span className="h-1.5 w-1.5 rounded-full bg-white/50"></span>
            {name}
        </span>
    );

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Payment Statuses</h3>
                    <p className="text-sm text-gray-500">Configure the payment status options for your invoices and orders.</p>
                </div>

                {/* Add New Payment Status */}
                <div className="mb-6 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-800">Add Payment Status</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Status Name *</label>
                            <input
                                type="text"
                                value={newPaymentStatus.status_name}
                                onChange={(e) => setNewPaymentStatusField('status_name', e.target.value)}
                                placeholder="e.g., Paid, Pending, Partial"
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-medium text-gray-600">Status Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={newPaymentStatus.status_color}
                                    onChange={(e) => setNewPaymentStatusField('status_color', e.target.value)}
                                    className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white"
                                />
                                <select
                                    value={newPaymentStatus.status_color}
                                    onChange={(e) => setNewPaymentStatusField('status_color', e.target.value)}
                                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                    {predefinedColors.map((color) => (
                                        <option key={color.value} value={color.value}>
                                            {color.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-gray-600">Description</label>
                        <textarea
                            value={newPaymentStatus.description}
                            onChange={(e) => setNewPaymentStatusField('description', e.target.value)}
                            placeholder="Brief description of when this status should be used"
                            rows={2}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500">Preview:</span>
                            <StatusBadge name={newPaymentStatus.status_name || 'Status'} color={newPaymentStatus.status_color} />
                        </div>
                        <button
                            type="button"
                            onClick={handleCreatePaymentStatus}
                            className="inline-flex items-center rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Status
                        </button>
                    </div>
                </div>

                {/* Payment Statuses Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Color</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Description</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">Default</th>
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
                            ) : paginatedData && paginatedData.length > 0 ? (
                                paginatedData.map((status: any) => {
                                    const isEditing = editingPaymentStatusId === status.id;
                                    const activeValue = status.is_active === true || status.is_active === 1 || status.is_active === '1';
                                    const defaultValue = status.is_default === true || status.is_default === 1 || status.is_default === '1';

                                    return (
                                        <tr key={status.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">{status.id}</td>
                                            <td className="px-4 py-3 align-top">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editingPaymentStatus.status_name}
                                                        onChange={(e) => setEditingPaymentStatusField('status_name', e.target.value)}
                                                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <StatusBadge name={status.status_name} color={status.status_color} />
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={editingPaymentStatus.status_color}
                                                            onChange={(e) => setEditingPaymentStatusField('status_color', e.target.value)}
                                                            className="h-8 w-10 cursor-pointer rounded border border-gray-300 bg-white"
                                                        />
                                                        <select
                                                            value={editingPaymentStatus.status_color}
                                                            onChange={(e) => setEditingPaymentStatusField('status_color', e.target.value)}
                                                            className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        >
                                                            {predefinedColors.map((color) => (
                                                                <option key={color.value} value={color.value}>
                                                                    {color.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: status.status_color }}></div>
                                                        <span className="text-xs text-gray-500">{status.status_color}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                {isEditing ? (
                                                    <textarea
                                                        value={editingPaymentStatus.description}
                                                        onChange={(e) => setEditingPaymentStatusField('description', e.target.value)}
                                                        rows={2}
                                                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-600">{status.description || '—'}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {defaultValue ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Default</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSetDefaultPaymentStatus(status.id)}
                                                        className="text-xs text-gray-400 transition-colors hover:text-emerald-600"
                                                        title="Set as default"
                                                    >
                                                        Set
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {isEditing
                                                    ? renderActiveToggle(
                                                          editingPaymentStatus.is_active,
                                                          () => setEditingPaymentStatusField('is_active', !editingPaymentStatus.is_active),
                                                          `edit-payment-status-active-${status.id}`
                                                      )
                                                    : renderActiveToggle(activeValue, () => handleTogglePaymentStatusActive(status.id, !activeValue), `payment-status-active-${status.id}`)}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdatePaymentStatus(status.id)}
                                                            className="rounded bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                                                            title="Save"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button type="button" onClick={cancelEditingPaymentStatus} className="rounded bg-gray-400 p-1.5 text-white hover:bg-gray-500" title="Cancel">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center">
                                                        <Dropdown
                                                            offset={[0, 5]}
                                                            placement="bottom-end"
                                                            btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                            button={<MoreVertical className="h-5 w-5" />}
                                                        >
                                                            <ul className="min-w-[120px] rounded-lg border bg-white shadow-lg">
                                                                <li>
                                                                    <button
                                                                        onClick={() => startEditingPaymentStatus(status)}
                                                                        className="w-full cursor-pointer px-4 py-2 text-left font-medium text-blue-600 hover:bg-blue-50"
                                                                    >
                                                                        Edit Status
                                                                    </button>
                                                                </li>
                                                                {!defaultValue && (
                                                                    <li className="border-t">
                                                                        <button
                                                                            onClick={() => handleDeletePaymentStatus(status.id, status.status_name)}
                                                                            className="w-full cursor-pointer px-4 py-2 text-left font-medium text-red-500 hover:bg-red-50"
                                                                        >
                                                                            Delete Status
                                                                        </button>
                                                                    </li>
                                                                )}
                                                            </ul>
                                                        </Dropdown>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No payment statuses added yet. Use the form above to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold">{startIndex + 1}</span> to <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> of{' '}
                            <span className="font-semibold">{totalItems}</span> payment statuses
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`rounded px-3 py-1.5 text-sm font-medium ${
                                            currentPage === page ? 'bg-emerald-600 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Total Count */}
                {paymentStatuses && paymentStatuses.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                        Total: <span className="font-semibold">{paymentStatuses.length}</span> payment status(es)
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatusTab;
