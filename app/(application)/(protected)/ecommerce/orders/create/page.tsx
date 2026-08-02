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
import { useGetStoreCustomersQuery } from '@/store/features/customer/customer';
import { ArrowLeft, Sparkles, ShoppingBag } from 'lucide-react';

import type { CartItem } from './types';
import EcommerceProductCatalog from './components/EcommerceProductCatalog';
import EcommerceOrderItemsSection from './components/EcommerceOrderItemsSection';
import EcommerceDeliverySection, { DELIVERY_PRESETS } from './components/EcommerceDeliverySection';
import EcommercePaymentSection from './components/EcommercePaymentSection';
import EcommerceInvoiceSummary from './components/EcommerceInvoiceSummary';

export default function CreateEcommerceOrderPage() {
    const router = useRouter();
    const { isBn } = useTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId } = useCurrentStore();

    // -------------------------------------------------------------
    // Order State
    // -------------------------------------------------------------
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');

    // Delivery Location State
    const [selectedDistrictId, setSelectedDistrictId] = useState<string | number>('1'); // Default Dhaka
    const [selectedDistrictName, setSelectedDistrictName] = useState('Dhaka');
    const [selectedZoneId, setSelectedZoneId] = useState<string | number>('');
    const [selectedZoneName, setSelectedZoneName] = useState('');
    const [selectedAreaId, setSelectedAreaId] = useState<string | number>('');
    const [selectedAreaName, setSelectedAreaName] = useState('');
    const [addressLine, setAddressLine] = useState('');

    // Shipping & Presets State
    const [shippingFee, setShippingFee] = useState<number>(60);
    const [selectedDeliveryPreset, setSelectedDeliveryPreset] = useState<string>('inside_dhaka');
    const [isCustomShipping, setIsCustomShipping] = useState<boolean>(false);
    const [customShippingFeeInput, setCustomShippingFeeInput] = useState<string>('60');

    // Payment & Source State
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

    // -------------------------------------------------------------
    // API Queries
    // -------------------------------------------------------------
    // Pathao Cities / BD Districts
    const { data: pathaoCitiesData, isLoading: isLoadingCities } = useGetPathaoCitiesQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );

    const cities = useMemo(() => {
        const d = pathaoCitiesData as any;
        const list = d?.data?.data || d?.data || d?.items || [];
        return Array.isArray(list) ? list : [];
    }, [pathaoCitiesData]);

    // Pathao Zones (When District is chosen)
    const { data: pathaoZonesData, isLoading: isLoadingZones } = useGetPathaoZonesQuery(
        { cityId: selectedDistrictId, store_id: currentStoreId },
        { skip: !currentStoreId || !selectedDistrictId }
    );

    const zones = useMemo(() => {
        const d = pathaoZonesData as any;
        const list = d?.data?.data || d?.data || d?.items || [];
        return Array.isArray(list) ? list : [];
    }, [pathaoZonesData]);

    // Pathao Areas (When Zone is chosen)
    const { data: pathaoAreasData, isLoading: isLoadingAreas } = useGetPathaoAreasQuery(
        { zoneId: selectedZoneId, store_id: currentStoreId },
        { skip: !currentStoreId || !selectedZoneId }
    );

    const areas = useMemo(() => {
        const d = pathaoAreasData as any;
        const list = d?.data?.data || d?.data || d?.items || [];
        return Array.isArray(list) ? list : [];
    }, [pathaoAreasData]);

    // Keep District Name synced
    useEffect(() => {
        if (cities.length > 0 && selectedDistrictId) {
            const match = cities.find((c: any) => String(c.city_id || c.id) === String(selectedDistrictId));
            if (match) setSelectedDistrictName(match.city_name || match.name);
        }
    }, [cities, selectedDistrictId]);

    // Keep Zone Name synced
    useEffect(() => {
        if (zones.length > 0 && selectedZoneId) {
            const match = zones.find((z: any) => String(z.zone_id || z.id) === String(selectedZoneId));
            if (match) setSelectedZoneName(match.zone_name || match.name);
        } else if (!selectedZoneId) {
            setSelectedZoneName('');
        }
    }, [zones, selectedZoneId]);

    // Keep Area Name synced
    useEffect(() => {
        if (areas.length > 0 && selectedAreaId) {
            const match = areas.find((a: any) => String(a.area_id || a.id) === String(selectedAreaId));
            if (match) setSelectedAreaName(match.area_name || match.name);
        } else if (!selectedAreaId) {
            setSelectedAreaName('');
        }
    }, [areas, selectedAreaId]);

    // Order Sources Query
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

    // Auto-select first source
    useEffect(() => {
        if (!selectedSourceId && sources.length > 0) {
            setSelectedSourceId(String(sources[0].id));
        }
    }, [sources, selectedSourceId]);

    // Existing customers for auto-lookup
    const { data: customersData } = useGetStoreCustomersQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );

    const existingCustomers = useMemo(() => {
        const d = customersData as any;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.data?.items)) return d.data.items;
        return [];
    }, [customersData]);

    // Create Order Mutation
    const [createOnlineOrder] = useCreateOnlineOrderMutation();

    // -------------------------------------------------------------
    // Financial Calculations
    // -------------------------------------------------------------
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
    }, [cart]);

    const calculatedDiscount = useMemo(() => {
        if (discountType === 'percent') {
            return (subtotal * Math.min(100, Math.max(0, discountValue))) / 100;
        }
        return Math.min(subtotal, Math.max(0, discountValue));
    }, [subtotal, discountType, discountValue]);

    const netItemTotal = Math.max(0, subtotal - calculatedDiscount);
    const orderTotal = netItemTotal + Number(shippingFee || 0);
    const codAmountToCollect = Math.max(0, orderTotal - Number(advancePaid || 0));

    // -------------------------------------------------------------
    // Cart Handlers
    // -------------------------------------------------------------
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
            isBn ? `"${newItem.product_name}" অর্ডারে যুক্ত হয়েছে` : `Added "${newItem.product_name}" to order`,
            'success'
        );
    };

    const handleUpdateQuantity = (stockId: number, newQty: number) => {
        if (newQty < 1) return;
        setCart((prev) =>
            prev.map((item) => (item.stock_id === stockId ? { ...item, quantity: newQty } : item))
        );
    };

    const handleUpdatePrice = (stockId: number, newPrice: number) => {
        if (isNaN(newPrice) || newPrice < 0) return;
        setCart((prev) =>
            prev.map((item) => (item.stock_id === stockId ? { ...item, price: newPrice } : item))
        );
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

    // -------------------------------------------------------------
    // Submit Order Handler
    // -------------------------------------------------------------
    const handleSubmitOrder = async () => {
        if (cart.length === 0) {
            showErrorDialog(isBn ? 'অনুগ্রহ করে অন্তত একটি পণ্য অর্ডারে যোগ করুন।' : 'Please add at least one item to the order.');
            return;
        }

        if (!customerName.trim() || !customerPhone.trim()) {
            showErrorDialog(isBn ? 'গ্রাহকের নাম ও মোবাইল নম্বর দেওয়া বাধ্যতামূলক।' : 'Customer Name and Mobile Phone are required.');
            return;
        }

        if (!selectedDistrictName && selectedDeliveryPreset !== 'store_pickup') {
            showErrorDialog(isBn ? 'অনুগ্রহ করে জেলা (District) নির্বাচন করুন।' : 'Please select a District for delivery.');
            return;
        }

        if (!addressLine.trim() && selectedDeliveryPreset !== 'store_pickup') {
            showErrorDialog(isBn ? 'অনুগ্রহ করে বিস্তারিত ঠিকানা (Address Line) পূরণ করুন।' : 'Address Line is required.');
            return;
        }

        if (!selectedSourceId && sources.length > 0) {
            showErrorDialog(isBn ? 'অনুগ্রহ করে অর্ডারের উৎস (Order Source) নির্বাচন করুন।' : 'Please select an Order Source.');
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
                isBn ? 'ই-কমার্স অর্ডার সফলভাবে তৈরি হয়েছে!' : 'eCommerce Order Created Successfully!'
            );
            router.push('/ecommerce/orders');
        } catch (err: any) {
            const errorMsg =
                err?.data?.message ||
                (typeof err?.data?.errors === 'object' ? Object.values(err.data.errors).flat().join(', ') : null) ||
                (isBn ? 'অর্ডার তৈরি করতে সমস্যা হয়েছে।' : 'Failed to create order. Please try again.');
            showErrorDialog(isBn ? 'ত্রুটি' : 'Error', errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedSource = sources.find((s: any) => String(s.id) === String(selectedSourceId));
    const selectedPresetObj = DELIVERY_PRESETS.find((p) => p.id === selectedDeliveryPreset);
    const selectedPresetLabel = isCustomShipping
        ? (isBn ? 'কাস্টম চার্জ' : 'Custom Fee')
        : selectedPresetObj
        ? (isBn ? selectedPresetObj.labelBn : selectedPresetObj.label)
        : undefined;

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-28">
            {/* Top Navigation / Sticky Header */}
            <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
                <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
                    {/* Left: Back Link & Page Title */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/ecommerce/orders"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                            title={isBn ? 'অর্ডার তালিকায় ফিরে যান' : 'Back to orders'}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                    {isBn ? 'ই-কমার্স চেকআউট টার্মিনাল' : 'eCommerce Checkout'}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                    <Sparkles className="h-3 w-3 text-emerald-500" />
                                    {isBn ? 'ম্যানুয়াল অনলাইন অর্ডার' : 'Manual Online Order'}
                                </span>
                            </div>
                            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                                {isBn ? 'নতুন অনলাইন অর্ডার তৈরি করুন' : 'Create New Online Order'}
                            </h1>
                        </div>
                    </div>

                    {/* Right: Cart Status Pill */}
                    <div className="flex items-center gap-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700">
                            <span className="text-slate-400 font-normal">{isBn ? 'কার্ট:' : 'Cart:'} </span>
                            <span className="text-primary font-black">{formatNumber(cart.length)}</span> {isBn ? 'আইটেম' : 'Items'} (
                            <span className="text-slate-900">{formatCurrency(subtotal)}</span>)
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="w-full px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12">
                    {/* Left & Center Main Flow (Up & Down sections) */}
                    <div className="space-y-6 lg:col-span-8 xl:col-span-8 2xl:col-span-9">
                        {/* 1. Product Search & Catalog (POS Left-Side Design) */}
                        <EcommerceProductCatalog
                            onAddToCart={handleAddToCart}
                            cart={cart}
                        />

                        {/* 2. Selected Order Items (POS Right-Side Order Details Design) */}
                        <EcommerceOrderItemsSection
                            cart={cart}
                            onUpdateQuantity={handleUpdateQuantity}
                            onUpdatePrice={handleUpdatePrice}
                            onRemoveItem={handleRemoveItem}
                            onClearCart={handleClearCart}
                        />

                        {/* 3. Delivery Address & Customer Information */}
                        <EcommerceDeliverySection
                            customerName={customerName}
                            setCustomerName={setCustomerName}
                            customerPhone={customerPhone}
                            setCustomerPhone={setCustomerPhone}
                            customerEmail={customerEmail}
                            setCustomerEmail={setCustomerEmail}
                            selectedDistrictId={selectedDistrictId}
                            setSelectedDistrictId={setSelectedDistrictId}
                            selectedZoneId={selectedZoneId}
                            setSelectedZoneId={setSelectedZoneId}
                            selectedAreaId={selectedAreaId}
                            setSelectedAreaId={setSelectedAreaId}
                            addressLine={addressLine}
                            setAddressLine={setAddressLine}
                            cities={cities}
                            isCitiesLoading={isLoadingCities}
                            zones={zones}
                            isZonesLoading={isLoadingZones}
                            areas={areas}
                            isAreasLoading={isLoadingAreas}
                            existingCustomers={existingCustomers}
                            shippingFee={shippingFee}
                            setShippingFee={setShippingFee}
                            selectedDeliveryPreset={selectedDeliveryPreset}
                            setSelectedDeliveryPreset={setSelectedDeliveryPreset}
                            isCustomShipping={isCustomShipping}
                            setIsCustomShipping={setIsCustomShipping}
                            customShippingFeeInput={customShippingFeeInput}
                            setCustomShippingFeeInput={setCustomShippingFeeInput}
                        />

                        {/* 4. Order Source & Payment Details */}
                        <EcommercePaymentSection
                            sources={sources}
                            selectedSourceId={selectedSourceId}
                            setSelectedSourceId={(id) => setSelectedSourceId(String(id))}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            discountType={discountType}
                            setDiscountType={setDiscountType}
                            discountValue={discountValue}
                            setDiscountValue={setDiscountValue}
                            calculatedDiscount={calculatedDiscount}
                            advancePaid={advancePaid}
                            setAdvancePaid={setAdvancePaid}
                            transactionId={transactionId}
                            setTransactionId={setTransactionId}
                            shippingFee={shippingFee}
                            customerNotes={customerNotes}
                            setCustomerNotes={setCustomerNotes}
                            internalNotes={internalNotes}
                            setInternalNotes={setInternalNotes}
                        />
                    </div>

                    {/* Right Column: Sticky Live Checkout Invoice */}
                    <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3">
                        <EcommerceInvoiceSummary
                            cart={cart}
                            subtotal={subtotal}
                            calculatedDiscount={calculatedDiscount}
                            shippingFee={shippingFee}
                            orderTotal={orderTotal}
                            advancePaid={advancePaid}
                            codAmountToCollect={codAmountToCollect}
                            paymentMethod={paymentMethod}
                            selectedSourceName={selectedSource?.source_name || selectedSource?.name}
                            selectedDeliveryPresetLabel={selectedPresetLabel}
                            customerName={customerName}
                            customerPhone={customerPhone}
                            selectedDistrictName={selectedDistrictName}
                            selectedZoneName={selectedZoneName}
                            selectedAreaName={selectedAreaName}
                            addressLine={addressLine}
                            isSubmitting={isSubmitting}
                            onSubmitOrder={handleSubmitOrder}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
