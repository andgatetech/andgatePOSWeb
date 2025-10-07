'use client';
import { useGetPurchaseOrderByIdQuery, useUpdatePurchaseOrderMutation } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const ReceiveItemsPage = () => {
    const params = useParams();
    const router = useRouter();
    const purchaseOrderId = params?.id as string;

    // Fetch purchase order details
    const { data: poResponse, isLoading } = useGetPurchaseOrderByIdQuery(purchaseOrderId);
    const [updatePO, { isLoading: isUpdating }] = useUpdatePurchaseOrderMutation();

    const purchaseOrder = poResponse?.data;

    // Local state for received quantities and prices
    const [receivedQuantities, setReceivedQuantities] = useState<Record<number, number>>({});
    const [purchasePrices, setPurchasePrices] = useState<Record<number, number>>({});
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNotes, setPaymentNotes] = useState('');

    // Initialize received quantities and prices from PO data
    useEffect(() => {
        if (purchaseOrder?.items) {
            const quantities: Record<number, number> = {};
            const prices: Record<number, number> = {};

            purchaseOrder.items.forEach((item: any) => {
                // Default to ordered quantity minus already received
                quantities[item.id] = item.quantity_ordered - (item.quantity_received || 0);
                // Convert purchase_price to number (backend might send string)
                prices[item.id] = parseFloat(item.purchase_price) || 0;
            });

            setReceivedQuantities(quantities);
            setPurchasePrices(prices);
        }
    }, [purchaseOrder]);

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

    const handleReceiveItems = async () => {
        if (!purchaseOrder || !purchaseOrder.items) {
            Swal.fire('Error', 'Purchase order data not loaded', 'error');
            return;
        }

        // Validation
        const hasItemsToReceive = purchaseOrder.items.some((item: any) => (receivedQuantities[item.id] || 0) > 0);

        if (!hasItemsToReceive) {
            Swal.fire('Error', 'Please enter quantities to receive', 'error');
            return;
        }

        // Check for new products without prices
        const newProductsWithoutPrice = purchaseOrder.items.filter((item: any) => item.product_id === null && (purchasePrices[item.id] || 0) === 0 && (receivedQuantities[item.id] || 0) > 0);

        if (newProductsWithoutPrice.length > 0) {
            Swal.fire('Error', 'Please set purchase prices for all new products', 'error');
            return;
        }

        // Prepare receive data
        const receiveData = {
            status: 'received',
            items: purchaseOrder.items.map((item: any) => ({
                id: item.id,
                quantity_received: receivedQuantities[item.id] || 0,
                purchase_price: purchasePrices[item.id] || 0,
            })),
            payment_amount: paymentAmount,
            payment_method: paymentMethod,
            payment_notes: paymentNotes,
        };

        try {
            const response = await updatePO({
                id: purchaseOrderId,
                ...receiveData,
            }).unwrap();

            // Show success with details
            const newProductsCreated = response.data?.new_products_created || [];
            const updatedItems = response.data?.items?.filter((i: any) => i.stock_updated) || [];

            Swal.fire({
                icon: 'success',
                title: 'Items Received Successfully!',
                html: `
                    <div class="text-left space-y-3">
                        <div>
                            <p class="font-semibold">✅ Stock Updated</p>
                            <p class="text-sm text-gray-600">${updatedItems.length} products updated</p>
                        </div>
                        ${
                            newProductsCreated.length > 0
                                ? `
                            <div class="mt-3 p-3 bg-blue-50 rounded">
                                <p class="font-semibold text-blue-800">🆕 New Products Created:</p>
                                <ul class="mt-2 space-y-1">
                                    ${newProductsCreated
                                        .map(
                                            (p: any) => `
                                        <li class="text-sm">
                                            <strong>${p.name}</strong> (SKU: ${p.sku}) - ${p.initial_stock} units
                                        </li>
                                    `
                                        )
                                        .join('')}
                                </ul>
                            </div>
                        `
                                : ''
                        }
                        <div class="mt-3 pt-3 border-t">
                            <p class="text-sm">💰 Payment: <strong>৳${Number(response.data.amount_paid || 0).toFixed(2)}</strong></p>
                            <p class="text-sm">📊 Balance: <strong>৳${Number(response.data.amount_due || 0).toFixed(2)}</strong></p>
                            <p class="text-sm">Status: <strong class="text-green-600">${response.data.payment_status.toUpperCase()}</strong></p>
                        </div>
                    </div>
                `,
                confirmButtonText: 'Back to Purchase Orders',
            }).then(() => {
                router.push('/purchases/list');
            });
        } catch (error: any) {
            console.error('Error receiving items:', error);
            Swal.fire('Error', error?.data?.message || 'Failed to receive items', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
        );
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
                <div className="rounded-2xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-green-700 shadow-md">
                                <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <Link href="/purchases/list" className="mb-1 inline-flex items-center text-sm text-primary hover:underline">
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    Back to Purchase Orders
                                </Link>
                                <h1 className="text-2xl font-bold text-gray-900">Receive Items</h1>
                                <p className="text-sm text-gray-500">
                                    Order: {purchaseOrder.invoice_number} | Supplier: {purchaseOrder.supplier?.name || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="rounded-lg bg-blue-50 px-4 py-3">
                                <p className="text-xs text-gray-600">Order Total</p>
                                <p className="text-2xl font-bold text-blue-600">৳{Number(purchaseOrder.grand_total || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Cards */}
                    <div className="grid grid-cols-4 gap-4">
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
                            <p className="mt-1 text-sm font-semibold text-green-600">৳{Number(purchaseOrder.amount_paid || 0).toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-3">
                            <p className="text-xs text-gray-600">Amount Due</p>
                            <p className="mt-1 text-sm font-semibold text-orange-600">৳{Number(purchaseOrder.amount_due || 0).toFixed(2)}</p>
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
                                <th>Type</th>
                                <th>Ordered</th>
                                <th>Already Received</th>
                                <th>Receive Now</th>
                                <th>Purchase Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrder?.items?.map((item: any) => {
                                const remainingToReceive = item.quantity_ordered - (item.quantity_received || 0);
                                const isNewProduct = item.product_id === null;

                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <div>
                                                <p className="font-semibold">{item.product_name_snapshot || item.product_name_temp}</p>
                                                {item.product_description_temp && <p className="text-sm text-gray-500">{item.product_description_temp}</p>}
                                                <p className="text-xs text-gray-400">Unit: {item.unit_temp || 'piece'}</p>
                                            </div>
                                        </td>
                                        <td>
                                            {isNewProduct ? (
                                                <span className="rounded bg-info/20 px-2 py-1 text-xs font-semibold text-info">New Product</span>
                                            ) : (
                                                <span className="rounded bg-success/20 px-2 py-1 text-xs font-semibold text-success">Existing</span>
                                            )}
                                        </td>
                                        <td className="font-semibold">{item.quantity_ordered}</td>
                                        <td>{item.quantity_received || 0}</td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-input w-24"
                                                min="0"
                                                max={remainingToReceive}
                                                value={receivedQuantities[item.id] || 0}
                                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Max: {remainingToReceive}</p>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className={`form-input w-32 ${isNewProduct && !purchasePrices[item.id] ? 'border-orange-400' : ''}`}
                                                min="0"
                                                step="0.01"
                                                value={purchasePrices[item.id] || 0}
                                                onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                                placeholder={isNewProduct ? 'Set price' : ''}
                                            />
                                            {isNewProduct && !purchasePrices[item.id] && <p className="mt-1 text-xs text-orange-600">Price required for new product</p>}
                                        </td>
                                        <td className="font-bold">৳{calculateItemTotal(item.id).toFixed(2)}</td>
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
                    <div className="grid grid-cols-3 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div>
                            <p className="text-sm text-gray-600">Grand Total</p>
                            <p className="text-2xl font-bold text-gray-900">৳{grandTotal.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Already Paid</p>
                            <p className="text-2xl font-bold text-blue-600">৳{Number(purchaseOrder.amount_paid || 0).toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Current Balance</p>
                            <p className="text-2xl font-bold text-orange-600">৳{Number(purchaseOrder.amount_due || 0).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Payment Input Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="mb-2 block text-sm font-semibold">Payment Amount</label>
                            <input
                                type="number"
                                className="form-input"
                                step="0.01"
                                min="0"
                                max={grandTotal}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                placeholder="Enter payment amount"
                            />
                            <p className="mt-1 text-xs text-gray-500">Maximum: ৳{grandTotal.toFixed(2)}</p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold">Payment Method</label>
                            <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="cash">Cash</option>
                                <option value="debit">Debit Card</option>
                                <option value="credit">Credit Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cheque">Cheque</option>
                                <option value="other">Other</option>
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
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Receiving Now:</span>
                                <span className="font-semibold">৳{grandTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Paying Now:</span>
                                <span className="font-semibold text-blue-600">৳{paymentAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-600">Previous Balance:</span>
                                <span className="font-semibold">৳{Number(purchaseOrder.amount_due || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="font-bold">New Balance Due:</span>
                                <span className={`text-lg font-bold ${grandTotal - paymentAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>৳{(grandTotal - paymentAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="panel">
                <div className="flex gap-3">
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
