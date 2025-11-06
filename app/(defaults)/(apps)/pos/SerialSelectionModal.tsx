'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Calendar, Package, Shield, X } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';

interface Serial {
    id: number;
    serial_number: string;
    status: string;
    notes?: string;
}

interface Warranty {
    id: number;
    warranty_type_id: number;
    warranty_type_name: string;
    duration_months: number | null;
    duration_days: number | null;
    start_date: string | null;
    end_date: string | null;
    status: string;
    remaining_days: number | null;
}

interface Stock {
    id: number;
    unit: string;
    price: number;
    purchase_price: number;
    wholesale_price: number;
    quantity: number;
    variant_name?: string;
    variant_data?: any;
    is_variant: boolean;
    serials?: Serial[]; // Optional: stock-level serials
}

interface Product {
    id: number;
    product_name: string;
    description: string;
    sku: string;
    has_serial: boolean;
    has_warranty: boolean;
    stocks: Stock[];
    serials?: Serial[];
    warranties?: Warranty[];
    available_serial_count?: number;
}

interface SerialSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    selectedStock?: Stock | null; // For variant products
    onConfirm: (selectedSerials: Serial[], warranty: Warranty | null) => void;
}

const SerialSelectionModal = ({ isOpen, onClose, product, selectedStock, onConfirm }: SerialSelectionModalProps) => {
    const [selectedSerialIds, setSelectedSerialIds] = useState<number[]>([]);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) {
            setSelectedSerialIds([]);
            setQuantity(1);

            // Debug logging
            console.log('📦 SerialSelectionModal opened');
            console.log('Product:', product?.product_name);
            console.log('Product serials:', product?.serials);
            console.log('Selected stock:', selectedStock);
            console.log('Stock serials:', selectedStock?.serials);
        }
    }, [isOpen, product, selectedStock]);

    if (!product) return null;

    // Get serials - check if they're stock-level or product-level
    let availableSerials: Serial[] = [];

    if (selectedStock && selectedStock.serials && Array.isArray(selectedStock.serials)) {
        // Stock-level serials (variant-specific)
        availableSerials = selectedStock.serials.filter((s: Serial) => s.status === 'in_stock');
    } else if (product.serials && Array.isArray(product.serials)) {
        // Product-level serials (shared across all variants)
        availableSerials = product.serials.filter((s: Serial) => s.status === 'in_stock');
    }

    const warranty = product.warranties && product.warranties.length > 0 ? product.warranties[0] : null;
    const currentStock = selectedStock || (product.stocks && product.stocks.length > 0 ? product.stocks[0] : null);

    const handleSerialToggle = (serialId: number) => {
        setSelectedSerialIds((prev) => {
            if (prev.includes(serialId)) {
                return prev.filter((id) => id !== serialId);
            } else {
                // Limit selection to quantity
                if (prev.length < quantity) {
                    return [...prev, serialId];
                }
                return prev;
            }
        });
    };

    const handleQuantityChange = (newQty: number) => {
        const maxQty = Math.min(availableSerials.length, currentStock?.quantity || 0);
        const validQty = Math.max(1, Math.min(newQty, maxQty));
        setQuantity(validQty);

        // Auto-adjust selected serials if quantity decreased
        if (selectedSerialIds.length > validQty) {
            setSelectedSerialIds(selectedSerialIds.slice(0, validQty));
        }
    };

    const handleConfirm = () => {
        if (selectedSerialIds.length !== quantity) {
            alert(`Please select exactly ${quantity} serial number(s)`);
            return;
        }

        const selectedSerials = availableSerials.filter((s) => selectedSerialIds.includes(s.id));
        onConfirm(selectedSerials, warranty);
        onClose();
    };

    const getWarrantyDuration = () => {
        if (!warranty) return null;
        if (warranty.duration_months) return `${warranty.duration_months} months`;
        if (warranty.duration_days) return `${warranty.duration_days} days`;
        return 'Lifetime';
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {/* Header */}
                                <div className="mb-6 flex items-start justify-between">
                                    <div className="flex-1">
                                        <Dialog.Title as="h3" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                            <Package className="h-6 w-6 text-blue-600" />
                                            Serial Number Selection
                                        </Dialog.Title>
                                        <p className="mt-1 text-sm text-gray-600">{product.product_name}</p>
                                        {selectedStock && selectedStock.variant_name && (
                                            <p className="text-xs text-gray-500">
                                                Variant: {selectedStock.variant_name}
                                                {selectedStock.serials ? ' (Variant-specific serials)' : ''}
                                            </p>
                                        )}
                                    </div>
                                    <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
                                        <X className="h-5 w-5 text-gray-400" />
                                    </button>
                                </div>

                                {/* Warranty Info Banner */}
                                {warranty && (
                                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <Shield className="mt-0.5 h-5 w-5 text-green-600" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-green-900">Warranty Included</h4>
                                                <div className="mt-1 grid grid-cols-2 gap-2 text-sm text-green-700">
                                                    <div>
                                                        <span className="font-medium">Type:</span> {warranty.warranty_type_name}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Duration:</span> {getWarrantyDuration()}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-xs text-green-600">
                                                    <Calendar className="mr-1 inline h-3 w-3" />
                                                    Warranty will be activated from the invoice date
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Quantity Selector */}
                                <div className="mb-6">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">Quantity to Sell</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                            disabled={quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                            className="w-20 rounded-lg border border-gray-300 px-4 py-2 text-center font-semibold"
                                            min={1}
                                            max={Math.min(availableSerials.length, currentStock?.quantity || 0)}
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                            disabled={quantity >= Math.min(availableSerials.length, currentStock?.quantity || 0)}
                                        >
                                            +
                                        </button>
                                        <span className="text-sm text-gray-600">Available: {availableSerials.length} serials</span>
                                    </div>
                                </div>

                                {/* Serial Selection Instructions */}
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-700">
                                        Select {quantity} serial number{quantity > 1 ? 's' : ''} ({selectedSerialIds.length}/{quantity} selected)
                                    </p>
                                </div>

                                {/* Serial Numbers Grid */}
                                <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200">
                                    {availableSerials.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <Package className="mx-auto mb-2 h-12 w-12 text-gray-300" />
                                            <p>No available serial numbers in stock</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200">
                                            {availableSerials.map((serial) => {
                                                const isSelected = selectedSerialIds.includes(serial.id);
                                                const isDisabled = !isSelected && selectedSerialIds.length >= quantity;

                                                return (
                                                    <div
                                                        key={serial.id}
                                                        onClick={() => !isDisabled && handleSerialToggle(serial.id)}
                                                        className={`cursor-pointer p-4 transition-colors ${
                                                            isSelected ? 'border-l-4 border-blue-600 bg-blue-50' : isDisabled ? 'cursor-not-allowed bg-gray-50 opacity-50' : 'hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {}}
                                                                    disabled={isDisabled}
                                                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <div>
                                                                    <p className="font-mono font-semibold text-gray-900">{serial.serial_number}</p>
                                                                    {serial.notes && <p className="text-xs text-gray-500">{serial.notes}</p>}
                                                                </div>
                                                            </div>
                                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">In Stock</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex justify-end gap-3">
                                    <button onClick={onClose} className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={selectedSerialIds.length !== quantity}
                                        className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Add to Cart ({selectedSerialIds.length}/{quantity})
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default SerialSelectionModal;
