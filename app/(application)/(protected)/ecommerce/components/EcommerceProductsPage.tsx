'use client';

import ReusableTable, { TableColumn } from '@/components/common/ReusableTable';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from '@/lib/toast';
import {
    useBulkUpdateEcommerceProductVisibilityMutation,
    useGetEcommerceProductsQuery,
    useGetEcommerceStoresQuery,
    useUpdateEcommerceProductVisibilityMutation,
} from '@/store/features/ecommerce/ecommerceManagementApi';
import { Eye, EyeOff, Globe2, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EcommerceProductsFilter } from './EcommerceFilters';
import EcommerceServiceRequest from './EcommerceServiceRequest';
import { VisibilityBadge } from './EcommerceBadges';
import { formatApiError, getEcommerceFallbackText, getProductName, getResponseItems, getResponsePagination, getSku, resolveCurrentStoreGate, visibilityLabel } from './ecommerceUtils';

const getProductVisibility = (product: any) => product.ecommerce_visible || product.ecommerce_visibility || product.ecommerce_status || 'pending';

const EcommerceProductsPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectAllMatching, setSelectAllMatching] = useState(false);

    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            page: currentPage,
            per_page: itemsPerPage,
            ...apiParams,
        };

        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage]);

    const { data: storesData, isLoading: storesLoading } = useGetEcommerceStoresQuery({}, { refetchOnMountOrArgChange: 30 });
    const ecommerceStores = useMemo(() => getResponseItems(storesData), [storesData]);
    const gate = useMemo(() => resolveCurrentStoreGate(ecommerceStores, queryParams, currentStoreId), [ecommerceStores, queryParams, currentStoreId]);

    const { data, isLoading, error } = useGetEcommerceProductsQuery(queryParams, {
        refetchOnMountOrArgChange: 30,
        skip: storesLoading || gate.blocked,
    });
    const [updateVisibility, { isLoading: isUpdatingOne }] = useUpdateEcommerceProductVisibilityMutation();
    const [bulkUpdateVisibility, { isLoading: isBulkUpdating }] = useBulkUpdateEcommerceProductVisibilityMutation();

    const products = useMemo(() => getResponseItems(data), [data]);
    const paginationMeta = useMemo(() => getResponsePagination(data), [data]);
    const totalItems = paginationMeta?.total || 0;
    const totalPages = paginationMeta?.last_page || 1;
    const visiblePageIds = useMemo(() => products.map((product: any) => product.id).filter(Boolean), [products]);
    const allPageSelected = visiblePageIds.length > 0 && visiblePageIds.every((id: number) => selectedIds.includes(id));

    useEffect(() => {
        setSelectedIds([]);
        setSelectAllMatching(false);
    }, [apiParams, currentPage, itemsPerPage]);

    const handleFilterChange = useCallback((params: Record<string, any>) => {
        setApiParams(params);
        setCurrentPage(1);
    }, []);

    const handleToggleOne = useCallback(
        async (product: any) => {
            const currentVisibility = getProductVisibility(product);
            if (currentVisibility === 'rejected') return;

            try {
                await updateVisibility({ productId: product.id, visible: currentVisibility !== 'active' }).unwrap();
                showSuccessDialog(t('ecommerce_product_updated_title'), t('ecommerce_product_updated_desc'));
            } catch (updateError) {
                showErrorDialog(t('ecommerce_update_failed_title'), formatApiError(updateError));
            }
        },
        [updateVisibility, t]
    );

    const handleBulkUpdate = async (visible: boolean) => {
        if (!selectAllMatching && selectedIds.length === 0) {
            showErrorDialog(t('ecommerce_no_products_selected_title'), t('ecommerce_no_products_selected_desc'));
            return;
        }

        const confirmed = await showConfirmDialog(t('ecommerce_update_visibility_confirm_title'), t(visible ? 'ecommerce_make_visible_confirm' : 'ecommerce_make_hidden_confirm'), t('btn_update'), t('btn_cancel'), false);
        if (!confirmed) return;

        const filterPayload = { ...apiParams };
        if (!filterPayload.store_id && !filterPayload.store_ids && currentStoreId) filterPayload.store_id = currentStoreId;

        const payload = selectAllMatching
            ? {
                  visible,
                  select_all_matching: true,
                  ...filterPayload,
              }
            : {
                  visible,
                  product_ids: selectedIds,
              };

        try {
            await bulkUpdateVisibility(payload).unwrap();
            setSelectedIds([]);
            setSelectAllMatching(false);
            showSuccessDialog(t('ecommerce_products_updated_title'), t('ecommerce_products_updated_desc'));
        } catch (bulkError) {
            showErrorDialog(t('ecommerce_bulk_update_failed_title'), formatApiError(bulkError));
        }
    };

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'selected',
                label: '',
                render: (_value, row) => (
                    <input
                        type="checkbox"
                        checked={selectAllMatching || selectedIds.includes(row.id)}
                        onChange={(event) => {
                            setSelectedIds((prev) => (event.target.checked ? Array.from(new Set([...prev, row.id])) : prev.filter((id) => id !== row.id)));
                            setSelectAllMatching(false);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                ),
            },
            {
                key: 'product_name',
                label: t('lbl_product'),
                render: (_value, row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{getProductName(row)}</span>
                        <span className="text-xs text-gray-500">{row.description ? String(row.description).slice(0, 70) : t('ecommerce_no_description')}</span>
                    </div>
                ),
            },
            {
                key: 'sku',
                label: t('ecommerce_sku_barcode'),
                render: (_value, row) => (
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-gray-800">{getSku(row)}</span>
                        {row.barcode && <span className="font-mono text-xs text-gray-500">{row.barcode}</span>}
                    </div>
                ),
            },
            {
                key: 'store',
                label: t('lbl_store'),
                render: (value, row) => <span className="text-sm text-gray-700">{value?.store_name || value?.name || row.store_name || getEcommerceFallbackText()}</span>,
            },
            {
                key: 'category',
                label: t('lbl_category'),
                render: (value, row) => <span className="text-sm text-gray-700">{value?.name || row.category_name || getEcommerceFallbackText()}</span>,
            },
            {
                key: 'brand',
                label: t('lbl_brand'),
                render: (value, row) => <span className="text-sm text-gray-700">{value?.name || row.brand_name || getEcommerceFallbackText()}</span>,
            },
            {
                key: 'ecommerce_visible',
                label: t('ecommerce_visibility'),
                render: (_value, row) => <VisibilityBadge value={getProductVisibility(row)} />,
            },
            {
                key: 'visibility_action',
                label: t('lbl_actions'),
                render: (_value, row) => {
                    const visibility = getProductVisibility(row);
                    const isVisible = visibility === 'active';
                    const isRejected = visibility === 'rejected';
                    return (
                        <button
                            type="button"
                            disabled={isRejected || isUpdatingOne}
                            onClick={() => handleToggleOne(row)}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                isVisible ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {isVisible ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                            {isVisible ? visibilityLabel('active') : isRejected ? visibilityLabel('rejected') : visibilityLabel('pending')}
                        </button>
                    );
                },
            },
        ],
        [selectedIds, isUpdatingOne, handleToggleOne, t]
    );

    if (storesLoading || isLoading) return <Loader message={t('ecommerce_loading_products')} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] text-white shadow-sm">
                        <Globe2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('ecommerce_products_title')}</h1>
                        <p className="text-sm text-gray-500">{t('ecommerce_products_desc')}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <EcommerceProductsFilter onFilterChange={handleFilterChange} />
            </div>

            {gate.blocked ? (
                <EcommerceServiceRequest store={gate.store} requestedStatus="enable" />
            ) : (
                <>
                    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={allPageSelected}
                                    onChange={(event) => {
                                        setSelectedIds((prev) =>
                                            event.target.checked ? Array.from(new Set([...prev, ...visiblePageIds])) : prev.filter((id) => !visiblePageIds.includes(id))
                                        );
                                        setSelectAllMatching(false);
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                {t('ecommerce_select_current_page')}
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={selectAllMatching}
                                    onChange={(event) => {
                                        setSelectAllMatching(event.target.checked);
                                        setSelectedIds([]);
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                {t('ecommerce_select_all_matching')}
                            </label>
                            <span className="text-sm text-gray-500">
                                {selectAllMatching ? t('ecommerce_matching_products_selected').replace('{count}', String(totalItems)) : t('ecommerce_products_selected').replace('{count}', String(selectedIds.length))}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => handleBulkUpdate(true)} disabled={isBulkUpdating} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
                                <Eye className="h-4 w-4" />
                                {t('ecommerce_make_visible')}
                            </button>
                            <button type="button" onClick={() => handleBulkUpdate(false)} disabled={isBulkUpdating} className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60">
                                <EyeOff className="h-4 w-4" />
                                {t('ecommerce_make_hidden')}
                            </button>
                        </div>
                    </div>

                    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{formatApiError(error)}</div>}
                    <ReusableTable
                        data={products}
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
                            icon: <Package className="mx-auto h-16 w-16" />,
                            title: t('ecommerce_no_products_title'),
                            description: t('ecommerce_no_products_desc'),
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default EcommerceProductsPage;
