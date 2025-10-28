'use client';

import { useCreateWarrantyTypeMutation, useDeleteWarrantyTypeMutation, useUpdateWarrantyTypeMutation } from '@/store/features/warrenty/WarrantyTypeApi';
import { Check, Loader2, MoreVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import Swal from 'sweetalert2';

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
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);

    const handleCreateWarranty = async () => {
        if (!warrantyName.trim()) {
            setMessage({ type: 'error', text: 'Please enter warranty name' });
            return;
        }

        // At least one duration must be provided
        const monthsValue = warrantyDurationMonths ? parseInt(warrantyDurationMonths) : null;
        const daysValue = warrantyDurationDays ? parseInt(warrantyDurationDays) : null;

        if (!monthsValue && !daysValue) {
            setMessage({ type: 'error', text: 'Please enter at least one duration (months or days)' });
            return;
        }

        if (!storeId || typeof storeId !== 'number') {
            setMessage({ type: 'error', text: 'No valid store selected. Cannot create warranty type.' });
            return;
        }

        const payload: any = {
            name: warrantyName.trim(),
            store_id: storeId,
        };

        // Only add duration fields if they have values
        if (monthsValue !== null && monthsValue > 0) {
            payload.duration_months = monthsValue;
        }
        if (daysValue !== null && daysValue > 0) {
            payload.duration_days = daysValue;
        }

        // Add description if provided
        if (warrantyDescription.trim()) {
            payload.description = warrantyDescription.trim();
        }

        console.log('Sending payload:', payload); // Debug log

        try {
            await createWarrantyType(payload).unwrap();
            setWarrantyName('');
            setWarrantyDurationMonths('');
            setWarrantyDurationDays('');
            setWarrantyDescription('');
            setMessage({ type: 'success', text: 'Warranty type created successfully!' });
        } catch (error: any) {
            console.error('Create warranty error:', error); // Debug log
            const errorMessage = error?.data?.message || 'Failed to create warranty type';
            setMessage({ type: 'error', text: errorMessage });
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
            setMessage({ type: 'error', text: 'Please enter warranty name' });
            return;
        }

        // At least one duration must be provided
        const monthsValue = editingWarrantyData.duration_months ? parseInt(editingWarrantyData.duration_months) : null;
        const daysValue = editingWarrantyData.duration_days ? parseInt(editingWarrantyData.duration_days) : null;

        if (!monthsValue && !daysValue) {
            setMessage({ type: 'error', text: 'Please enter at least one duration (months or days)' });
            return;
        }

        try {
            const payload: any = {
                id,
                name: editingWarrantyData.name.trim(),
            };

            // Only add duration fields if they have values
            if (monthsValue !== null && monthsValue > 0) {
                payload.duration_months = monthsValue;
            }
            if (daysValue !== null && daysValue > 0) {
                payload.duration_days = daysValue;
            }

            // Add description if provided
            if (editingWarrantyData.description.trim()) {
                payload.description = editingWarrantyData.description.trim();
            }

            console.log('Update payload:', payload); // Debug log

            await updateWarrantyType(payload).unwrap();
            setEditingWarrantyId(null);
            setEditingWarrantyData({ name: '', duration_months: '', duration_days: '', description: '' });
            setMessage({ type: 'success', text: 'Warranty type updated successfully!' });
        } catch (error: any) {
            console.error('Update warranty error:', error); // Debug log
            const errorMessage = error?.data?.message || 'Failed to update warranty type';
            setMessage({ type: 'error', text: errorMessage });
        }
    };

    const handleDeleteWarranty = async (id: number, name: string) => {
        const result = await Swal.fire({
            title: 'Delete Warranty Type?',
            text: `Are you sure you want to delete "${name}"? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                await deleteWarrantyType(id).unwrap();
                setMessage({ type: 'success', text: 'Warranty type deleted successfully!' });
            } catch (error: any) {
                const errorMessage = error?.data?.message || 'Failed to delete warranty type. It may be in use by products.';
                setMessage({ type: 'error', text: errorMessage });
            }
        }
    };

    const handleToggleWarrantyActive = async (id: number, isActive: boolean) => {
        try {
            const currentWarranty = warrantyTypesData.find((w: any) => w.id === id);
            if (!currentWarranty) {
                setMessage({ type: 'error', text: 'Warranty type not found' });
                return;
            }

            const payload: any = {
                id,
                name: currentWarranty.name,
                is_active: isActive ? 1 : 0,
            };

            // Add duration fields - at least one must exist
            if (currentWarranty.duration_months !== undefined && currentWarranty.duration_months !== null) {
                payload.duration_months = currentWarranty.duration_months;
            }
            if (currentWarranty.duration_days !== undefined && currentWarranty.duration_days !== null) {
                payload.duration_days = currentWarranty.duration_days;
            }

            // Add description if exists
            if (currentWarranty.description) {
                payload.description = currentWarranty.description;
            }

            console.log('Toggle payload:', payload); // Debug log

            await updateWarrantyType(payload).unwrap();
            setMessage({ type: 'success', text: 'Warranty type status updated successfully!' });
        } catch (error: any) {
            console.error('Toggle warranty error:', error);
            const errorMessage = error?.data?.message || 'Failed to update warranty type status';
            setMessage({ type: 'error', text: errorMessage });
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
                        className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        value={warrantyDurationMonths}
                        onChange={(e) => setWarrantyDurationMonths(e.target.value)}
                        placeholder="Months (optional)"
                        min="0"
                        className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                        type="number"
                        value={warrantyDurationDays}
                        onChange={(e) => setWarrantyDurationDays(e.target.value)}
                        placeholder="Days (optional)"
                        min="0"
                        className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Warranty
                    </button>
                </div>

                {/* Helper Text */}
                <p className="mb-4 text-xs text-gray-500">* At least one duration (months or days) is required</p>

                {/* Warranty Types Table */}
                <div className="overflow-visible">
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
                                ) : warrantyTypesData && warrantyTypesData.length > 0 ? (
                                    warrantyTypesData.map((warranty: any, index: number) => (
                                        <tr key={warranty.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">{warranty.id}</td>
                                            <td className="px-4 py-3">
                                                {editingWarrantyId === warranty.id ? (
                                                    <input
                                                        type="text"
                                                        value={editingWarrantyData.name}
                                                        onChange={(e) => setEditingWarrantyData({ ...editingWarrantyData, name: e.target.value })}
                                                        className="w-full rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                                            onChange={(e) => setEditingWarrantyData({ ...editingWarrantyData, duration_months: e.target.value })}
                                                            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            min="0"
                                                            placeholder="Months"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={editingWarrantyData.duration_days}
                                                            onChange={(e) => setEditingWarrantyData({ ...editingWarrantyData, duration_days: e.target.value })}
                                                            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                                        className="w-full rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                                    <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300"></div>
                                                </label>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {editingWarrantyId === warranty.id ? (
                                                    <div className="inline-flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateWarranty(warranty.id)}
                                                            className="rounded bg-green-600 p-1.5 text-white hover:bg-green-700"
                                                            title="Save"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button type="button" onClick={cancelEditingWarranty} className="rounded bg-gray-400 p-1.5 text-white hover:bg-gray-500" title="Cancel">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="relative inline-block text-left">
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenDropdown(openDropdown === warranty.id ? null : warranty.id)}
                                                            className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                                                        >
                                                            <MoreVertical className="h-5 w-5" />
                                                        </button>

                                                        {openDropdown === warranty.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-[100]" onClick={() => setOpenDropdown(null)} />
                                                                <div
                                                                    className={`absolute right-0 z-[101] w-40 origin-top-right rounded-lg border border-gray-200 bg-white shadow-xl ${
                                                                        index >= warrantyTypesData.length - 2 ? 'bottom-full mb-2' : 'top-full mt-2'
                                                                    }`}
                                                                >
                                                                    <div className="py-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                startEditingWarranty(
                                                                                    warranty.id,
                                                                                    warranty.name,
                                                                                    warranty.duration_months,
                                                                                    warranty.duration_days,
                                                                                    warranty.description
                                                                                );
                                                                                setOpenDropdown(null);
                                                                            }}
                                                                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50"
                                                                        >
                                                                            <Pencil className="h-4 w-4 text-blue-600" />
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                handleDeleteWarranty(warranty.id, warranty.name);
                                                                                setOpenDropdown(null);
                                                                            }}
                                                                            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-red-50"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
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
                </div>

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
