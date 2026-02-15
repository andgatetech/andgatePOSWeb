'use client';
import Loading from '@/components/layouts/loading';
import { useCurrency } from '@/hooks/useCurrency';
import type { RootState } from '@/store';
import { useGetPurchaseOrderByIdQuery, useUpdatePurchaseOrderMutation } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { ArrowLeft, Calculator, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';

const ReceiveItemsPage = () => {
    const params = useParams();
    const router = useRouter();
    const { formatCurrency } = useCurrency();
    const purchaseOrderId = params?.id as string;

    // Fetch purchase order details
    const { data: poResponse, isLoading } = useGetPurchaseOrderByIdQuery(purchaseOrderId);
    const [updatePO, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();

    const purchaseOrder = poResponse?.data;

    // Local state for received quantities and prices
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

    // Get payment methods from Redux
    const paymentMethods = useSelector((state: RootState) => state.auth.currentStore?.payment_methods || []);
    const activePaymentMethods = paymentMethods.filter((pm) => pm.is_active);

    // Initialize received quantities and prices from PO data
    useEffect(() => {
        if (purchaseOrder?.items) {
            const quantities: Record<number, number> = {};
            const prices: Record<number, number> = {};
            const selling: Record<number, number> = {};
            const taxes: Record<number, number> = {};
            const lowStock: Record<number, number> = {};
            const variants: Record<number, any> = {};

            purchaseOrder.items.forEach((item: any) => {
                // Default to ordered quantity minus already received (but never negative)
                const remaining = item.quantity_ordered - (item.quantity_received || 0);
                quantities[item.id] = Math.max(0, remaining);
                // Convert purchase_price to number (backend might send string)
                prices[item.id] = parseFloat(item.purchase_price) || 0;
                // Initialize selling price from current stock selling price
                selling[item.id] = parseFloat(item.current_stock_selling_price) || 0;
                // Tax rate
                taxes[item.id] = parseFloat(item.tax_rate) || 0;
                // Low stock quantity
                lowStock[item.id] = parseFloat(item.low_stock_quantity) || 5;
                // Variant data
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

    // Set default payment method when payment methods are loaded
    useEffect(() => {
        if (activePaymentMethods.length > 0 && !paymentMethod) {
            setPaymentMethod(activePaymentMethods[0].payment_method_name);
        }
    }, [activePaymentMethods, paymentMethod]);

    const handleQuantityChange = (itemId: number, value: string) => {
        const quantity = parseFloat(value) || 0;
        setReceivedQuantities((prev) => ({
            ...prev,
            [itemId]: quantity,
        }));
    };

    const handlePriceChange = (itemId: number, value: string) => {
        const price = parseFloat(value) || 0;
        setPurchasePrices((prev) => ({
            ...prev,
            [itemId]: price,
        }));
    };

    const handleSellingPriceChange = (itemId: number, value: string) => {
        const price = parseFloat(value) || 0;
        setSellingPrices((prev) => ({
            ...prev,
            [itemId]: price,
        }));
    };

    const handleTaxRateChange = (itemId: number, value: string) => {
        const rate = parseFloat(value) || 0;
        setTaxRates((prev) => ({
            ...prev,
            [itemId]: rate,
        }));
    };

    const handleLowStockChange = (itemId: number, value: string) => {
        const quantity = parseFloat(value) || 0;
        setLowStockQuantities((prev) => ({
            ...prev,
            [itemId]: quantity,
        }));
    };

    const handleVariantChange = (itemId: number, key: string, value: string) => {
        setVariantData((prev) => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                [key]: value,
            },
        }));
    };

    const handleRemoveItem = (itemId: number) => {
        setExcludedItems((prev) => {
            const newSet = new Set(prev);
            newSet.add(itemId);
            return newSet;
        });
    };

    const handleRestoreItem = (itemId: number) => {
        setExcludedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
        });
    };

    const calculateItemTotal = (itemId: number) => {
        return (receivedQuantities[itemId] || 0) * (purchasePrices[itemId] || 0);
    };

    const calculateGrandTotal = () => {
        return (
            purchaseOrder?.items?.reduce((total: number, item: any) => {
                return total + calculateItemTotal(item.id);
            }, 0) || 0
        );
    };

    // WAC (Weighted Average Cost) calculation
    // Formula: ((Current Stock × Current Purchase Price) + (Receiving Qty × New Purchase Price)) / (Current Stock + Receiving Qty)
    const calculateWAC = useCallback(
        (item: any) => {
            const currentStock = parseFloat(item.current_stock_quantity) || 0;
            const currentPurchasePrice = parseFloat(item.current_stock_purchase_price) || 0;
            const receivingQty = receivedQuantities[item.id] || 0;
            const newPurchasePrice = purchasePrices[item.id] || 0;

            if (receivingQty <= 0) return null;

            const totalStock = currentStock + receivingQty;
            if (totalStock <= 0) return null;

            const wac = (currentStock * currentPurchasePrice + receivingQty * newPurchasePrice) / totalStock;
            return wac;
        },
        [receivedQuantities, purchasePrices]
    );

    // Memoize WAC values for all items
    const wacValues = useMemo(() => {
        if (!purchaseOrder?.items) return {};
        const values: Record<number, number | null> = {};
        purchaseOrder.items.forEach((item: any) => {
            values[item.id] = calculateWAC(item);
        });
        return values;
    }, [purchaseOrder?.items, calculateWAC]);

    const handleReceiveItems = async () => {
        if (!purchaseOrder || !purchaseOrder.items) {
            Swal.fire('Error', 'Purchase order data not loaded', 'error');
            return;
        }

        // Filter out excluded items
        const activeItems = purchaseOrder.items.filter((item: any) => !excludedItems.has(item.id));

        // Validation
        const hasItemsToReceive = activeItems.some((item: any) => (receivedQuantities[item.id] || 0) > 0);

        if (!hasItemsToReceive) {
            Swal.fire('Error', 'Please enter quantities to receive', 'error');
            return;
        }

        // Check for new products without prices
        const newProductsWithoutPrice = activeItems.filter((item: any) => item.product_id === null && (purchasePrices[item.id] || 0) === 0 && (receivedQuantities[item.id] || 0) > 0);

        if (newProductsWithoutPrice.length > 0) {
            Swal.fire('Error', 'Please set purchase prices for all new products', 'error');
            return;
        }

        // Check for items without selling prices
        const itemsWithoutSellingPrice = activeItems.filter((item: any) => (sellingPrices[item.id] || 0) === 0 && (receivedQuantities[item.id] || 0) > 0);

        if (itemsWithoutSellingPrice.length > 0) {
            Swal.fire('Error', 'Please set selling prices for all items to receive', 'error');
            return;
        }

        // Prepare receive data - send ALL items with cumulative quantity_received
        // Note: Backend calculates WAC automatically, we only send purchase_price and selling_price
        const receiveData = {
            status: 'received',
            items: purchaseOrder.items.map((item: any) => {
                const isExcluded = excludedItems.has(item.id);
                const alreadyReceived = parseFloat(item.quantity_received || 0);
                const receivingNow = receivedQuantities[item.id] || 0;
                // Send cumulative total: already received + receiving now (or just already received if excluded)
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

        // 📋 Log the data being sent to backend
        console.log('=== RECEIVE PURCHASE ORDER DATA ===');
        console.log('Purchase Order ID:', purchaseOrderId);
        console.log('Data being sent to backend:', JSON.stringify(receiveData, null, 2));
        console.log('===================================');

        try {
            const response = await updatePO({
                id: purchaseOrderId,
                ...receiveData,
            }).unwrap();

            // Simple success message
            Swal.fire({
                icon: 'success',
                title: 'Items Received Successfully!',
                text: 'Purchase order has been updated.',
                confirmButtonText: 'OK',
            }).then(() => {
                router.push('/purchases/list');
            });
        } catch (error: any) {
            console.error('Error receiving items:', error);
            Swal.fire('Error', error?.data?.message || 'Failed to receive items', 'error');
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!purchaseOrder) {
        return (
            <div className="panel">
                <p className="text-center text-red-500">Purchase order not found</p>
            </div>
        );
    }

    const grandTotal = calculateGrandTotal();
    const balanceDue = grandTotal - paymentAmount;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <section className="mb-8">
                <div className="rounded-2xl bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
                    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-green-700 shadow-md">
                                <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <Link href="/purchases/list" className="mb-1 inline-flex items-center text-sm text-primary hover:underline">
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    Back to Purchase Orders
                                </Link>
                                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Receive Items</h1>
                                <p className="text-xs text-gray-500 sm:text-sm">
                                    Order: {purchaseOrder.invoice_number} | Supplier: {purchaseOrder.supplier?.name || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="w-full text-left sm:w-auto sm:text-right">
                            <div className="rounded-lg bg-blue-50 px-4 py-3">
                                <p className="text-xs text-gray-600">Order Total</p>
                                <p className="text-xl font-bold text-blue-600 sm:text-2xl">{formatCurrency(purchaseOrder.grand_total || 0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-3">
                            <p className="text-xs text-gray-600">Order Status</p>
                            <p className="mt-1 text-sm font-semibold text-blue-600">{purchaseOrder.status.replace('_', ' ').toUpperCase()}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-3">
                            <p className="text-xs text-gray-600">Payment Status</p>
                            <p className="mt-1 text-sm font-semibold text-purple-600">{purchaseOrder.payment_status?.toUpperCase()}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-white p-3">
                            <p className="text-xs text-gray-600">Amount Paid</p>
                            <p className="mt-1 text-sm font-semibold text-green-600">{formatCurrency(purchaseOrder.amount_paid || 0)}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-3">
                            <p className="text-xs text-gray-600">Amount Due</p>
                            <p className="mt-1 text-sm font-semibold text-orange-600">{formatCurrency(purchaseOrder.amount_due || 0)}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Items to Receive */}
            <div className="panel">
                <h2 className="mb-5 text-xl font-bold">Items to Receive</h2>

                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Type / Variant</th>
                                <th>Ordered</th>
                                <th>Already Received</th>
                                <th>Receive Now</th>
                                <th>Purchase Price</th>
                                <th>Avg. Cost</th>
                                <th>Selling Price</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrder?.items?.map((item: any) => {
                                const remainingToReceive = item.quantity_ordered - (item.quantity_received || 0);
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
                                                <p className="font-semibold">{item.product_name || item.product_name_at_purchase || 'Unknown Product'}</p>
                                                <p className="text-xs text-gray-400">Unit: {item.unit || 'piece'}</p>
                                                {!isNewProduct && <p className="text-xs text-gray-400">Current Stock: {parseFloat(item.current_stock_quantity) || 0}</p>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="space-y-1">
                                                {isNewProduct ? (
                                                    <span className="rounded bg-info/20 px-2 py-1 text-xs font-semibold text-info">New Product</span>
                                                ) : (
                                                    <span className="rounded bg-success/20 px-2 py-1 text-xs font-semibold text-success">Existing</span>
                                                )}
                                                {hasVariant && (
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-xs font-semibold text-purple-600">Variant: {item.variant_name}</p>
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
                                                    placeholder={item.current_stock_purchase_price || 'Purchase price'}
                                                />
                                                {!isNewProduct && item.current_stock_purchase_price && (
                                                    <span className="mt-0.5 block text-xs text-blue-600">Current: {formatCurrency(item.current_stock_purchase_price)}</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Avg. Cost Column */}
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
                                                            {newPurchasePrice > currentPurchasePrice ? '↑ Cost Up' : '↓ Cost Down'}
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
                                                    placeholder={item.current_stock_selling_price || 'Selling price'}
                                                />
                                                {!isNewProduct && item.current_stock_selling_price && (
                                                    <span className="mt-0.5 block text-xs text-green-600">Current: {formatCurrency(item.current_stock_selling_price)}</span>
                                                )}
                                                {itemWac !== null && currentSellingPrice > 0 && (
                                                    <div className={`mt-1 rounded px-1.5 py-0.5 ${isBelowWac ? 'bg-red-50' : 'bg-green-50'}`}>
                                                        <span className={`text-[11px] font-semibold ${isBelowWac ? 'text-red-600' : 'text-green-600'}`}>
                                                            {isBelowWac ? '⚠ Loss: ' : 'Profit: '}
                                                            {formatCurrency(Math.abs(currentSellingPrice - itemWac))} ({Math.abs(((currentSellingPrice - itemWac) / itemWac) * 100).toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="font-bold">{formatCurrency(calculateItemTotal(item.id))}</td>
                                        <td>
                                            {isExcluded ? (
                                                <button onClick={() => handleRestoreItem(item.id)} className="rounded bg-green-500 p-2 text-white hover:bg-green-600" title="Restore item">
                                                    <ArrowLeft className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button onClick={() => handleRemoveItem(item.id)} className="rounded bg-red-500 p-2 text-white hover:bg-red-600" title="Remove from receiving">
                                                    <span className="text-lg font-bold">×</span>
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

            {/* Payment Section */}
            <div className="panel">
                <h2 className="mb-5 text-xl font-bold">Payment Details</h2>

                <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">
                        <div>
                            <p className="text-sm text-gray-600">Grand Total</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(grandTotal)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Already Paid</p>
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(purchaseOrder.amount_paid || 0)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Current Balance</p>
                            <p className="text-2xl font-bold text-orange-600">{formatCurrency(purchaseOrder.amount_due || 0)}</p>
                        </div>
                    </div>

                    {/* Payment Input Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Payment Amount</label>
                            <input
                                type="number"
                                className="form-input"
                                step="0.01"
                                min="0"
                                max={grandTotal}
                                value={paymentAmount === 0 ? '' : paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                placeholder="Enter payment amount"
                            />
                            <p className="mt-1 text-xs text-gray-500">Maximum: {formatCurrency(grandTotal)}</p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">Payment Method</label>
                            <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                {activePaymentMethods.length > 0 ? (
                                    activePaymentMethods.map((method) => (
                                        <option key={method.id} value={method.payment_method_name}>
                                            {method.payment_method_name.charAt(0).toUpperCase() + method.payment_method_name.slice(1)}
                                        </option>
                                    ))
                                ) : (
                                    <option value="cash">Cash</option>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Payment Notes */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold">Payment Notes (Optional)</label>
                        <textarea className="form-textarea" rows={3} value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="Add any notes about this payment..." />
                    </div>

                    {/* New Balance Preview */}
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-4">
                        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Receiving Now:</span>
                                <span className="font-semibold">{formatCurrency(grandTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Paying Now:</span>
                                <span className="font-semibold text-blue-600">{formatCurrency(paymentAmount)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-600">Previous Balance:</span>
                                <span className="font-semibold">{formatCurrency(purchaseOrder.amount_due || 0)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-bold">New Balance Due:</span>
                                <span className={`text-lg font-bold ${grandTotal - paymentAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>{formatCurrency(grandTotal - paymentAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="panel">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button onClick={handleReceiveItems} className="btn btn-success flex-1" disabled={isUpdating}>
                        {isUpdating ? (
                            <>
                                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-5 w-5" />
                                Receive Items & Update Stock
                            </>
                        )}
                    </button>
                    <Link href="/purchases/list" className="btn btn-outline-secondary">
                        Cancel
                    </Link>
                </div>

                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Clicking &quot;Receive Items&quot; will:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700">
                        <li>✓ Update stock quantities for existing products</li>
                        <li>✓ Calculate Weighted Average Cost (WAC) automatically</li>
                        <li>✓ Automatically create new products in your inventory</li>
                        <li>✓ Record payment information</li>
                        <li>✓ Update purchase order status</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReceiveItemsPage;
