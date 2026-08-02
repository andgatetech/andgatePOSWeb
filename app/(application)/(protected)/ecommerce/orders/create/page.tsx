'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showErrorDialog, showSuccessDialog, showToast } from '@/lib/toast';
import { useTranslation } from '@/components/i18n/TranslationProvider';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import {
    useCreateOnlineOrderMutation,
    useGetOnlineOrderSourcesQuery,
    useGetPathaoCitiesQuery,
    useGetPathaoZonesQuery,
    useGetPathaoAreasQuery,
} from '@/store/features/ecommerce/ecommerceManagementApi';
import { useGetAllProductsQuery } from '@/store/features/Product/productApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { useGetStoreCustomersQuery } from '@/store/features/customer/customer';
import {
    ShoppingBag,
    Search,
    Plus,
    Minus,
    Trash2,
    User,
    Phone,
    Mail,
    CreditCard,
    Truck,
    Receipt,
    CheckCircle2,
    ArrowLeft,
    Sparkles,
    Store as StoreIcon,
    Tag,
    DollarSign,
    FileText,
    ShieldCheck,
    MessageSquare,
    Globe,
    Smartphone,
    LayoutGrid,
    List,
    Box,
    X,
    MapPin,
    Layers,
    Share2,
} from 'lucide-react';

interface CartItem {
    stock_id: number;
    product_id: number;
    product_name: string;
    sku: string;
    price: number;
    originalPrice: number;
    quantity: number;
    unit?: string;
    image?: string | null;
    availableStock?: number;
    variantName?: string;
    weight?: number;
}

interface DeliveryPreset {
    id: string;
    label: string;
    labelBn: string;
    fee: number;
    icon: any;
    badge: string;
}

