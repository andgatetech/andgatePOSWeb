'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showToast } from '@/lib/toast';
import { useCreateOnlineOrderMutation, useGetEcommerceProductsQuery, useGetOnlineOrderSourcesQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import { ArrowLeft, Globe2, Loader2, Minus, Package, Plus, Search, ShoppingBag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface CartItem {
    stock_id: number;
    product_name: string;
    sku: string;
    price: number;
    quantity: number;
}

interface ProductOption {
    stock_id: number;
    product_name: string;
    sku: string;
    price: number;
    available: number;
    store_id: number;
    category?: string;
    brand?: string;
}

const paymentMethods = ['cod', 'bkash', 'nagad', 'rocket', 'bank', 'card'];

const emptyAddress = {
    name: '',
    phone: '',
    email: '',
    address_line: '',
    city: '',
    zone: '',
    area: '',
    postal_code: '',
};

const CreateOnlineOrderPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [shippingAddress, setShippingAddress] = useState(emptyAddress);
    const [sourceId, setSourceId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [shippingFee, setShippingFee] = useState('0');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<CartItem[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const goBack = () => router.push('/ecommerce/orders');

    useEffect(() => {
        const handle = setTimeout(() => setDebouncedSearch(productSearch.trim()), 350);
        return () => clearTimeout(handle);
    }, [productSearch]);

    const searchQueryParams = useMemo(() => {
        if (!debouncedSearch || !currentStoreId) return null;
        return { store_id: currentStoreId, search: debouncedSearch, per_page: 24 };
    }, [debouncedSearch, currentStoreId]);

    const { data: productData, isFetching: searching } = useGetEcommerceProductsQuery(searchQueryParams ?? {}, { skip: !searchQueryParams });

    const searchResults = useMemo<ProductOption[]>(() => {
        if (!productData || !debouncedSearch) return [];
        const d = productData as any;
        const raw = d?.data?.items ?? d?.items ?? [];
        if (!Array.isArray(raw)) return [];
        return raw
            .map((p: any) => ({
                stock_id: p.primary_stock?.id ?? 0,
                product_name: p.product_name ?? 'Unknown',
                sku: p.primary_stock?.sku ?? '',
                price: parseFloat(p.primary_stock?.price ?? 0),
                available: parseFloat(p.primary_stock?.quantity ?? 0) || 0,
                store_id: p.store_id,
                category: p.category?.name,
                brand: p.brand?.name,
            }))
            .filter((p: ProductOption) => p.stock_id > 0);
    }, [productData, debouncedSearch]);

    const { data: sourcesData } = useGetOnlineOrderSourcesQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const sources: any[] = useMemo(() => {
        const d = sourcesData as any;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    }, [sourcesData]);

    const [createOrder, { isLoading: creating }] = useCreateOnlineOrderMutation();

    const addItem = (product: ProductOption) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.stock_id === product.stock_id);
            if (existing) {
                return prev.map((i) => (i.stock_id === product.stock_id ? { ...i, quantity: i.quantity + 1 } : i));
            }
            return [
                ...prev,
                {
                    stock_id: product.stock_id,
                    product_name: product.product_name,
                    sku: product.sku,
                    price: product.price,
                    quantity: 1,
                },
            ];
        });
        showToast(t('msg_item_added_to_order'), 'success');
    };

    const removeItem = (stockId: number) => {
        setItems((prev) => prev.filter((i) => i.stock_id !== stockId));
    };

    const updateQuantity = (stockId: number, qty: number) => {
        if (qty < 1) return;
        setItems((prev) => prev.map((i) => (i.stock_id === stockId ? { ...i, quantity: qty } : i)));
    };

    const itemSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = itemSubtotal + parseFloat(shippingFee || '0');

    const fillAddressFromCustomer = () => {
        setShippingAddress((prev) => ({
            ...prev,
            name: prev.name || customerName,
            phone: prev.phone || customerPhone,
            email: prev.email || customerEmail,
        }));
    };

    const handleSubmit = async () => {
        if (!customerName.trim() || !customerPhone.trim()) {
            showErrorDialog(t('msg_required_customer'));
            return;
        }
        if (!shippingAddress.address_line.trim() || !shippingAddress.city.trim()) {
            showErrorDialog(t('msg_required_address'));
            return;
        }
        if (items.length === 0) {
            showErrorDialog(t('msg_required_items'));
            return;
        }
        if (!sourceId) {
            showErrorDialog(t('msg_required_source'));
            return;
        }

        try {
            await createOrder({
                store_id: currentStoreId,
                customer: {
                    name: customerName,
                    phone: customerPhone,
                    email: customerEmail || undefined,
                },
                shipping_address: {
                    name: shippingAddress.name || customerName,
                    phone: shippingAddress.phone || customerPhone,
                    email: shippingAddress.email || customerEmail || undefined,
                    address_line: shippingAddress.address_line,
                    city: shippingAddress.city,
                    zone: shippingAddress.zone || undefined,
                    area: shippingAddress.area || undefined,
                    postal_code: shippingAddress.postal_code || undefined,
                },
                items: items.map((i) => ({
                    stock_id: i.stock_id,
                    quantity: i.quantity,
                })),
                payment_method: paymentMethod,
                source_id: parseInt(sourceId, 10),
                shipping_fee: parseFloat(shippingFee || '0') || undefined,
                notes: notes || undefined,
            }).unwrap();
            showToast(t('msg_order_created'), 'success');
            router.push('/ecommerce/orders');
        } catch (err: any) {
            const msg = err?.data?.message || err?.data?.errors?.items || t('msg_error_generic');
            showErrorDialog(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    };

    return (
        <div className="space-y-5">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                        <button
                            type="button"
                            aria-label={t('ecommerce_detail_back_to_orders')}
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                            onClick={goBack}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                                <Globe2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{t('lbl_create_online_order')}</h1>
                                <p className="text-sm text-gray-500">{t('lbl_create_online_order_desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-5">
                    {/* Customer Info */}
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t('lbl_customer_info')}</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_name')} *</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    placeholder={t('ph_customer_name')}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_phone')} *</label>
                                <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    placeholder={t('ph_customer_phone')}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_email')}</label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Shipping Address */}
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-700">{t('lbl_shipping_address')} *</h3>
                            <button type="button" onClick={fillAddressFromCustomer} className="text-xs text-primary hover:underline">
                                {t('lbl_copy_from_customer')}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_recipient_name')} *</label>
                                <input
                                    type="text"
                                    value={shippingAddress.name}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_recipient_phone')} *</label>
                                <input
                                    type="text"
                                    value={shippingAddress.phone}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_address_line')} *</label>
                                <input
                                    type="text"
                                    value={shippingAddress.address_line}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_city')} *</label>
                                <input
                                    type="text"
                                    value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_zone')}</label>
                                <input
                                    type="text"
                                    value={shippingAddress.zone}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, zone: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_area')}</label>
                                <input
                                    type="text"
                                    value={shippingAddress.area}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, area: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_postal_code')}</label>
                                <input
                                    type="text"
                                    value={shippingAddress.postal_code}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Source + Payment */}
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_source')} *</label>
                                <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                                    <option value="">{t('lbl_select_source')}</option>
                                    {sources.map((s: any) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_payment_method')}</label>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                                    {paymentMethods.map((pm) => (
                                        <option key={pm} value={pm}>
                                            {pm.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_shipping_fee')}</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={shippingFee}
                                    onChange={(e) => setShippingFee(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Product Search */}
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t('lbl_products')}</h3>
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />}
                            <input
                                type="text"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-9 text-sm"
                                placeholder={t('ph_search_products')}
                            />
                        </div>

                        {debouncedSearch && !searching && searchResults.length === 0 && (
                            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">{t('msg_no_products_found')}</p>
                        )}

                        {searchResults.length > 0 && (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {searchResults.map((product) => (
                                    <button
                                        key={product.stock_id}
                                        type="button"
                                        onClick={() => addItem(product)}
                                        className="group flex flex-col rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-primary/40 hover:shadow-md"
                                    >
                                        <div className="mb-2 flex items-start justify-between gap-2">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50">
                                                <Package className="h-5 w-5 text-gray-300" />
                                            </div>
                                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white opacity-0 transition group-hover:opacity-100">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        </div>
                                        <p className="line-clamp-2 text-sm font-semibold text-gray-800">{product.product_name}</p>
                                        {(product.category || product.brand) && (
                                            <p className="mt-0.5 truncate text-xs text-gray-400">{[product.category, product.brand].filter(Boolean).join(' · ')}</p>
                                        )}
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm font-bold text-primary">৳{product.price.toLocaleString()}</span>
                                            <span
                                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                                    product.available > 10 ? 'bg-green-50 text-green-600' : product.available > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500'
                                                }`}
                                            >
                                                {t('lbl_stock')}: {product.available}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Notes */}
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <label className="mb-1 block text-xs font-medium text-gray-500">{t('lbl_notes')}</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder={t('ph_order_notes')}
                        />
                    </section>
                </div>

                {/* Order Summary sidebar */}
                <aside className="space-y-5">
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold text-gray-700">{t('lbl_order_items')}</h3>
                        </div>

                        {items.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">{t('msg_no_items_yet')}</p>
                        ) : (
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <div key={item.stock_id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-800">{item.product_name}</p>
                                            <p className="text-xs text-gray-400">
                                                ৳{item.price.toLocaleString()} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <button type="button" onClick={() => updateQuantity(item.stock_id, item.quantity - 1)} className="rounded p-0.5 text-gray-400 hover:bg-gray-100">
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-6 text-center text-sm font-medium text-gray-700">{item.quantity}</span>
                                                <button type="button" onClick={() => updateQuantity(item.stock_id, item.quantity + 1)} className="rounded p-0.5 text-gray-400 hover:bg-gray-100">
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <button type="button" onClick={() => removeItem(item.stock_id)} className="rounded p-1 text-gray-400 hover:text-red-500">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('lbl_subtotal')}:</span>
                                <span className="font-semibold text-gray-800">৳{itemSubtotal.toLocaleString()}</span>
                            </div>
                            {parseFloat(shippingFee || '0') > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('lbl_shipping')}:</span>
                                    <span className="font-semibold text-gray-800">৳{parseFloat(shippingFee || '0').toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
                                <span className="text-gray-700">{t('lbl_total')}:</span>
                                <span className="text-primary">৳{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={creating}
                                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                            >
                                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                                {t('lbl_create_order')}
                            </button>
                            <button type="button" onClick={goBack} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                {t('lbl_cancel')}
                            </button>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default CreateOnlineOrderPage;
