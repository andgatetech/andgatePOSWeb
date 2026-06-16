'use client';
import Loading from '@/app/loading';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';
import {
    useCreatePurchaseReturnMutation,
    useGetPurchaseOrderByIdQuery,
} from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

interface ReturnItemState {
    purchase_order_item_id: number;
    quantity_returned: string;
    reason: string;
    enabled: boolean;
}

const PurchaseReturnPage = () => {
    const { t } = getTranslation();
    const params = useParams();
    const router = useRouter();
    const { formatCurrency } = useCurrency();
    const { currentStoreId } = useCurrentStore();

    const purchaseOrderId = params?.id as string;

    const { data: poResponse, isLoading } = useGetPurchaseOrderByIdQuery(purchaseOrderId);
    const [createReturn, { isLoading: isSubmitting }] = useCreatePurchaseReturnMutation();

    const purchaseOrder = poResponse?.data;

    const [returnItems, setReturnItems] = useState<Record<number, ReturnItemState>>({});
    const [globalReason, setGlobalReason] = useState('');
    const [notes, setNotes] = useState('');
    const [refundType, setRefundType] = useState<'credit' | 'cash'>('credit');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const handleItemToggle = (itemId: number, item: any) => {
        setReturnItems((prev) => {
            if (prev[itemId]) {
                const next = { ...prev };
                delete next[itemId];
                return next;
            }
            return {
                ...prev,
                [itemId]: {
                    purchase_order_item_id: itemId,
                    quantity_returned: String(item.quantity_received),
                    reason: '',
                    enabled: true,
                },
            };
        });
    };

    const handleQtyChange = (itemId: number, value: string) => {
        setReturnItems((prev) => ({
            ...prev,
            [itemId]: { ...prev[itemId], quantity_returned: value },
        }));
    };

    const handleItemReason = (itemId: number, value: string) => {
        setReturnItems((prev) => ({
            ...prev,
            [itemId]: { ...prev[itemId], reason: value },
        }));
    };

    const selectedItems = Object.values(returnItems);
    const totalReturn = purchaseOrder?.items?.reduce((sum: number, item: any) => {
        const ri = returnItems[item.id];
        if (!ri) return sum;
        return sum + parseFloat(ri.quantity_returned || '0') * parseFloat(item.purchase_price || '0');
    }, 0) ?? 0;

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            showErrorDialog(t('purchase_return_no_items') || 'Select at least one item to return');
            return;
        }

        const items = selectedItems.map((ri) => ({
            purchase_order_item_id: ri.purchase_order_item_id,
            quantity_returned: parseFloat(ri.quantity_returned),
            reason: ri.reason || undefined,
        }));

        try {
            await createReturn({
                purchase_order_id: parseInt(purchaseOrderId),
                store_id: currentStoreId,
                refund_type: refundType,
                payment_method: refundType === 'cash' ? paymentMethod : undefined,
                reason: globalReason || undefined,
                notes: notes || undefined,
                items,
            }).unwrap();

            showSuccessDialog(t('purchase_return_success') || 'Purchase return processed successfully');
            router.push('/purchases/list');
        } catch (err: any) {
            const msg = err?.data?.message || t('purchase_return_error') || 'Failed to process return';
            showErrorDialog(msg);
        }
    };

    if (isLoading) return <Loading />;
    if (!purchaseOrder) {
        return (
            <div className="p-6 text-center text-danger">
                {t('purchase_order_not_found') || 'Purchase order not found'}
            </div>
        );
    }

    const canReturn = ['received', 'partially_received'].includes(purchaseOrder.status);

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <Link href="/purchases/list" className="text-gray-500 hover:text-primary">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                        {t('purchase_return_title') || 'Purchase Return'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {purchaseOrder.invoice_number} · {purchaseOrder.supplier?.name || '—'}
                    </p>
                </div>
            </div>

            {!canReturn && (
                <div className="mb-4 rounded-lg bg-warning/10 border border-warning/30 p-4 text-warning text-sm">
                    {t('purchase_return_cannot') || 'Returns can only be made for received purchase orders.'}
                </div>
            )}

            {/* Items table */}
            <div className="mb-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                        <tr>
                            <th className="px-4 py-3 w-10"></th>
                            <th className="px-4 py-3">{t('product') || 'Product'}</th>
                            <th className="px-4 py-3 text-right">{t('received') || 'Received'}</th>
                            <th className="px-4 py-3 text-right">{t('price') || 'Price'}</th>
                            <th className="px-4 py-3 text-right w-32">{t('return_qty') || 'Return Qty'}</th>
                            <th className="px-4 py-3 w-44">{t('reason') || 'Reason'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {purchaseOrder.items?.map((item: any) => {
                            const ri = returnItems[item.id];
                            const maxQty = parseFloat(item.quantity_received);
                            return (
                                <tr key={item.id} className={ri ? 'bg-primary/5' : ''}>
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={!!ri}
                                            disabled={!canReturn || maxQty <= 0}
                                            onChange={() => handleItemToggle(item.id, item)}
                                            className="h-4 w-4 accent-primary"
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                                        {item.product?.product_name || item.product_name_snapshot || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">{item.quantity_received}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(item.purchase_price)}</td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="number"
                                            min={0.01}
                                            max={maxQty}
                                            step="any"
                                            disabled={!ri}
                                            value={ri?.quantity_returned ?? ''}
                                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1 text-right disabled:opacity-40"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            type="text"
                                            disabled={!ri}
                                            placeholder={t('optional') || 'Optional'}
                                            value={ri?.reason ?? ''}
                                            onChange={(e) => handleItemReason(item.id, e.target.value)}
                                            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1 disabled:opacity-40"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Return options */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('refund_type') || 'Refund Type'}
                    </label>
                    <select
                        value={refundType}
                        onChange={(e) => setRefundType(e.target.value as 'credit' | 'cash')}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
                    >
                        <option value="credit">{t('refund_credit') || 'Credit (reduce AP)'}</option>
                        <option value="cash">{t('refund_cash') || 'Cash Refund'}</option>
                    </select>
                </div>

                {refundType === 'cash' && (
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('payment_method') || 'Payment Method'}
                        </label>
                        <input
                            type="text"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            placeholder="cash"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
                        />
                    </div>
                )}

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('reason') || 'Overall Reason'}
                    </label>
                    <input
                        type="text"
                        value={globalReason}
                        onChange={(e) => setGlobalReason(e.target.value)}
                        placeholder={t('optional') || 'Optional'}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('notes') || 'Notes'}
                    </label>
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t('optional') || 'Optional'}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
                    />
                </div>
            </div>

            {/* Summary + submit */}
            <div className="flex flex-col items-end gap-4">
                {selectedItems.length > 0 && (
                    <div className="text-right">
                        <span className="text-sm text-gray-500">{t('total_return') || 'Total Return Amount'}: </span>
                        <span className="text-lg font-bold text-danger">{formatCurrency(totalReturn)}</span>
                    </div>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={!canReturn || isSubmitting || selectedItems.length === 0}
                    className="flex items-center gap-2 rounded-lg bg-danger px-6 py-2.5 text-white font-medium hover:bg-danger/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <RotateCcw size={16} />
                    {isSubmitting
                        ? (t('processing') || 'Processing…')
                        : (t('process_return') || 'Process Return')}
                </button>
            </div>
        </div>
    );
};

export default PurchaseReturnPage;