const DELIVERY_PRESETS: DeliveryPreset[] = [
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
        labelBn: 'ঢাকা উপশহর (সাভার / গাজীপুর)',
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

// 64 Bangladesh Districts Fallback
const BD_DISTRICTS_FALLBACK = [
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
    { city_id: 23, city_name: 'Dinajpur' },
    { city_id: 24, city_name: 'Sirajganj' },
    { city_id: 25, city_name: 'Jamalpur' },
    { city_id: 26, city_name: 'Naogaon' },
    { city_id: 27, city_name: 'Natore' },
    { city_id: 28, city_name: 'Narsingdi' },
    { city_id: 29, city_name: 'Manikganj' },
    { city_id: 30, city_name: 'Munshiganj' },
    { city_id: 31, city_name: 'Gopalganj' },
    { city_id: 32, city_name: 'Madaripur' },
    { city_id: 33, city_name: 'Rajbari' },
    { city_id: 34, city_name: 'Shariatpur' },
    { city_id: 35, city_name: 'Kishoreganj' },
    { city_id: 36, city_name: 'Lakshmipur' },
    { city_id: 37, city_name: 'Bandarban' },
    { city_id: 38, city_name: 'Khagrachhari' },
    { city_id: 39, city_name: 'Rangamati' },
    { city_id: 40, city_name: 'Habiganj' },
    { city_id: 41, city_name: 'Moulvibazar' },
    { city_id: 42, city_name: 'Sunamganj' },
    { city_id: 43, city_name: 'Bagerhat' },
    { city_id: 44, city_name: 'Chuadanga' },
    { city_id: 45, city_name: 'Jhenaidah' },
    { city_id: 46, city_name: 'Magura' },
    { city_id: 47, city_name: 'Meherpur' },
    { city_id: 48, city_name: 'Narail' },
    { city_id: 49, city_name: 'Satkhira' },
    { city_id: 50, city_name: 'Barguna' },
    { city_id: 51, city_name: 'Bhola' },
    { city_id: 52, city_name: 'Jhalokati' },
    { city_id: 53, city_name: 'Patuakhali' },
    { city_id: 54, city_name: 'Pirojpur' },
    { city_id: 55, city_name: 'Gaibandha' },
    { city_id: 56, city_name: 'Kurigram' },
    { city_id: 57, city_name: 'Lalmonirhat' },
    { city_id: 58, city_name: 'Nilphamari' },
    { city_id: 59, city_name: 'Panchagarh' },
    { city_id: 60, city_name: 'Thakurgaon' },
    { city_id: 61, city_name: 'Joypurhat' },
    { city_id: 62, city_name: 'Chapai Nawabganj' },
    { city_id: 63, city_name: 'Netrokona' },
    { city_id: 64, city_name: 'Sherpur' },
];

export default function CreateEcommerceOrderPage() {
    const { i18n } = useTranslation();
    const isBn = i18n?.language === 'bn';
    const router = useRouter();
    const { currentStoreId, currentStore } = useCurrentStore();

    // -------------------------------------------------------------
    // State: Product Search & Catalog (1st SECTION)
    // -------------------------------------------------------------
    const [productSearch, setProductSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedProductForVariant, setSelectedProductForVariant] = useState<any | null>(null);

    // -------------------------------------------------------------
    // State: Cart / Items
    // -------------------------------------------------------------
    const [cart, setCart] = useState<CartItem[]>([]);

    // -------------------------------------------------------------
    // State: Customer Information & Delivery Address (2nd SECTION)
    // -------------------------------------------------------------
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    // Cascading Address Fields: District -> Zone -> Area -> Address Line
    const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
    const [selectedDistrictName, setSelectedDistrictName] = useState<string>('');
    const [selectedZoneId, setSelectedZoneId] = useState<string>('');
    const [selectedZoneName, setSelectedZoneName] = useState<string>('');
    const [selectedAreaId, setSelectedAreaId] = useState<string>('');
    const [selectedAreaName, setSelectedAreaName] = useState<string>('');
    const [addressLine, setAddressLine] = useState('');
    const [postalCode, setPostalCode] = useState('');

    // Shipping Rate Presets
    const [selectedDeliveryPreset, setSelectedDeliveryPreset] = useState<string>('inside_dhaka');
    const [shippingFee, setShippingFee] = useState<number>(60);
    const [customShippingFeeInput, setCustomShippingFeeInput] = useState<string>('60');
    const [isCustomShipping, setIsCustomShipping] = useState(false);

    // -------------------------------------------------------------
    // State: Order Source & Payment (3rd SECTION - Before Payment)
    // -------------------------------------------------------------
    const [selectedSourceId, setSelectedSourceId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('Cash on Delivery');
    const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
    const [discountValue, setDiscountValue] = useState<number>(0);
    const [advancePaid, setAdvancePaid] = useState<number>(0);
    const [transactionId, setTransactionId] = useState('');
    const [customerNotes, setCustomerNotes] = useState('');
    const [internalNotes, setInternalNotes] = useState('');

    // Submission loading
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // -------------------------------------------------------------
    // API Data Hooks: Location API (District -> Zone -> Area)
    // -------------------------------------------------------------
    const { data: pathaoCitiesData, isLoading: isLoadingDistricts } = useGetPathaoCitiesQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );

    const districtsList = useMemo(() => {
        const d = pathaoCitiesData as any;
        const list = d?.data?.data || d?.data || d?.items || [];
        if (Array.isArray(list) && list.length > 0) {
            return list.map((item: any) => ({
                city_id: item.city_id || item.id,
                city_name: item.city_name || item.name,
            }));
        }
        return BD_DISTRICTS_FALLBACK;
    }, [pathaoCitiesData]);

    // Zones API (Triggered when District is selected)
    const { data: pathaoZonesData, isLoading: isLoadingZones } = useGetPathaoZonesQuery(
        { cityId: selectedDistrictId, store_id: currentStoreId },
        { skip: !currentStoreId || !selectedDistrictId }
    );

    const zonesList = useMemo(() => {
        const d = pathaoZonesData as any;
        const list = d?.data?.data || d?.data || d?.items || [];
        return Array.isArray(list) ? list : [];
    }, [pathaoZonesData]);

    // Areas API (Triggered when Zone is selected)
    const { data: pathaoAreasData, isLoading: isLoadingAreas } = useGetPathaoAreasQuery(
        { zoneId: selectedZoneId, store_id: currentStoreId },
        { skip: !currentStoreId || !selectedZoneId }
    );

    const areasList = useMemo(() => {
        const d = pathaoAreasData as any;
        const list = d?.data?.data || d?.data || d?.items || [];
        return Array.isArray(list) ? list : [];
    }, [pathaoAreasData]);

    // -------------------------------------------------------------
    // Product & Source Hooks
    // -------------------------------------------------------------
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(productSearch.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [productSearch]);

    // Categories
    const { data: categoriesData } = useGetCategoryQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );
    const categories: any[] = useMemo(() => {
        const d = categoriesData as any;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    }, [categoriesData]);

    // Products Query
    const { data: productsData, isLoading: productsLoading, isFetching: productsFetching } = useGetAllProductsQuery(
        {
            store_id: currentStoreId,
            available: 'yes',
            search: debouncedSearch || undefined,
            category_id: selectedCategory || undefined,
            per_page: 48,
        },
        { skip: !currentStoreId }
    );

    const productList: any[] = useMemo(() => {
        const d = productsData as any;
        if (Array.isArray(d?.data?.items)) return d.data.items;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.items)) return d.items;
        return [];
    }, [productsData]);

    // Order Sources Query
    const { data: sourcesData } = useGetOnlineOrderSourcesQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );
    const sources: any[] = useMemo(() => {
        const d = sourcesData as any;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    }, [sourcesData]);

    // Auto-select first source if none selected
    useEffect(() => {
        if (!selectedSourceId && sources.length > 0) {
            setSelectedSourceId(String(sources[0].id));
        }
    }, [sources, selectedSourceId]);

    // Customer search hook
    const { data: customersData } = useGetStoreCustomersQuery(
        {
            store_id: currentStoreId,
            search: customerSearchTerm,
        },
        { skip: !currentStoreId || customerSearchTerm.length < 2 }
    );
    const customerSuggestions: any[] = useMemo(() => {
        const d = customersData as any;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.data?.items)) return d.data.items;
        return [];
    }, [customersData]);

    // Create order mutation
    const [createOnlineOrder] = useCreateOnlineOrderMutation();

    // -------------------------------------------------------------
    // Financial Calculations
    // -------------------------------------------------------------
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const totalUnits = useMemo(() => {
        return cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
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
    // Handlers: Cart Actions
    // -------------------------------------------------------------
    const addProductToCart = (product: any, selectedStock?: any) => {
        const stocks = product.stocks || [];
        if (stocks.length > 1 && !selectedStock) {
            setSelectedProductForVariant(product);
            return;
        }

        const stock = selectedStock || product.primary_stock || stocks[0];
        if (!stock || !stock.id) {
            showToast(isBn ? 'এই পণ্যের কোন স্টক পাওয়া যায়নি' : 'No active stock found for this product', 'error');
            return;
        }

        const stockId = stock.id;
        const availableQty = parseFloat(stock.quantity || product.available || 0);
        const itemPrice = parseFloat(stock.price || product.price || 0);

        setCart((prev) => {
            const existing = prev.find((item) => item.stock_id === stockId);
            if (existing) {
                return prev.map((item) =>
                    item.stock_id === stockId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [
                ...prev,
                {
                    stock_id: stockId,
                    product_id: product.id,
                    product_name: product.product_name,
                    sku: stock.sku || product.sku || '',
                    price: itemPrice,
                    originalPrice: itemPrice,
                    quantity: 1,
                    unit: stock.unit || product.unit || 'Pcs',
                    image: product.image || stock.images?.[0]?.url || null,
                    availableStock: availableQty,
                    variantName: stock.variant_name || (stock.attributes ? Object.values(stock.attributes).join(' / ') : undefined),
                },
            ];
        });

        setSelectedProductForVariant(null);
        showToast(isBn ? 'পণ্যটি অর্ডারে যোগ করা হয়েছে' : 'Item added to order', 'success');
    };

    const updateQuantity = (stockId: number, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.stock_id === stockId) {
                        const newQ = item.quantity + delta;
                        return newQ > 0 ? { ...item, quantity: newQ } : null;
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[]
        );
    };

    const updateItemPrice = (stockId: number, newPrice: number) => {
        if (isNaN(newPrice) || newPrice < 0) return;
        setCart((prev) =>
            prev.map((item) => (item.stock_id === stockId ? { ...item, price: newPrice } : item))
        );
    };

    const removeFromCart = (stockId: number) => {
        setCart((prev) => prev.filter((item) => item.stock_id !== stockId));
    };

    const clearCart = () => {
        if (cart.length === 0) return;
        if (window.confirm(isBn ? 'আপনি কি নিশ্চিত যে পুরো কার্ট খালি করতে চান?' : 'Clear all items from this order?')) {
            setCart([]);
        }
    };

    // -------------------------------------------------------------
    // Handlers: Cascading Location Selection
    // -------------------------------------------------------------
    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const distId = e.target.value;
        setSelectedDistrictId(distId);
        const distObj = districtsList.find((d: any) => String(d.city_id) === String(distId));
        setSelectedDistrictName(distObj ? distObj.city_name : '');
        // Reset Zone and Area when District changes
        setSelectedZoneId('');
        setSelectedZoneName('');
        setSelectedAreaId('');
        setSelectedAreaName('');
    };

    const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const zId = e.target.value;
        setSelectedZoneId(zId);
        const zObj = zonesList.find((z: any) => String(z.zone_id || z.id) === String(zId));
        setSelectedZoneName(zObj ? (zObj.zone_name || zObj.name) : '');
        // Reset Area when Zone changes
        setSelectedAreaId('');
        setSelectedAreaName('');
    };

    const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const aId = e.target.value;
        setSelectedAreaId(aId);
        const aObj = areasList.find((a: any) => String(a.area_id || a.id) === String(aId));
        setSelectedAreaName(aObj ? (aObj.area_name || aObj.name) : '');
    };

    // -------------------------------------------------------------
    // Handlers: Delivery Presets
    // -------------------------------------------------------------
    const handleSelectPreset = (preset: DeliveryPreset) => {
        setSelectedDeliveryPreset(preset.id);
        setIsCustomShipping(false);
        setShippingFee(preset.fee);
        setCustomShippingFeeInput(String(preset.fee));
    };

    const handleCustomShippingChange = (val: string) => {
        setCustomShippingFeeInput(val);
        const num = parseFloat(val);
        setShippingFee(isNaN(num) ? 0 : num);
        setIsCustomShipping(true);
        setSelectedDeliveryPreset('custom');
    };

    // -------------------------------------------------------------
    // Handlers: Customer Auto-fill
    // -------------------------------------------------------------
    const handleSelectCustomer = (cust: any) => {
        setCustomerName(cust.name || '');
        setCustomerPhone(cust.mobile_number || cust.phone || '');
        setCustomerEmail(cust.email || '');
        if (cust.address) {
            setAddressLine(cust.address);
        }
        setIsCustomerDropdownOpen(false);
        setCustomerSearchTerm('');
        showToast(isBn ? `কাস্টমার "${cust.name}" নির্বাচিত হয়েছে` : `Applied customer "${cust.name}"`, 'success');
    };

    // -------------------------------------------------------------
    // Order Submit Handler
    // -------------------------------------------------------------
    const handleSubmitOrder = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (cart.length === 0) {
            showErrorDialog(isBn ? 'অনুগ্রহ করে অন্তত একটি পণ্য যোগ করুন।' : 'Please add at least one item to the order.');
            return;
        }

        if (!customerName.trim() || !customerPhone.trim()) {
            showErrorDialog(isBn ? 'গ্রাহকের নাম ও ফোন নম্বর প্রদান করা বাধ্যতামূলক।' : 'Customer Name and Mobile Phone are required.');
            return;
        }

        if (!selectedDistrictName && selectedDeliveryPreset !== 'store_pickup') {
            showErrorDialog(isBn ? 'অনুগ্রহ করে জেলা (District) নির্বাচন করুন।' : 'Please select a District for delivery.');
            return;
        }

        if (!addressLine.trim() && selectedDeliveryPreset !== 'store_pickup') {
            showErrorDialog(isBn ? 'অনুগ্রহ করে ডেলিভারি ঠিকানা (Address Line) পূরণ করুন।' : 'Address Line is required.');
            return;
        }

        if (!selectedSourceId) {
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
                    postal_code: postalCode || undefined,
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
                source_id: parseInt(selectedSourceId, 10),
                shipping_fee: Number(shippingFee || 0),
                discount: Number(calculatedDiscount || 0),
                advance_paid: Number(advancePaid || 0),
                transaction_id: transactionId || undefined,
                notes: customerNotes.trim() || undefined,
                internal_notes: internalNotes.trim() || undefined,
            };

            await createOnlineOrder(payload).unwrap();

            await showSuccessDialog(
                isBn ? 'অর্ডার সফলভাবে তৈরি হয়েছে!' : 'eCommerce Order Created Successfully!'
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

    const selectedSource = sources.find((s) => String(s.id) === selectedSourceId);

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-28">
            {/* ========================================================= */}
            {/* TOP HEADER (FULL-WIDTH DESIGN)                            */}
            {/* ========================================================= */}
            <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
                <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
                    
                    {/* Left: Back & Page Title */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/ecommerce/orders"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-[#046ca9]/40 hover:bg-[#046ca9]/5 hover:text-[#046ca9]"
                            title={isBn ? 'অর্ডার তালিকায় ফিরে যান' : 'Back to orders'}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#046ca9]">
                                    {isBn ? 'ই-কমার্স চেকআউট টার্মিনাল' : 'eCommerce Checkout'}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                    <Sparkles className="h-3 w-3 text-emerald-500" />
                                    {isBn ? 'ম্যানুয়াল অনলাইন অর্ডার' : 'Manual Online Order'}
                                </span>
                            </div>
                            <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                                {isBn ? 'নতুন অনলাইন অর্ডার তৈরি' : 'Create Online Order'}
                            </h1>
                        </div>
                    </div>

                    {/* Right: Current Store Context */}
                    <div className="flex items-center gap-3">
                        {currentStore && (
                            <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs">
                                <StoreIcon className="h-4 w-4 text-[#046ca9]" />
                                <span className="font-bold text-slate-900">{currentStore.store_name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* MAIN WORKSPACE (FULL-WIDTH GRID)                          */}
            {/* ========================================================= */}
            <div className="w-full px-4 pt-6 sm:px-6 lg:px-8 xl:px-10">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 xl:grid-cols-12">
                    
                    {/* ----------------------------------------------------- */}
                    {/* LEFT MAIN AREA: 1. Products -> 2. Address -> 3. Pay   */}
                    {/* ----------------------------------------------------- */}
                    <div className="space-y-6 lg:col-span-8 xl:col-span-8 2xl:col-span-9">
                        
                        {/* 1. PRODUCT SEARCH & CATALOG + CART (FIRST SECTION) */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#046ca9]/10 text-[#046ca9]">
                                        <ShoppingBag className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">
                                            {isBn ? '১. পণ্য নির্বাচন ও কার্ট' : '1. Product Search & Catalog'}
                                            <span className="text-red-500 ml-0.5">*</span>
                                        </h2>
                                        <p className="text-[11px] text-slate-400">
                                            {isBn ? 'অর্ডারের পণ্য সার্চ করে নির্বাচন করুন' : 'Search & add products to this order'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                                        <button
                                            type="button"
                                            onClick={() => setCatalogViewMode('grid')}
                                            className={`p-1 rounded-md transition ${catalogViewMode === 'grid' ? 'bg-white shadow-xs text-[#046ca9]' : 'text-slate-400 hover:text-slate-600'}`}
                                            title="Grid view"
                                        >
                                            <LayoutGrid className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCatalogViewMode('list')}
                                            className={`p-1 rounded-md transition ${catalogViewMode === 'list' ? 'bg-white shadow-xs text-[#046ca9]' : 'text-slate-400 hover:text-slate-600'}`}
                                            title="List view"
                                        >
                                            <List className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Search Omnibar */}
                            <div className="relative mb-3">
                                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder={
                                        isBn
                                            ? 'পণ্যের নাম, বারকোড অথবা SKU দিয়ে খুঁজুন...'
                                            : 'Search products by name, barcode, or SKU...'
                                    }
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#046ca9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#046ca9]/20 transition"
                                />
                                {productSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setProductSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Pills */}
                            {categories.length > 0 && (
                                <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory('')}
                                        className={`shrink-0 rounded-full px-3 py-1 font-semibold transition ${
                                            selectedCategory === ''
                                                ? 'bg-[#046ca9] text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {isBn ? 'সকল পণ্য' : 'All Products'}
                                    </button>
                                    {categories.map((cat: any) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setSelectedCategory(String(cat.id))}
                                            className={`shrink-0 rounded-full px-3 py-1 font-semibold transition ${
                                                selectedCategory === String(cat.id)
                                                    ? 'bg-[#046ca9] text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Product Results Grid / List */}
                            <div className="max-h-[340px] overflow-y-auto pr-1">
                                {productsLoading || productsFetching ? (
                                    <div className="flex h-36 flex-col items-center justify-center gap-2 text-slate-400">
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#046ca9] border-t-transparent" />
                                        <span className="text-xs">{isBn ? 'পণ্য লোড হচ্ছে...' : 'Loading products...'}</span>
                                    </div>
                                ) : productList.length === 0 ? (
                                    <div className="flex h-28 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                                        <Box className="h-6 w-6 text-slate-300 mb-1" />
                                        <p className="text-xs font-semibold text-slate-600">
                                            {isBn ? 'কোন পণ্য পাওয়া যায়নি' : 'No products found'}
                                        </p>
                                    </div>
                                ) : catalogViewMode === 'grid' ? (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                                        {productList.map((prod: any) => {
                                            const primaryStock = prod.stocks?.[0] || prod.primary_stock;
                                            const price = primaryStock?.price || prod.price || 0;
                                            const stockQty = primaryStock?.quantity ?? prod.available ?? 0;
                                            const hasVariants = (prod.stocks?.length || 0) > 1;

                                            return (
                                                <div
                                                    key={prod.id}
                                                    onClick={() => addProductToCart(prod)}
                                                    className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-[#046ca9] hover:shadow-md cursor-pointer"
                                                >
                                                    <div>
                                                        <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center">
                                                            {prod.image ? (
                                                                <img
                                                                    src={prod.image}
                                                                    alt={prod.product_name}
                                                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <ShoppingBag className="h-6 w-6 text-slate-300" />
                                                            )}
                                                            {hasVariants && (
                                                                <span className="absolute bottom-1 right-1 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                                                                    {prod.stocks.length} Var
                                                                </span>
                                                            )}
                                                            {stockQty <= 5 && stockQty > 0 && (
                                                                <span className="absolute top-1 left-1 rounded-md bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                                                    Low: {stockQty}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="line-clamp-2 text-xs font-bold text-slate-800 group-hover:text-[#046ca9] transition">
                                                            {prod.product_name}
                                                        </h3>
                                                        {prod.sku && (
                                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                                                                SKU: {prod.sku}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100">
                                                        <span className="text-xs font-extrabold text-[#046ca9]">
                                                            ৳{Number(price).toLocaleString()}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#046ca9]/10 text-[#046ca9] transition group-hover:bg-[#046ca9] group-hover:text-white"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden border-slate-200">
                                        {productList.map((prod: any) => {
                                            const primaryStock = prod.stocks?.[0] || prod.primary_stock;
                                            const price = primaryStock?.price || prod.price || 0;
                                            const stockQty = primaryStock?.quantity ?? prod.available ?? 0;
                                            const hasVariants = (prod.stocks?.length || 0) > 1;

                                            return (
                                                <div
                                                    key={prod.id}
                                                    onClick={() => addProductToCart(prod)}
                                                    className="flex items-center gap-3 p-2.5 hover:bg-slate-50 cursor-pointer transition"
                                                >
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center border border-slate-100">
                                                        {prod.image ? (
                                                            <img src={prod.image} alt={prod.product_name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag className="h-4 w-4 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="truncate text-xs font-bold text-slate-800 hover:text-[#046ca9]">
                                                            {prod.product_name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                            {prod.sku && <span>SKU: {prod.sku}</span>}
                                                            <span>•</span>
                                                            <span className={stockQty > 0 ? 'text-emerald-600 font-medium' : 'text-red-500'}>
                                                                {stockQty > 0 ? `Stock: ${stockQty}` : 'Out of stock'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-extrabold text-[#046ca9]">
                                                            ৳{Number(price).toLocaleString()}
                                                        </div>
                                                        {hasVariants && (
                                                            <span className="text-[9px] font-semibold text-slate-400">
                                                                {prod.stocks.length} variants
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#046ca9]/10 text-[#046ca9] hover:bg-[#046ca9] hover:text-white transition"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Added Items (Detailed Cart Table) */}
                            <div className="mt-5 pt-4 border-t border-slate-100">
                                {/* Top Stats Bar */}
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                            <ShoppingBag className="h-3.5 w-3.5 text-[#046ca9]" />
                                            <span>{isBn ? 'অর্ডারে যুক্ত পণ্যসমূহ' : 'Selected Order Items'}</span>
                                        </h3>
                                        <span className="rounded-full bg-[#046ca9]/10 border border-[#046ca9]/20 px-2 py-0.5 text-[11px] font-bold text-[#046ca9]">
                                            {cart.length} {cart.length === 1 ? (isBn ? 'টি আইটেম' : 'Item') : (isBn ? 'টি আইটেম' : 'Items')} ({totalUnits} {isBn ? 'পিস' : 'Units'})
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {cart.length > 0 && (
                                            <>
                                                <div className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                    <span>{isBn ? 'পণ্য সাবটোটাল:' : 'Items Subtotal:'}</span>
                                                    <span className="font-extrabold text-slate-900">৳{subtotal.toLocaleString()}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={clearCart}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    <span>{isBn ? 'সব মুছুন' : 'Clear all'}</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {cart.length === 0 ? (
                                    <div className="flex h-24 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center p-4">
                                        <ShoppingBag className="h-6 w-6 text-slate-300 mb-1" />
                                        <p className="text-xs font-semibold text-slate-500">
                                            {isBn ? 'কার্ট খালি — উপরের তালিকা থেকে পণ্য নির্বাচন করুন' : 'No items added yet — Search & click + above to add products'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                                        <table className="w-full min-w-[620px] text-xs text-left">
                                            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                <tr>
                                                    <th className="py-2.5 pl-3 pr-2 text-center w-10">#</th>
                                                    <th className="py-2.5 px-3">{isBn ? 'পণ্যের বিবরণ (Product Details)' : 'Product Details'}</th>
                                                    <th className="py-2.5 px-3 text-right w-36">{isBn ? 'একক মূল্য (Unit Price)' : 'Unit Price (৳)'}</th>
                                                    <th className="py-2.5 px-3 text-center w-36">{isBn ? 'পরিমাণ (Quantity)' : 'Quantity (Qty)'}</th>
                                                    <th className="py-2.5 px-3 text-right w-32">{isBn ? 'মোট মূল্য (Total)' : 'Total (৳)'}</th>
                                                    <th className="py-2.5 pr-3 pl-2 text-center w-12">{isBn ? 'মুছুন' : 'Action'}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {cart.map((item, idx) => (
                                                    <tr key={item.stock_id} className="hover:bg-slate-50/80 transition">
                                                        {/* # */}
                                                        <td className="py-3 pl-3 pr-2 text-center font-bold text-slate-400">
                                                            {idx + 1}
                                                        </td>

                                                        {/* Product Details */}
                                                        <td className="py-3 px-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                                    {item.image ? (
                                                                        <img src={item.image} alt={item.product_name} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <ShoppingBag className="h-4 w-4 text-slate-400" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-bold text-slate-900 line-clamp-1">{item.product_name}</p>
                                                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                                                        {item.variantName && (
                                                                            <span className="rounded bg-slate-100 px-1.5 py-0.2 font-medium text-slate-700 border border-slate-200/60">
                                                                                {item.variantName}
                                                                            </span>
                                                                        )}
                                                                        {item.sku && (
                                                                            <span className="font-mono text-slate-400">
                                                                                SKU: {item.sku}
                                                                            </span>
                                                                        )}
                                                                        {item.unit && (
                                                                            <span className="text-slate-400">• {item.unit}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Unit Price (Editable) */}
                                                        <td className="py-3 px-3 text-right">
                                                            <div className="inline-flex items-center justify-end gap-1">
                                                                <span className="text-slate-400 font-semibold text-[11px]">৳</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={item.price}
                                                                    onChange={(e) => updateItemPrice(item.stock_id, parseFloat(e.target.value))}
                                                                    className="h-8 w-24 rounded-lg border border-slate-200 bg-white px-2 text-right font-bold text-slate-900 focus:border-[#046ca9] focus:outline-none focus:ring-1 focus:ring-[#046ca9]"
                                                                    title="Click to edit unit price"
                                                                />
                                                            </div>
                                                        </td>

                                                        {/* Quantity Stepper */}
                                                        <td className="py-3 px-3 text-center">
                                                            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateQuantity(item.stock_id, -1)}
                                                                    className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition rounded-l-lg"
                                                                    title="Decrease qty"
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </button>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value, 10);
                                                                        if (!isNaN(val) && val > 0) {
                                                                            setCart((prev) =>
                                                                                prev.map((c) =>
                                                                                    c.stock_id === item.stock_id
                                                                                        ? { ...c, quantity: val }
                                                                                        : c
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                    className="w-10 text-center font-extrabold text-slate-900 border-x border-slate-100 py-0.5 focus:outline-none text-xs"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateQuantity(item.stock_id, 1)}
                                                                    className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition rounded-r-lg"
                                                                    title="Increase qty"
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </td>

                                                        {/* Line Total */}
                                                        <td className="py-3 px-3 text-right">
                                                            <span className="font-extrabold text-slate-900 text-sm">
                                                                ৳{(item.price * item.quantity).toLocaleString()}
                                                            </span>
                                                        </td>

                                                        {/* Action */}
                                                        <td className="py-3 pr-3 pl-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFromCart(item.stock_id)}
                                                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                                                                title={isBn ? 'পণ্য সরান' : 'Remove item'}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-700">
                                                <tr>
                                                    <td colSpan={3} className="py-2.5 px-4 text-left">
                                                        <span className="text-[11px] uppercase tracking-wider text-slate-500">
                                                            {isBn ? 'সর্বমোট কার্ট হিসাব:' : 'Total Items & Quantity:'}
                                                        </span>
                                                        <span className="ml-2 text-slate-900">
                                                            {cart.length} {isBn ? 'প্রকার পণ্য' : 'items'} ({totalUnits} {isBn ? 'পিস' : 'pcs'})
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center text-slate-500 text-[11px]">
                                                        {isBn ? 'সাবটোটাল' : 'Subtotal'}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right text-sm font-extrabold text-[#046ca9]">
                                                        ৳{subtotal.toLocaleString()}
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. DELIVERY ADDRESS & CUSTOMER INFO (SECOND SECTION - EXACT ECOMMERCE SPEC) */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
                            <div className="mb-4 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900">
                                            {isBn ? '২. ডেলিভারি ঠিকানা (Delivery Address)' : '2. Delivery Address'}
                                            <span className="text-red-500 ml-0.5">*</span>
                                        </h2>
                                        <p className="text-[11px] text-slate-500">
                                            {isBn
                                                ? 'ডেলিভারি ঠিকানার জন্য জেলা, এরপর জোন, এবং এরপর এরিয়া নির্বাচন করুন।'
                                                : 'Select district, then zone, then area for the shipping address.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Lookup Omnibar */}
                            <div className="relative mb-4">
                                <label className="mb-1 block text-xs font-semibold text-slate-700">
                                    {isBn ? 'বিদ্যমান গ্রাহক অনুসন্ধান (ফোন / নাম)' : 'Quick Customer Lookup'}
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={customerSearchTerm}
                                        onChange={(e) => {
                                            setCustomerSearchTerm(e.target.value);
                                            setIsCustomerDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsCustomerDropdownOpen(true)}
                                        placeholder={isBn ? 'ফোন নম্বর বা নাম লিখে সার্চ করুন...' : 'Search existing customer by phone or name...'}
                                        className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#046ca9] focus:bg-white focus:outline-none"
                                    />
                                </div>

                                {/* Customer Auto-suggest dropdown */}
                                {isCustomerDropdownOpen && customerSearchTerm.length >= 2 && (
                                    <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                        {customerSuggestions.length === 0 ? (
                                            <div className="p-3 text-center text-xs text-slate-400">
                                                {isBn ? 'কোন গ্রাহক পাওয়া যায়নি' : 'No existing customer found'}
                                            </div>
                                        ) : (
                                            customerSuggestions.map((c: any) => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => handleSelectCustomer(c)}
                                                    className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs hover:bg-slate-50 transition"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-900">{c.name}</p>
                                                        <p className="text-[11px] text-slate-500">{c.mobile_number || c.phone}</p>
                                                    </div>
                                                    {c.total_orders && (
                                                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                                            {c.total_orders} Orders
                                                        </span>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Full Name & Phone Number */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        {isBn ? 'সম্পূর্ণ নাম (Full Name)' : 'Full Name'} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder={isBn ? 'গ্রাহকের নাম লিখুন' : 'Enter customer name'}
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-900 focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]/20"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        {isBn ? 'ফোন নম্বর (Phone Number)' : 'Phone Number'} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                        <input
                                            type="tel"
                                            required
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="01712345678"
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold text-slate-900 focus:border-[#046ca9] focus:outline-none focus:ring-2 focus:ring-[#046ca9]/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Cascading Dropdowns: District -> Zone -> Area */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
                                {/* District */}
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        {isBn ? 'জেলা (District)' : 'District'} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedDistrictId}
                                            onChange={handleDistrictChange}
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 focus:border-[#046ca9] focus:outline-none"
                                        >
                                            <option value="">{isLoadingDistricts ? (isBn ? 'লোড হচ্ছে...' : 'Loading districts...') : (isBn ? 'জেলা নির্বাচন করুন' : 'Select district')}</option>
                                            {districtsList.map((d: any) => (
                                                <option key={d.city_id} value={d.city_id}>
                                                    {d.city_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Zone */}
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        {isBn ? 'জোন / থানা (Zone)' : 'Zone'}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedZoneId}
                                            onChange={handleZoneChange}
                                            disabled={!selectedDistrictId || isLoadingZones}
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 focus:border-[#046ca9] focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {!selectedDistrictId
                                                    ? (isBn ? 'আগে জেলা নির্বাচন করুন' : 'Select district first')
                                                    : isLoadingZones
                                                    ? (isBn ? 'জোন লোড হচ্ছে...' : 'Loading zones...')
                                                    : (isBn ? 'জোন নির্বাচন করুন' : 'Select zone')}
                                            </option>
                                            {zonesList.map((z: any) => (
                                                <option key={z.zone_id || z.id} value={z.zone_id || z.id}>
                                                    {z.zone_name || z.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Area */}
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        {isBn ? 'এরিয়া (Area)' : 'Area'}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedAreaId}
                                            onChange={handleAreaChange}
                                            disabled={!selectedZoneId || isLoadingAreas}
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 focus:border-[#046ca9] focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {!selectedZoneId
                                                    ? (isBn ? 'আগে জোন নির্বাচন করুন' : 'Select zone first')
                                                    : isLoadingAreas
                                                    ? (isBn ? 'এরিয়া লোড হচ্ছে...' : 'Loading areas...')
                                                    : (isBn ? 'এরিয়া নির্বাচন করুন' : 'Select area')}
                                            </option>
                                            {areasList.map((a: any) => (
                                                <option key={a.area_id || a.id} value={a.area_id || a.id}>
                                                    {a.area_name || a.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Address Line & Postal Code */}
                            <div className="space-y-3 mb-4">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                        {isBn ? 'ঠিকানা (Address Line)' : 'Address Line'} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
                                        <textarea
                                            rows={2}
                                            required
                                            value={addressLine}
                                            onChange={(e) => setAddressLine(e.target.value)}
                                            placeholder={isBn ? 'বাসা/ফ্ল্যাট নং, রোড নং, সেক্টর/গ্রাম...' : 'House #, Road #, Sector/Area, Village/Post...'}
                                            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#046ca9] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                                            {isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                                        </label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                            <input
                                                type="email"
                                                value={customerEmail}
                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                                placeholder="customer@example.com"
                                                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 focus:border-[#046ca9] focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                                            {isBn ? 'পোস্ট কোড (ঐচ্ছিক)' : 'Postal Code (Optional)'}
                                        </label>
                                        <input
                                            type="text"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            placeholder="1200"
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-[#046ca9] focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Area Rate Presets */}
                            <div className="pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-slate-700">
                                        {isBn ? 'ডেলিভারি চার্জ নির্ধারণ' : 'Shipping Rate & Area'}
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] text-slate-400">Custom ৳</span>
                                        <input
                                            type="number"
                                            min="0"
                                            value={customShippingFeeInput}
                                            onChange={(e) => handleCustomShippingChange(e.target.value)}
                                            className="h-7 w-20 rounded-lg border border-slate-200 bg-white px-2 text-right text-xs font-bold text-slate-900 focus:border-[#046ca9] focus:outline-none"
                                        />
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
                                                className={`flex flex-col justify-between rounded-xl border p-2 text-left transition ${
                                                    isSelected
                                                        ? 'border-[#046ca9] bg-[#046ca9]/5 text-[#046ca9] ring-2 ring-[#046ca9]/20 shadow-xs'
                                                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <Icon className="h-3.5 w-3.5" />
                                                    <span className="text-[9px] font-bold">{preset.badge}</span>
                                                </div>
                                                <p className="text-xs font-bold truncate">{isBn ? preset.labelBn : preset.label}</p>
                                                <p className="text-xs font-extrabold text-[#046ca9] mt-0.5">
                                                    ৳{preset.fee}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 3. ORDER SOURCE & PAYMENT DETAILS (THIRD SECTION) */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
                            <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">
                                        {isBn ? '৩. অর্ডারের উৎস ও পেমেন্ট বিবরণ' : '3. Order Source & Payment Details'}
                                    </h2>
                                    <p className="text-[11px] text-slate-400">
                                        {isBn ? 'অর্ডারের মাধ্যম, পেমেন্ট মেথড ও ডিসকাউন্ট' : 'Select order sales channel, payment type & discounts'}
                                    </p>
                                </div>
                            </div>

                            {/* ORDER SOURCE SELECTION (MOVED HERE BEFORE PAYMENT) */}
                            <div className="mb-4 rounded-xl border border-[#046ca9]/20 bg-[#046ca9]/5 p-3.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                            <Layers className="h-4 w-4 text-[#046ca9]" />
                                            <span>{isBn ? 'অর্ডারের উৎস (Order Source / Channel)' : 'Order Source / Channel'}</span>
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-[11px] text-slate-500">
                                            {isBn ? 'অর্ডারটি কোন প্ল্যাটফর্ম থেকে এসেছে তা নির্বাচন করুন' : 'Select which channel this order originated from'}
                                        </p>
                                    </div>

                                    {/* Source Select Dropdown */}
                                    <div className="min-w-[220px]">
                                        <select
                                            value={selectedSourceId}
                                            onChange={(e) => setSelectedSourceId(e.target.value)}
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 shadow-2xs focus:border-[#046ca9] focus:outline-none"
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

                            {/* Payment Method Selector */}
                            <div className="mb-4">
                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                    {isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}
                                </label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {[
                                        { id: 'Cash on Delivery', label: 'Cash on Delivery (COD)', icon: DollarSign },
                                        { id: 'bKash', label: 'bKash', icon: Smartphone },
                                        { id: 'Nagad', label: 'Nagad', icon: Smartphone },
                                        { id: 'Card', label: 'POS Card / Pay', icon: CreditCard },
                                    ].map((m) => {
                                        const isSelected = paymentMethod === m.id;
                                        return (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setPaymentMethod(m.id)}
                                                className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                                                    isSelected
                                                        ? 'border-[#046ca9] bg-[#046ca9]/5 text-[#046ca9] ring-2 ring-[#046ca9]/20 shadow-xs'
                                                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white'
                                                }`}
                                            >
                                                <m.icon className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{m.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Discounts & Advance Paid Grid */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-3 border-t border-slate-100">
                                {/* Discount */}
                                <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                            <Tag className="h-3.5 w-3.5 text-[#046ca9]" />
                                            {isBn ? 'অর্ডার ডিসকাউন্ট' : 'Order Discount'}
                                        </label>
                                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white">
                                            <button
                                                type="button"
                                                onClick={() => setDiscountType('fixed')}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                                    discountType === 'fixed' ? 'bg-[#046ca9] text-white' : 'text-slate-600'
                                                }`}
                                            >
                                                ৳ Fixed
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDiscountType('percent')}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                                    discountType === 'percent' ? 'bg-[#046ca9] text-white' : 'text-slate-600'
                                                }`}
                                            >
                                                % Percent
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
                                            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs font-bold text-slate-900 focus:border-[#046ca9] focus:outline-none"
                                        />
                                    </div>
                                    {calculatedDiscount > 0 && (
                                        <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
                                            {isBn ? `ছাড় প্রযোজ্য: -৳${calculatedDiscount.toLocaleString()}` : `Discount applied: -৳${calculatedDiscount.toLocaleString()}`}
                                        </p>
                                    )}
                                </div>

                                {/* Advance Payment */}
                                <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                            {isBn ? 'অগ্রিম জমা (Advance Received)' : 'Advance Payment Received'}
                                        </label>
                                        {shippingFee > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setAdvancePaid(shippingFee)}
                                                className="text-[10px] font-bold text-[#046ca9] hover:underline"
                                            >
                                                {isBn ? `ডেলিভারি চার্জ (৳${shippingFee})` : `Fee (৳${shippingFee})`}
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
                                            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs font-bold text-slate-900 focus:border-[#046ca9] focus:outline-none"
                                        />
                                    </div>
                                    {advancePaid > 0 && (
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                placeholder={isBn ? 'bKash/Nagad TrxID বা রসিদ নং...' : 'bKash/Nagad TrxID or Reference...'}
                                                className="h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-800 focus:border-[#046ca9] focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Customer & Staff Notes */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-3 mt-3 border-t border-slate-100">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700 flex items-center gap-1">
                                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                                        {isBn ? 'ডেলিভারি সংক্রান্ত নির্দেশনা' : 'Delivery Instructions'}
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={customerNotes}
                                        onChange={(e) => setCustomerNotes(e.target.value)}
                                        placeholder={isBn ? 'উদাঃ ৫টার পর ডেলিভারি দিন, কল দিয়ে যাবেন...' : 'e.g. Call before delivery, deliver in afternoon...'}
                                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#046ca9] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700 flex items-center gap-1">
                                        <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                                        {isBn ? 'অভ্যন্তরীণ স্টাফ নোট' : 'Internal Staff Note'}
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={internalNotes}
                                        onChange={(e) => setInternalNotes(e.target.value)}
                                        placeholder={isBn ? 'উদাঃ গিফট বক্স ও স্টিকার যুক্ত করুন...' : 'e.g. Fragile item, add protective bubble wrap...'}
                                        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#046ca9] focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ----------------------------------------------------- */}
                    {/* RIGHT COLUMN: Sticky Live Checkout Invoice (Full)     */}
                    {/* ----------------------------------------------------- */}
                    <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3">
                        <div className="sticky top-20 space-y-4">
                            
                            {/* Live Invoice Card */}
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
                                <div className="border-b border-slate-100 bg-gradient-to-r from-[#046ca9] to-[#034d79] p-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Receipt className="h-5 w-5 opacity-90" />
                                            <h2 className="font-bold text-sm sm:text-base">
                                                {isBn ? 'চেকআউট ইনভয়েস সামারি' : 'Checkout Order Summary'}
                                            </h2>
                                        </div>
                                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur-xs">
                                            {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1 text-[11px] text-white/80">
                                        <span>{isBn ? 'অর্ডারের মাধ্যম:' : 'Source Channel:'}</span>
                                        <span className="font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">
                                            {selectedSource?.source_name || 'Online Store'}
                                        </span>
                                    </div>
                                </div>

                                {/* Financial Math Breakdown */}
                                <div className="p-4 space-y-3 text-xs">
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>{isBn ? 'মোট পণ্যের মূল্য (Subtotal)' : 'Items Subtotal'}</span>
                                        <span className="font-bold text-slate-900">৳{subtotal.toLocaleString()}</span>
                                    </div>

                                    {calculatedDiscount > 0 && (
                                        <div className="flex justify-between items-center text-emerald-600 font-semibold">
                                            <span>{isBn ? 'ডিসকাউন্ট (Discount)' : 'Order Discount'}</span>
                                            <span>- ৳{calculatedDiscount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <span>{isBn ? 'ডেলিভারি চার্জ (Shipping)' : 'Shipping Fee'}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">({selectedDeliveryPreset})</span>
                                        </div>
                                        <span className="font-bold text-slate-900">+ ৳{Number(shippingFee || 0).toLocaleString()}</span>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-900 font-bold text-sm">
                                        <span>{isBn ? 'সর্বমোট অর্ডার মূল্য' : 'Total Order Value'}</span>
                                        <span className="text-base text-slate-900">৳{orderTotal.toLocaleString()}</span>
                                    </div>

                                    {advancePaid > 0 && (
                                        <div className="flex justify-between items-center text-blue-600 font-semibold pt-1 border-t border-dashed border-slate-200">
                                            <span>{isBn ? 'অগ্রিম জমা (Advance Paid)' : 'Advance Payment Paid'}</span>
                                            <span>- ৳{advancePaid.toLocaleString()}</span>
                                        </div>
                                    )}

                                    {/* Prominent COD Amount to Collect Box */}
                                    <div className="mt-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 p-3.5 text-center">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                                            {isBn ? 'ডেলিভারিতে গ্রাহক থেকে আদায়যোগ্য (COD)' : 'Cash on Delivery (COD) to Collect'}
                                        </p>
                                        <div className="text-2xl font-black text-emerald-700 mt-1">
                                            ৳{codAmountToCollect.toLocaleString()}
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
                                        onClick={handleSubmitOrder}
                                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#046ca9] to-[#034d79] px-4 text-sm font-bold text-white shadow-md shadow-[#046ca9]/20 transition hover:opacity-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
                                        {isBn ? 'অর্ডার তৈরি হলে ইনভয়েস প্রিন্ট ও প্রক্রিয়াকরণ করা যাবে।' : 'Order and invoice will be generated upon confirmation.'}
                                    </p>
                                </div>
                            </div>

                            {/* Customer Summary Mini Card */}
                            {customerPhone && (
                                <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700 shadow-xs">
                                    <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-[#046ca9]" />
                                        {customerName || 'Customer'}
                                    </p>
                                    <p className="text-slate-500 font-mono">{customerPhone}</p>
                                    {selectedDistrictName && (
                                        <p className="text-slate-500 text-[11px] mt-1">
                                            📍 {[addressLine, selectedAreaName, selectedZoneName, selectedDistrictName].filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>

            {/* ========================================================= */}
            {/* Modal: Variant Selector                                   */}
            {/* ========================================================= */}
            {selectedProductForVariant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    {isBn ? 'পণ্য ভ্যারিয়েন্ট ও স্টক নির্বাচন করুন' : 'Select Product Variant'}
                                </h3>
                                <p className="text-xs text-slate-500">{selectedProductForVariant.product_name}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedProductForVariant(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {(selectedProductForVariant.stocks || []).map((stk: any) => (
                                <div
                                    key={stk.id}
                                    onClick={() => addProductToCart(selectedProductForVariant, stk)}
                                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-[#046ca9] hover:bg-[#046ca9]/5 cursor-pointer transition"
                                >
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">
                                            {stk.variant_name || stk.sku || 'Variant'}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {isBn ? `স্টক: ${stk.quantity || 0} ${stk.unit || 'Pcs'}` : `In Stock: ${stk.quantity || 0} ${stk.unit || 'Pcs'}`}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-extrabold text-[#046ca9]">
                                            ৳{Number(stk.price || 0).toLocaleString()}
                                        </span>
                                        <button
                                            type="button"
                                            className="block text-[10px] font-bold text-[#046ca9] hover:underline"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
