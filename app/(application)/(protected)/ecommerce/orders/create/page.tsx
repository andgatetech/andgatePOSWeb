'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showErrorDialog, showSuccessDialog, showToast } from '@/lib/toast';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useCurrency } from '@/hooks/useCurrency';
import {
    useCreateOnlineOrderMutation,
    useGetOnlineOrderSourcesQuery,
    useGetPathaoCitiesQuery,
    useGetPathaoZonesQuery,
    useGetPathaoAreasQuery,
} from '@/store/features/ecommerce/ecommerceManagementApi';
import {
    ArrowLeft,
    ArrowRight,
    ShoppingCart,
    Truck,
    CreditCard,
    ClipboardCheck,
    CheckCircle2,
    Loader2,
    Sparkles,
} from 'lucide-react';

import type { CartItem } from './types';
import EcommerceProductCatalog from './components/EcommerceProductCatalog';
import EcommerceOrderItemsSection from './components/EcommerceOrderItemsSection';
import EcommerceDeliverySection, { DELIVERY_PRESETS } from './components/EcommerceDeliverySection';
import EcommercePaymentSection from './components/EcommercePaymentSection';
import EcommerceInvoiceSummary from './components/EcommerceInvoiceSummary';

// ─── Mobile Step definitions ──────────────────────────────────────────────────
const STEPS = [
    {
        id: 1,
        key: 'products',
        label: 'Products',
        labelBn: 'পণ্য',
        description: 'Add items',
        descriptionBn: 'পণ্য যোগ',
        icon: ShoppingCart,
    },
    {
        id: 2,
        key: 'delivery',
        label: 'Delivery',
        labelBn: 'ডেলিভারি',
        description: 'Customer & address',
        descriptionBn: 'গ্রাহক ও ঠিকানা',
        icon: Truck,
    },
    {
        id: 3,
        key: 'payment',
        label: 'Payment',
        labelBn: 'পেমেন্ট',
        description: 'Method & discount',
        descriptionBn: 'পেমেন্ট',
        icon: CreditCard,
    },
    {
        id: 4,
        key: 'review',
        label: 'Review',
        labelBn: 'পর্যালোচনা',
        description: 'Confirm & submit',
        descriptionBn: 'নিশ্চিত করুন',
        icon: ClipboardCheck,
    },
] as const;

