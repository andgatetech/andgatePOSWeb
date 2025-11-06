import IconShoppingCart from '@/components/icon/icon-shopping-cart';
import IconX from '@/components/icon/icon-x';
import type { PosFormData } from './types';

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
}) => {
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
            <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Order Details</h3>
                <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-blue-200 bg-blue-50 px-3 py-1.5 transition-colors hover:bg-blue-100">
                        <input
                            type="checkbox"
                            checked={formData.useWholesale}
                            onChange={(e) => onWholesaleToggle(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs font-semibold text-blue-900 sm:text-sm">Wholesale</span>
                    </label>

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
                            <th className="border-b border-r border-gray-300 p-3 text-left text-xs font-semibold text-gray-700">Items</th>
                            <th className="border-b border-r border-gray-300 p-3 text-left text-xs font-semibold text-gray-700">Variant</th>
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
                                    <td className="border-r border-gray-300 p-3 text-sm font-medium">
                                        <span title={item.title}>{item.title.length > 10 ? `${item.title.substring(0, 10)}...` : item.title}</span>
                                        {item.isWholesale && <span className="ml-2 inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Wholesale</span>}
                                    </td>
                                    <td className="border-r border-gray-300 p-3">
                                        {item.variantName ? (
                                            <div>
                                                <div className="text-xs font-medium text-gray-900" title={item.variantName}>
                                                    {item.variantName.length > 10 ? `${item.variantName.substring(0, 10)}...` : item.variantName}
                                                </div>
                                                {item.variantData && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {Object.entries(item.variantData).map(([key, value]) => (
                                                            <span key={key} className="inline-block rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
                                                                {value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="border-r border-gray-300 p-3 text-center">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className={`form-input w-16 text-center ${item.quantity === 0 ? 'border-yellow-400' : 'border-gray-300'}`}
                                                min={0}
                                                max={item.PlaceholderQuantity || 9999}
                                                value={item.quantity === 0 ? '' : item.quantity}
                                                onChange={(e) => onQuantityChange(item.id, e.target.value)}
                                                onBlur={() => onQuantityBlur(item.id)}
                                            />
                                            {item.quantity === 0 && <div className="absolute left-0 top-full z-10 mt-1 whitespace-nowrap text-xs text-yellow-600">Quantity must be at least 1</div>}
                                        </div>
                                    </td>
                                    <td className="border-r border-gray-300 p-3 text-center text-sm">
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs">{item.unit || 'piece'}</span>
                                    </td>
                                    <td className="border-r border-gray-300 p-3 text-right text-sm font-medium">
                                        <div className="relative">
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
                    invoiceItems.map((item) => (
                        <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="mb-2 flex items-start justify-between">
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                                    {item.description && <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{item.description}</p>}
                                </div>
                                <button type="button" onClick={() => onRemoveItem(item.id)} className="ml-2 flex-shrink-0 rounded-full bg-red-50 p-1.5 text-red-600 hover:bg-red-100">
                                    <IconX className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Qty:</span>
                                    <input
                                        type="number"
                                        className="form-input ml-2 w-16 rounded border border-gray-300 px-2 py-1 text-center text-xs"
                                        placeholder="Quantity"
                                        value={item.quantity === 0 ? '' : item.quantity}
                                        onChange={(e) => onQuantityChange(item.id, e.target.value)}
                                        onBlur={() => onQuantityBlur(item.id)}
                                        min="0"
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Unit:</span>
                                    <span className="font-medium">{item.unit || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rate:</span>
                                    <input
                                        type="number"
                                        className="form-input ml-2 w-16 rounded border border-gray-300 px-2 py-1 text-center text-xs"
                                        placeholder="Quantity"
                                        value={item.rate === 0 ? '' : item.rate}
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
