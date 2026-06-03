'use client';

import ReusableTable, { TableAction, TableColumn } from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import Loader from '@/lib/Loader';
import { useBulkCreateCourierShipmentsMutation, useGetCourierCredentialsQuery, useGetEcommerceOrdersQuery, useGetEcommerceStoresQuery } from '@/store/features/ecommerce/ecommerceManagementApi';
import { Eye, Globe2, Loader2, ShoppingBag, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { EcommerceOrdersFilter } from './EcommerceFilters';
import EcommerceServiceRequest from './EcommerceServiceRequest';
import CourierFraudCheckPanel from './CourierFraudCheckPanel';
import { StatusBadge } from './EcommerceBadges';
import { formatApiError, getCustomerLabel, getEcommercePaymentMethodLabel, getEcommerceSourceLabel, getResponseItems, getResponsePagination, resolveCurrentStoreGate } from './ecommerceUtils';
import { showErrorDialog, showSuccessDialog } from '@/lib/toast';

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
    const [bulkCourierProvider, setBulkCourierProvider] = useState('redx');
    const [bulkCourierForm, setBulkCourierForm] = useState({
        delivery_area: '',
        delivery_area_id: '',
        pickup_area_id: '',
        parcel_weight: '500',
        item_weight: '0.5',
        recipient_city: '',
        recipient_zone: '',
    });

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
    const { data: courierCredentialsData } = useGetCourierCredentialsQuery({ store_id: queryParams.store_id }, { skip: !queryParams.store_id || storesLoading || gate.blocked });
    const [bulkCreateCourierShipments, { isLoading: isBulkCreatingCourier }] = useBulkCreateCourierShipmentsMutation();

    const orders = useMemo(() => getResponseItems(data), [data]);
    const courierCredentials = useMemo(() => {
        const items = courierCredentialsData?.data?.items || courierCredentialsData?.items || [];
        return Array.isArray(items) ? items.filter((item: any) => item.is_active) : [];
    }, [courierCredentialsData]);
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

    const handleBulkCourierCreate = async () => {
        const eligibleOrders = orders.filter((order: any) => order?.id && !order?.courier && !order?.latest_courier_shipment);
        if (eligibleOrders.length === 0) {
            showErrorDialog('No orders', 'No visible store orders are eligible for courier parcel creation.');
            return;
        }

        const overrides = Object.fromEntries(
            eligibleOrders.map((order: any) => [
                order.id,
                bulkCourierProvider === 'redx'
                    ? {
                          delivery_area: bulkCourierForm.delivery_area,
                          delivery_area_id: Number(bulkCourierForm.delivery_area_id),
                          pickup_area_id: bulkCourierForm.pickup_area_id ? Number(bulkCourierForm.pickup_area_id) : undefined,
                          parcel_weight: Number(bulkCourierForm.parcel_weight || 500),
                      }
                    : bulkCourierProvider === 'pathao'
                    ? {
                          recipient_city: Number(bulkCourierForm.recipient_city),
                          recipient_zone: Number(bulkCourierForm.recipient_zone),
                          item_weight: Number(bulkCourierForm.item_weight || 0.5),
                      }
                    : {},
            ])
        );

        try {
            await bulkCreateCourierShipments({
                provider: bulkCourierProvider,
                store_order_ids: eligibleOrders.map((order: any) => order.id),
                overrides,
            }).unwrap();
            showSuccessDialog('Bulk parcels created', `${eligibleOrders.length} courier parcel request(s) completed.`);
        } catch (bulkError) {
            showErrorDialog('Bulk create failed', formatApiError(bulkError));
        }
    };

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

            {!gate.blocked && (
                <CourierFraudCheckPanel
                    storeId={queryParams.store_id ? Number(queryParams.store_id) : null}
                    title="Manual courier fraud check"
                    description="Check any customer phone number against the central courier fraud providers before confirming ecommerce orders."
                />
            )}

            {!gate.blocked && courierCredentials.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-[#046ca9]" />
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Bulk courier parcel creation</h2>
                            <p className="text-xs text-gray-500">Creates parcels for visible orders on this page that do not already have a courier shipment.</p>
                        </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-6">
                        <select
                            value={bulkCourierProvider}
                            onChange={(event) => setBulkCourierProvider(event.target.value)}
                            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#046ca9]"
                        >
                            {courierCredentials.map((credential: any) => (
                                <option key={credential.provider} value={credential.provider}>
                                    {String(credential.provider).toUpperCase()}
                                </option>
                            ))}
                        </select>

                        {bulkCourierProvider === 'redx' && (
                            <>
                                <input value={bulkCourierForm.delivery_area} onChange={(event) => setBulkCourierForm((prev) => ({ ...prev, delivery_area: event.target.value }))} placeholder="Delivery area" className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#046ca9]" />
                                <input value={bulkCourierForm.delivery_area_id} onChange={(event) => setBulkCourierForm((prev) => ({ ...prev, delivery_area_id: event.target.value }))} placeholder="Area ID" className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#046ca9]" />
                                <input value={bulkCourierForm.pickup_area_id} onChange={(event) => setBulkCourierForm((prev) => ({ ...prev, pickup_area_id: event.target.value }))} placeholder="Pickup area ID" className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#046ca9]" />
                                <input value={bulkCourierForm.parcel_weight} onChange={(event) => setBulkCourierForm((prev) => ({ ...prev, parcel_weight: event.target.value }))} placeholder="Weight gram" className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#046ca9]" />
                            </>
                        )}

                        {bulkCourierProvider === 'pathao' && (
                            <>
                                <input value={bulkCourierForm.recipient_city} onChange={(event) => setBulkCourierForm((prev) => ({ ...prev, recipient_city: event.target.value }))} placeholder="City ID" className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#046ca9]" />
                                <input value={bulkCourierForm.recipient_zone} onChange={(event) => setBulkCourierForm((prev) => ({ ...prev, recipient_zone: event.target.value }))} placeholder="Zone ID" className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#046ca9]" />
                                <input value={bulkCourierForm.item_weight} onChange={(event) => setBulkCourierForm((prev) => ({ ...prev, item_weight: event.target.value }))} placeholder="Weight KG" className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#046ca9]" />
                            </>
                        )}

                        <button
                            type="button"
                            onClick={handleBulkCourierCreate}
                            disabled={isBulkCreatingCourier}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#046ca9] px-4 text-sm font-semibold text-white transition hover:bg-[#035f95] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isBulkCreatingCourier && <Loader2 className="h-4 w-4 animate-spin" />}
                            Bulk create
                        </button>
                    </div>
                </div>
            )}

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