// ─── Mobile Step Progress Bar (hidden on lg+) ─────────────────────────────────
function MobileStepBar({
    currentStep,
    isBn,
}: {
    currentStep: number;
    isBn: boolean;
}) {
    return (
        <div className="lg:hidden w-full bg-white border-b border-slate-100 px-3 py-2.5">
            <div className="flex items-center justify-between">
                {STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;
                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                        isCompleted
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : isActive
                                            ? 'bg-primary border-primary text-white scale-110 shadow-md shadow-primary/25'
                                            : 'bg-slate-100 border-slate-200 text-slate-400'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <Icon className="h-3.5 w-3.5" />
                                    )}
                                </div>
                                <p
                                    className={`text-[9px] font-bold leading-tight text-center ${
                                        isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                                    }`}
                                >
                                    {isBn ? step.labelBn : step.label}
                                </p>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-1 mb-4 transition-all duration-500 ${
                                        currentStep > step.id ? 'bg-emerald-400' : 'bg-slate-200'
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CreateEcommerceOrderPage() {
    const router = useRouter();
    const { isBn } = useTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId } = useCurrentStore();

    // ── Mobile wizard step (1-4) ─────────────────────────────────────────────
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

    // ── Order State ──────────────────────────────────────────────────────────
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');

    // Delivery Location
    const [selectedDistrictId, setSelectedDistrictId] = useState<string | number>('1');
    const [selectedDistrictName, setSelectedDistrictName] = useState('Dhaka');
    const [selectedZoneId, setSelectedZoneId] = useState<string | number>('');
    const [selectedZoneName, setSelectedZoneName] = useState('');
    const [selectedAreaId, setSelectedAreaId] = useState<string | number>('');
    const [selectedAreaName, setSelectedAreaName] = useState('');
    const [addressLine, setAddressLine] = useState('');

    // Shipping & Presets
    const [shippingFee, setShippingFee] = useState<number>(60);
    const [selectedDeliveryPreset, setSelectedDeliveryPreset] = useState<string>('inside_dhaka');
    const [isCustomShipping, setIsCustomShipping] = useState<boolean>(false);
    const [customShippingFeeInput, setCustomShippingFeeInput] = useState<string>('60');

    // Payment & Source
    const [selectedSourceId, setSelectedSourceId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('Cash on Delivery');
    const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [advancePaid, setAdvancePaid] = useState<number>(0);
    const [transactionId, setTransactionId] = useState<string>('');

    // Notes
    const [customerNotes, setCustomerNotes] = useState<string>('');
    const [internalNotes, setInternalNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [selectedCustomerId, setSelectedCustomerId] = useState<number | string | null>(null);

    // ── API Queries ──────────────────────────────────────────────────────────
    const { data: pathaoCitiesData, isLoading: isLoadingCities } = useGetPathaoCitiesQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );
    const cities = useMemo(() => {
        const d = pathaoCitiesData as any;
        const list = d?.data?.data || d?.data || d?.items || [];
        return Array.isArray(list) ? list : [];
    }, [pathaoCitiesData]);

    const { data: pathaoZonesData, isLoading: isLoadingZones } = useGetPathaoZonesQuery(
        { cityId: selectedDistrictId, store_id: currentStoreId },
        { skip: !currentStoreId || !selectedDistrictId }
    );
    const zones = useMemo(() => {
        const d = pathaoZonesData as any;
        const list = d?.data?.data || d?.data || d?.items || [];
        return Array.isArray(list) ? list : [];
    }, [pathaoZonesData]);

    const { data: pathaoAreasData, isLoading: isLoadingAreas } = useGetPathaoAreasQuery(
        { zoneId: selectedZoneId, store_id: currentStoreId },
        { skip: !currentStoreId || !selectedZoneId }
    );
    const areas = useMemo(() => {
        const d = pathaoAreasData as any;
        const list = d?.data?.data || d?.data || d?.items || [];
        return Array.isArray(list) ? list : [];
    }, [pathaoAreasData]);

    useEffect(() => {
        if (cities.length > 0 && selectedDistrictId) {
            const match = cities.find((c: any) => String(c.city_id || c.id) === String(selectedDistrictId));
            if (match) setSelectedDistrictName(match.city_name || match.name);
        }
    }, [cities, selectedDistrictId]);

    useEffect(() => {
        if (zones.length > 0 && selectedZoneId) {
            const match = zones.find((z: any) => String(z.zone_id || z.id) === String(selectedZoneId));
            if (match) setSelectedZoneName(match.zone_name || match.name);
        } else if (!selectedZoneId) {
            setSelectedZoneName('');
        }
    }, [zones, selectedZoneId]);

    useEffect(() => {
        if (areas.length > 0 && selectedAreaId) {
            const match = areas.find((a: any) => String(a.area_id || a.id) === String(selectedAreaId));
            if (match) setSelectedAreaName(match.area_name || match.name);
        } else if (!selectedAreaId) {
            setSelectedAreaName('');
        }
    }, [areas, selectedAreaId]);

    const { data: sourcesData } = useGetOnlineOrderSourcesQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );
    const sources = useMemo(() => {
        const d = sourcesData as any;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    }, [sourcesData]);

    useEffect(() => {
        if (!selectedSourceId && sources.length > 0) {
            setSelectedSourceId(String(sources[0].id));
        }
    }, [sources, selectedSourceId]);

    const [createOnlineOrder] = useCreateOnlineOrderMutation();

    // ── Financial Calculations ────────────────────────────────────────────────
    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0),
        [cart]
    );
    const calculatedDiscount = useMemo(() => {
        if (discountType === 'percent') {
            return (subtotal * Math.min(100, Math.max(0, discountValue))) / 100;
        }
        return Math.min(subtotal, Math.max(0, discountValue));
    }, [subtotal, discountType, discountValue]);
    const netItemTotal = Math.max(0, subtotal - calculatedDiscount);
    const orderTotal = netItemTotal + Number(shippingFee || 0);
    const codAmountToCollect = Math.max(0, orderTotal - Number(advancePaid || 0));

    // ── Cart Handlers ─────────────────────────────────────────────────────────
    const handleAddToCart = (newItem: CartItem) => {
        setCart((prev) => {
            const existingIndex = prev.findIndex((item) => item.stock_id === newItem.stock_id);
            if (existingIndex > -1) {
                return prev.map((item, idx) =>
                    idx === existingIndex ? { ...item, quantity: item.quantity + (newItem.quantity || 1) } : item
                );
            }
            return [...prev, newItem];
        });
        showToast(
            isBn ? `"${newItem.product_name}" অর্ডারে যুক্ত হয়েছে` : `Added "${newItem.product_name}" to order`,
            'success'
        );
    };

    const handleUpdateQuantity = (stockId: number, newQty: number) => {
        if (newQty < 1) return;
        setCart((prev) => prev.map((item) => (item.stock_id === stockId ? { ...item, quantity: newQty } : item)));
    };

    const handleUpdatePrice = (stockId: number, newPrice: number) => {
        if (isNaN(newPrice) || newPrice < 0) return;
        setCart((prev) => prev.map((item) => (item.stock_id === stockId ? { ...item, price: newPrice } : item)));
    };

    const handleRemoveItem = (stockId: number) => {
        setCart((prev) => prev.filter((item) => item.stock_id !== stockId));
    };

    const handleClearCart = () => {
        if (cart.length === 0) return;
        if (window.confirm(isBn ? 'আপনি কি নিশ্চিত যে কার্টের সব পণ্য মুছতে চান?' : 'Clear all items from this order?')) {
            setCart([]);
        }
    };

    // ── Mobile Step Navigation ────────────────────────────────────────────────
    const handleNext = () => {
        if (currentStep === 1 && cart.length === 0) {
            showErrorDialog(
                isBn ? 'অনুগ্রহ করে অন্তত একটি পণ্য যোগ করুন।' : 'Please add at least one product to the order.'
            );
            return;
        }
        if (currentStep === 2) {
            if (!customerName.trim() || !customerPhone.trim()) {
                showErrorDialog(
                    isBn ? 'গ্রাহকের নাম ও মোবাইল নম্বর দেওয়া বাধ্যতামূলক।' : 'Customer Name and Phone are required.'
                );
                return;
            }
            if (!addressLine.trim() && selectedDeliveryPreset !== 'store_pickup') {
                showErrorDialog(
                    isBn ? 'অনুগ্রহ করে বিস্তারিত ঠিকানা পূরণ করুন।' : 'Address Line is required for delivery.'
                );
                return;
            }
        }
        if (currentStep < 4) {
            setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmitOrder = async () => {
        if (cart.length === 0) {
            showErrorDialog(
                isBn ? 'অনুগ্রহ করে অন্তত একটি পণ্য অর্ডারে যোগ করুন।' : 'Please add at least one item to the order.'
            );
            return;
        }
        if (!customerName.trim() || !customerPhone.trim()) {
            showErrorDialog(
                isBn ? 'গ্রাহকের নাম ও মোবাইল নম্বর দেওয়া বাধ্যতামূলক।' : 'Customer Name and Mobile Phone are required.'
            );
            return;
        }
        if (!selectedDistrictName && selectedDeliveryPreset !== 'store_pickup') {
            showErrorDialog(
                isBn ? 'অনুগ্রহ করে জেলা (District) নির্বাচন করুন।' : 'Please select a District for delivery.'
            );
            return;
        }
        if (!addressLine.trim() && selectedDeliveryPreset !== 'store_pickup') {
            showErrorDialog(
                isBn ? 'অনুগ্রহ করে বিস্তারিত ঠিকানা পূরণ করুন।' : 'Address Line is required.'
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                store_id: currentStoreId,
                customer: {
                    name: customerName.trim(),
                    phone: customerPhone.trim(),
                    email: customerEmail.trim() || undefined,
                },
                shipping_address: {
                    name: customerName.trim(),
                    phone: customerPhone.trim(),
                    email: customerEmail.trim() || undefined,
                    address_line: addressLine.trim() || 'Store Pickup',
                    address_line_1: addressLine.trim() || 'Store Pickup',
                    city: selectedDistrictName || 'Dhaka',
                    district: selectedDistrictName || 'Dhaka',
                    city_id: selectedDistrictId ? Number(selectedDistrictId) : undefined,
                    zone: selectedZoneName || undefined,
                    zone_id: selectedZoneId ? Number(selectedZoneId) : undefined,
                    area: selectedAreaName || undefined,
                    area_id: selectedAreaId ? Number(selectedAreaId) : undefined,
                },
                items: cart.map((item) => ({
                    stock_id: item.stock_id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit: item.unit || 'Pcs',
                    price: item.price,
                })),
                payment_method: paymentMethod,
                source_id: selectedSourceId ? parseInt(selectedSourceId, 10) : undefined,
                shipping_fee: Number(shippingFee || 0),
                discount: Number(calculatedDiscount || 0),
                advance_paid: Number(advancePaid || 0),
                transaction_id: transactionId || undefined,
                notes: customerNotes.trim() || undefined,
                internal_notes: internalNotes.trim() || undefined,
            };

            await createOnlineOrder(payload).unwrap();
            await showSuccessDialog(
                isBn ? 'ই-কমার্স অর্ডার সফলভাবে তৈরি হয়েছে!' : 'eCommerce Order Created Successfully!'
            );
            router.push('/ecommerce/orders');
        } catch (err: any) {
            const errorMsg =
                err?.data?.message ||
                (typeof err?.data?.errors === 'object' ? Object.values(err.data.errors).flat().join(', ') : null) ||
                (isBn ? 'অর্ডার তৈরি করতে সমস্যা হয়েছে।' : 'Failed to create order. Please try again.');
            showErrorDialog(isBn ? 'ত্রুটি' : 'Error', errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedSource = sources.find((s: any) => String(s.id) === String(selectedSourceId));
    const selectedPresetObj = DELIVERY_PRESETS.find((p) => p.id === selectedDeliveryPreset);
    const selectedPresetLabel = isCustomShipping
        ? isBn ? 'কাস্টম চার্জ' : 'Custom Fee'
        : selectedPresetObj
        ? isBn ? selectedPresetObj.labelBn : selectedPresetObj.label
        : undefined;

    // Shared sub-components props (used by both mobile & desktop)
    const deliverySectionProps = {
        customerName, setCustomerName,
        customerPhone, setCustomerPhone,
        customerEmail, setCustomerEmail,
        selectedCustomerId, setSelectedCustomerId,
        selectedDistrictId, setSelectedDistrictId,
        selectedZoneId, setSelectedZoneId,
        selectedAreaId, setSelectedAreaId,
        addressLine, setAddressLine,
        cities, isCitiesLoading: isLoadingCities,
        zones, isZonesLoading: isLoadingZones,
        areas, isAreasLoading: isLoadingAreas,
        shippingFee, setShippingFee,
        selectedDeliveryPreset, setSelectedDeliveryPreset,
        isCustomShipping, setIsCustomShipping,
        customShippingFeeInput, setCustomShippingFeeInput,
        storeId: currentStoreId,
    };

    const paymentSectionProps = {
        sources,
        selectedSourceId,
        setSelectedSourceId: (id: string | number) => setSelectedSourceId(String(id)),
        paymentMethod, setPaymentMethod,
        discountType, setDiscountType,
        discountValue, setDiscountValue,
        calculatedDiscount,
        advancePaid, setAdvancePaid,
        transactionId, setTransactionId,
        shippingFee,
        customerNotes, setCustomerNotes,
        internalNotes, setInternalNotes,
    };

    const invoiceSummaryProps = {
        cart, subtotal, calculatedDiscount, shippingFee,
        orderTotal, advancePaid, codAmountToCollect,
        paymentMethod,
        selectedSourceName: selectedSource?.source_name || selectedSource?.name,
        selectedDeliveryPresetLabel: selectedPresetLabel,
        customerName, customerPhone,
        selectedDistrictName, selectedZoneName, selectedAreaName, addressLine,
        isSubmitting,
        onSubmitOrder: handleSubmitOrder,
    };

    const currentStepDef = STEPS.find((s) => s.id === currentStep)!;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 -mx-3 sm:-mx-4 lg:-mx-6">

            {/* ══════════════════════════════════════════════════════════════
                SHARED STICKY HEADER
                - Mobile: shows current step info
                - Desktop: shows original title + cart pill
            ══════════════════════════════════════════════════════════════ */}
            <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
                <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    {/* Left: Back Link & Page Title */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/ecommerce/orders"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                            title={isBn ? 'অর্ডার তালিকায় ফিরে যান' : 'Back to orders'}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            {/* Mobile: show step info */}
                            <div className="lg:hidden flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                    {isBn ? 'ই-কমার্স অর্ডার' : 'eCommerce Order'}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                    {isBn ? `ধাপ ${currentStep}/${STEPS.length}` : `Step ${currentStep}/${STEPS.length}`}
                                </span>
                            </div>
                            {/* Desktop: show original badge */}
                            <div className="hidden lg:flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                    {isBn ? 'ই-কমার্স চেকআউট টার্মিনাল' : 'eCommerce Checkout'}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                    <Sparkles className="h-3 w-3 text-emerald-500" />
                                    {isBn ? 'ম্যানুয়াল অনলাইন অর্ডার' : 'Manual Online Order'}
                                </span>
                            </div>
                            {/* Mobile: step label */}
                            <h1 className="lg:hidden text-sm font-black tracking-tight text-slate-900">
                                {isBn ? currentStepDef.labelBn : currentStepDef.label}
                                <span className="text-slate-400 font-normal ml-1 text-xs">
                                    — {isBn ? currentStepDef.descriptionBn : currentStepDef.description}
                                </span>
                            </h1>
                            {/* Desktop: original title */}
                            <h1 className="hidden lg:block text-base sm:text-lg font-black tracking-tight text-slate-900">
                                {isBn ? 'নতুন অনলাইন অর্ডার তৈরি করুন' : 'Create New Online Order'}
                            </h1>
                        </div>
                    </div>

                    {/* Cart Status Pill */}
                    <div className="flex items-center gap-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700">
                            <span className="text-slate-400 font-normal">{isBn ? 'কার্ট:' : 'Cart:'} </span>
                            <span className="text-primary font-black">{formatNumber(cart.length)}</span>{' '}
                            {isBn ? 'আইটেম' : 'Items'} (
                            <span className="text-slate-900">{formatCurrency(subtotal)}</span>)
                        </div>
                    </div>
                </div>

                {/* Mobile step progress bar (hidden on lg+) */}
                <MobileStepBar currentStep={currentStep} isBn={isBn} />
            </div>

            {/* ══════════════════════════════════════════════════════════════
                DESKTOP LAYOUT (lg+) — original full two-column layout
            ══════════════════════════════════════════════════════════════ */}
            <div className="hidden lg:block w-full px-4 py-5 lg:px-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left & Center Main Flow */}
                    <div className="space-y-6 lg:col-span-9">
                        <EcommerceProductCatalog onAddToCart={handleAddToCart} cart={cart} />
                        <EcommerceOrderItemsSection
                            cart={cart}
                            onUpdateQuantity={handleUpdateQuantity}
                            onUpdatePrice={handleUpdatePrice}
                            onRemoveItem={handleRemoveItem}
                            onClearCart={handleClearCart}
                        />
                        <EcommerceDeliverySection {...deliverySectionProps} />
                        <EcommercePaymentSection {...paymentSectionProps} />
                    </div>

                    {/* Right Column: Sticky Live Checkout Invoice */}
                    <div className="lg:col-span-3">
                        <EcommerceInvoiceSummary {...invoiceSummaryProps} />
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                MOBILE LAYOUT (below lg) — 4-step wizard
                Extra bottom padding to clear the fixed nav bar
            ══════════════════════════════════════════════════════════════ */}
            <div className="lg:hidden w-full px-3 py-4 sm:px-4 pb-36">

                {/* Step 1 — Products & Cart */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <EcommerceProductCatalog onAddToCart={handleAddToCart} cart={cart} />
                        <EcommerceOrderItemsSection
                            cart={cart}
                            onUpdateQuantity={handleUpdateQuantity}
                            onUpdatePrice={handleUpdatePrice}
                            onRemoveItem={handleRemoveItem}
                            onClearCart={handleClearCart}
                        />
                    </div>
                )}

                {/* Step 2 — Delivery & Customer */}
                {currentStep === 2 && (
                    <EcommerceDeliverySection {...deliverySectionProps} />
                )}

                {/* Step 3 — Payment & Source */}
                {currentStep === 3 && (
                    <EcommercePaymentSection {...paymentSectionProps} />
                )}

                {/* Step 4 — Review & Submit */}
                {currentStep === 4 && (
                    <EcommerceInvoiceSummary {...invoiceSummaryProps} />
                )}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                MOBILE ONLY — Sticky Bottom Navigation Bar
                Hidden on lg+ (desktop has its own submit button in the invoice)
            ══════════════════════════════════════════════════════════════ */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3">
                <div className="flex items-center gap-3 max-w-2xl mx-auto">
                    {/* Back / Cancel */}
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {isBn ? 'পিছনে' : 'Back'}
                        </button>
                    ) : (
                        <Link
                            href="/ecommerce/orders"
                            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {isBn ? 'বাতিল' : 'Cancel'}
                        </Link>
                    )}

                    {/* Next Step / Confirm Order */}
                    {currentStep < 4 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#034d79] text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:opacity-95 cursor-pointer"
                        >
                            {isBn ? 'পরবর্তী ধাপ' : 'Next Step'}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmitOrder}
                            disabled={isSubmitting || cart.length === 0}
                            className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-md shadow-emerald-200 transition hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {isBn ? 'অর্ডার তৈরি হচ্ছে...' : 'Placing Order...'}
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    {isBn ? 'অর্ডার কনফার্ম করুন' : 'Confirm & Place Order'}
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1.5 mt-2">
                    {STEPS.map((step) => (
                        <div
                            key={step.id}
                            className={`rounded-full transition-all duration-300 ${
                                step.id === currentStep
                                    ? 'w-6 h-1.5 bg-primary'
                                    : step.id < currentStep
                                    ? 'w-1.5 h-1.5 bg-emerald-400'
                                    : 'w-1.5 h-1.5 bg-slate-200'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
