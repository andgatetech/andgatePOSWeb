'use client';

import { useMemo, useState } from 'react';
import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useApproveStockCountMutation, useCreateStockCountMutation, useGetAllProductsQuery, useGetStockCountsQuery } from '@/store/features/Product/productApi';
import { CheckCircle2, ClipboardList, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

type CountLine = {
    product_stock_id: number;
    label: string;
    sku?: string;
    system_quantity: number;
    counted_quantity: number;
};

const normalizeProducts = (response: any) => {
    const payload = response?.data?.items || response?.data || response?.items || [];
    return Array.isArray(payload) ? payload : [];
};

export default function StockCountPage() {
    const { t } = getTranslation();
    const { formatNumber } = useCurrency();
    const { currentStoreId } = useCurrentStore();
    const [lines, setLines] = useState<CountLine[]>([]);
    const [title, setTitle] = useState('');
    const [createStockCount, { isLoading: isCreating }] = useCreateStockCountMutation();
    const [approveStockCount, { isLoading: isApproving }] = useApproveStockCountMutation();
    const { data: productsResponse, isLoading: productsLoading } = useGetAllProductsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const { data: countsResponse, refetch } = useGetStockCountsQuery({ store_id: currentStoreId, per_page: 10 }, { skip: !currentStoreId });

    const stockOptions = useMemo(() => {
        return normalizeProducts(productsResponse).flatMap((product: any) => {
            const stocks = Array.isArray(product.stocks) ? product.stocks : Array.isArray(product.product_stocks) ? product.product_stocks : [];
            if (stocks.length === 0 && product.product_stock_id) {
                return [{
                    id: product.product_stock_id,
                    productName: product.name,
                    sku: product.sku,
                    quantity: Number(product.quantity || 0),
                    label: product.name,
                }];
            }
            return stocks.map((stock: any) => ({
                id: stock.id,
                productName: product.name,
                sku: stock.sku || stock.barcode,
                quantity: Number(stock.quantity || 0),
                label: [product.name, stock.variant_name || (stock.variant_data ? Object.values(stock.variant_data).join(' - ') : '')].filter(Boolean).join(' / '),
            }));
        });
    }, [productsResponse]);

    const addLine = (stockId: string) => {
        const stock = stockOptions.find((item: any) => String(item.id) === stockId);
        if (!stock || lines.some((line) => line.product_stock_id === stock.id)) return;
        setLines((prev) => [
            ...prev,
            {
                product_stock_id: stock.id,
                label: stock.label,
                sku: stock.sku,
                system_quantity: stock.quantity,
                counted_quantity: stock.quantity,
            },
        ]);
    };

    const saveCount = async () => {
        if (!currentStoreId || lines.length === 0) return;
        try {
            await createStockCount({
                store_id: currentStoreId,
                title: title || t('stock_count_default_title'),
                items: lines.map((line) => ({
                    product_stock_id: line.product_stock_id,
                    counted_quantity: line.counted_quantity,
                })),
            }).unwrap();
            setLines([]);
            setTitle('');
            toast.success(t('stock_count_created'));
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || t('stock_count_create_failed'));
        }
    };

    const approve = async (id: number) => {
        try {
            await approveStockCount({ id }).unwrap();
            toast.success(t('stock_count_approved'));
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || t('stock_count_approve_failed'));
        }
    };

    const sessions = countsResponse?.data?.data || countsResponse?.data?.items || countsResponse?.data || [];

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{t('stock_count_title')}</h1>
                    <p className="mt-1 text-sm text-slate-500">{t('stock_count_subtitle')}</p>
                </div>
                <button type="button" onClick={() => refetch()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <RefreshCw className="h-4 w-4" />
                    {t('btn_refresh')}
                </button>
            </div>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
                    <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('stock_count_title_placeholder')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                    <select disabled={productsLoading} onChange={(event) => addLine(event.target.value)} value="" className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500">
                        <option value="">{productsLoading ? t('lbl_loading') : t('stock_count_add_item')}</option>
                        {stockOptions.map((stock: any) => (
                            <option key={stock.id} value={stock.id}>{stock.label}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                            <tr>
                                <th className="px-3 py-2">{t('lbl_product')}</th>
                                <th className="px-3 py-2">{t('lbl_sku')}</th>
                                <th className="px-3 py-2 text-right">{t('stock_count_system_qty')}</th>
                                <th className="px-3 py-2 text-right">{t('stock_count_counted_qty')}</th>
                                <th className="px-3 py-2 text-right">{t('stock_count_variance')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {lines.map((line, index) => (
                                <tr key={line.product_stock_id}>
                                    <td className="px-3 py-2 font-medium text-slate-800">{line.label}</td>
                                    <td className="px-3 py-2 text-slate-500">{line.sku || '-'}</td>
                                    <td className="px-3 py-2 text-right">{formatNumber(line.system_quantity)}</td>
                                    <td className="px-3 py-2 text-right">
                                        <input type="number" min="0" value={line.counted_quantity} onChange={(event) => setLines((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, counted_quantity: Number(event.target.value) || 0 } : item))} className="w-28 rounded-md border border-slate-200 px-2 py-1 text-right" />
                                    </td>
                                    <td className="px-3 py-2 text-right font-semibold">{formatNumber(line.counted_quantity - line.system_quantity)}</td>
                                </tr>
                            ))}
                            {lines.length === 0 && (
                                <tr><td colSpan={5} className="px-3 py-8 text-center text-slate-400">{t('stock_count_empty')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <button type="button" onClick={saveCount} disabled={isCreating || lines.length === 0} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50">
                    <Plus className="h-4 w-4" />
                    {t('stock_count_create_session')}
                </button>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-4 py-3">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ClipboardList className="h-4 w-4" />{t('stock_count_recent_sessions')}</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {sessions.map((session: any) => (
                        <div key={session.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-semibold text-slate-900">{session.reference_no} <span className="text-sm font-normal text-slate-500">{session.title || ''}</span></p>
                                <p className="text-xs text-slate-500">{t('stock_count_variance_lines')}: {session.variance_count ?? '-'} | {t('stock_count_status')}: {session.status}</p>
                            </div>
                            <button type="button" onClick={() => approve(session.id)} disabled={isApproving || session.status === 'approved'} className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50">
                                <CheckCircle2 className="h-4 w-4" />
                                {session.status === 'approved' ? t('stock_count_approved_status') : t('stock_count_approve')}
                            </button>
                        </div>
                    ))}
                    {sessions.length === 0 && <div className="px-4 py-8 text-center text-sm text-slate-400">{t('stock_count_no_sessions')}</div>}
                </div>
            </section>
        </div>
    );
}
