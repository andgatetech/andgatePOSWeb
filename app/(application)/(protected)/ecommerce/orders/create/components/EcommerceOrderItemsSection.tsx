'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    Package,
    Eye,
    Tag,
    AlertCircle,
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import ItemPreviewModal from '@/app/(application)/(protected)/pos/pos-right-side/ItemPreviewModal';
import type { CartItem } from '../types';

interface EcommerceOrderItemsSectionProps {
    cart: CartItem[];
    onUpdateQuantity: (stockId: number, newQty: number) => void;
    onUpdatePrice: (stockId: number, newPrice: number) => void;
    onRemoveItem: (stockId: number) => void;
    onClearCart: () => void;
}

export default function EcommerceOrderItemsSection({
    cart,
    onUpdateQuantity,
    onUpdatePrice,
    onRemoveItem,
    onClearCart,
}: EcommerceOrderItemsSectionProps) {
    const { t, isBn } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const [previewItem, setPreviewItem] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const totalUnits = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

    const handlePreview = (item: CartItem) => {
        setPreviewItem({
            id: item.stock_id,
            title: item.product_name,
            variantName: item.variantName,
            variantData: item.variantData,
            quantity: item.quantity,
            rate: item.price,
            unit: item.unit || 'Pcs',
            description: `SKU: ${item.sku} | In Stock: ${item.availableStock ?? 'N/A'}`,
        });
        setIsPreviewOpen(true);
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md">
            {/* Header: POS Right-Side Order Details style */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-slate-900">
                                {isBn ? '২. অর্ডারে নির্বাচিত পণ্যসমূহ' : '2. Selected Order Items'}
                            </h2>
                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                                {formatNumber(cart.length)} {cart.length === 1 ? 'Item' : 'Items'} ({formatNumber(totalUnits)} {isBn ? 'ইউনিট' : 'Units'})
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            {isBn ? 'পণ্যের পরিমাণ বা বিক্রয়মূল্য পরিবর্তন করুন' : 'Adjust quantities or custom line item rates'}
                        </p>
                    </div>
                </div>

                {cart.length > 0 && (
                    <button
                        type="button"
                        onClick={onClearCart}
                        className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 transition cursor-pointer"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>{isBn ? 'সব মুছুন' : 'Clear All'}</span>
                    </button>
                )}
            </div>

            {/* Empty State (POS style) */}
            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-3xl mb-2">
                        🛒
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                        {isBn ? 'অর্ডারে এখনো কোন পণ্য যুক্ত করা হয়নি' : 'No items added to this order yet'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
                        {isBn
                            ? 'উপরের ক্যাটালগ থেকে সক্রিয় পণ্যের উপর ক্লিক করে যুক্ত করুন'
                            : 'Click on any active product from the catalog above to add items'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View (hidden md:block) */}
                    <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    <th className="px-3 py-2.5 text-center w-10">#</th>
                                    <th className="px-3 py-2.5">{isBn ? 'পণ্যের বিবরণ' : 'Item Details'}</th>
                                    <th className="px-3 py-2.5 text-center w-36">{isBn ? 'পরিমাণ (Qty)' : 'Quantity'}</th>
                                    <th className="px-3 py-2.5 text-center w-20">{isBn ? 'একক' : 'Unit'}</th>
                                    <th className="px-3 py-2.5 text-right w-32">{isBn ? 'দর (Rate)' : 'Unit Price'}</th>
                                    <th className="px-3 py-2.5 text-right w-32">{isBn ? 'মোট মূল্য' : 'Total Amount'}</th>
                                    <th className="px-3 py-2.5 text-center w-14">{isBn ? 'মুছুন' : 'Action'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {cart.map((item, index) => {
                                    const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
                                    return (
                                        <tr key={`${item.stock_id}-${index}`} className="hover:bg-primary/5 transition-colors">
                                            {/* Index */}
                                            <td className="px-3 py-3 text-center font-bold text-slate-400">
                                                {formatNumber(index + 1)}
                                            </td>

                                            {/* Product Info */}
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    {/* View Item Details Eye Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePreview(item)}
                                                        className="flex-shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800 cursor-pointer"
                                                        title={isBn ? 'পণ্যের বিবরণ' : 'View Item Details'}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>

                                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                                        {item.image ? (
                                                            <Image
                                                                src={item.image}
                                                                alt={item.product_name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="40px"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                                                                <Package className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 line-clamp-1" title={item.product_name}>
                                                            {item.product_name}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            {item.variantName && (
                                                                <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                                                                    {item.variantName}
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] text-slate-400 font-mono">
                                                                SKU: {item.sku}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Quantity Stepper */}
                                            <td className="px-3 py-3 text-center">
                                                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => onUpdateQuantity(item.stock_id, Math.max(1, item.quantity - 1))}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => onUpdateQuantity(item.stock_id, Math.max(1, parseInt(e.target.value) || 1))}
                                                        className="h-7 w-12 text-center text-xs font-bold text-slate-900 focus:outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => onUpdateQuantity(item.stock_id, item.quantity + 1)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Unit */}
                                            <td className="px-3 py-3 text-center">
                                                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                                    {item.unit || 'Pcs'}
                                                </span>
                                            </td>

                                            {/* Editable Unit Price */}
                                            <td className="px-3 py-3 text-right">
                                                <div className="relative inline-flex items-center">
                                                    <span className="absolute left-2 text-[11px] font-bold text-slate-400">৳</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.price}
                                                        onChange={(e) => onUpdatePrice(item.stock_id, Math.max(0, parseFloat(e.target.value) || 0))}
                                                        className="h-8 w-24 rounded-lg border border-slate-200 bg-white pl-5 pr-2 text-right text-xs font-bold text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                </div>
                                            </td>

                                            {/* Line Item Total */}
                                            <td className="px-3 py-3 text-right font-extrabold text-slate-900">
                                                {formatCurrency(lineTotal)}
                                            </td>

                                            {/* Delete Action */}
                                            <td className="px-3 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => onRemoveItem(item.stock_id)}
                                                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                                    title={isBn ? 'আইটেমটি মুছুন' : 'Remove Item'}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards View (md:hidden) */}
                    <div className="md:hidden space-y-2.5">
                        {cart.map((item, index) => {
                            const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
                            return (
                                <div
                                    key={`${item.stock_id}-${index}`}
                                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2.5"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {/* Eye Button Mobile */}
                                            <button
                                                type="button"
                                                onClick={() => handlePreview(item)}
                                                className="flex-shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800 cursor-pointer"
                                                title={isBn ? 'পণ্যের বিবরণ' : 'View Item Details'}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>

                                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.product_name}
                                                        fill
                                                        className="object-cover"
                                                        sizes="44px"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                                                        <Package className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                                    {item.product_name}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {item.variantName && (
                                                        <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[9px] font-semibold text-primary">
                                                            {item.variantName}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        SKU: {item.sku}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onRemoveItem(item.stock_id)}
                                            className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Mobile Controls Row */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                        {/* Stepper */}
                                        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQuantity(item.stock_id, Math.max(1, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                                className="flex h-6 w-6 items-center justify-center text-slate-500 disabled:opacity-40"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-xs font-bold text-slate-900">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onUpdateQuantity(item.stock_id, item.quantity + 1)}
                                                className="flex h-6 w-6 items-center justify-center text-slate-500"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>

                                        {/* Price & Total */}
                                        <div className="text-right">
                                            <span className="text-[10px] text-slate-400 block">
                                                @ ৳{item.price}
                                            </span>
                                            <span className="text-xs font-black text-slate-900">
                                                {formatCurrency(lineTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Section Footer: POS Summary Row */}
                    <div className="mt-3 flex flex-wrap items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                            <span>
                                {isBn ? 'মোট পণ্য:' : 'Total Items:'} <strong className="text-slate-900">{formatNumber(cart.length)}</strong>
                            </span>
                            <span>•</span>
                            <span>
                                {isBn ? 'মোট একক:' : 'Total Units:'} <strong className="text-slate-900">{formatNumber(totalUnits)}</strong>
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">
                                {isBn ? 'আইটেম সাবটোটাল:' : 'Items Subtotal:'}
                            </span>
                            <span className="text-sm font-black text-primary">
                                {formatCurrency(subtotal)}
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Modal: Item Preview Details (like POS ItemPreviewModal) */}
            <ItemPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => {
                    setIsPreviewOpen(false);
                    setPreviewItem(null);
                }}
                item={previewItem}
            />
        </div>
    );
}

