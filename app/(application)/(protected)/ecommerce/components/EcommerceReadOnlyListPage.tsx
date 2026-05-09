'use client';

import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetEcommerceCartsQuery, useGetEcommerceStoresQuery, useGetEcommerceWishlistsQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import { Globe2, Heart, ShoppingCart } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { EcommerceSimpleFilter } from './EcommerceFilters';
import EcommerceServiceRequest from './EcommerceServiceRequest';
import { formatApiError, getCustomerLabel, getProductName, getResponseItems, getResponsePagination, getSku, getStoreName, resolveCurrentStoreGate } from './ecommerceUtils';

type ReadOnlyKind = 'carts' | 'wishlists';

const getStoreLabel = (row: any, fallbackText: string) => {
    if (row?.store) return getStoreName(row.store);
    return row?.store_name || row?.stock?.store?.store_name || row?.product?.store?.store_name || fallbackText;
};

const splitDateTime = (value: string | undefined, fallbackText: string) => {
    if (!value) return { date: fallbackText, time: '' };
    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})\s+(.+)$/);
    return match ? { date: match[1], time: match[2] } : { date: value, time: '' };
};

const DateCell = ({ value, fallbackText }: { value?: string; fallbackText: string }) => {
    const { date, time } = splitDateTime(value, fallbackText);
    return (
        <span className="flex flex-col text-sm text-gray-700">
            <span>{date}</span>
            {time && <span className="text-xs text-gray-500">{time}</span>}
        </span>
    );
};

const CustomerCell = ({ row, fallbackText }: { row: any; fallbackText: string }) => {
    const customer = getCustomerLabel(row);
    return (
        <div className="flex flex-col">
            <span className="font-medium text-gray-900">{customer.name || fallbackText}</span>
            {customer.phone && <span className="text-xs text-gray-500">{customer.phone}</span>}
            {customer.email && <span className="text-xs text-gray-500">{customer.email}</span>}
        </div>
    );
};

const EcommerceReadOnlyListPage = ({ kind }: { kind: ReadOnlyKind }) => {
    const { t } = getTranslation();
    const fallbackText = t('ecommerce_not_available');
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const isCarts = kind === 'carts';

    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            page: currentPage,
            per_page: itemsPerPage,
            ...apiParams,
        };

        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentPage, currentStoreId, itemsPerPage]);

    const { data: storesData, isLoading: storesLoading } = useGetEcommerceStoresQuery({}, { refetchOnMountOrArgChange: 30 });
    const ecommerceStores = useMemo(() => getResponseItems(storesData), [storesData]);
    const gate = useMemo(() => resolveCurrentStoreGate(ecommerceStores, queryParams, currentStoreId), [ecommerceStores, queryParams, currentStoreId]);

    const cartsQuery = useGetEcommerceCartsQuery(queryParams, {
        refetchOnMountOrArgChange: 30,
        skip: !isCarts || storesLoading || gate.blocked,
    });
    const wishlistsQuery = useGetEcommerceWishlistsQuery(queryParams, {
        refetchOnMountOrArgChange: 30,
        skip: isCarts || storesLoading || gate.blocked,
    });
    const activeQuery = isCarts ? cartsQuery : wishlistsQuery;

    const records = useMemo(() => getResponseItems(activeQuery.data).filter((item) => item && typeof item === 'object'), [activeQuery.data]);
    const paginationMeta = useMemo(() => getResponsePagination(activeQuery.data), [activeQuery.data]);
    const totalItems = paginationMeta?.total || 0;
    const totalPages = paginationMeta?.last_page || 1;

    const handleFilterChange = useCallback((params: Record<string, any>) => {
        setApiParams(params);
        setCurrentPage(1);
    }, []);

    const columns: TableColumn[] = useMemo(() => {
        const tableColumns: TableColumn[] = [
            {
                key: 'customer',
                label: t('lbl_customer'),
                render: (_value, row) => <CustomerCell row={row} fallbackText={fallbackText} />,
            },
            {
                key: 'product_name',
                label: t('lbl_product'),
                render: (_value, row) => <span className="font-medium text-gray-900">{getProductName(row)}</span>,
            },
            {
                key: 'sku',
                label: t('lbl_sku'),
                render: (_value, row) => <span className="font-mono text-xs text-gray-700">{getSku(row)}</span>,
            },
        ];

        if (isCarts) {
            tableColumns.push({
                key: 'quantity',
                label: t('ecommerce_qty'),
                render: (value) => <span className="font-semibold text-gray-900">{value ?? 0}</span>,
            });
        }

        tableColumns.push(
            {
                key: 'store',
                label: t('lbl_store'),
                render: (_value, row) => <span className="text-sm text-gray-700">{getStoreLabel(row, fallbackText)}</span>,
            },
            {
                key: 'created_at',
                label: t('lbl_created_date'),
                render: (value) => <DateCell value={value} fallbackText={fallbackText} />,
            }
        );

        return tableColumns;
    }, [fallbackText, isCarts, t]);

    if (storesLoading || activeQuery.isLoading) {
        return <Loader message={t(isCarts ? 'ecommerce_loading_carts' : 'ecommerce_loading_wishlists')} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                    {isCarts ? <ShoppingCart className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t(isCarts ? 'ecommerce_carts_title' : 'ecommerce_wishlists_title')}</h1>
                    <p className="text-sm text-gray-500">{t(isCarts ? 'ecommerce_carts_desc' : 'ecommerce_wishlists_desc')}</p>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <EcommerceSimpleFilter onFilterChange={handleFilterChange} placeholder={t(isCarts ? 'ecommerce_carts_search_placeholder' : 'ecommerce_wishlists_search_placeholder')} />
            </div>

            {gate.blocked ? (
                <EcommerceServiceRequest store={gate.store} requestedStatus="enable" />
            ) : (
                <>
                    {activeQuery.error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{formatApiError(activeQuery.error)}</div>}
                    <ReusableTable
                        data={records}
                        columns={columns}
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
                        emptyState={{
                            icon: isCarts ? <ShoppingCart className="mx-auto h-16 w-16" /> : <Globe2 className="mx-auto h-16 w-16" />,
                            title: t(isCarts ? 'ecommerce_no_carts_title' : 'ecommerce_no_wishlists_title'),
                            description: t('ecommerce_readonly_empty_desc'),
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default EcommerceReadOnlyListPage;
