import IconShoppingCart from '@/components/icon/icon-shopping-cart';
import IconX from '@/components/icon/icon-x';
import { useCurrency } from '@/hooks/useCurrency';
import { ChevronDown, ChevronUp, Eye, Hash, Shield } from 'lucide-react';
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
    // Return mode fields
    isReturnItem?: boolean;
    orderItemId?: number;
    originalQuantity?: number;
    returnQuantity?: number;
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
    isReturnMode?: boolean;
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
    isReturnMode = false,
}) => {
    const { formatCurrency, symbol } = useCurrency();
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
            return formatCurrency(basePrice + taxAmount);
        }
        return formatCurrency(basePrice);
    };

    return (
        <div>
            <ItemPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} item={previewItem} />
            <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Order Details</h3>
                <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm">Items: {invoiceItems.length}</span>
                    {!isReturnMode && (
                        <button type="button" onClick={onClearItems} className="text-xs text-red-600 hover:text-red-800 sm:text-sm">
                            Clear all
                        </button>
                    )}
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
                            invoiceItems.map((item, index) => {
                                // Check if this is a fully returned item (in return mode)
                                const isFullyReturned = isReturnMode && item.isReturnItem && item.quantity === 0;
                                const isPartiallyReturned = isReturnMode && item.isReturnItem && item.returnQuantity && item.returnQuantity > 0 && item.quantity > 0;

                                return (
                                    <tr
                                        key={item.id}
                                        className={`transition-colors ${
                                            isFullyReturned ? 'bg-amber-50 hover:bg-amber-100' : isPartiallyReturned ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-blue-50'
                                        } ${index < invoiceItems.length - 1 ? 'border-b border-gray-200' : ''}`}
                                    >
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
                                                        {/* Return Status Badge */}
                                                        {isFullyReturned && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">Returning All</span>
                                                        )}
                                                        {isPartiallyReturned && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                                                                Returning {item.returnQuantity}
                                                            </span>
                                                        )}
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
                                                ) : isReturnMode && item.isReturnItem ? (
                                                    // Return item - show kept quantity with original
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => onQuantityChange(item.id, Math.max(0, item.quantity - 1).toString())}
                                                                className="flex h-7 w-7 items-center justify-center rounded-l border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                                                disabled={item.quantity <= 0}
                                                            >
                                                                −
                                                            </button>
                                                            <input
                                                                type="number"
                                                                className={`form-input h-7 w-16 border-y border-gray-300 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                                                                    isFullyReturned ? 'bg-amber-50' : ''
                                                                }`}
                                                                min={0}
                                                                max={item.originalQuantity || item.PlaceholderQuantity || 9999}
                                                                value={item.quantity === 0 ? '0' : item.quantity}
                                                                onChange={(e) => onQuantityChange(item.id, e.target.value)}
                                                                onBlur={() => onQuantityBlur(item.id)}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    onQuantityChange(item.id, Math.min(item.originalQuantity || item.PlaceholderQuantity || 9999, item.quantity + 1).toString())
                                                                }
                                                                className="flex h-7 w-7 items-center justify-center rounded-r border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                                                disabled={item.quantity >= (item.originalQuantity || item.PlaceholderQuantity || 9999)}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <span className="text-xs text-gray-500">of {item.originalQuantity}</span>
                                                    </div>
                                                ) : (
                                                    <div className="relative flex w-[80px] items-center">
                                                        <input
                                                            type="number"
                                                            className={`form-input h-9 w-full border-gray-300 pr-6 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                                                                item.quantity === 0 ? 'border-yellow-400' : ''
                                                            }`}
                                                            min={0}
                                                            max={item.PlaceholderQuantity || 9999}
                                                            value={item.quantity === 0 ? '' : item.quantity}
                                                            onChange={(e) => onQuantityChange(item.id, e.target.value)}
                                                            onBlur={() => onQuantityBlur(item.id)}
                                                        />
                                                        <div className="absolute right-0 top-0 flex h-full flex-col border-l border-gray-300">
                                                            <button
                                                                type="button"
                                                                onClick={() => onQuantityChange(item.id, (item.quantity + 1).toString())}
                                                                className="flex h-1/2 w-6 items-center justify-center border-b border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                                disabled={item.quantity >= (item.PlaceholderQuantity || 9999)}
                                                            >
                                                                <ChevronUp className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => onQuantityChange(item.id, Math.max(0, item.quantity - 1).toString())}
                                                                className="flex h-1/2 w-6 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                                disabled={item.quantity <= 0}
                                                            >
                                                                <ChevronDown className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Only show warning for non-return items */}
                                                {item.quantity === 0 && !(isReturnMode && item.isReturnItem) && (
                                                    <div className="absolute left-0 top-full z-10 mt-1 whitespace-nowrap text-xs text-yellow-600">Quantity must be at least 1</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="border-r border-gray-300 p-3 text-center text-sm">
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs">{item.unit || 'piece'}</span>
                                        </td>
                                        <td className="border-r border-gray-300 p-3 text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
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
                                                <div className="relative flex w-[80px] items-center">
                                                    <input
                                                        type="number"
                                                        step="1"
                                                        className="form-input h-9 w-full border-gray-300 pr-6 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                        value={item.rate === 0 ? '' : item.rate}
                                                        onChange={(e) => onUnitPriceChange(item.id, e.target.value)}
                                                        onBlur={() => onUnitPriceBlur(item.id)}
                                                    />
                                                    <div className="absolute right-0 top-0 flex h-full flex-col border-l border-gray-300">
                                                        <button
                                                            type="button"
                                                            onClick={() => onUnitPriceChange(item.id, (item.rate + 1).toString())}
                                                            className="flex h-1/2 w-6 items-center justify-center border-b border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                                        >
                                                            <ChevronUp className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => onUnitPriceChange(item.id, Math.max(0, item.rate - 1).toString())}
                                                            className="flex h-1/2 w-6 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                                        >
                                                            <ChevronDown className="h-3 w-3" />
                                                        </button>
                                                    </div>
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
                                        <td className="border-r border-gray-300 p-3 text-right text-sm font-bold">{totalAmountForItem(item)}</td>
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
                                );
                            })
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
                    invoiceItems.map((item, index) => {
                        const isFullyReturned = isReturnMode && item.isReturnItem && item.quantity === 0;
                        const isPartiallyReturned = isReturnMode && item.isReturnItem && item.returnQuantity && item.returnQuantity > 0 && item.quantity > 0;

                        return (
                            <div
                                key={item.id}
                                className={`rounded-lg border p-3 shadow-sm ${
                                    isFullyReturned ? 'border-amber-300 bg-amber-50' : isPartiallyReturned ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'
                                }`}
                            >
                                <div className="mb-2 flex items-start justify-between">
                                    <div className="flex items-start gap-2">
                                        <span
                                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                isFullyReturned ? 'bg-amber-200 text-amber-700' : 'bg-blue-100 text-blue-700'
                                            }`}
                                        >
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                                                {/* Return Status Badge - Mobile */}
                                                {isFullyReturned && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">Returning All</span>
                                                )}
                                                {isPartiallyReturned && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                                                        Returning {item.returnQuantity}
                                                    </span>
                                                )}
                                            </div>
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
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Qty:</span>
                                        {item.has_serial ? (
                                            <span className="font-medium">1</span>
                                        ) : isReturnMode && item.isReturnItem ? (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => onQuantityChange(item.id, Math.max(0, item.quantity - 1).toString())}
                                                    className="flex h-6 w-6 items-center justify-center rounded-l border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                                    disabled={item.quantity <= 0}
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    className={`form-input h-6 w-14 border-y border-gray-300 px-1 py-0 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                                                        isFullyReturned ? 'bg-amber-50' : ''
                                                    }`}
                                                    placeholder="Qty"
                                                    value={item.quantity === 0 ? '0' : item.quantity}
                                                    onChange={(e) => onQuantityChange(item.id, e.target.value)}
                                                    onBlur={() => onQuantityBlur(item.id)}
                                                    min="0"
                                                    max={item.originalQuantity}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => onQuantityChange(item.id, Math.min(item.originalQuantity || 9999, item.quantity + 1).toString())}
                                                    className="flex h-6 w-6 items-center justify-center rounded-r border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                                                    disabled={item.quantity >= item.originalQuantity}
                                                >
                                                    +
                                                </button>
                                                <span className="ml-1 text-gray-500">/{item.originalQuantity}</span>
                                            </div>
                                        ) : (
                                            <div className="relative flex w-[80px] items-center">
                                                <input
                                                    type="number"
                                                    className="form-input h-9 w-full border-gray-300 pr-6 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                    placeholder="Qty"
                                                    value={item.quantity === 0 ? '' : item.quantity}
                                                    onChange={(e) => onQuantityChange(item.id, e.target.value)}
                                                    onBlur={() => onQuantityBlur(item.id)}
                                                    min="0"
                                                    max={item.PlaceholderQuantity || 9999}
                                                />
                                                <div className="absolute right-0 top-0 flex h-full flex-col border-l border-gray-300">
                                                    <button
                                                        type="button"
                                                        onClick={() => onQuantityChange(item.id, (item.quantity + 1).toString())}
                                                        className="flex h-1/2 w-6 items-center justify-center border-b border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                        disabled={item.quantity >= (item.PlaceholderQuantity || 9999)}
                                                    >
                                                        <ChevronUp className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onQuantityChange(item.id, Math.max(0, item.quantity - 1).toString())}
                                                        className="flex h-1/2 w-6 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                        disabled={item.quantity <= 0}
                                                    >
                                                        <ChevronDown className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
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
                                                {item.isWholesale ? 'Wholesale' : 'Retail'}
                                            </button>
                                        </div>
                                        <div className="relative flex w-full items-center">
                                            <input
                                                type="number"
                                                step="1"
                                                className="form-input h-9 w-full border-gray-300 pr-6 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                placeholder="Rate"
                                                value={item.rate === 0 ? '' : item.rate}
                                                onChange={(e) => onUnitPriceChange(item.id, e.target.value)}
                                                onBlur={() => onUnitPriceBlur(item.id)}
                                                min="0"
                                            />
                                            <div className="absolute right-0 top-0 flex h-full flex-col border-l border-gray-300">
                                                <button
                                                    type="button"
                                                    onClick={() => onUnitPriceChange(item.id, (item.rate + 1).toString())}
                                                    className="flex h-1/2 w-6 items-center justify-center border-b border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                                >
                                                    <ChevronUp className="h-3 w-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onUnitPriceChange(item.id, Math.max(0, item.rate - 1).toString())}
                                                    className="flex h-1/2 w-6 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                                >
                                                    <ChevronDown className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
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
                                    <span className="text-base font-bold text-primary">{formatCurrency(item.rate * item.quantity)}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default OrderDetailsSection;
