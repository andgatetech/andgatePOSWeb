'use client';

import React from 'react';
import {
    Receipt,
    CheckCircle2,
    User,
    MapPin,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import type { CartItem } from '../types';

interface EcommerceInvoiceSummaryProps {
    cart: CartItem[];
    subtotal: number;
    calculatedDiscount: number;
    shippingFee: number;
    orderTotal: number;
    advancePaid: number;
    codAmountToCollect: number;
    paymentMethod: string;
    selectedSourceName?: string;
    selectedDeliveryPresetLabel?: string;

    // Customer summary
    customerName: string;
    customerPhone: string;
    selectedDistrictName?: string;
    selectedZoneName?: string;
    selectedAreaName?: string;
    addressLine?: string;

    // Actions
    isSubmitting: boolean;
    onSubmitOrder: () => void;
}

export default function EcommerceInvoiceSummary({
    cart,
    subtotal,
    calculatedDiscount,
    shippingFee,
    orderTotal,
    advancePaid,
    codAmountToCollect,
    paymentMethod,
    selectedSourceName,
    selectedDeliveryPresetLabel,
    customerName,
    customerPhone,
    selectedDistrictName,
    selectedZoneName,
    selectedAreaName,
    addressLine,
    isSubmitting,
    onSubmitOrder,
}: EcommerceInvoiceSummaryProps) {
    const { t, isBn } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();

    return (
        <div className="sticky top-20 space-y-4">
            {/* Live Invoice Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
                {/* Invoice Header */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-primary to-[#034d79] p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5 opacity-90" />
                            <h2 className="font-bold text-sm sm:text-base">
                                {isBn ? 'চেকআউট ইনভয়েস সামারি' : 'Checkout Order Summary'}
                            </h2>
                        </div>
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur-xs">
                            {formatNumber(cart.length)} {cart.length === 1 ? 'Item' : 'Items'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-white/80">
                        <span>{isBn ? 'অর্ডারের মাধ্যম:' : 'Source Channel:'}</span>
                        <span className="font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">
                            {selectedSourceName || 'Online Store'}
                        </span>
                    </div>
                </div>

                {/* Financial Breakdown */}
                <div className="p-4 space-y-3 text-xs">
                    {/* Items Subtotal */}
                    <div className="flex justify-between items-center text-slate-600">
                        <span>{isBn ? 'মোট পণ্যের মূল্য (Subtotal)' : 'Items Subtotal'}</span>
                        <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                    </div>

                    {/* Discount */}
                    {calculatedDiscount > 0 && (
                        <div className="flex justify-between items-center text-emerald-600 font-semibold">
                            <span>{isBn ? 'ডিসকাউন্ট (Discount)' : 'Order Discount'}</span>
                            <span>- {formatCurrency(calculatedDiscount)}</span>
                        </div>
                    )}

                    {/* Shipping */}
                    <div className="flex justify-between items-center text-slate-600">
                        <div className="flex items-center gap-1">
                            <span>{isBn ? 'ডেলিভারি চার্জ (Shipping)' : 'Shipping Fee'}</span>
                            {selectedDeliveryPresetLabel && (
                                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[110px]">
                                    ({selectedDeliveryPresetLabel})
                                </span>
                            )}
                        </div>
                        <span className="font-bold text-slate-900">+ {formatCurrency(Number(shippingFee || 0))}</span>
                    </div>

                    {/* Order Total */}
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-900 font-bold text-sm">
                        <span>{isBn ? 'সর্বমোট অর্ডার মূল্য' : 'Total Order Value'}</span>
                        <span className="text-base font-black text-slate-900">{formatCurrency(orderTotal)}</span>
                    </div>

                    {/* Advance Paid */}
                    {advancePaid > 0 && (
                        <div className="flex justify-between items-center text-blue-600 font-semibold pt-1 border-t border-dashed border-slate-200">
                            <span>{isBn ? 'অগ্রিম জমা (Advance Paid)' : 'Advance Payment Paid'}</span>
                            <span>- {formatCurrency(advancePaid)}</span>
                        </div>
                    )}

                    {/* Prominent COD Banner */}
                    <div className="mt-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 p-3.5 text-center">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                            {isBn ? 'ডেলিভারিতে আদায়যোগ্য (COD Amount)' : 'Cash on Delivery (COD) to Collect'}
                        </p>
                        <div className="text-2xl font-black text-emerald-700 mt-1">
                            {formatCurrency(codAmountToCollect)}
                        </div>
                        <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                            {paymentMethod === 'Cash on Delivery'
                                ? (isBn ? 'কুরিয়ার ডেলিভারির সময় নগদ গ্রহণ করবেন' : 'Collect cash upon delivery')
                                : (isBn ? `পেমেন্ট মোড: ${paymentMethod}` : `Payment Mode: ${paymentMethod}`)}
                        </p>
                    </div>
                </div>

                {/* Confirm and Place Order Action Button */}
                <div className="p-4 pt-0 space-y-2">
                    <button
                        type="button"
                        disabled={isSubmitting || cart.length === 0}
                        onClick={onSubmitOrder}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#034d79] px-4 text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:opacity-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>{isBn ? 'অর্ডার তৈরি হচ্ছে...' : 'Placing Order...'}</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                <span>{isBn ? 'অর্ডার কনফার্ম করুন' : 'Confirm & Place Order'}</span>
                            </>
                        )}
                    </button>

                    <p className="text-center text-[11px] text-slate-400 font-medium">
                        {isBn
                            ? 'অর্ডার তৈরি হলে সরাসরি ইনভয়েস প্রিন্ট ও কুরিয়ার বুকিং করা যাবে।'
                            : 'Order invoice and courier parcel tracking will be created.'}
                    </p>
                </div>
            </div>

            {/* Customer Summary Mini Card */}
            {customerPhone && (
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700 shadow-xs">
                    <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" />
                        {customerName || 'Customer'}
                    </p>
                    <p className="text-slate-500 font-mono">{customerPhone}</p>
                    {selectedDistrictName && (
                        <p className="text-slate-500 text-[11px] mt-1 flex items-start gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{[addressLine, selectedAreaName, selectedZoneName, selectedDistrictName].filter(Boolean).join(', ')}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
