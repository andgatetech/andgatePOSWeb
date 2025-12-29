'use client';

import { Check, ChevronLeft, ChevronRight, Loader2, MoreVertical, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import Dropdown from './Dropdown';

interface AdjustmentReason {
    id?: number;
    name: string;
    description?: string | null;
    is_active?: boolean | number;
}

interface AdjustmentReasonsTabProps {
    storeId: number | undefined;
    adjustmentReasonsData: AdjustmentReason[];
    adjustmentReasonsLoading?: boolean;
    adjustmentReasonName: string;
    setAdjustmentReasonName: (name: string) => void;
    adjustmentReasonDescription: string;
    setAdjustmentReasonDescription: (description: string) => void;
    handleCreateAdjustmentReason: () => void;
    handleUpdateAdjustmentReason: (id: number, name: string, description: string) => void;
    handleDeleteAdjustmentReason: (id: number, name: string) => void;
    handleToggleAdjustmentReasonActive: (id: number, isActive: boolean) => void;
    setMessage: (message: { type: string; text: string }) => void;
}

const AdjustmentReasonsTab: React.FC<AdjustmentReasonsTabProps> = ({
    storeId,
    adjustmentReasonsData,
    adjustmentReasonsLoading,
    adjustmentReasonName,
    setAdjustmentReasonName,
    adjustmentReasonDescription,
    setAdjustmentReasonDescription,
    handleCreateAdjustmentReason,
    handleUpdateAdjustmentReason,
    handleDeleteAdjustmentReason,
    handleToggleAdjustmentReasonActive,
    setMessage,
}) => {
    const [editingReasonId, setEditingReasonId] = useState<number | null>(null);
    const [editingReasonName, setEditingReasonName] = useState('');
    const [editingReasonDescription, setEditingReasonDescription] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calculate pagination
    const totalItems = adjustmentReasonsData?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = adjustmentReasonsData?.slice(startIndex, endIndex) || [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const startEditingReason = (id: number, name: string, description: string) => {
        setEditingReasonId(id);
        setEditingReasonName(name);
        setEditingReasonDescription(description || '');
    };

    const cancelEditingReason = () => {
        setEditingReasonId(null);
        setEditingReasonName('');
        setEditingReasonDescription('');
    };

    const saveEditingReason = (id: number) => {
        if (!editingReasonName.trim()) {
            setMessage({ type: 'error', text: 'Adjustment reason name cannot be empty' });
            return;
        }
        handleUpdateAdjustmentReason(id, editingReasonName.trim(), editingReasonDescription.trim());
        setEditingReasonId(null);
        setEditingReasonName('');
        setEditingReasonDescription('');
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Product Adjustment Reasons</h3>

                {/* Add New Adjustment Reason */}
                <div className="mb-4 space-y-2">
                    <input
                        type="text"
                        value={adjustmentReasonName}
                        onChange={(e) => setAdjustmentReasonName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateAdjustmentReason()}
                        placeholder="Enter adjustment reason name (e.g., Damaged Goods, Expired)"
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={adjustmentReasonDescription}
                            onChange={(e) => setAdjustmentReasonDescription(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateAdjustmentReason()}
                            placeholder="Enter description (optional)"
                            className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                            type="button"
                            onClick={handleCreateAdjustmentReason}
                            className="inline-flex items-center rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                        </button>
                    </div>
                </div>

                {/* Adjustment Reasons Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reason Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Active</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adjustmentReasonsLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                    </td>
                                </tr>
                            ) : paginatedData && paginatedData.length > 0 ? (
                                paginatedData.map((reason, index) => (
                                    <tr key={reason.id || index} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">{reason.id || index + 1}</td>
                                        <td className="px-4 py-3">
                                            {editingReasonId === reason.id ? (
                                                <input
                                                    type="text"
                                                    value={editingReasonName}
                                                    onChange={(e) => setEditingReasonName(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && reason.id && saveEditingReason(reason.id)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    placeholder="Enter reason name"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">{reason.name || 'Unnamed Reason'}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingReasonId === reason.id ? (
                                                <input
                                                    type="text"
                                                    value={editingReasonDescription}
                                                    onChange={(e) => setEditingReasonDescription(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && reason.id && saveEditingReason(reason.id)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    placeholder="Enter description"
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-600">{reason.description || '-'}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={reason.is_active === true || reason.is_active === 1}
                                                    onChange={() => reason.id && handleToggleAdjustmentReasonActive(reason.id, !(reason.is_active === true || reason.is_active === 1))}
                                                    className="peer sr-only"
                                                />
                                                <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
                                            </label>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            {editingReasonId === reason.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => reason.id && saveEditingReason(reason.id)}
                                                        className="rounded bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                                                        title="Save"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={cancelEditingReason} className="rounded bg-gray-400 p-1.5 text-white hover:bg-gray-500" title="Cancel">
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
                                                                    onClick={() => {
                                                                        if (reason.id) {
                                                                            startEditingReason(reason.id, reason.name, reason.description || '');
                                                                        }
                                                                    }}
                                                                    className="w-full cursor-pointer px-4 py-2 text-left font-medium text-blue-600 hover:bg-blue-50"
                                                                >
                                                                    Edit Reason
                                                                </button>
                                                            </li>
                                                            <li className="border-t">
                                                                <button
                                                                    onClick={() => {
                                                                        if (reason.id) {
                                                                            handleDeleteAdjustmentReason(reason.id, reason.name);
                                                                        }
                                                                    }}
                                                                    className="w-full cursor-pointer px-4 py-2 text-left font-medium text-red-500 hover:bg-red-50"
                                                                >
                                                                    Delete Reason
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </Dropdown>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No adjustment reasons added yet. Click &quot;Add&quot; to create your first reason.
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
                            <span className="font-semibold">{totalItems}</span> reasons
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
                {adjustmentReasonsData && adjustmentReasonsData.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                        Total: <span className="font-semibold">{adjustmentReasonsData.length}</span> adjustment reason(s)
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdjustmentReasonsTab;
