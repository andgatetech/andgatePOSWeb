'use client';

import { Check, ChevronLeft, ChevronRight, Loader2, MoreVertical, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import Dropdown from './Dropdown';

interface Unit {
    id?: number;
    name: string;
    is_active?: boolean | number;
}

interface UnitsTabProps {
    storeId: number | undefined;
    unitsData: Unit[];
    unitsLoading?: boolean;
    unitName: string;
    setUnitName: (name: string) => void;
    handleCreateUnit: () => void;
    handleUpdateUnit: (id: number, name: string) => void;
    handleDeleteUnit: (id: number, name: string) => void;
    handleToggleUnitActive: (id: number, isActive: boolean) => void;
    setMessage: (message: { type: string; text: string }) => void;
}

const UnitsTab: React.FC<UnitsTabProps> = ({ storeId, unitsData, unitsLoading, unitName, setUnitName, handleCreateUnit, handleUpdateUnit, handleDeleteUnit, handleToggleUnitActive, setMessage }) => {
    const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
    const [editingUnitName, setEditingUnitName] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Calculate pagination
    const totalItems = unitsData?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = unitsData?.slice(startIndex, endIndex) || [];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const startEditingUnit = (id: number, name: string) => {
        setEditingUnitId(id);
        setEditingUnitName(name);
    };

    const cancelEditingUnit = () => {
        setEditingUnitId(null);
        setEditingUnitName('');
    };

    const saveEditingUnit = (id: number) => {
        if (!editingUnitName.trim()) {
            setMessage({ type: 'error', text: 'Unit name cannot be empty' });
            return;
        }
        handleUpdateUnit(id, editingUnitName.trim());
        setEditingUnitId(null);
        setEditingUnitName('');
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Product Units</h3>

                {/* Add New Unit */}
                <div className="mb-4 flex gap-2">
                    <input
                        type="text"
                        value={unitName}
                        onChange={(e) => setUnitName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateUnit()}
                        placeholder="Enter unit name (e.g., Piece, Box, Kg)"
                        className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button type="button" onClick={handleCreateUnit} className="inline-flex items-center rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                    </button>
                </div>

                {/* Units Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit Name</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Active</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unitsLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                    </td>
                                </tr>
                            ) : paginatedData && paginatedData.length > 0 ? (
                                paginatedData.map((unit, index) => (
                                    <tr key={unit.id || index} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">{unit.id || index + 1}</td>
                                        <td className="px-4 py-3">
                                            {editingUnitId === unit.id ? (
                                                <input
                                                    type="text"
                                                    value={editingUnitName}
                                                    onChange={(e) => setEditingUnitName(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && unit.id && saveEditingUnit(unit.id)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    placeholder="Enter unit name"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">{unit.name || 'Unnamed Unit'}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={unit.is_active === true || unit.is_active === 1}
                                                    onChange={() => unit.id && handleToggleUnitActive(unit.id, !(unit.is_active === true || unit.is_active === 1))}
                                                    className="peer sr-only"
                                                />
                                                <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
                                            </label>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            {editingUnitId === unit.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => unit.id && saveEditingUnit(unit.id)}
                                                        className="rounded bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                                                        title="Save"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={cancelEditingUnit} className="rounded bg-gray-400 p-1.5 text-white hover:bg-gray-500" title="Cancel">
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
                                                                        if (unit.id) {
                                                                            startEditingUnit(unit.id, unit.name);
                                                                        }
                                                                    }}
                                                                    className="w-full cursor-pointer px-4 py-2 text-left font-medium text-blue-600 hover:bg-blue-50"
                                                                >
                                                                    Edit Unit
                                                                </button>
                                                            </li>
                                                            <li className="border-t">
                                                                <button
                                                                    onClick={() => {
                                                                        if (unit.id) {
                                                                            handleDeleteUnit(unit.id, unit.name);
                                                                        }
                                                                    }}
                                                                    className="w-full cursor-pointer px-4 py-2 text-left font-medium text-red-500 hover:bg-red-50"
                                                                >
                                                                    Delete Unit
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
                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No units added yet. Click &quot;Add&quot; to create your first unit.
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
                            <span className="font-semibold">{totalItems}</span> units
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
                {unitsData && unitsData.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                        Total: <span className="font-semibold">{unitsData.length}</span> unit(s)
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnitsTab;
