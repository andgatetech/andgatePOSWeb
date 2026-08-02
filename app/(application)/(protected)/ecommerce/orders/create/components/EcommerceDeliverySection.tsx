'use client';

import React, { useState } from 'react';
import {
    MapPin,
    User,
    Phone,
    Mail,
    Truck,
    Globe,
    Store as StoreIcon,
    Search,
    Check,
    Navigation,
    Building2,
} from 'lucide-react';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { useCurrency } from '@/hooks/useCurrency';
import type { DeliveryPreset } from '../types';

export const DELIVERY_PRESETS: DeliveryPreset[] = [
    {
        id: 'inside_dhaka',
        label: 'Inside Dhaka',
        labelBn: 'ঢাকার ভিতরে',
        fee: 60,
        icon: Truck,
        badge: '⚡ 24h Express',
    },
    {
        id: 'dhaka_suburbs',
        label: 'Dhaka Suburbs',
        labelBn: 'ঢাকা উপশহর (সাভার/গাজীপুর)',
        fee: 100,
        icon: Truck,
        badge: '🚚 24-48h',
    },
    {
        id: 'outside_dhaka',
        label: 'Outside Dhaka',
        labelBn: 'ঢাকার বাইরে (সারাদেশ)',
        fee: 130,
        icon: Globe,
        badge: '🚛 2-3 Days',
    },
    {
        id: 'store_pickup',
        label: 'Store Pickup',
        labelBn: 'দোকান থেকে সংগ্রহ (ফ্রি)',
        fee: 0,
        icon: StoreIcon,
        badge: '🏬 Free ৳0',
    },
];

export const BD_DISTRICTS_FALLBACK = [
    { city_id: 1, city_name: 'Dhaka' },
    { city_id: 2, city_name: 'Chattogram' },
    { city_id: 3, city_name: 'Gazipur' },
    { city_id: 4, city_name: 'Narayanganj' },
    { city_id: 5, city_name: 'Sylhet' },
    { city_id: 6, city_name: 'Rajshahi' },
    { city_id: 7, city_name: 'Khulna' },
    { city_id: 8, city_name: 'Barishal' },
    { city_id: 9, city_name: 'Rangpur' },
    { city_id: 10, city_name: 'Mymensingh' },
    { city_id: 11, city_name: 'Cumilla' },
    { city_id: 12, city_name: 'Bogura' },
    { city_id: 13, city_name: 'Cox\'s Bazar' },
    { city_id: 14, city_name: 'Feni' },
    { city_id: 15, city_name: 'Brahmanbaria' },
    { city_id: 16, city_name: 'Noakhali' },
    { city_id: 17, city_name: 'Chandpur' },
    { city_id: 18, city_name: 'Jashore' },
    { city_id: 19, city_name: 'Kushtia' },
    { city_id: 20, city_name: 'Pabna' },
    { city_id: 21, city_name: 'Tangail' },
    { city_id: 22, city_name: 'Faridpur' },
    { city_id: 23, city_name: 'Jamalpur' },
    { city_id: 24, city_name: 'Dinajpur' },
];

interface EcommerceDeliverySectionProps {
    customerName: string;
    setCustomerName: (v: string) => void;
    customerPhone: string;
    setCustomerPhone: (v: string) => void;
    customerEmail: string;
    setCustomerEmail: (v: string) => void;

    // Delivery Location
    selectedDistrictId: string | number;
    setSelectedDistrictId: (v: string | number) => void;
    selectedZoneId: string | number;
    setSelectedZoneId: (v: string | number) => void;
    selectedAreaId: string | number;
    setSelectedAreaId: (v: string | number) => void;
    addressLine: string;
    setAddressLine: (v: string) => void;

    // Data lists for cascading
    cities: any[];
    isCitiesLoading: boolean;
    zones: any[];
    isZonesLoading: boolean;
    areas: any[];
    isAreasLoading: boolean;

    // Customers list for auto-lookup
    existingCustomers?: any[];

    // Shipping presets
    shippingFee: number;
    setShippingFee: (fee: number) => void;
    selectedDeliveryPreset: string;
    setSelectedDeliveryPreset: (id: string) => void;
    isCustomShipping: boolean;
    setIsCustomShipping: (custom: boolean) => void;
    customShippingFeeInput: string;
    setCustomShippingFeeInput: (v: string) => void;
}

