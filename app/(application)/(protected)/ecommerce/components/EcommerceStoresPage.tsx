'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useGetEcommerceStoresQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import { ArrowRight, Globe2, Heart, Send, ShoppingCart, Store } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { StatusBadge } from './EcommerceBadges';
import EcommerceServiceRequest from './EcommerceServiceRequest';
import { formatApiError, getResponseItems, getStoreName } from './ecommerceUtils';

const EcommerceStoresPage = () => {
    const { t } = getTranslation();
    const [selectedRequestStore, setSelectedRequestStore] = useState<any>(null);
    const { data, isLoading, error } = useGetEcommerceStoresQuery({}, { refetchOnMountOrArgChange: 30 });

    const stores = useMemo(() => getResponseItems(data), [data]);

    const columns: TableColumn[] = useMemo(
        () => [
            {
                key: 'store_name',
                label: t('lbl_store'),
                sortable: true,
                render: (_value, row) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{getStoreName(row)}</span>
                        <span className="text-xs text-gray-500">{row.slug || t('ecommerce_no_slug')}</span>
                    </div>
                ),
            },
            {
                key: 'is_ecommerce_enabled',
                label: t('ecommerce_ecommerce'),
                render: (value) => <StatusBadge status={value ? 'active' : 'pending'} label={value ? t('ecommerce_status_enabled') : t('ecommerce_status_disabled')} />,
            },
            {
                key: 'ecommerce_orders_count',
                label: t('ecommerce_orders_title'),
                render: (value) => <span className="font-semibold text-gray-900">{value ?? 0}</span>,
            },
            {
                key: 'ecommerce_products_count',
                label: t('ecommerce_products_title'),
                render: (value) => <span className="font-semibold text-gray-900">{value ?? 0}</span>,
            },
            {
                key: 'active_ecommerce_products_count',
                label: t('ecommerce_visible_products'),
                render: (value) => <span className="font-semibold text-green-700">{value ?? 0}</span>,
            },
            {
                key: 'is_active',
                label: t('ecommerce_store_status'),
                render: (_value, row) => {
                    const active = Boolean(row.is_active) && !row.store_disabled;
                    return <StatusBadge status={active ? 'active' : 'cancelled'} label={active ? t('lbl_active') : t('lbl_inactive')} />;
                },
            },
        ],
        [t]
    );

    const actions: TableAction[] = useMemo(
        () => [
            {
                label: t('ecommerce_request_enable'),
                icon: <Send className="h-4 w-4" />,
                className: 'text-blue-600',
                hidden: (row) => Boolean(row.is_ecommerce_enabled),
                onClick: (row) => setSelectedRequestStore(row),
            },
            {
                label: t('ecommerce_request_disable'),
                icon: <Send className="h-4 w-4" />,
                className: 'text-amber-600',
                hidden: (row) => !row.is_ecommerce_enabled,
                onClick: (row) => setSelectedRequestStore(row),
            },
        ],
        [t]
    );

    if (isLoading) return <Loader message={t('ecommerce_loading_stores')} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                        <Globe2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('ecommerce_stores_title')}</h1>
                        <p className="text-sm text-gray-500">{t('ecommerce_stores_desc')}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Link
                    href="/ecommerce/carts"
                    className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary hover:shadow-md"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">{t('ecommerce_carts_title')}</h2>
                            <p className="mt-1 text-sm text-gray-500">{t('ecommerce_carts_desc')}</p>
                        </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>

                <Link
                    href="/ecommerce/wishlists"
                    className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-amber-500 hover:shadow-md"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <Heart className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900">{t('ecommerce_wishlists_title')}</h2>
                            <p className="mt-1 text-sm text-gray-500">{t('ecommerce_wishlists_desc')}</p>
                        </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-amber-600" />
                </Link>
            </div>

            {selectedRequestStore && (
                <EcommerceServiceRequest
                    store={selectedRequestStore}
                    requestedStatus={selectedRequestStore.is_ecommerce_enabled ? 'disable' : 'enable'}
                    title={`${selectedRequestStore.is_ecommerce_enabled ? t('ecommerce_request_disable') : t('ecommerce_request_enable')} ${getStoreName(selectedRequestStore)}`}
                />
            )}

            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{formatApiError(error)}</div>}

            <ReusableTable
                data={stores}
                columns={columns}
                actions={actions}
                emptyState={{
                    icon: <Store className="mx-auto h-16 w-16" />,
                    title: t('ecommerce_no_stores_title'),
                    description: t('ecommerce_no_stores_desc'),
                }}
            />
        </div>
    );
};

export default EcommerceStoresPage;
