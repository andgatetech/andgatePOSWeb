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
import { formatApiError, getCustomerLabel, getEcommercePaymentMethodLabel, getEcommerceSourceLabel, getResponseItems, getResponsePagination, resolveCurrentStoreGate } from './ecommerceUtils';

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

    const handleOpenOrder = useCallback(
        (order: any) => {
            if (order?.id) router.push(`/ecommerce/orders/${order.id}`);
        },
        [router]
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

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'order_number',
                label: t('ecommerce_order_number'),
                sortable: true,
                render: (value, row) => <span className="font-semibold text-gray-900">{value || row?.parent_order?.order_number || row?.order?.order_number || fallbackText}</span>,
            },
            {
                key: 'status',
                label: t('lbl_status'),
                sortable: true,
                render: (value) => <StatusBadge status={value} />,
            },
            {
                key: 'store',
                label: t('ecommerce_store_shop'),
                render: (value, row) => {
                    const stores = Array.isArray(row?.stores) ? row.stores : value ? [value] : row?.store ? [row.store] : [];
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
                key: 'customer',
                label: t('lbl_customer'),
                render: (_value, row) => {
                    const customer = getCustomerLabel(row);
                    return (
                        <div className="flex min-w-[160px] flex-col">
                            <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                            {customer.phone && <span className="text-xs text-gray-500">{customer.phone}</span>}
                        </div>
                    );
                },
            },
            {
                key: 'source',
                label: t('ecommerce_source'),
                render: (value, row) => <span className="text-sm font-medium text-gray-700">{getEcommerceSourceLabel(value || row?.parent_order?.source || row?.order?.source)}</span>,
            },
            {
                key: 'payment_method',
                label: t('lbl_payment_method'),
                render: (value, row) => <span className="text-sm text-gray-700">{getEcommercePaymentMethodLabel(value || row?.latest_payment_method)}</span>,
            },
            {
                key: 'payment_status',
                label: t('lbl_payment_status'),
                render: (value, row) => <StatusBadge status={value || row?.latest_payment_status} />,
            },
            {
                key: 'store_items_count',
                label: t('ecommerce_store_items'),
                render: (value, row) => <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">{value ?? row?.items_count ?? row?.items?.length ?? 0}</span>,
            },
            {
                key: 'store_items_subtotal',
                label: t('ecommerce_store_items_subtotal'),
                sortable: true,
                render: (value, row) => <span className="font-semibold text-gray-900">{formatCurrency(value ?? row?.subtotal ?? 0)}</span>,
            },
            {
                key: 'store_total',
                label: t('ecommerce_store_total'),
                sortable: true,
                render: (value, row) => <span className="font-semibold text-gray-900">{formatCurrency(value ?? row?.total ?? 0)}</span>,
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
        [fallbackText, formatCurrency, renderDateTime, t]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: t('btn_view'),
                icon: <Eye className="h-4 w-4" />,
                className: 'text-blue-600',
                onClick: handleOpenOrder,
            },
        ],
        [handleOpenOrder, t]
    );

    if (storesLoading || isLoading) return <Loader message={t('ecommerce_loading_orders')} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Globe2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('ecommerce_orders_title')}</h1>
                        <p className="text-sm text-gray-500">{t('ecommerce_orders_desc')}</p>
                    </div>
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
                        onRowClick={handleOpenOrder}
                        rowClassName={(_row, index) =>
                            `border-b border-gray-100 transition-colors last:border-0 ${
                                index % 2 === 0 ? 'bg-white hover:bg-[#046ca9]/5' : 'bg-slate-50/60 hover:bg-[#046ca9]/5'
                            }`
                        }
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
