'use client';

import { Check, MoreVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

interface Unit {
    id?: number;
    name: string;
    is_active?: boolean | number;
}

interface UnitsTabProps {
    storeId: number | undefined;
    unitsData: Unit[];
    unitName: string;
    setUnitName: (name: string) => void;
    handleCreateUnit: () => void;
    handleUpdateUnit: (id: number, name: string) => void;
    handleDeleteUnit: (id: number, name: string) => void;
    handleToggleUnitActive: (id: number, isActive: boolean) => void;
    setMessage: (message: { type: string; text: string }) => void;
}

const UnitsTab: React.FC<UnitsTabProps> = ({ storeId, unitsData, unitName, setUnitName, handleCreateUnit, handleUpdateUnit, handleDeleteUnit, handleToggleUnitActive, setMessage }) => {
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
    const [editingUnitName, setEditingUnitName] = useState('');

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
                        className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button type="button" onClick={handleCreateUnit} className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                    </button>
                </div>

                {/* Units Table */}
                <div className="relative overflow-x-auto">
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
                            {unitsData && unitsData.length > 0 ? (
                                unitsData.map((unit, index) => (
                                    <tr key={unit.id || index} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">{unit.id || index + 1}</td>
                                        <td className="px-4 py-3">
                                            {editingUnitId === unit.id ? (
                                                <input
                                                    type="text"
                                                    value={editingUnitName}
                                                    onChange={(e) => setEditingUnitName(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && unit.id && saveEditingUnit(unit.id)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                                <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300"></div>
                                            </label>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {editingUnitId === unit.id ? (
                                                <div className="inline-flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => unit.id && saveEditingUnit(unit.id)}
                                                        className="rounded bg-green-600 p-1.5 text-white hover:bg-green-700"
                                                        title="Save"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={cancelEditingUnit} className="rounded bg-gray-400 p-1.5 text-white hover:bg-gray-500" title="Cancel">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative inline-flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenDropdown(openDropdown === unit.id ? null : unit.id || null)}
                                                        className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                                                    >
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>

                                                    {unit.id && openDropdown === unit.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-[100]" onClick={() => setOpenDropdown(null)} />
                                                            <div
                                                                className={`absolute right-0 z-[101] min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl ${
                                                                    index > unitsData.length / 2 ? 'bottom-8' : 'top-8'
                                                                }`}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (unit.id) {
                                                                            startEditingUnit(unit.id, unit.name);
                                                                            setOpenDropdown(null);
                                                                        }
                                                                    }}
                                                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-blue-50"
                                                                >
                                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (unit.id) {
                                                                            handleDeleteUnit(unit.id, unit.name);
                                                                            setOpenDropdown(null);
                                                                        }
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
