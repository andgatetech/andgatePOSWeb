'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import { useCreateOnlineOrderMutation, useGetEcommerceProductsQuery, useGetOnlineOrderSourcesQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import { Loader2, Minus, Plus, Search, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

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
}

interface CreateOnlineOrderModalProps {
    open: boolean;
    onClose: () => void;
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

const CreateOnlineOrderModal = ({ open, onClose }: CreateOnlineOrderModalProps) => {
    const { t } = getTranslation();
    const { currentStoreId, currentStore } = useCurrentStore();

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
    const [searchCounter, setSearchCounter] = useState(0);

    const searchQueryParams = useMemo(() => {
        if (searchCounter === 0 || !productSearch.trim() || !currentStoreId) return null;
        return { store_id: currentStoreId, search: productSearch.trim(), per_page: 20 };
    }, [searchCounter, productSearch, currentStoreId]);

    const { data: productData, isFetching: searching } = useGetEcommerceProductsQuery(
        searchQueryParams ?? {},
        { skip: !searchQueryParams }
    );

    const searchResults = useMemo<ProductOption[]>(() => {
        if (!productData || searchCounter === 0) return [];
        const d = productData as any;
        const raw = d?.data?.items ?? d?.items ?? [];
        if (!Array.isArray(raw)) return [];
        return raw.map((p: any) => ({
            stock_id: p.primary_stock?.id ?? 0,
            product_name: p.product_name ?? 'Unknown',
            sku: p.primary_stock?.sku ?? '',
            price: parseFloat(p.primary_stock?.price ?? 0),
            available: parseFloat(p.primary_stock?.quantity ?? 0) || 0,
            store_id: p.store_id,
        })).filter((p: ProductOption) => p.stock_id > 0);
    }, [productData, searchCounter]);

    const { data: sourcesData } = useGetOnlineOrderSourcesQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId || !open }
    );
    const sources: any[] = useMemo(() => {
        const d = sourcesData as any;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d)) return d;
        return [];
    }, [sourcesData]);

    const [createOrder, { isLoading: creating }] = useCreateOnlineOrderMutation();

    const handleSearchProducts = useCallback(() => {
        if (!productSearch.trim() || !currentStoreId) return;
        setSearchCounter((prev) => prev + 1);
    }, [productSearch, currentStoreId]);

    const addItem = useCallback((product: ProductOption) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.stock_id === product.stock_id);
            if (existing) {
                return prev.map((i) =>
                    i.stock_id === product.stock_id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
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
    }, []);

    const removeItem = useCallback((stockId: number) => {
        setItems((prev) => prev.filter((i) => i.stock_id !== stockId));
    }, []);

    const updateQuantity = useCallback((stockId: number, qty: number) => {
        if (qty < 1) return;
        setItems((prev) =>
            prev.map((i) => (i.stock_id === stockId ? { ...i, quantity: qty } : i))
        );
    }, []);

    const itemSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = itemSubtotal + parseFloat(shippingFee || '0');

    const fillAddressFromCustomer = useCallback(() => {
        setShippingAddress((prev) => ({
            ...prev,
            name: prev.name || customerName,
            phone: prev.phone || customerPhone,
            email: prev.email || customerEmail,
        }));
    }, [customerName, customerPhone, customerEmail]);

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
            showSuccessDialog(t('msg_order_created'));
            onClose();
        } catch (err: any) {
            const msg = err?.data?.message || err?.data?.errors?.items || t('msg_error_generic');
            showErrorDialog(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-12 pb-12">
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
                <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('lbl_create_online_order')}</h2>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
                    {/* Customer Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('lbl_customer_info')}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_name')} *</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    placeholder={t('ph_customer_name')}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_phone')} *</label>
                                <input
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    placeholder={t('ph_customer_phone')}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_email')}</label>
                                <input
                                    type="email"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    placeholder="email@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('lbl_shipping_address')} *</h3>
                            <button
                                type="button"
                                onClick={fillAddressFromCustomer}
                                className="text-xs text-primary hover:underline"
                            >
                                {t('lbl_copy_from_customer')}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_recipient_name')} *</label>
                                <input
                                    type="text"
                                    value={shippingAddress.name}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_recipient_phone')} *</label>
                                <input
                                    type="text"
                                    value={shippingAddress.phone}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_address_line')} *</label>
                                <input
                                    type="text"
                                    value={shippingAddress.address_line}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_city')} *</label>
                                <input
                                    type="text"
                                    value={shippingAddress.city}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_zone')}</label>
                                <input
                                    type="text"
                                    value={shippingAddress.zone}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, zone: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_area')}</label>
                                <input
                                    type="text"
                                    value={shippingAddress.area}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, area: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_postal_code')}</label>
                                <input
                                    type="text"
                                    value={shippingAddress.postal_code}
                                    onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Source + Payment */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_source')} *</label>
                            <select
                                value={sourceId}
                                onChange={(e) => setSourceId(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                <option value="">{t('lbl_select_source')}</option>
                                {sources.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_payment_method')}</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                {paymentMethods.map((pm) => (
                                    <option key={pm} value={pm}>{pm.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_shipping_fee')}</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={shippingFee}
                                onChange={(e) => setShippingFee(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Product Search */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('lbl_products')}</h3>
                        <div className="flex gap-2 mb-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchProducts()}
                                    className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    placeholder={t('ph_search_products')}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSearchProducts}
                                disabled={searching}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : t('lbl_search')}
                            </button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
                                {searchResults.map((product) => (
                                    <button
                                        key={product.stock_id}
                                        type="button"
                                        onClick={() => addItem(product)}
                                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                                    >
                                        <div>
                                            <span className="font-medium text-gray-800 dark:text-gray-100">{product.product_name}</span>
                                            {product.sku && <span className="ml-2 text-xs text-gray-400">({product.sku})</span>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500">{t('lbl_stock')}: {product.available}</span>
                                            <span className="text-sm font-semibold text-success">৳{product.price.toLocaleString()}</span>
                                            <Plus className="h-4 w-4 text-primary" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    {items.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('lbl_order_items')}</h3>
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <div
                                        key={item.stock_id}
                                        className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                                {item.product_name}
                                            </p>
                                            <p className="text-xs text-gray-400">৳{item.price.toLocaleString()} × {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.stock_id, item.quantity - 1)}
                                                    className="rounded p-0.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.stock_id, item.quantity + 1)}
                                                    className="rounded p-0.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                                ৳{(item.price * item.quantity).toLocaleString()}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.stock_id)}
                                                className="rounded p-1 text-gray-400 hover:text-red-500"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex justify-between text-sm font-semibold">
                                <span className="text-gray-500">{t('lbl_subtotal')}:</span>
                                <span className="text-gray-800 dark:text-gray-100">৳{itemSubtotal.toLocaleString()}</span>
                            </div>
                            {parseFloat(shippingFee || '0') > 0 && (
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-500">{t('lbl_shipping')}:</span>
                                    <span className="text-gray-800 dark:text-gray-100">৳{parseFloat(shippingFee || '0').toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-gray-700 dark:text-gray-200">{t('lbl_total')}:</span>
                                <span className="text-primary">৳{total.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('lbl_notes')}</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            placeholder={t('ph_order_notes')}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t px-6 py-4 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        {t('lbl_cancel')}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={creating}
                        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                        {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                        {t('lbl_create_order')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateOnlineOrderModal;
