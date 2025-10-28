'use client';

import { Check, Loader2, MoreVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

interface AttributesTabProps {
    storeId: number | undefined;
    attributesData: any[];
    attributesLoading?: boolean;
    attributeName: string;
    setAttributeName: (name: string) => void;
    handleCreateAttribute: () => void;
    editingAttributeId: number | null;
    editingAttributeName: string;
    setEditingAttributeName: (name: string) => void;
    startEditingAttribute: (id: number, name: string) => void;
    cancelEditingAttribute: () => void;
    handleUpdateAttribute: (id: number) => void;
    handleDeleteAttribute: (id: number, name: string) => void;
    handleToggleActive: (id: number, isActive: boolean) => void;
}

const AttributesTab: React.FC<AttributesTabProps> = ({
    storeId,
    attributesData,
    attributesLoading,
    attributeName,
    setAttributeName,
    handleCreateAttribute,
    editingAttributeId,
    editingAttributeName,
    setEditingAttributeName,
    startEditingAttribute,
    cancelEditingAttribute,
    handleUpdateAttribute,
    handleDeleteAttribute,
    handleToggleActive,
}) => {
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Product Attributes</h3>

                {/* Add New Attribute */}
                <div className="mb-4 flex gap-2">
                    <input
                        type="text"
                        value={attributeName}
                        onChange={(e) => setAttributeName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateAttribute()}
                        placeholder="Enter attribute name (e.g., Color, Size)"
                        className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button type="button" onClick={handleCreateAttribute} className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                    </button>
                </div>

                {/* Attributes Table */}
                <div className="relative overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Attribute Name</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Active</th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attributesLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                                    </td>
                                </tr>
                            ) : attributesData && attributesData.length > 0 ? (
                                attributesData.map((attribute: any, index: number) => (
                                    <tr key={attribute.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-600">{attribute.id}</td>
                                        <td className="px-4 py-3">
                                            {editingAttributeId === attribute.id ? (
                                                <input
                                                    type="text"
                                                    value={editingAttributeName}
                                                    onChange={(e) => setEditingAttributeName(e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-900">{attribute.name}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input type="checkbox" checked={attribute.is_active} onChange={() => handleToggleActive(attribute.id, !attribute.is_active)} className="peer sr-only" />
                                                <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300"></div>
                                            </label>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {editingAttributeId === attribute.id ? (
                                                <div className="inline-flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateAttribute(attribute.id)}
                                                        className="rounded bg-green-600 p-1.5 text-white hover:bg-green-700"
                                                        title="Save"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button type="button" onClick={cancelEditingAttribute} className="rounded bg-gray-400 p-1.5 text-white hover:bg-gray-500" title="Cancel">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="relative inline-flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenDropdown(openDropdown === attribute.id ? null : attribute.id)}
                                                        className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                                                    >
                                                        <MoreVertical className="h-5 w-5" />
                                                    </button>

                                                    {openDropdown === attribute.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-[100]" onClick={() => setOpenDropdown(null)} />
                                                            <div
                                                                className={`absolute right-0 z-[101] min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-xl ${
                                                                    index > attributesData.length / 2 ? 'bottom-8' : 'top-8'
                                                                }`}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        startEditingAttribute(attribute.id, attribute.name);
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
                                                                        handleDeleteAttribute(attribute.id, attribute.name);
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                                        No attributes added yet. Add your first attribute above.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Total Count */}
                {attributesData && attributesData.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                        Total: <span className="font-semibold">{attributesData.length}</span> attribute(s)
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttributesTab;
