import IconShoppingCart from '@/components/icon/icon-shopping-cart';
import IconX from '@/components/icon/icon-x';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
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
    soldQuantity?: number;
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
    const { t } = getTranslation();
    const { formatCurrency, formatNumber, symbol } = useCurrency();
    const [previewItem, setPreviewItem] = useState<InvoiceItem | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const displayUnit = (unit?: string) => (unit && unit.toLowerCase() !== 'piece' ? unit : t('lbl_piece'));
    const returnableItemsCount = invoiceItems.filter((item) => item.isReturnItem).length;
    const selectedReturnItemsCount = invoiceItems.filter((item) => item.isReturnItem && Number(item.returnQuantity ?? item.quantity ?? 0) > 0).length;

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
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                        <IconShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-600">{isReturnMode ? t('pos_return_selection') : t('pos_order_details')}</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        {isReturnMode ? `${formatNumber(selectedReturnItemsCount)}/${formatNumber(returnableItemsCount)}` : formatNumber(invoiceItems.length)}
                    </span>
                </div>
                {!isReturnMode && invoiceItems.length > 0 && (
                    <button type="button" onClick={onClearItems} className="text-xs font-medium text-red-400 hover:text-red-600">
                        {t('btn_clear_all')}
                    </button>
                )}
            </div>

            <div className="hidden overflow-hidden rounded-xl border border-gray-200 shadow-sm md:block">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">#</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">{t('lbl_items')}</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">{isReturnMode ? t('lbl_qty_returned') : t('lbl_qty')}</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">{t('lbl_unit')}</th>
                            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">{t('lbl_rate')}</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">{t('lbl_tax')}</th>
                            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">{isReturnMode ? t('lbl_return_value') : t('lbl_amount')}</th>
                            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600">{t('lbl_action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceItems.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-3xl">🛒</div>
                                        <div className="font-semibold text-gray-600">{t('pos_no_items_added')}</div>
                                        <div className="text-sm text-gray-400">{t('pos_add_products_hint')}</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            invoiceItems.map((item, index) => {
                                // Check if this is a fully returned item (in return mode)
                                const selectedReturnQty = Number(item.returnQuantity ?? item.quantity ?? 0);
                                const originalQty = Number(item.originalQuantity ?? item.PlaceholderQuantity ?? 0);
                                const soldQty = Number(item.soldQuantity ?? item.originalQuantity ?? 0);
                                const isFullyReturned = isReturnMode && item.isReturnItem && selectedReturnQty > 0 && selectedReturnQty >= originalQty;
                                const isPartiallyReturned = isReturnMode && item.isReturnItem && selectedReturnQty > 0 && selectedReturnQty < originalQty;

                                return (
                                    <tr
                                        key={item.id}
                                        className={`border-b border-gray-100 transition-colors last:border-0 ${
                                            isFullyReturned
                                                ? 'bg-amber-50 hover:bg-amber-100'
                                                : isPartiallyReturned
                                                ? 'bg-orange-50 hover:bg-orange-100'
                                                : index % 2 === 0
                                                ? 'bg-white hover:bg-primary/5'
                                                : 'bg-slate-50/60 hover:bg-primary/5'
                                        }`}
                                    >
                                        <td className="px-3 py-2.5 text-center text-sm font-bold text-gray-500">{formatNumber(index + 1)}</td>
                                        <td className="px-3 py-2.5 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handlePreview(item)}
                                                    className="flex-shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                                                    title={t('btn_view_details')}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span title={item.title}>{item.title.length > 20 ? `${item.title.substring(0, 20)}...` : item.title}</span>
                                                        {/* Return Status Badge */}
                                                        {isFullyReturned && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">{t('pos_returning_all')}</span>
                                                        )}
                                                        {isPartiallyReturned && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                                                                {t('pos_returning')} {item.returnQuantity}
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
                                                    {isReturnMode && item.isReturnItem && (
                                                        <div className="mt-1 flex flex-wrap gap-1 text-xs">
                                                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
                                                                {t('lbl_qty_sold')}: {formatNumber(soldQty)}
                                                            </span>
                                                            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">
                                                                {t('lbl_returnable')}: {formatNumber(item.originalQuantity || 0)}
                                                            </span>
                                                            {selectedReturnQty <= 0 && <span className="rounded bg-gray-50 px-1.5 py-0.5 text-gray-400">{t('lbl_not_selected')}</span>}
                                                        </div>
                                                    )}
                                                    {/* Serial Number Badge */}
                                                    {item.has_serial && item.serials && item.serials.length > 0 && (
                                                        <div className="mt-1">
                                                            <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                                                                <Hash className="h-3 w-3" />
                                                                {t('lbl_serial')}: {item.serials[0].serial_number}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {/* Warranty Badge */}
                                                    {item.has_warranty && item.warranty && typeof item.warranty === 'object' && (
                                                        <div className="mt-1">
                                                            <span
                                                                className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700"
                                                                title={`${item.warranty.warranty_type_name} ${t('lbl_warranty')}`}
                                                            >
                                                                <Shield className="h-3 w-3" />
                                                                {item.warranty.duration_months
                                                                    ? `${item.warranty.duration_months}mo`
                                                                    : item.warranty.duration_days
                                                                    ? `${item.warranty.duration_days}d`
                                                                    : t('lbl_lifetime')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                            <div className="relative">
                                                {isReturnMode && item.isReturnItem ? (
                                                    // Return item - show selected return quantity
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
                                                        <span className="text-xs text-gray-500">{t('lbl_of')} {item.originalQuantity}</span>
                                                    </div>
                                                ) : item.has_serial ? (
                                                    // Serialized products have fixed quantity = 1
                                                    <span className="inline-block rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">1</span>
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
                                                    <div className="absolute left-1/2 bottom-full z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 shadow-sm ring-1 ring-yellow-300">
                                                        {t('msg_qty_at_least_1')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-sm">
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{displayUnit(item.unit)}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right text-sm font-medium">
                                            {isReturnMode && item.isReturnItem ? (
                                                <span className="font-semibold text-gray-700">{formatCurrency(item.rate)}</span>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => onItemWholesaleToggle(item.id)}
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                                                            item.isWholesale ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        }`}
                                                        title={t('msg_switch_price_mode', { mode: item.isWholesale ? t('lbl_retail') : t('lbl_wholesale') })}
                                                    >
                                                        {item.isWholesale ? t('lbl_wholesale') : t('lbl_retail')}
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
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-sm">
                                            {item.tax_rate ? (
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-xs font-semibold text-gray-700">{item.tax_rate}%</span>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            item.tax_included ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                        }`}
                                                    >
                                                        {item.tax_included ? t('lbl_incl') : t('lbl_excl')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">{t('lbl_no_tax')}</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            <span className={`text-sm font-bold ${isReturnMode && item.isReturnItem && selectedReturnQty <= 0 ? 'text-gray-300' : 'text-primary'}`}>
                                                {isReturnMode && item.isReturnItem && selectedReturnQty <= 0 ? '—' : totalAmountForItem(item)}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                            {isReturnMode && item.isReturnItem && selectedReturnQty <= 0 ? (
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-400">{t('lbl_not_selected')}</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveItem(item.id)}
                                                    className="inline-flex items-center justify-center rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                    title={isReturnMode && item.isReturnItem ? t('btn_clear_selection') : t('btn_remove_item')}
                                                >
                                                    <IconX className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="space-y-2.5 md:hidden">
                {invoiceItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12">
                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <IconShoppingCart className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-500">{t('pos_no_items_added')}</p>
                        <p className="mt-1 text-xs text-gray-400">{t('pos_add_products_hint_mobile')}</p>
                    </div>
                ) : (
                    invoiceItems.map((item, index) => {
                        const selectedReturnQty = Number(item.returnQuantity ?? item.quantity ?? 0);
                        const originalQty = Number(item.originalQuantity ?? item.PlaceholderQuantity ?? 0);
                        const soldQty = Number(item.soldQuantity ?? item.originalQuantity ?? 0);
                        const isFullyReturned = isReturnMode && item.isReturnItem && selectedReturnQty > 0 && selectedReturnQty >= originalQty;
                        const isPartiallyReturned = isReturnMode && item.isReturnItem && selectedReturnQty > 0 && selectedReturnQty < originalQty;

                        return (
                            <div
                                key={item.id}
                                className={`overflow-hidden rounded-xl border shadow-sm ${
                                    isFullyReturned ? 'border-amber-200' : isPartiallyReturned ? 'border-orange-200' : 'border-gray-200'
                                }`}
                            >
                                {/* Card Header */}
                                <div
                                    className={`flex items-start justify-between px-3 py-2.5 ${
                                        isFullyReturned ? 'bg-amber-50' : isPartiallyReturned ? 'bg-orange-50' : 'bg-primary/5'
                                    }`}
                                >
                                    <div className="flex items-start gap-2 overflow-hidden">
                                        <span
                                            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                                isFullyReturned ? 'bg-amber-400 text-white' : isPartiallyReturned ? 'bg-orange-400 text-white' : 'bg-primary text-white'
                                            }`}
                                        >
                                            {formatNumber(index + 1)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate text-sm font-semibold text-gray-900">{item.title}</h4>
                                            {item.variantName && (
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    {item.variantName}{item.variantData && ` (${Object.values(item.variantData).join(', ')})`}
                                                </p>
                                            )}
                                            {isReturnMode && item.isReturnItem && (
                                                <div className="mt-1 flex flex-wrap gap-1 text-xs">
                                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600">
                                                        {t('lbl_qty_sold')}: {formatNumber(soldQty)}
                                                    </span>
                                                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">
                                                        {t('lbl_returnable')}: {formatNumber(item.originalQuantity || 0)}
                                                    </span>
                                                    {selectedReturnQty <= 0 && <span className="rounded bg-gray-50 px-1.5 py-0.5 text-gray-400">{t('lbl_not_selected')}</span>}
                                                </div>
                                            )}
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {isFullyReturned && (
                                                    <span className="inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">{t('pos_returning_all')}</span>
                                                )}
                                                {isPartiallyReturned && (
                                                    <span className="inline-flex items-center rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                                                        {t('pos_returning')} {item.returnQuantity}
                                                    </span>
                                                )}
                                                {item.has_serial && item.serials && item.serials.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                                                        <Hash className="h-3 w-3" />
                                                        {item.serials[0].serial_number}
                                                    </span>
                                                )}
                                                {item.has_warranty && item.warranty && typeof item.warranty === 'object' && (
                                                    <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                                        <Shield className="h-3 w-3" />
                                                        {item.warranty.duration_months
                                                            ? `${item.warranty.duration_months}mo`
                                                            : item.warranty.duration_days
                                                            ? `${item.warranty.duration_days}d`
                                                            : t('lbl_lifetime')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-2 flex flex-shrink-0 gap-1">
                                        <button type="button" onClick={() => handlePreview(item)} className="rounded-lg p-1.5 text-primary hover:bg-primary/10">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        {isReturnMode && item.isReturnItem && selectedReturnQty <= 0 ? null : (
                                            <button
                                                type="button"
                                                onClick={() => onRemoveItem(item.id)}
                                                className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                                                title={isReturnMode && item.isReturnItem ? t('btn_clear_selection') : t('btn_remove_item')}
                                            >
                                                <IconX className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="bg-white px-3 py-2.5">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                        {/* Qty */}
                                        <div>
                                            <p className="mb-1 font-medium text-gray-500">{isReturnMode && item.isReturnItem ? t('lbl_qty_returned') : t('lbl_qty')}</p>
                                            {isReturnMode && item.isReturnItem ? (
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
                                                        className={`form-input h-6 w-12 border-y border-gray-300 px-1 py-0 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${isFullyReturned ? 'bg-amber-50' : ''}`}
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
                                                        disabled={item.quantity >= (item.originalQuantity || 9999)}
                                                    >
                                                        +
                                                    </button>
                                                    <span className="ml-0.5 text-gray-400">/{item.originalQuantity}</span>
                                                </div>
                                            ) : item.has_serial ? (
                                                <span className="inline-block rounded bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">1</span>
                                            ) : (
                                                <div className="relative flex w-[72px] items-center">
                                                    <input
                                                        type="number"
                                                        className="form-input h-8 w-full border-gray-300 pr-5 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                        value={item.quantity === 0 ? '' : item.quantity}
                                                        onChange={(e) => onQuantityChange(item.id, e.target.value)}
                                                        onBlur={() => onQuantityBlur(item.id)}
                                                        min="0"
                                                        max={item.PlaceholderQuantity || 9999}
                                                    />
                                                    <div className="absolute right-0 top-0 flex h-full flex-col border-l border-gray-300">
                                                        <button type="button" onClick={() => onQuantityChange(item.id, (item.quantity + 1).toString())} className="flex h-1/2 w-5 items-center justify-center border-b border-gray-300 bg-gray-50 hover:bg-gray-100" disabled={item.quantity >= (item.PlaceholderQuantity || 9999)}>
                                                            <ChevronUp className="h-2.5 w-2.5" />
                                                        </button>
                                                        <button type="button" onClick={() => onQuantityChange(item.id, Math.max(0, item.quantity - 1).toString())} className="flex h-1/2 w-5 items-center justify-center bg-gray-50 hover:bg-gray-100" disabled={item.quantity <= 0}>
                                                            <ChevronDown className="h-2.5 w-2.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Unit */}
                                        <div>
                                            <p className="mb-1 font-medium text-gray-500">{t('lbl_unit')}</p>
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">{item.unit || '—'}</span>
                                        </div>

                                        {/* Rate */}
                                        <div className="col-span-2">
                                            <div className="mb-1 flex items-center justify-between">
                                                <p className="font-medium text-gray-500">{t('lbl_rate')}</p>
                                                {!isReturnMode || !item.isReturnItem ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onItemWholesaleToggle(item.id)}
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${item.isWholesale ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                                    >
                                                        {item.isWholesale ? t('lbl_wholesale') : t('lbl_retail')}
                                                    </button>
                                                ) : null}
                                            </div>
                                            {isReturnMode && item.isReturnItem ? (
                                                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center text-sm font-semibold text-gray-700">{formatCurrency(item.rate)}</div>
                                            ) : (
                                                <div className="relative flex w-full items-center">
                                                    <input
                                                        type="number"
                                                        step="1"
                                                        className="form-input h-8 w-full border-gray-300 pr-5 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                        placeholder={t('lbl_rate')}
                                                        value={item.rate === 0 ? '' : item.rate}
                                                        onChange={(e) => onUnitPriceChange(item.id, e.target.value)}
                                                        onBlur={() => onUnitPriceBlur(item.id)}
                                                        min="0"
                                                    />
                                                    <div className="absolute right-0 top-0 flex h-full flex-col border-l border-gray-300">
                                                        <button type="button" onClick={() => onUnitPriceChange(item.id, (item.rate + 1).toString())} className="flex h-1/2 w-5 items-center justify-center border-b border-gray-300 bg-gray-50 hover:bg-gray-100">
                                                            <ChevronUp className="h-2.5 w-2.5" />
                                                        </button>
                                                        <button type="button" onClick={() => onUnitPriceChange(item.id, Math.max(0, item.rate - 1).toString())} className="flex h-1/2 w-5 items-center justify-center bg-gray-50 hover:bg-gray-100">
                                                            <ChevronDown className="h-2.5 w-2.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tax */}
                                        <div className="col-span-2">
                                            <p className="mb-1 font-medium text-gray-500">{t('lbl_tax')}</p>
                                            {item.tax_rate ? (
                                                <span className="font-semibold text-gray-700">
                                                    {item.tax_rate}%{' '}
                                                    <span className={`text-xs ${item.tax_included ? 'text-green-600' : 'text-blue-600'}`}>
                                                        ({item.tax_included ? t('lbl_incl') : t('lbl_excl')})
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">{t('lbl_no_tax')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer - Amount */}
                                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-3 py-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{isReturnMode ? t('lbl_return_value') : t('lbl_amount')}</span>
                                    <span className={`text-base font-bold ${isReturnMode && item.isReturnItem && selectedReturnQty <= 0 ? 'text-gray-300' : 'text-primary'}`}>
                                        {isReturnMode && item.isReturnItem && selectedReturnQty <= 0 ? '—' : totalAmountForItem(item)}
                                    </span>
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
