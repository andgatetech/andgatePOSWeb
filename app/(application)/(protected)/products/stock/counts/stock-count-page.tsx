'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { getTranslation } from '@/i18n';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useApproveStockCountMutation, useCreateStockCountMutation, useGetAllProductsQuery, useGetStockCountsQuery } from '@/store/features/Product/productApi';
import { CheckCircle2, ClipboardList, Plus, RefreshCw, Search, X } from 'lucide-react';
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

const normalizeSessions = (response: any) => {
    const payload = response?.data?.data || response?.data?.items || response?.data || response?.items || response;
    return Array.isArray(payload) ? payload : [];
};

export default function StockCountPage() {
    const { t } = getTranslation();
    const { formatNumber } = useCurrency();
    const { currentStoreId } = useCurrentStore();
    const [lines, setLines] = useState<CountLine[]>([]);
    const [title, setTitle] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const deferredProductSearch = useDeferredValue(productSearch.trim());
    const [createStockCount, { isLoading: isCreating }] = useCreateStockCountMutation();
    const [approveStockCount, { isLoading: isApproving }] = useApproveStockCountMutation();
    const { data: productsResponse, isLoading: productsLoading, isFetching: productsFetching } = useGetAllProductsQuery({
        store_id: currentStoreId,
        search: deferredProductSearch || undefined,
        light: 1,
        per_page: 25,
        sort_field: 'product_name',
        sort_direction: 'asc',
        fast_pagination: 1,
    }, { skip: !currentStoreId });
    const { data: countsResponse, refetch } = useGetStockCountsQuery({ store_id: currentStoreId, per_page: 10 }, { skip: !currentStoreId });

    const stockOptions = useMemo(() => {
        return normalizeProducts(productsResponse).flatMap((product: any) => {
            const stocks = Array.isArray(product.stocks) ? product.stocks : Array.isArray(product.product_stocks) ? product.product_stocks : [];
            const productName = product.product_name || product.name || '';
            if (stocks.length === 0 && product.product_stock_id) {
                return [{
                    id: product.product_stock_id,
                    productName,
                    sku: product.sku,
                    barcode: product.barcode,
                    quantity: Number(product.quantity || 0),
                    label: productName,
                }];
            }
            return stocks.map((stock: any) => ({
                id: stock.id,
                productName,
                sku: stock.sku || stock.barcode,
                barcode: stock.barcode,
                quantity: Number(stock.quantity || 0),
                label: [productName, stock.variant_name || (stock.variant_data ? Object.values(stock.variant_data).join(' - ') : '')].filter(Boolean).join(' / '),
            }));
        });
    }, [productsResponse]);

    const selectedStockIds = useMemo(() => new Set(lines.map((line) => line.product_stock_id)), [lines]);

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

    const removeLine = (stockId: number) => {
        setLines((prev) => prev.filter((line) => line.product_stock_id !== stockId));
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

    const sessions = normalizeSessions(countsResponse);

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
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
                    <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t('stock_count_title_placeholder')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500" />
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            value={productSearch}
                            onChange={(event) => setProductSearch(event.target.value)}
                            placeholder={t('placeholder_search_products') || t('stock_count_add_item')}
                            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-9 text-sm outline-none focus:border-sky-500"
                        />
                        {productSearch && (
                            <button type="button" onClick={() => setProductSearch('')} className="absolute right-2 top-2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={t('btn_clear')}>
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/70 p-2">
                    <div className="mb-2 flex items-center justify-between px-1">
                        <p className="text-xs font-semibold uppercase text-slate-500">{t('lbl_search_results')}</p>
                        <p className="text-xs text-slate-400">{productsFetching ? t('lbl_loading') : `${stockOptions.length}`}</p>
                    </div>
                    <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                        {productsLoading || productsFetching ? (
                            <div className="px-3 py-8 text-center text-sm text-slate-400">{t('lbl_loading')}</div>
                        ) : stockOptions.length === 0 ? (
                            <div className="px-3 py-8 text-center text-sm text-slate-400">{t('msg_no_products_found')}</div>
                        ) : (
                            stockOptions.map((stock: any) => {
                                const selected = selectedStockIds.has(stock.id);
                                return (
                                    <button
                                        key={stock.id}
                                        type="button"
                                        onClick={() => addLine(String(stock.id))}
                                        disabled={selected}
                                        className="flex w-full items-center justify-between gap-3 rounded-md border border-transparent bg-white px-3 py-2 text-left text-sm shadow-sm hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:bg-emerald-50 disabled:text-emerald-700"
                                    >
                                        <span className="min-w-0">
                                            <span className="block truncate font-semibold text-slate-800">{stock.label}</span>
                                            <span className="block truncate text-xs text-slate-500">
                                                {t('lbl_sku')}: {stock.sku || '-'} {stock.barcode ? `| ${stock.barcode}` : ''} | {t('stock_count_system_qty')}: {formatNumber(stock.quantity)}
                                            </span>
                                        </span>
                                        <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold text-white ${selected ? 'bg-emerald-600' : 'bg-sky-600'}`}>
                                            {selected ? t('stock_count_selected') : t('btn_add')}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
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
                                <th className="px-3 py-2 text-right">{t('lbl_action')}</th>
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
                                    <td className="px-3 py-2 text-right">
                                        <button type="button" onClick={() => removeLine(line.product_stock_id)} className="inline-flex items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" title={t('btn_remove')}>
                                            <X className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {lines.length === 0 && (
                                <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">{t('stock_count_empty')}</td></tr>
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
