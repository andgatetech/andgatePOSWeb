'use client';

import { useState } from 'react';

interface SerialData {
    id: number;
    serial_number: string;
    status: 'in_stock' | 'sold' | 'returned' | 'damaged';
    reason: string;
    notes: string;
}

interface SerialAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productId: number;
    stockId: number;
    onSave: (serials: SerialData[]) => void;
}

const SerialAdjustmentModal = ({ isOpen, onClose, productName, productId, stockId, onSave }: SerialAdjustmentModalProps) => {
    const [mode, setMode] = useState<'update-status' | 'bulk-add'>('update-status');
    const [serials, setSerials] = useState<SerialData[]>([]);

    // Bulk Add States
    const [bulkSerialNumbers, setBulkSerialNumbers] = useState('');
    const [bulkStatus, setBulkStatus] = useState<'in_stock' | 'sold' | 'returned' | 'damaged'>('in_stock');
    const [bulkReason, setBulkReason] = useState('');
    const [bulkNotes, setBulkNotes] = useState('');

    if (!isOpen) return null;

    const addSerialRow = () => {
        setSerials([
            ...serials,
            {
                id: Date.now(),
                serial_number: '',
                status: 'in_stock',
                reason: '',
                notes: '',
            },
        ]);
    };

    const removeSerialRow = (id: number) => {
        setSerials(serials.filter((s) => s.id !== id));
    };

    const updateSerial = (id: number, field: keyof SerialData, value: any) => {
        setSerials(serials.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
    };

    const handleSave = () => {
        if (mode === 'update-status') {
            const validSerials = serials.filter((s) => s.serial_number && s.reason);
            if (validSerials.length === 0) {
                alert('Please add at least one serial with serial number and reason');
                return;
            }
            onSave(validSerials);
        } else {
            // Bulk add mode
            const serialNumbers = bulkSerialNumbers
                .split('\n')
                .map((s) => s.trim())
                .filter((s) => s);

            if (serialNumbers.length === 0 || !bulkReason) {
                alert('Please enter serial numbers and reason');
                return;
            }

            const bulkSerials = serialNumbers.map((sn, index) => ({
                id: Date.now() + index,
                serial_number: sn,
                status: bulkStatus,
                reason: bulkReason,
                notes: bulkNotes,
            }));

            onSave(bulkSerials);
        }

        // Reset
        setSerials([]);
        setBulkSerialNumbers('');
        setBulkReason('');
        setBulkNotes('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Serial Number Adjustment</h2>
                            <p className="mt-1 text-sm text-gray-600">{productName}</p>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 flex gap-4">
                        <button
                            onClick={() => setMode('update-status')}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                mode === 'update-status' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Update Serial Status
                        </button>
                        <button
                            onClick={() => setMode('bulk-add')}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === 'bulk-add' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            Bulk Add Serials
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {mode === 'update-status' ? (
                        // Update Status Mode
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">Update existing serial number statuses (sold, damaged, returned)</p>
                                <button onClick={addSerialRow} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Serial
                                </button>
                            </div>

                            {serials.length === 0 ? (
                                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                    <p className="text-sm text-gray-500">Click "Add Serial" to start updating serial statuses</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {serials.map((serial, index) => (
                                        <div key={serial.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-gray-700">Serial #{index + 1}</span>
                                                <button onClick={() => removeSerialRow(serial.id)} className="text-red-600 hover:text-red-700">
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium text-gray-700">Serial Number *</label>
                                                    <input
                                                        type="text"
                                                        value={serial.serial_number}
                                                        onChange={(e) => updateSerial(serial.id, 'serial_number', e.target.value)}
                                                        placeholder="SN12345"
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium text-gray-700">New Status *</label>
                                                    <select
                                                        value={serial.status}
                                                        onChange={(e) => updateSerial(serial.id, 'status', e.target.value)}
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                    >
                                                        <option value="in_stock">In Stock</option>
                                                        <option value="sold">Sold</option>
                                                        <option value="returned">Returned </option>
                                                        <option value="damaged">Damaged</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium text-gray-700">Reason *</label>
                                                    <input
                                                        type="text"
                                                        value={serial.reason}
                                                        onChange={(e) => updateSerial(serial.id, 'reason', e.target.value)}
                                                        placeholder="e.g., Customer purchase"
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium text-gray-700">Notes</label>
                                                    <input
                                                        type="text"
                                                        value={serial.notes}
                                                        onChange={(e) => updateSerial(serial.id, 'notes', e.target.value)}
                                                        placeholder="Additional notes"
                                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Bulk Add Mode
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">Add multiple serial numbers at once (one per line)</p>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Serial Numbers (one per line) *</label>
                                <textarea
                                    value={bulkSerialNumbers}
                                    onChange={(e) => setBulkSerialNumbers(e.target.value)}
                                    placeholder={'SN001\nSN002\nSN003'}
                                    rows={6}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm"
                                />
                                <p className="mt-1 text-xs text-gray-500">{bulkSerialNumbers.split('\n').filter((s) => s.trim()).length} serial number(s) entered</p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Status *</label>
                                    <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value as any)} className="w-full rounded-lg border border-gray-300 px-3 py-2">
                                        <option value="in_stock">In Stock </option>
                                        <option value="sold">Sold</option>
                                        <option value="returned">Returned </option>
                                        <option value="damaged">Damaged</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Reason *</label>
                                    <input
                                        type="text"
                                        value={bulkReason}
                                        onChange={(e) => setBulkReason(e.target.value)}
                                        placeholder="e.g., New stock arrival"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Notes</label>
                                    <input
                                        type="text"
                                        value={bulkNotes}
                                        onChange={(e) => setBulkNotes(e.target.value)}
                                        placeholder="Optional notes"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                            Save Serial Adjustments
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SerialAdjustmentModal;