export default function EcommerceDeliverySection({
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerEmail,
    setCustomerEmail,
    selectedDistrictId,
    setSelectedDistrictId,
    selectedZoneId,
    setSelectedZoneId,
    selectedAreaId,
    setSelectedAreaId,
    addressLine,
    setAddressLine,
    cities,
    isCitiesLoading,
    zones,
    isZonesLoading,
    areas,
    isAreasLoading,
    existingCustomers = [],
    shippingFee,
    setShippingFee,
    selectedDeliveryPreset,
    setSelectedDeliveryPreset,
    isCustomShipping,
    setIsCustomShipping,
    customShippingFeeInput,
    setCustomShippingFeeInput,
}: EcommerceDeliverySectionProps) {
    const { isBn } = useTranslation();
    const { formatCurrency } = useCurrency();
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    // Filter customers for lookup
    const filteredCustomers = existingCustomers.filter((c: any) => {
        const query = customerSearch.toLowerCase().trim();
        if (!query) return false;
        const name = (c.name || c.customer_name || '').toLowerCase();
        const phone = (c.phone || c.phone_number || '').toLowerCase();
        return name.includes(query) || phone.includes(query);
    });

    const handleSelectCustomer = (customer: any) => {
        setCustomerName(customer.name || customer.customer_name || '');
        setCustomerPhone(customer.phone || customer.phone_number || '');
        setCustomerEmail(customer.email || '');
        if (customer.address) setAddressLine(customer.address);
        setCustomerSearch('');
        setShowCustomerDropdown(false);
    };

    const handleSelectPreset = (preset: DeliveryPreset) => {
        setSelectedDeliveryPreset(preset.id);
        setIsCustomShipping(false);
        setShippingFee(preset.fee);
        setCustomShippingFeeInput(preset.fee.toString());
    };

    const handleCustomShippingChange = (val: string) => {
        setCustomShippingFeeInput(val);
        setIsCustomShipping(true);
        const parsed = parseFloat(val);
        setShippingFee(!isNaN(parsed) && parsed >= 0 ? parsed : 0);
    };

    const displayCities = cities && cities.length > 0 ? cities : BD_DISTRICTS_FALLBACK;

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md space-y-4">
            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            {isBn ? '৩. গ্রাহক ও ডেলিভারি ঠিকানা' : '3. Customer & Delivery Address'}
                        </h2>
                        <p className="text-[11px] text-slate-400">
                            {isBn ? 'গ্রাহকের তথ্য এবং কুরিয়ার ডেলিভারি লোকেশন' : 'Recipient details, cascading location & delivery fee'}
                        </p>
                    </div>
                </div>

                {/* Quick Customer Search Autocomplete */}
                <div className="relative min-w-[220px]">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={customerSearch}
                            onChange={(e) => {
                                setCustomerSearch(e.target.value);
                                setShowCustomerDropdown(true);
                            }}
                            onFocus={() => setShowCustomerDropdown(true)}
                            placeholder={isBn ? 'পুরাতন গ্রাহক খুঁজুন...' : 'Search existing customer...'}
                            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-8 pr-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none"
                        />
                    </div>

                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                        <div className="absolute right-0 top-full z-40 mt-1 max-h-48 w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                            {filteredCustomers.slice(0, 5).map((cust: any) => (
                                <button
                                    key={cust.id}
                                    type="button"
                                    onClick={() => handleSelectCustomer(cust)}
                                    className="flex w-full items-start justify-between rounded-lg p-2 text-left hover:bg-primary/5 transition"
                                >
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">{cust.name || cust.customer_name}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">{cust.phone || cust.phone_number}</p>
                                    </div>
                                    <span className="text-[10px] font-semibold text-primary">Select</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Customer Basic Info Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Phone */}
                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-primary" />
                        <span>{isBn ? 'মোবাইল নম্বর' : 'Phone Number'}</span>
                        <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="017xxxxxxxx"
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                {/* Name */}
                <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 flex items-center gap-1">
                        <User className="h-3 w-3 text-primary" />
                        <span>{isBn ? 'গ্রাহকের নাম' : 'Customer Name'}</span>
                        <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={isBn ? 'গ্রাহকের পূর্ণ নাম' : 'Full Name'}
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</span>
                    </label>
                    <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="customer@example.com"
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none"
                    />
                </div>
            </div>

            {/* Cascading Location Hierarchy (District -> Zone -> Area) */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5 text-primary" />
                        {isBn ? 'কুরিয়ার ডেলিভারি লোকেশন (Courier Hierarchy)' : 'Courier Delivery Hierarchy'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                        {isBn ? 'ডেলিভারি দ্রুত করতে সিলেক্ট করুন' : 'District > Zone > Area'}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {/* District / City */}
                    <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600">
                            {isBn ? '১. জেলা / সিটি (District)' : '1. District / City'} <span className="text-rose-500">*</span>
                        </label>
                        <select
                            value={selectedDistrictId}
                            onChange={(e) => {
                                setSelectedDistrictId(e.target.value);
                                setSelectedZoneId('');
                                setSelectedAreaId('');
                            }}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-primary focus:outline-none"
                        >
                            <option value="">{isBn ? '-- জেলা নির্বাচন করুন --' : '-- Select District --'}</option>
                            {displayCities.map((city: any) => (
                                <option key={city.city_id || city.id} value={city.city_id || city.id}>
                                    {city.city_name || city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Zone / Thana */}
                    <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600">
                            {isBn ? '২. জোন / থানা (Zone)' : '2. Zone / Thana'}
                        </label>
                        <select
                            value={selectedZoneId}
                            disabled={!selectedDistrictId || isZonesLoading}
                            onChange={(e) => {
                                setSelectedZoneId(e.target.value);
                                setSelectedAreaId('');
                            }}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-primary focus:outline-none disabled:bg-slate-100 disabled:opacity-60"
                        >
                            <option value="">
                                {isZonesLoading
                                    ? (isBn ? 'লোড হচ্ছে...' : 'Loading Zones...')
                                    : (isBn ? '-- জোন নির্বাচন করুন --' : '-- Select Zone --')}
                            </option>
                            {zones.map((zone: any) => (
                                <option key={zone.zone_id || zone.id} value={zone.zone_id || zone.id}>
                                    {zone.zone_name || zone.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Area */}
                    <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600">
                            {isBn ? '৩. এলাকা (Area / Union)' : '3. Area / Union'}
                        </label>
                        <select
                            value={selectedAreaId}
                            disabled={!selectedZoneId || isAreasLoading}
                            onChange={(e) => setSelectedAreaId(e.target.value)}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 focus:border-primary focus:outline-none disabled:bg-slate-100 disabled:opacity-60"
                        >
                            <option value="">
                                {isAreasLoading
                                    ? (isBn ? 'লোড হচ্ছে...' : 'Loading Areas...')
                                    : (isBn ? '-- এলাকা নির্বাচন করুন --' : '-- Select Area --')}
                            </option>
                            {areas.map((area: any) => (
                                <option key={area.area_id || area.id} value={area.area_id || area.id}>
                                    {area.area_name || area.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Detailed Street Address */}
                <div>
                    <label className="mb-1 block text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        <span>{isBn ? 'বিস্তারিত ঠিকানা (রোড / বাড়ি / ল্যান্ডমার্ক)' : 'Detailed Street Address / Landmark'}</span>
                        <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                        rows={2}
                        required
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder={isBn ? 'উদাঃ বাসা # ১২, রোড # ৪, ব্লক-সি, ধানমন্ডি...' : 'e.g. House #12, Road #4, Block C, Dhanmondi...'}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Delivery Presets & Shipping Rate Selection */}
            <div>
                <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5 text-primary" />
                        <span>{isBn ? 'ডেলিভারি মেথড ও চার্জ' : 'Delivery Method & Shipping Fee'}</span>
                    </label>

                    {/* Custom shipping fee override */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-500">
                            {isBn ? 'কাস্টম চার্জ:' : 'Custom Fee:'}
                        </span>
                        <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">৳</span>
                            <input
                                type="number"
                                min="0"
                                value={customShippingFeeInput}
                                onChange={(e) => handleCustomShippingChange(e.target.value)}
                                className="h-7 w-20 rounded-lg border border-slate-200 bg-white pl-4 pr-2 text-right text-xs font-bold text-slate-900 focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {DELIVERY_PRESETS.map((preset) => {
                        const isSelected = selectedDeliveryPreset === preset.id && !isCustomShipping;
                        const Icon = preset.icon;
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleSelectPreset(preset)}
                                className={`flex flex-col justify-between rounded-xl border p-2.5 text-left transition ${
                                    isSelected
                                        ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20 shadow-xs'
                                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <Icon className="h-3.5 w-3.5" />
                                    <span className="text-[9px] font-bold">{preset.badge}</span>
                                </div>
                                <p className="text-xs font-bold truncate">{isBn ? preset.labelBn : preset.label}</p>
                                <p className="text-xs font-extrabold text-primary mt-0.5">
                                    {formatCurrency(preset.fee)}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
