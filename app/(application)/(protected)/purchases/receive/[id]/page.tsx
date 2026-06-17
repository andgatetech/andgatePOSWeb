'use client';
import Loading from '@/app/loading';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import type { RootState } from '@/store';
import { useGetPurchaseOrderByIdQuery, useUpdatePurchaseOrderMutation } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { ArrowLeft, Calculator, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

const ReceiveItemsPage = () => {
    const { t } = getTranslation();
    const params = useParams();
    const router = useRouter();
    const { formatCurrency } = useCurrency();
    const purchaseOrderId = params?.id as string;

    const { data: poResponse, isLoading } = useGetPurchaseOrderByIdQuery(purchaseOrderId);
    const [updatePO, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();

    const purchaseOrder = poResponse?.data;

    const [receivedQuantities, setReceivedQuantities] = useState<Record<number, number>>({});
    const [purchasePrices, setPurchasePrices] = useState<Record<number, number>>({});
    const [sellingPrices, setSellingPrices] = useState<Record<number, number>>({});
    const [taxRates, setTaxRates] = useState<Record<number, number>>({});
    const [lowStockQuantities, setLowStockQuantities] = useState<Record<number, number>>({});
    const [variantData, setVariantData] = useState<Record<number, any>>({});
    const [excludedItems, setExcludedItems] = useState<Set<number>>(new Set());
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');

    const paymentMethods = useSelector((state: RootState) => state.auth.currentStore?.payment_methods || []);
    const activePaymentMethods = paymentMethods.filter((pm) => pm.is_active);

    useEffect(() => {
        if (purchaseOrder?.items) {
            const quantities: Record<number, number> = {};
            const prices: Record<number, number> = {};
            const selling: Record<number, number> = {};
            const taxes: Record<number, number> = {};
            const lowStock: Record<number, number> = {};
            const variants: Record<number, any> = {};

            purchaseOrder.items.forEach((item: any) => {
                const remaining = item.quantity_ordered - (item.quantity_received || 0);
                quantities[item.id] = Math.max(0, remaining);
                prices[item.id] = parseFloat(item.purchase_price) || 0;
                selling[item.id] = parseFloat(item.current_stock_selling_price) || 0;
                taxes[item.id] = parseFloat(item.tax_rate) || 0;
                lowStock[item.id] = parseFloat(item.low_stock_quantity) || 5;
                variants[item.id] = item.variant_data || {};
            });

            setReceivedQuantities(quantities);
            setPurchasePrices(prices);
            setSellingPrices(selling);
            setTaxRates(taxes);
            setLowStockQuantities(lowStock);
            setVariantData(variants);
        }
    }, [purchaseOrder]);

    useEffect(() => {
        if (activePaymentMethods.length > 0 && !paymentMethod) {
            setPaymentMethod(activePaymentMethods[0].payment_method_name);
        }
    }, [activePaymentMethods, paymentMethod]);

    const handleQuantityChange = (itemId: number, value: string) => {
        setReceivedQuantities((prev) => ({ ...prev, [itemId]: parseFloat(value) || 0 }));
    };

    const handlePriceChange = (itemId: number, value: string) => {
        setPurchasePrices((prev) => ({ ...prev, [itemId]: parseFloat(value) || 0 }));
    };

    const handleSellingPriceChange = (itemId: number, value: string) => {
        setSellingPrices((prev) => ({ ...prev, [itemId]: parseFloat(value) || 0 }));
    };

    const handleTaxRateChange = (itemId: number, value: string) => {
        setTaxRates((prev) => ({ ...prev, [itemId]: parseFloat(value) || 0 }));
    };

    const handleLowStockChange = (itemId: number, value: string) => {
        setLowStockQuantities((prev) => ({ ...prev, [itemId]: parseFloat(value) || 0 }));
    };

    const handleVariantChange = (itemId: number, key: string, value: string) => {
        setVariantData((prev) => ({ ...prev, [itemId]: { ...prev[itemId], [key]: value } }));
    };

    const handleRemoveItem = (itemId: number) => {
        setExcludedItems((prev) => { const s = new Set(prev); s.add(itemId); return s; });
    };

    const handleRestoreItem = (itemId: number) => {
        setExcludedItems((prev) => { const s = new Set(prev); s.delete(itemId); return s; });
    };

    const calculateItemTotal = (itemId: number) => {
        return (receivedQuantities[itemId] || 0) * (purchasePrices[itemId] || 0);
    };

    const calculateGrandTotal = () => {
        return purchaseOrder?.items?.reduce((total: number, item: any) => total + calculateItemTotal(item.id), 0) || 0;
    };

    const calculateWAC = useCallback(
        (item: any) => {
            const currentStock = parseFloat(item.current_stock_quantity) || 0;
            const currentPurchasePrice = parseFloat(item.current_stock_purchase_price) || 0;
            const receivingQty = receivedQuantities[item.id] || 0;
            const newPurchasePrice = purchasePrices[item.id] || 0;

            if (receivingQty <= 0) return null;
            const totalStock = currentStock + receivingQty;
            if (totalStock <= 0) return null;

            return (currentStock * currentPurchasePrice + receivingQty * newPurchasePrice) / totalStock;
        },
        [receivedQuantities, purchasePrices]
    );

    const wacValues = useMemo(() => {
        if (!purchaseOrder?.items) return {};
        const values: Record<number, number | null> = {};
        purchaseOrder.items.forEach((item: any) => { values[item.id] = calculateWAC(item); });
        return values;
    }, [purchaseOrder?.items, calculateWAC]);

    const handleReceiveItems = async () => {
        if (!purchaseOrder || !purchaseOrder.items) {
            showErrorDialog(t('msg_po_data_not_loaded'));
            return;
        }

        const activeItems = purchaseOrder.items.filter((item: any) => !excludedItems.has(item.id));
        const hasItemsToReceive = activeItems.some((item: any) => (receivedQuantities[item.id] || 0) > 0);

        if (!hasItemsToReceive) {
            showErrorDialog(t('msg_enter_quantities'));
            return;
        }

        const newProductsWithoutPrice = activeItems.filter(
            (item: any) => item.product_id === null && (purchasePrices[item.id] || 0) === 0 && (receivedQuantities[item.id] || 0) > 0
        );
        if (newProductsWithoutPrice.length > 0) {
            showErrorDialog(t('msg_set_purchase_prices'));
            return;
        }

        const itemsWithoutSellingPrice = activeItems.filter(
            (item: any) => (sellingPrices[item.id] || 0) === 0 && (receivedQuantities[item.id] || 0) > 0
        );
        if (itemsWithoutSellingPrice.length > 0) {
            showErrorDialog(t('msg_set_selling_prices'));
            return;
        }

        const receiveData = {
            status: 'received',
            items: purchaseOrder.items.map((item: any) => {
                const isExcluded = excludedItems.has(item.id);
                const alreadyReceived = parseFloat(item.quantity_received || 0);
                const receivingNow = receivedQuantities[item.id] || 0;
                const totalReceived = isExcluded ? alreadyReceived : alreadyReceived + receivingNow;
                return {
                    id: item.id,
                    quantity_received: totalReceived,
                    purchase_price: purchasePrices[item.id] || 0,
                    selling_price: sellingPrices[item.id] || 0,
                    tax_rate: taxRates[item.id] || 0,
                    tax_included: false,
                    low_stock_quantity: lowStockQuantities[item.id] || 5,
                    variant_data: Object.keys(variantData[item.id] || {}).length > 0 ? variantData[item.id] : undefined,
                };
            }),
            payment_amount: paymentAmount,
            payment_method: paymentMethod,
            payment_notes: paymentNotes,
        };

        try {
            await updatePO({ id: purchaseOrderId, ...receiveData }).unwrap();
            showSuccessDialog(t('msg_items_received_success'));
            router.push('/purchases/list');
        } catch (error: any) {
            showErrorDialog(error?.data?.message || t('msg_error_generic'));
        }
    };

    if (isLoading) return <Loading />;

    if (!purchaseOrder) {
        return (
            <div className="panel">
                <p className="text-center text-red-500">{t('lbl_purchase_order_not_found')}</p>
            </div>
        );
    }

    const grandTotal = calculateGrandTotal();
    const supplierName = purchaseOrder.supplier?.name || t('lbl_na');

    const receiveBullets = [
        t('msg_receive_bullet_1'),
        t('msg_receive_bullet_2'),
        t('msg_receive_bullet_3'),
        t('msg_receive_bullet_4'),
        t('msg_receive_bullet_5'),
    ];

    return (
        <div className="space-y-6">
            <section className="mb-6">
                <div>
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <Link href="/purchases/list" className="mb-1 inline-flex items-center text-sm text-[#046ca9] hover:underline">
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    {t('lbl_back_to_purchase_orders')}
                                </Link>
                                <h1 className="text-xl font-bold text-gray-900">{t('lbl_receive_items')}</h1>
                                <p className="text-xs text-gray-500 sm:text-sm">
                                    {t('lbl_order')}: {purchaseOrder.invoice_number} | {t('lbl_supplier')}: {supplierName}
                                </p>
                            </div>
                        </div>
                        <div className="w-full text-left sm:w-auto sm:text-right">
                            <div className="rounded-lg bg-blue-50 px-4 py-3">
                                <p className="text-xs text-gray-600">{t('lbl_order_total')}</p>
                                <p className="text-xl font-bold text-blue-600 sm:text-2xl">{formatCurrency(purchaseOrder.grand_total || 0)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-3">
                            <p className="text-xs text-gray-600">{t('lbl_order_status')}</p>
                            <p className="mt-1 text-sm font-semibold text-blue-600">{purchaseOrder.status.replace('_', ' ').toUpperCase()}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-3">
                            <p className="text-xs text-gray-600">{t('lbl_payment_status')}</p>
                            <p className="mt-1 text-sm font-semibold text-purple-600">{purchaseOrder.payment_status?.toUpperCase()}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-white p-3">
                            <p className="text-xs text-gray-600">{t('lbl_amount_paid')}</p>
                            <p className="mt-1 text-sm font-semibold text-green-600">{formatCurrency(purchaseOrder.amount_paid || 0)}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-3">
                            <p className="text-xs text-gray-600">{t('lbl_amount_due')}</p>
                            <p className="mt-1 text-sm font-semibold text-orange-600">{formatCurrency(purchaseOrder.amount_due || 0)}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="panel">
                <h2 className="mb-5 text-xl font-bold">{t('lbl_items_to_receive')}</h2>
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>{t('lbl_product')}</th>
                                <th>{t('lbl_type')} / {t('lbl_variant')}</th>
                                <th>{t('status_ordered')}</th>
                                <th>{t('lbl_already_received')}</th>
                                <th>{t('lbl_receive_now')}</th>
                                <th>{t('lbl_purchase_price')}</th>
                                <th>{t('lbl_avg_cost')}</th>
                                <th>{t('lbl_selling_price')}</th>
                                <th>{t('lbl_total')}</th>
                                <th>{t('lbl_action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrder?.items?.map((item: any) => {
                                const isNewProduct = item.product_id === null;
                                const hasVariant = item.is_variant && item.variant_data;
                                const isExcluded = excludedItems.has(item.id);
                                const itemWac = wacValues[item.id];
                                const currentPurchasePrice = parseFloat(item.current_stock_purchase_price) || 0;
                                const newPurchasePrice = purchasePrices[item.id] || 0;
                                const priceChanged = !isNewProduct && newPurchasePrice !== currentPurchasePrice;
                                const currentSellingPrice = sellingPrices[item.id] || 0;
                                const isBelowWac = itemWac !== null && currentSellingPrice > 0 && currentSellingPrice < itemWac;

                                return (
                                    <tr key={item.id} className={isExcluded ? 'bg-gray-50 opacity-50' : ''}>
                                        <td>
                                            <div>
                                                <p className="font-semibold">{item.product_name || item.product_name_at_purchase || t('lbl_unknown_product')}</p>
                                                <p className="text-xs text-gray-400">{t('lbl_unit')}: {item.unit || t('lbl_piece')}</p>
                                                {!isNewProduct && <p className="text-xs text-gray-400">{t('lbl_current_stock')}: {parseFloat(item.current_stock_quantity) || 0}</p>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="space-y-1">
                                                {isNewProduct ? (
                                                    <span className="rounded bg-info/20 px-2 py-1 text-xs font-semibold text-info">{t('lbl_new_product')}</span>
                                                ) : (
                                                    <span className="rounded bg-success/20 px-2 py-1 text-xs font-semibold text-success">{t('lbl_existing')}</span>
                                                )}
                                                {hasVariant && (
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-xs font-semibold text-purple-600">{t('lbl_variant')}: {item.variant_name}</p>
                                                        {Object.entries(variantData[item.id] || item.variant_data || {}).map(([key, value]: [string, any]) => (
                                                            <div key={key} className="flex items-center gap-1">
                                                                <span className="text-xs text-gray-500">{key}:</span>
                                                                <input
                                                                    type="text"
                                                                    className="form-input h-6 w-20 px-1 text-xs"
                                                                    value={variantData[item.id]?.[key] || value || ''}
                                                                    onChange={(e) => handleVariantChange(item.id, key, e.target.value)}
                                                                    placeholder={key}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="font-semibold">{item.quantity_ordered}</td>
                                        <td>{item.quantity_received || 0}</td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-input w-24"
                                                min="0"
                                                step="1"
                                                value={receivedQuantities[item.id] === 0 ? '' : receivedQuantities[item.id] ?? ''}
                                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="form-input w-32"
                                                    min="0"
                                                    step="0.01"
                                                    value={purchasePrices[item.id] === 0 ? '' : purchasePrices[item.id] ?? ''}
                                                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                                    placeholder={String(item.current_stock_purchase_price || t('lbl_purchase_price'))}
                                                />
                                                {!isNewProduct && item.current_stock_purchase_price && (
                                                    <span className="mt-0.5 block text-xs text-blue-600">{t('lbl_current')}: {formatCurrency(item.current_stock_purchase_price)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {itemWac !== null ? (
                                                <div className="min-w-[100px]">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calculator className="h-3.5 w-3.5 text-indigo-500" />
                                                        <span className="text-sm font-bold text-indigo-700">{formatCurrency(itemWac)}</span>
                                                    </div>
                                                    {priceChanged && (
                                                        <span
                                                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                                newPurchasePrice > currentPurchasePrice ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                            }`}
                                                        >
                                                            {newPurchasePrice > currentPurchasePrice ? `↑ ${t('lbl_cost_up')}` : `↓ ${t('lbl_cost_down')}`}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className={`form-input w-32 ${isBelowWac ? 'border-red-400 bg-red-50' : ''}`}
                                                    min="0"
                                                    step="0.01"
                                                    value={sellingPrices[item.id] === 0 ? '' : sellingPrices[item.id] ?? ''}
                                                    onChange={(e) => handleSellingPriceChange(item.id, e.target.value)}
                                                    placeholder={String(item.current_stock_selling_price || t('lbl_selling_price'))}
                                                />
                                                {!isNewProduct && item.current_stock_selling_price && (
                                                    <span className="mt-0.5 block text-xs text-green-600">{t('lbl_current')}: {formatCurrency(item.current_stock_selling_price)}</span>
                                                )}
                                                {itemWac !== null && currentSellingPrice > 0 && (
                                                    <div className={`mt-1 rounded px-1.5 py-0.5 ${isBelowWac ? 'bg-red-50' : 'bg-green-50'}`}>
                                                        <span className={`text-[11px] font-semibold ${isBelowWac ? 'text-red-600' : 'text-green-600'}`}>
                                                            {isBelowWac ? `⚠ ${t('lbl_loss')}: ` : `${t('lbl_profit')}: `}
                                                            {formatCurrency(Math.abs(currentSellingPrice - itemWac))} ({Math.abs(((currentSellingPrice - itemWac) / itemWac) * 100).toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="font-bold">{formatCurrency(calculateItemTotal(item.id))}</td>
                                        <td>
                                            {isExcluded ? (
                                                <button onClick={() => handleRestoreItem(item.id)} className="rounded bg-green-500 p-2 text-white hover:bg-green-600" title={t('lbl_restore_item')}>
                                                    <ArrowLeft className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleRemoveItem(item.id)} className="rounded bg-red-500 p-2 text-white hover:bg-red-600" title={t('lbl_remove_from_receiving')}>
                                                    <span className="text-lg font-bold">&times;</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="panel">
                <h2 className="mb-5 text-xl font-bold">{t('lbl_payment_details')}</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">
                        <div>
                            <p className="text-sm text-gray-600">{t('lbl_grand_total')}</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(grandTotal)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{t('lbl_already_paid')}</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(purchaseOrder.amount_paid || 0)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">{t('lbl_current_balance')}</p>
                            <p className="text-2xl font-bold text-orange-600">{formatCurrency(purchaseOrder.amount_due || 0)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">{t('lbl_payment_amount')}</label>
                            <input
                                type="number"
                                className="form-input"
                                step="0.01"
                                min="0"
                                max={grandTotal}
                                value={paymentAmount === 0 ? '' : paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                placeholder={t('placeholder_payment_amount')}
                            />
                            <p className="mt-1 text-xs text-gray-500">{t('lbl_maximum')}: {formatCurrency(grandTotal)}</p>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-semibold">{t('lbl_payment_method')}</label>
                            <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                {activePaymentMethods.length > 0 ? (
                                    activePaymentMethods.map((method) => (
                                        <option key={method.id} value={method.payment_method_name}>
                                            {method.payment_method_name.charAt(0).toUpperCase() + method.payment_method_name.slice(1)}
                                        </option>
                                    ))
                                ) : (
                                    <option value="cash">{t('lbl_cash')}</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold">{t('lbl_payment_notes_optional')}</label>
                        <textarea className="form-textarea" rows={3} value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder={t('placeholder_payment_notes')} />
                    </div>

                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-4">
                        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('lbl_receiving_now')}:</span>
                                <span className="font-semibold">{formatCurrency(grandTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('lbl_paying_now')}:</span>
                                <span className="font-semibold text-blue-600">{formatCurrency(paymentAmount)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-600">{t('lbl_previous_balance')}:</span>
                                <span className="font-semibold">{formatCurrency(purchaseOrder.amount_due || 0)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-bold">{t('lbl_new_balance_due')}:</span>
                                <span className={`text-lg font-bold ${grandTotal - paymentAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>{formatCurrency(grandTotal - paymentAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="panel">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button onClick={handleReceiveItems} className="btn btn-success flex-1" disabled={isUpdating}>
                        {isUpdating ? (
                            <>
                                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                                {t('lbl_processing')}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-5 w-5" />
                                {t('lbl_receive_items_update_stock')}
                            </>
                        )}
                    </button>
                    <Link href="/purchases/list" className="btn btn-outline-secondary">
                        {t('lbl_cancel')}
                    </Link>
                </div>

                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                        <strong>{t('lbl_note')}:</strong> {t('purchase_receive_click_note')}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700">
                        {receiveBullets.map((bullet, i) => (
                            <li key={i}>&#10003; {bullet}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReceiveItemsPage;
