import IconShoppingCart from '@/components/icon/icon-shopping-cart';
import IconX from '@/components/icon/icon-x';
import { Eye, Hash, Shield } from 'lucide-react';
import { useState } from 'react';
import ItemPreviewModal from './ItemPreviewModal';
import type { PosFormData } from './types';

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
    regularPrice?: number;
    wholesalePrice?: number;
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

interface OrderDetailsSectionProps {
    invoiceItems: InvoiceItem[];
    formData: PosFormData;
    onWholesaleToggle: (checked: boolean) => void;
    onClearItems: () => void;
    onQuantityChange: (itemId: number, value: string) => void;
    onQuantityBlur: (itemId: number) => void;
    onUnitPriceChange: (itemId: number, value: string) => void;
    onUnitPriceBlur: (itemId: number) => void;
    onRemoveItem: (itemId: number) => void;
    onItemWholesaleToggle: (itemId: number) => void;
}

const OrderDetailsSection: React.FC<OrderDetailsSectionProps> = ({
    invoiceItems,
    formData,
    onWholesaleToggle,
    onClearItems,
    onQuantityChange,
    onQuantityBlur,
    onUnitPriceChange,
    onUnitPriceBlur,
    onRemoveItem,
    onItemWholesaleToggle,
}) => {
    const [previewItem, setPreviewItem] = useState<InvoiceItem | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handlePreview = (item: InvoiceItem) => {
        setPreviewItem(item);
        setIsPreviewOpen(true);
    };

    const totalAmountForItem = (item: InvoiceItem) => {
        const basePrice = item.rate * item.quantity;
        if (item.tax_rate && !item.tax_included) {
            const taxAmount = basePrice * (item.tax_rate / 100);
            return (basePrice + taxAmount).toFixed(2);
        }
        return basePrice.toFixed(2);
    };

    return (
        <div>
            <ItemPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} item={previewItem} />
            <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Order Details</h3>
                <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm">Items: {invoiceItems.length}</span>
                    <button type="button" onClick={onClearItems} className="text-xs text-red-600 hover:text-red-800 sm:text-sm">
                        Clear all
                    </button>
                </div>
            </div>

            <div className="hidden overflow-x-auto rounded-lg border border-gray-300 md:block">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">#</th>
                            <th className="border-b border-r border-gray-300 p-3 text-left text-xs font-semibold text-gray-700">Items</th>
                            <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Qty</th>
                            <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Unit</th>
                            <th className="border-b border-r border-gray-300 p-3 text-right text-xs font-semibold text-gray-700">Rate</th>
                            <th className="border-b border-r border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Tax</th>
                            <th className="border-b border-r border-gray-300 p-3 text-right text-xs font-semibold text-gray-700">Amount</th>
                            <th className="border-b border-gray-300 p-3 text-center text-xs font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {invoiceItems.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="border-b border-gray-300 p-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <div className="mb-2 text-3xl">🛒</div>
                                        <div className="font-medium">No items added yet</div>
                                        <div className="text-sm">Add products from the left panel</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            invoiceItems.map((item, index) => (
                                <tr key={item.id} className={`transition-colors hover:bg-blue-50 ${index < invoiceItems.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                    <td className="border-r border-gray-300 p-3 text-center text-sm font-bold text-gray-700">{index + 1}</td>
                                    <td className="border-r border-gray-300 p-3 text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handlePreview(item)}
                                                className="flex-shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                                                title="View details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span title={item.title}>{item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title}</span>
                                                </div>
                                                {/* Variant Info - Inline */}
                                                {item.variantName && (
                                                    <div className="mt-1 text-xs text-gray-600">
                                                        <span className="font-medium">{item.variantName}</span>
                                                        {item.variantData && <span className="ml-1">({Object.values(item.variantData).join(', ')})</span>}
                                                    </div>
                                                )}
                                                {/* Serial Number Badge */}
                                                {item.has_serial && item.serials && item.serials.length > 0 && (
                                                    <div className="mt-1">
                                                        <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                                                            <Hash className="h-3 w-3" />
                                                            S/N: {item.serials[0].serial_number}
                                                        </span>
                                                    </div>
                                                )}
                                                {/* Warranty Badge */}
                                                {item.has_warranty && item.warranty && typeof item.warranty === 'object' && (
                                                    <div className="mt-1">
                                                        <span
                                                            className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700"
                                                            title={`${item.warranty.warranty_type_name} warranty`}
                                                        >
                                                            <Shield className="h-3 w-3" />
                                                            {item.warranty.duration_months
                                                                ? `${item.warranty.duration_months}mo`
                                                                : item.warranty.duration_days
                                                                ? `${item.warranty.duration_days}d`
                                                                : 'Lifetime'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-r border-gray-300 p-3 text-center">
                                        <div className="relative">
                                            {item.has_serial ? (
                                                // Serialized products have fixed quantity = 1
                                                <span className="inline-block rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">1</span>
                                            ) : (
                                                <input
                                                    type="number"
                                                    className={`form-input w-16 text-center ${item.quantity === 0 ? 'border-yellow-400' : 'border-gray-300'}`}
                                                    min={0}
                                                    max={item.PlaceholderQuantity || 9999}
                                                    value={item.quantity === 0 ? '' : item.quantity}
                                                    onChange={(e) => onQuantityChange(item.id, e.target.value)}
                                                    onBlur={() => onQuantityBlur(item.id)}
                                                />
                                            )}
                                            {item.quantity === 0 && <div className="absolute left-0 top-full z-10 mt-1 whitespace-nowrap text-xs text-yellow-600">Quantity must be at least 1</div>}
                                        </div>
                                    </td>
                                    <td className="border-r border-gray-300 p-3 text-center text-sm">
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs">{item.unit || 'piece'}</span>
                                    </td>
                                    <td className="border-r border-gray-300 p-3 text-right text-sm font-medium">
                                        <div className="flex flex-col items-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => onItemWholesaleToggle(item.id)}
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                                                    item.isWholesale ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                                title={`Click to switch to ${item.isWholesale ? 'Retail' : 'Wholesale'} price`}
                                            >
                                                {item.isWholesale ? 'Wholesale' : 'Retail'}
                                            </button>
                                            <div className="relative w-full">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">৳</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="form-input w-24 rounded-md border-gray-300 text-right focus:border-indigo-500 focus:ring-indigo-500"
                                                    value={item.rate}
                                                    onChange={(e) => onUnitPriceChange(item.id, e.target.value)}
                                                    onBlur={() => onUnitPriceBlur(item.id)}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-r border-gray-300 p-3 text-center text-sm">
                                        {item.tax_rate ? (
                                            <div className="text-xs">
                                                <div className="font-medium">{item.tax_rate}%</div>
                                                <div
                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                                                        item.tax_included ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}
                                                >
                                                    {item.tax_included ? 'Incl.' : 'Excl.'}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">No tax</span>
                                        )}
                                    </td>
                                    <td className="border-r border-gray-300 p-3 text-right text-sm font-bold">৳{totalAmountForItem(item)}</td>
                                    <td className="p-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(item.id)}
                                            className="inline-flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100 hover:text-red-800"
                                            title="Remove item"
                                        >
                                            <IconX className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="space-y-3 md:hidden">
                {invoiceItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12">
                        <IconShoppingCart className="mb-2 h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">No items added yet</p>
                        <p className="text-xs text-gray-400">Add products to start your order</p>
                    </div>
                ) : (
                    invoiceItems.map((item, index) => (
                        <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="mb-2 flex items-start justify-between">
                                <div className="flex items-start gap-2">
                                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{index + 1}</span>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                                        {item.description && <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{item.description}</p>}

                                        {/* Variant Info - Mobile */}
                                        {item.variantName && (
                                            <div className="mt-1 text-xs text-gray-600">
                                                <span className="font-medium">{item.variantName}</span>
                                                {item.variantData && <span className="ml-1">({Object.values(item.variantData).join(', ')})</span>}
                                            </div>
                                        )}

                                        {/* Serial & Warranty Badges - Mobile */}
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {item.has_serial && item.serials && item.serials.length > 0 && (
                                                <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                                                    <Hash className="h-3 w-3" />
                                                    S/N: {item.serials[0].serial_number}
                                                </span>
                                            )}
                                            {item.has_warranty && item.warranty && typeof item.warranty === 'object' && (
                                                <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                                    <Shield className="h-3 w-3" />
                                                    {item.warranty.duration_months
                                                        ? `${item.warranty.duration_months}mo`
                                                        : item.warranty.duration_days
                                                        ? `${item.warranty.duration_days}d`
                                                        : 'Lifetime'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-2 flex flex-shrink-0 gap-1">
                                    <button type="button" onClick={() => handlePreview(item)} className="rounded-full bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    <button type="button" onClick={() => onRemoveItem(item.id)} className="rounded-full bg-red-50 p-1.5 text-red-600 hover:bg-red-100">
                                        <IconX className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Qty:</span>
                                    {item.has_serial ? (
                                        <span className="font-medium">1</span>
                                    ) : (
                                        <input
                                            type="number"
                                            className="form-input ml-2 w-16 rounded border border-gray-300 px-2 py-1 text-center text-xs"
                                            placeholder="Quantity"
                                            value={item.quantity === 0 ? '' : item.quantity}
                                            onChange={(e) => onQuantityChange(item.id, e.target.value)}
                                            onBlur={() => onQuantityBlur(item.id)}
                                            min="0"
                                        />
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Unit:</span>
                                    <span className="font-medium">{item.unit || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Rate:</span>
                                        <button
                                            type="button"
                                            onClick={() => onItemWholesaleToggle(item.id)}
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                                                item.isWholesale ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                        >
                                            {item.isWholesale ? 'W' : 'R'}
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        className="form-input w-full rounded border border-gray-300 px-2 py-1 text-center text-xs"
                                        placeholder="Rate"
                                        value={item.rate}
                                        onChange={(e) => onUnitPriceChange(item.id, e.target.value)}
                                        onBlur={() => onUnitPriceBlur(item.id)}
                                        min="0"
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax:</span>
                                    {item.tax_rate ? (
                                        <span className="font-medium">
                                            {item.tax_rate}% <span className={item.tax_included ? 'text-green-600' : 'text-blue-600'}>({item.tax_included ? 'Incl' : 'Excl'})</span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">No tax</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                                <span className="text-xs font-medium text-gray-600">Amount:</span>
                                <span className="text-base font-bold text-primary">৳{(item.rate * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderDetailsSection;
