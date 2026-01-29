'use client';

import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useCreateWarrantyTypeMutation, useDeleteWarrantyTypeMutation, useUpdateWarrantyTypeMutation } from '@/store/features/warrenty/WarrantyTypeApi';
import { Check, ChevronLeft, ChevronRight, Loader2, MoreVertical, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import Dropdown from './Dropdown';

interface WarrantyTypesTabProps {
    storeId: number | undefined;
    warrantyTypesData: any[];
    warrantyTypesLoading?: boolean;
    setMessage: (message: { type: string; text: string }) => void;
}

const WarrantyTypesTab: React.FC<WarrantyTypesTabProps> = ({ storeId, warrantyTypesData, warrantyTypesLoading, setMessage }) => {
    const [createWarrantyType] = useCreateWarrantyTypeMutation();
    const [updateWarrantyType] = useUpdateWarrantyTypeMutation();
    const [deleteWarrantyType] = useDeleteWarrantyTypeMutation();

    const [warrantyName, setWarrantyName] = useState('');
    const [warrantyDurationMonths, setWarrantyDurationMonths] = useState('');
    const [warrantyDurationDays, setWarrantyDurationDays] = useState('');
    const [warrantyDescription, setWarrantyDescription] = useState('');
    const [editingWarrantyId, setEditingWarrantyId] = useState<number | null>(null);
    const [editingWarrantyData, setEditingWarrantyData] = useState({
        name: '',
        duration_months: '',
        duration_days: '',
        description: '',
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calculate pagination
    const totalItems = warrantyTypesData?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = warrantyTypesData?.slice(startIndex, endIndex) || [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleCreateWarranty = async () => {
        if (!warrantyName.trim()) {
            showErrorDialog('Error', 'Please enter warranty name');
            return;
        }

        const monthsValue = warrantyDurationMonths ? parseInt(warrantyDurationMonths) : null;
        const daysValue = warrantyDurationDays ? parseInt(warrantyDurationDays) : null;

        if (!monthsValue && !daysValue) {
            showErrorDialog('Error', 'Please enter at least one duration (months or days)');
            return;
        }

        if (!storeId || typeof storeId !== 'number') {
            showErrorDialog('Error', 'No valid store selected. Cannot create warranty type.');
            return;
        }

        const payload: any = {
            name: warrantyName.trim(),
            store_id: storeId,
        };

        if (monthsValue !== null && monthsValue > 0) {
            payload.duration_months = monthsValue;
        }
        if (daysValue !== null && daysValue > 0) {
            payload.duration_days = daysValue;
        }

        if (warrantyDescription.trim()) {
            payload.description = warrantyDescription.trim();
        }

        console.log('Sending payload:', payload);

        try {
            await createWarrantyType(payload).unwrap();
            setWarrantyName('');
            setWarrantyDurationMonths('');
            setWarrantyDurationDays('');
            setWarrantyDescription('');
            showSuccessDialog('Success!', 'Warranty type created successfully!');
        } catch (error: any) {
            console.error('Create warranty error:', error);
            const errorMessage = error?.data?.message || 'Failed to create warranty type';
            showErrorDialog('Create Failed!', errorMessage);
        }
    };

    const startEditingWarranty = (id: number, name: string, durationMonths: number | null, durationDays: number | null, description?: string) => {
        setEditingWarrantyId(id);
        setEditingWarrantyData({
            name,
            duration_months: durationMonths ? durationMonths.toString() : '',
            duration_days: durationDays ? durationDays.toString() : '',
            description: description || '',
        });
    };

    const cancelEditingWarranty = () => {
        setEditingWarrantyId(null);
        setEditingWarrantyData({ name: '', duration_months: '', duration_days: '', description: '' });
    };

    const handleUpdateWarranty = async (id: number) => {
        if (!editingWarrantyData.name.trim()) {
            showErrorDialog('Error', 'Please enter warranty name');
            return;
        }

        const monthsValue = editingWarrantyData.duration_months ? parseInt(editingWarrantyData.duration_months) : null;
        const daysValue = editingWarrantyData.duration_days ? parseInt(editingWarrantyData.duration_days) : null;

        if (!monthsValue && !daysValue) {
            showErrorDialog('Error', 'Please enter at least one duration (months or days)');
            return;
        }

        try {
            const payload: any = {
                id,
                name: editingWarrantyData.name.trim(),
            };

            if (monthsValue !== null && monthsValue > 0) {
                payload.duration_months = monthsValue;
            }
            if (daysValue !== null && daysValue > 0) {
                payload.duration_days = daysValue;
            }

            if (editingWarrantyData.description.trim()) {
                payload.description = editingWarrantyData.description.trim();
            }

            console.log('Update payload:', payload);

            await updateWarrantyType(payload).unwrap();
            setEditingWarrantyId(null);
            setEditingWarrantyData({ name: '', duration_months: '', duration_days: '', description: '' });
            showSuccessDialog('Updated!', 'Warranty type updated successfully!');
        } catch (error: any) {
            console.error('Update warranty error:', error);
            const errorMessage = error?.data?.message || 'Failed to update warranty type';
            showErrorDialog('Update Failed!', errorMessage);
        }
    };

    const handleDeleteWarranty = async (id: number, name: string) => {
        const confirmed = await showConfirmDialog('Delete Warranty Type?', `Are you sure you want to delete "${name}"? This cannot be undone.`, 'Yes, delete it!', 'Cancel');

        if (!confirmed) return;

        try {
            await deleteWarrantyType(id).unwrap();
            showSuccessDialog('Deleted!', 'Warranty type deleted successfully!');
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Failed to delete warranty type. It may be in use by products.';
            showErrorDialog('Delete Failed!', errorMessage);
        }
    };

    const handleToggleWarrantyActive = async (id: number, isActive: boolean) => {
        try {
            const currentWarranty = warrantyTypesData.find((w: any) => w.id === id);
            if (!currentWarranty) {
                showErrorDialog('Error', 'Warranty type not found');
                return;
            }

            const payload: any = {
                id,
                name: currentWarranty.name,
                is_active: isActive ? 1 : 0,
            };

            if (currentWarranty.duration_months !== undefined && currentWarranty.duration_months !== null) {
                payload.duration_months = currentWarranty.duration_months;
            }
            if (currentWarranty.duration_days !== undefined && currentWarranty.duration_days !== null) {
                payload.duration_days = currentWarranty.duration_days;
            }

            if (currentWarranty.description) {
                payload.description = currentWarranty.description;
            }

            console.log('Toggle payload:', payload);

            await updateWarrantyType(payload).unwrap();
            showSuccessDialog('Updated!', 'Warranty type status updated successfully!');
        } catch (error: any) {
            console.error('Toggle warranty error:', error);
            const errorMessage = error?.data?.message || 'Failed to update warranty type status';
            showErrorDialog('Update Failed!', errorMessage);
        }
    };

    const formatDuration = (months: number | null, days: number | null) => {
        const parts: string[] = [];

        if (months && months > 0) {
            if (months < 12) {
                parts.push(`${months} Month${months !== 1 ? 's' : ''}`);
            } else {
                const years = Math.floor(months / 12);
                const remainingMonths = months % 12;
                if (remainingMonths === 0) {
                    parts.push(`${years} Year${years !== 1 ? 's' : ''}`);
                } else {
                    parts.push(`${years}y ${remainingMonths}m`);
                }
            }
        }

        if (days && days > 0) {
            parts.push(`${days} Day${days !== 1 ? 's' : ''}`);
        }

        return parts.length > 0 ? parts.join(' + ') : '-';
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Warranty Types</h3>

                {/* Add New Warranty Type */}
                <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-5">
                    <input
                        type="text"
                        value={warrantyName}
                        onChange={(e) => setWarrantyName(e.target.value)}
                        placeholder="Warranty name *"
                        className="rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                        type="number"
                        value={warrantyDurationMonths}
                        onChange={(e) => {
                            setWarrantyDurationMonths(e.target.value);
                            if (e.target.value) {
                                setWarrantyDurationDays(''); // Clear days when months is filled
                            }
                        }}
                        placeholder="Months (optional)"
                        min="0"
                        disabled={!!warrantyDurationDays}
                        className="rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    <input
                        type="number"
                        value={warrantyDurationDays}
                        onChange={(e) => {
                            setWarrantyDurationDays(e.target.value);
                            if (e.target.value) {
                                setWarrantyDurationMonths(''); // Clear months when days is filled
                            }
                        }}
                        placeholder="Days (optional)"
                        min="0"
                        disabled={!!warrantyDurationMonths}
                        className="rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    <input
                        type="text"
                        value={warrantyDescription}
                        onChange={(e) => setWarrantyDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        onClick={handleCreateWarranty}
                        className="inline-flex items-center justify-center rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Warranty
                    </button>
                </div>

                <p className="mb-4 text-xs text-gray-500">* Enter either months OR days (not both)</p>

                {/* Warranty Types Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Active</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warrantyTypesLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                    </td>
                                </tr>
                            ) : paginatedData && paginatedData.length > 0 ? (
                                paginatedData.map((warranty: any) => (
                                    <tr key={warranty.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">{warranty.id}</td>
                                        <td className="px-4 py-3">
                                            {editingWarrantyId === warranty.id ? (
                                                <input
                                                    type="text"
                                                    value={editingWarrantyData.name}
                                                    onChange={(e) => setEditingWarrantyData({ ...editingWarrantyData, name: e.target.value })}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">{warranty.name}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingWarrantyId === warranty.id ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={editingWarrantyData.duration_months}
                                                        onChange={(e) => {
                                                            setEditingWarrantyData({
                                                                ...editingWarrantyData,
                                                                duration_months: e.target.value,
                                                            });
                                                        }}
                                                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        min="0"
                                                        placeholder="Months"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={editingWarrantyData.duration_days}
                                                        onChange={(e) => {
                                                            setEditingWarrantyData({
                                                                ...editingWarrantyData,
                                                                duration_days: e.target.value,
                                                            });
                                                        }}
                                                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        min="0"
                                                        placeholder="Days"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-700">{formatDuration(warranty.duration_months, warranty.duration_days)}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {editingWarrantyId === warranty.id ? (
                                                <input
                                                    type="text"
                                                    value={editingWarrantyData.description}
                                                    onChange={(e) => setEditingWarrantyData({ ...editingWarrantyData, description: e.target.value })}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-600">{warranty.description || '-'}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={warranty.is_active}
                                                    onChange={() => handleToggleWarrantyActive(warranty.id, !warranty.is_active)}
                                                    className="peer sr-only"
                                                />
                                                <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
                                            </label>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-4 text-center">
                                            {editingWarrantyId === warranty.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateWarranty(warranty.id)}
                                                        className="rounded bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                                                        title="Save"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={cancelEditingWarranty} className="rounded bg-gray-400 p-1.5 text-white hover:bg-gray-500" title="Cancel">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Dropdown
                                                    offset={[0, 5]}
                                                    placement="bottom"
                                                    btnClassName="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    button={<MoreVertical className="h-5 w-5" />}
                                                >
                                                    <ul className="min-w-[120px] rounded-lg border bg-white shadow-lg">
                                                        <li>
                                                            <button
                                                                onClick={() => startEditingWarranty(warranty.id, warranty.name, warranty.duration_months, warranty.duration_days, warranty.description)}
                                                                className="w-full cursor-pointer px-4 py-2 text-left font-medium text-blue-600 hover:bg-blue-50"
                                                            >
                                                                Edit Warranty
                                                            </button>
                                                        </li>
                                                        <li className="border-t">
                                                            <button
                                                                onClick={() => handleDeleteWarranty(warranty.id, warranty.name)}
                                                                className="w-full cursor-pointer px-4 py-2 text-left font-medium text-red-500 hover:bg-red-50"
                                                            >
                                                                Delete Warranty
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </Dropdown>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No warranty types added yet. Add your first warranty type above.
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
                            <span className="font-semibold">{totalItems}</span> warranty types
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
                {warrantyTypesData && warrantyTypesData.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                        Total: <span className="font-semibold">{warrantyTypesData.length}</span> warranty type(s)
                    </div>
                )}
            </div>
        </div>
    );
};

export default WarrantyTypesTab;
