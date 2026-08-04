'use client';

import React from 'react';
import {
    CreditCard,
    DollarSign,
    Smartphone,
    Layers,
    Tag,
    ShieldCheck,
    FileText,
    MessageSquare,
} from 'lucide-react';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { useCurrency } from '@/hooks/useCurrency';

interface EcommercePaymentSectionProps {
    // Order Source
    sources: any[];
    selectedSourceId: string | number;
    setSelectedSourceId: (id: string | number) => void;

    // Payment Method
    paymentMethod: string;
    setPaymentMethod: (method: string) => void;

    // Discount
    discountType: 'fixed' | 'percent';
    setDiscountType: (type: 'fixed' | 'percent') => void;
    discountValue: number;
    setDiscountValue: (val: number) => void;
    calculatedDiscount: number;

    // Advance
    advancePaid: number;
    setAdvancePaid: (val: number) => void;
    transactionId: string;
    setTransactionId: (val: string) => void;
    shippingFee: number;

    // Notes
    customerNotes: string;
    setCustomerNotes: (val: string) => void;
    internalNotes: string;
    setInternalNotes: (val: string) => void;
}

export default function EcommercePaymentSection({
    sources,
    selectedSourceId,
    setSelectedSourceId,
    paymentMethod,
    setPaymentMethod,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue,
    calculatedDiscount,
    advancePaid,
    setAdvancePaid,
    transactionId,
    setTransactionId,
    shippingFee,
    customerNotes,
    setCustomerNotes,
    internalNotes,
    setInternalNotes,
}: EcommercePaymentSectionProps) {
    const { t, i18n } = useTranslation();
    const isBn = i18n.language === 'bn';
    const { formatCurrency } = useCurrency();

    const paymentMethods = [
        { id: 'Cash on Delivery', label: 'Cash on Delivery (COD)', icon: DollarSign },
        { id: 'bKash', label: 'bKash', icon: Smartphone },
        { id: 'Nagad', label: 'Nagad', icon: Smartphone },
        { id: 'Card', label: 'POS Card / Pay', icon: CreditCard },
    ];

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <CreditCard className="h-4 w-4" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-slate-900">
                        {t('ecomm_payment_section_title')}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                        {t('ecomm_order_source_label')}
                    </p>
                </div>
            </div>

            {/* Order Source Channel Selection */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-primary" />
                            <span>{t('ecomm_order_source_label')}</span>
                            <span className="text-rose-500">*</span>
                        </label>
                        <p className="text-[11px] text-slate-500">
                            {t('ecomm_order_source_label')}
                        </p>
                    </div>

                    <div className="min-w-[220px]">
                        <select
                            value={selectedSourceId}
                            onChange={(e) => setSelectedSourceId(e.target.value)}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 shadow-2xs focus:border-primary focus:outline-none"
                        >
                            {sources.map((src: any) => (
                                <option key={src.id} value={src.id}>
                                    {src.source_name || src.name || 'Channel'} {src.handle ? `(@${src.handle})` : ''}
                                </option>
                            ))}
                            {sources.length === 0 && <option value="">Default Web Store</option>}
                        </select>
                    </div>
                </div>
            </div>

            {/* Payment Method Pills */}
            <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    {t('ecomm_payment_method_label')}
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {paymentMethods.map((m) => {
                        const isSelected = paymentMethod === m.id;
                        const Icon = m.icon;
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setPaymentMethod(m.id)}
                                className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-bold transition ${
                                    isSelected
                                        ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs'
                                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                                }`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="truncate">{m.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Discounts & Advance Paid Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100">
                {/* Discount Card */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5 text-primary" />
                            {t('ecomm_payment_discount_label')}
                        </label>
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white shadow-2xs">
                            <button
                                type="button"
                                onClick={() => setDiscountType('fixed')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                    discountType === 'fixed' ? 'bg-primary text-white' : 'text-slate-600'
                                }`}
                            >
                                {t('ecomm_payment_discount_fixed')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setDiscountType('percent')}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                    discountType === 'percent' ? 'bg-primary text-white' : 'text-slate-600'
                                }`}
                            >
                                {t('ecomm_payment_discount_percent')}
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            {discountType === 'fixed' ? '৳' : '%'}
                        </span>
                        <input
                            type="number"
                            min="0"
                            value={discountValue === 0 ? '' : discountValue}
                            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs font-bold text-slate-900 focus:border-primary focus:outline-none"
                        />
                    </div>
                    {calculatedDiscount > 0 && (
                        <p className="mt-1 text-[11px] text-emerald-600 font-bold">
                            {`${t('ecomm_invoice_discount')}: -${formatCurrency(calculatedDiscount)}`}
                        </p>
                    )}
                </div>

                {/* Advance Payment Card */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            {t('ecomm_payment_advance_label')}
                        </label>
                        {shippingFee > 0 && (
                            <button
                                type="button"
                                onClick={() => setAdvancePaid(shippingFee)}
                                className="text-[10px] font-bold text-primary hover:underline"
                            >
                                {`${t('ecomm_invoice_shipping')} (${formatCurrency(shippingFee)})`}
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">৳</span>
                        <input
                            type="number"
                            min="0"
                            value={advancePaid === 0 ? '' : advancePaid}
                            onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs font-bold text-slate-900 focus:border-primary focus:outline-none"
                        />
                    </div>
                    {advancePaid > 0 && (
                        <div className="mt-2">
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder={t('ecomm_payment_transaction_id')}
                                className="h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-800 focus:border-primary focus:outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Notes Row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100">
                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {t('ecomm_payment_notes_customer')}
                    </label>
                    <textarea
                        rows={2}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder={t('ecomm_payment_notes_customer')}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                        {t('ecomm_payment_notes_internal')}
                    </label>
                    <textarea
                        rows={2}
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder={t('ecomm_payment_notes_internal')}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
}
