import IconX from '@/components/icon/icon-x';
import { useCurrency } from '@/hooks/useCurrency';
import { Hash, Shield } from 'lucide-react';
import React from 'react';

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

interface InvoiceItem {
    id: number;
    title: string;
    variantName?: string;
    variantData?: Record<string, string>;
    quantity: number;
    PlaceholderQuantity?: number;
    rate: number;
    tax_rate?: number;
    tax_included?: boolean;
    unit?: string;
    description?: string;
    isWholesale?: boolean;
    serials?: Serial[];
    warranty?: Warranty | null;
    has_serial?: boolean;
    has_warranty?: boolean;
}

interface ItemPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InvoiceItem | null;
}

const ItemPreviewModal: React.FC<ItemPreviewModalProps> = ({ isOpen, onClose, item }) => {
    const { formatCurrency } = useCurrency();
    if (!isOpen || !item) return null;

    const totalAmount = () => {
        const basePrice = item.rate * item.quantity;
        if (item.tax_rate && !item.tax_included) {
            const taxAmount = basePrice * (item.tax_rate / 100);
            return formatCurrency(basePrice + taxAmount);
        }
        return formatCurrency(basePrice);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-2" onClick={onClose}>
            <div className="relative max-h-[95vh] w-full max-w-[90vw] overflow-auto rounded-lg bg-white p-6 shadow-2xl md:max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-800">
                    <IconX className="h-5 w-5" />
                </button>

                <div className="mb-6">
                    <h3 className="mb-2 text-xl font-bold text-gray-900">Product Details</h3>
                    <div className="h-1 w-20 rounded bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                </div>

                {/* Product Info */}
                <div className="mb-6">
                    <h4 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h4>
                    {item.description && <p className="text-sm text-gray-600">{item.description}</p>}

                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {item.isWholesale && <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">Wholesale</span>}
                        {item.has_serial && <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">Serialized</span>}
                        {item.has_warranty && <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Has Warranty</span>}
                    </div>
                </div>

                {/* Variant Details */}
                {item.variantName && (
                    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h5 className="mb-2 text-sm font-semibold text-gray-700">Variant</h5>
                        <p className="mb-2 font-medium text-gray-900">{item.variantName}</p>
                        {item.variantData && (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(item.variantData).map(([key, value]) => (
                                    <div key={key} className="rounded-lg bg-purple-100 px-3 py-1.5">
                                        <span className="text-xs font-semibold text-purple-900">{key}:</span>
                                        <span className="ml-1 text-xs font-medium text-purple-700">{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Serial Numbers */}
                {item.has_serial && item.serials && item.serials.length > 0 && (
                    <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                        <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-900">
                            <Hash className="h-4 w-4" />
                            Serial Numbers
                        </h5>
                        <div className="space-y-2">
                            {item.serials.map((serial) => (
                                <div key={serial.id} className="flex items-center justify-between rounded-lg bg-white p-3">
                                    <div>
                                        <p className="font-mono text-sm font-bold text-gray-900">{serial.serial_number}</p>
                                        {serial.notes && <p className="text-xs text-gray-600">{serial.notes}</p>}
                                    </div>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${serial.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                        {serial.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Warranty Details */}
                {item.has_warranty && item.warranty && typeof item.warranty === 'object' && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                        <h5 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-900">
                            <Shield className="h-4 w-4" />
                            Warranty Information
                        </h5>
                        <div className="space-y-2 rounded-lg bg-white p-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Type:</span>
                                <span className="text-sm font-semibold text-gray-900">{item.warranty.warranty_type_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Duration:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {item.warranty.duration_months ? `${item.warranty.duration_months} months` : item.warranty.duration_days ? `${item.warranty.duration_days} days` : 'Lifetime'}
                                </span>
                            </div>
                            {item.warranty.start_date && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Start Date:</span>
                                    <span className="text-sm font-semibold text-gray-900">{item.warranty.start_date}</span>
                                </div>
                            )}
                            {item.warranty.end_date && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">End Date:</span>
                                    <span className="text-sm font-semibold text-gray-900">{item.warranty.end_date}</span>
                                </div>
                            )}
                            {item.warranty.remaining_days !== null && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Remaining:</span>
                                    <span className="text-sm font-semibold text-gray-900">{item.warranty.remaining_days} days</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Status:</span>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.warranty.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {item.warranty.status}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Details */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h5 className="mb-3 text-sm font-semibold text-gray-700">Pricing</h5>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Quantity:</span>
                            <span className="text-sm font-semibold text-gray-900">{item.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Unit:</span>
                            <span className="text-sm font-semibold text-gray-900">{item.unit || 'piece'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Rate per unit:</span>
                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.rate)}</span>
                        </div>
                        {item.tax_rate && (
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Tax:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {item.tax_rate}% ({item.tax_included ? 'Included' : 'Excluded'})
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-gray-300 pt-2">
                            <span className="text-base font-bold text-gray-900">Total Amount:</span>
                            <span className="text-lg font-bold text-primary">{totalAmount()}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button className="btn btn-secondary px-5 py-2 text-sm hover:bg-gray-200" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemPreviewModal;
