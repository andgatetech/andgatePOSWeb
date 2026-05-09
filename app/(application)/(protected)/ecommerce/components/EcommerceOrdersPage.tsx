'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetEcommerceOrdersQuery, useGetEcommerceStoresQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import { Eye, Globe2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { EcommerceOrdersFilter } from './EcommerceFilters';
import EcommerceServiceRequest from './EcommerceServiceRequest';
import { StatusBadge } from './EcommerceBadges';
import { formatApiError, getResponseItems, getResponsePagination, resolveCurrentStoreGate } from './ecommerceUtils';

const EcommerceOrdersPage = () => {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const fallbackText = t('ecommerce_not_available');
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            page: currentPage,
            per_page: itemsPerPage,
            sort_field: sortField,
            sort_direction: sortDirection,
            ...apiParams,
        };

        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    const { data: storesData, isLoading: storesLoading } = useGetEcommerceStoresQuery({}, { refetchOnMountOrArgChange: 30 });
    const ecommerceStores = useMemo(() => getResponseItems(storesData), [storesData]);
    const gate = useMemo(() => resolveCurrentStoreGate(ecommerceStores, queryParams, currentStoreId), [ecommerceStores, queryParams, currentStoreId]);

    const { data, isLoading, error } = useGetEcommerceOrdersQuery(queryParams, {
        refetchOnMountOrArgChange: 30,
        skip: storesLoading || gate.blocked,
    });

    const orders = useMemo(() => getResponseItems(data), [data]);
    const paginationMeta = useMemo(() => getResponsePagination(data), [data]);
    const totalItems = paginationMeta?.total || 0;
    const totalPages = paginationMeta?.last_page || 1;

    const handleFilterChange = useCallback((params: Record<string, any>) => {
        setApiParams(params);
        setCurrentPage(1);
    }, []);

    const handleSort = useCallback(
        (field: string) => {
            setCurrentPage(1);
            if (field === sortField) {
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
                setSortField(field);
                setSortDirection('asc');
            }
        },
        [sortField]
    );

    const renderDateTime = useCallback(
        (value?: string) => {
            if (!value) return <span className="text-sm text-gray-700">{fallbackText}</span>;
            const parts = String(value).split(' ');
            const date = parts.slice(0, 1).join(' ');
            const time = parts.slice(1).join(' ');

            return (
                <span className="flex min-w-[120px] flex-col whitespace-nowrap text-sm text-gray-700">
                    <span>{date}</span>
                    {time && <span className="text-xs text-gray-500">{time}</span>}
                </span>
            );
        },
        [fallbackText]
    );

    const getPaymentMethodLabel = useCallback(
        (value?: string) => {
            const methodMap: Record<string, string> = {
                cash_on_delivery: t('ecommerce_payment_method_cash_on_delivery'),
                bkash: t('ecommerce_payment_method_bkash'),
                nagad: t('ecommerce_payment_method_nagad'),
                sslcommerz: t('ecommerce_payment_method_sslcommerz'),
                card: t('ecommerce_payment_method_card'),
                cash: t('ecommerce_payment_method_cash'),
            };

            return methodMap[String(value || '').toLowerCase()] || value || fallbackText;
        },
        [fallbackText, t]
    );

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'order_number',
                label: t('ecommerce_order_number'),
                sortable: true,
                render: (value) => <span className="font-semibold text-gray-900">{value || fallbackText}</span>,
            },
            {
                key: 'status',
                label: t('lbl_status'),
                sortable: true,
                render: (value) => <StatusBadge status={value} />,
            },
            {
                key: 'stores',
                label: t('ecommerce_store_shop'),
                render: (value) => {
                    const stores = Array.isArray(value) ? value : [];
                    return (
                        <div className="flex flex-col">
                            {stores.length > 0 ? (
                                stores.map((store: any) => (
                                    <span key={store.id || store.slug || store.store_name} className="text-sm font-medium text-gray-900">
                                        {store.store_name || fallbackText}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500">{fallbackText}</span>
                            )}
                        </div>
                    );
                },
            },
            {
                key: 'latest_payment_method',
                label: t('lbl_payment_method'),
                render: (value) => <span className="text-sm text-gray-700">{getPaymentMethodLabel(value)}</span>,
            },
            {
                key: 'latest_payment_status',
                label: t('lbl_payment_status'),
                render: (value) => <StatusBadge status={value} />,
            },
            {
                key: 'store_items_count',
                label: t('ecommerce_store_items'),
                render: (value) => <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">{value ?? 0}</span>,
            },
            {
                key: 'store_items_subtotal',
                label: t('ecommerce_store_items_subtotal'),
                sortable: true,
                render: (value) => <span className="font-semibold text-gray-900">{formatCurrency(value ?? 0)}</span>,
            },
            {
                key: 'store_total',
                label: t('ecommerce_store_total'),
                sortable: true,
                render: (value) => <span className="font-semibold text-gray-900">{formatCurrency(value ?? 0)}</span>,
            },
            {
                key: 'created_at',
                label: t('lbl_created'),
                sortable: true,
                render: (value) => renderDateTime(value),
            },
            {
                key: 'updated_at',
                label: t('lbl_updated'),
                sortable: true,
                render: (value) => renderDateTime(value),
            },
        ],
        [fallbackText, formatCurrency, getPaymentMethodLabel, renderDateTime, t]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: t('btn_view'),
                icon: <Eye className="h-4 w-4" />,
                className: 'text-blue-600',
                onClick: (order) => router.push(`/ecommerce/orders/${order.id}`),
            },
        ],
        [router, t]
    );

    if (storesLoading || isLoading) return <Loader message={t('ecommerce_loading_orders')} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                    <Globe2 className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('ecommerce_orders_title')}</h1>
                    <p className="text-sm text-gray-500">{t('ecommerce_orders_desc')}</p>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <EcommerceOrdersFilter onFilterChange={handleFilterChange} />
            </div>

            {gate.blocked ? (
                <EcommerceServiceRequest store={gate.store} requestedStatus="enable" />
            ) : (
                <>
                    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{formatApiError(error)}</div>}
                    <ReusableTable
                        data={orders}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            currentPage,
                            totalPages,
                            itemsPerPage,
                            totalItems,
                            onPageChange: setCurrentPage,
                            onItemsPerPageChange: (items) => {
                                setItemsPerPage(items);
                                setCurrentPage(1);
                            },
                        }}
                        sorting={{ field: sortField, direction: sortDirection, onSort: handleSort }}
                        emptyState={{
                            icon: <ShoppingBag className="mx-auto h-16 w-16" />,
                            title: t('ecommerce_no_orders_title'),
                            description: t('ecommerce_no_orders_desc'),
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default EcommerceOrdersPage;
