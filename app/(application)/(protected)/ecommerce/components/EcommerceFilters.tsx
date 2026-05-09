'use client';

import UniversalFilter, { FilterOptions } from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { CreditCard, Package, Tag } from 'lucide-react';
import React from 'react';
import { buildEcommerceFilterParams, ECOMMERCE_ORDER_STATUSES, getEcommercePaymentMethodLabel, getEcommerceStatusLabel, visibilityLabel } from './ecommerceUtils';

interface FilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const SelectWrapper = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="relative">
        {children}
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
    </div>
);

const baseSelectClass = 'appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export const EcommerceOrdersFilter = ({ onFilterChange }: FilterProps) => {
    const { t } = getTranslation();
    const { userStores } = useCurrentStore();
    const [filters, setFilters] = React.useState<FilterOptions>({});
    const [status, setStatus] = React.useState('all');
    const [paymentStatus, setPaymentStatus] = React.useState('all');
    const [paymentMethod, setPaymentMethod] = React.useState('all');

    React.useEffect(() => {
        onFilterChange(
            buildEcommerceFilterParams(filters, userStores, {
                status,
                payment_status: paymentStatus,
                payment_method: paymentMethod,
            })
        );
    }, [filters, status, paymentStatus, paymentMethod, userStores, onFilterChange]);

    return (
        <UniversalFilter
            onFilterChange={setFilters}
            placeholder={t('ecommerce_orders_search_placeholder')}
            showStoreFilter
            showDateFilter
            showSearch
            onResetFilters={() => {
                setStatus('all');
                setPaymentStatus('all');
                setPaymentMethod('all');
            }}
            customFilters={
                <>
                    <SelectWrapper icon={<Tag className="h-5 w-5" />}>
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className={baseSelectClass}>
                            <option value="all">{t('ecommerce_all_order_statuses')}</option>
                            {ECOMMERCE_ORDER_STATUSES.map((item) => (
                                <option key={item} value={item}>
                                    {getEcommerceStatusLabel(item)}
                                </option>
                            ))}
                        </select>
                    </SelectWrapper>
                    <SelectWrapper icon={<CreditCard className="h-5 w-5" />}>
                        <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} className={baseSelectClass}>
                            <option value="all">{t('ecommerce_all_payment_statuses')}</option>
                            <option value="pending">{getEcommerceStatusLabel('pending')}</option>
                            <option value="paid">{getEcommerceStatusLabel('paid')}</option>
                            <option value="completed">{getEcommerceStatusLabel('completed')}</option>
                            <option value="failed">{getEcommerceStatusLabel('failed')}</option>
                            <option value="cancelled">{getEcommerceStatusLabel('cancelled')}</option>
                        </select>
                    </SelectWrapper>
                    <SelectWrapper icon={<CreditCard className="h-5 w-5" />}>
                        <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className={baseSelectClass}>
                            <option value="all">{t('ecommerce_all_payment_methods')}</option>
                            <option value="cash_on_delivery">{getEcommercePaymentMethodLabel('cash_on_delivery')}</option>
                            <option value="bkash">{getEcommercePaymentMethodLabel('bkash')}</option>
                            <option value="nagad">{getEcommercePaymentMethodLabel('nagad')}</option>
                            <option value="sslcommerz">{getEcommercePaymentMethodLabel('sslcommerz')}</option>
                            <option value="card">{getEcommercePaymentMethodLabel('card')}</option>
                            <option value="cash">{getEcommercePaymentMethodLabel('cash')}</option>
                        </select>
                    </SelectWrapper>
                </>
            }
        />
    );
};

export const EcommerceOrderItemsFilter = ({ onFilterChange }: FilterProps) => {
    const { t } = getTranslation();
    const { userStores } = useCurrentStore();
    const [filters, setFilters] = React.useState<FilterOptions>({});
    const [orderStatus, setOrderStatus] = React.useState('all');

    React.useEffect(() => {
        onFilterChange(buildEcommerceFilterParams(filters, userStores, { order_status: orderStatus }));
    }, [filters, orderStatus, userStores, onFilterChange]);

    return (
        <UniversalFilter
            onFilterChange={setFilters}
            placeholder={t('ecommerce_order_items_search_placeholder')}
            showStoreFilter
            showDateFilter
            showSearch
            onResetFilters={() => setOrderStatus('all')}
            customFilters={
                <SelectWrapper icon={<Tag className="h-5 w-5" />}>
                    <select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} className={baseSelectClass}>
                        <option value="all">{t('ecommerce_all_order_statuses')}</option>
                        {ECOMMERCE_ORDER_STATUSES.map((item) => (
                            <option key={item} value={item}>
                                {getEcommerceStatusLabel(item)}
                            </option>
                        ))}
                    </select>
                </SelectWrapper>
            }
        />
    );
};

export const EcommerceTransactionsFilter = ({ onFilterChange }: FilterProps) => {
    const { t } = getTranslation();
    const { userStores } = useCurrentStore();
    const [filters, setFilters] = React.useState<FilterOptions>({});
    const [paymentStatus, setPaymentStatus] = React.useState('all');
    const [paymentMethod, setPaymentMethod] = React.useState('all');

    React.useEffect(() => {
        onFilterChange(buildEcommerceFilterParams(filters, userStores, { payment_status: paymentStatus, payment_method: paymentMethod }));
    }, [filters, paymentStatus, paymentMethod, userStores, onFilterChange]);

    return (
        <UniversalFilter
            onFilterChange={setFilters}
            placeholder={t('ecommerce_transactions_search_placeholder')}
            showStoreFilter
            showDateFilter
            showSearch={false}
            onResetFilters={() => {
                setPaymentStatus('all');
                setPaymentMethod('all');
            }}
            customFilters={
                <>
                    <SelectWrapper icon={<CreditCard className="h-5 w-5" />}>
                        <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} className={baseSelectClass}>
                            <option value="all">{t('ecommerce_all_payment_statuses')}</option>
                            <option value="pending">{getEcommerceStatusLabel('pending')}</option>
                            <option value="paid">{getEcommerceStatusLabel('paid')}</option>
                            <option value="completed">{getEcommerceStatusLabel('completed')}</option>
                            <option value="failed">{getEcommerceStatusLabel('failed')}</option>
                        </select>
                    </SelectWrapper>
                    <SelectWrapper icon={<CreditCard className="h-5 w-5" />}>
                        <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className={baseSelectClass}>
                            <option value="all">{t('ecommerce_all_payment_methods')}</option>
                            <option value="cash">{getEcommercePaymentMethodLabel('cash')}</option>
                            <option value="cod">{t('ecommerce_payment_method_cod')}</option>
                            <option value="card">{getEcommercePaymentMethodLabel('card')}</option>
                            <option value="bkash">{getEcommercePaymentMethodLabel('bkash')}</option>
                            <option value="nagad">{getEcommercePaymentMethodLabel('nagad')}</option>
                            <option value="sslcommerz">{getEcommercePaymentMethodLabel('sslcommerz')}</option>
                        </select>
                    </SelectWrapper>
                </>
            }
        />
    );
};

export const EcommerceSimpleFilter = ({ onFilterChange, placeholder }: FilterProps & { placeholder: string }) => {
    const { userStores } = useCurrentStore();
    const [filters, setFilters] = React.useState<FilterOptions>({});

    React.useEffect(() => {
        onFilterChange(buildEcommerceFilterParams(filters, userStores));
    }, [filters, userStores, onFilterChange]);

    return <UniversalFilter onFilterChange={setFilters} placeholder={placeholder} showStoreFilter showDateFilter={false} showSearch />;
};

export const EcommerceProductsFilter = ({ onFilterChange }: FilterProps) => {
    const { t } = getTranslation();
    const { currentStore, userStores } = useCurrentStore();
    const [filters, setFilters] = React.useState<FilterOptions>({});
    const [visibility, setVisibility] = React.useState('all');
    const [categoryId, setCategoryId] = React.useState<number | 'all'>('all');
    const [brandId, setBrandId] = React.useState<number | 'all'>('all');

    const storeParams = React.useMemo(() => {
        if (filters.storeId === 'all') {
            const ids = userStores.map((store: any) => store.id).filter(Boolean);
            if (ids.length === 1) return { store_id: ids[0] };
            if (ids.length > 1) return { store_ids: ids.join(',') };
        }
        if (typeof filters.storeId === 'number') return { store_id: filters.storeId };
        if (currentStore?.id) return { store_id: currentStore.id };
        return {};
    }, [filters.storeId, userStores, currentStore?.id]);

    const { data: categoriesResponse } = useGetCategoryQuery(storeParams);
    const { data: brandsResponse } = useGetBrandsQuery(storeParams);

    const categories = React.useMemo(() => {
        if (Array.isArray(categoriesResponse?.data?.items)) return categoriesResponse.data.items;
        if (Array.isArray(categoriesResponse?.data)) return categoriesResponse.data;
        return [];
    }, [categoriesResponse]);

    const brands = React.useMemo(() => {
        if (Array.isArray(brandsResponse?.data?.items)) return brandsResponse.data.items;
        if (Array.isArray(brandsResponse?.data)) return brandsResponse.data;
        return [];
    }, [brandsResponse]);

    React.useEffect(() => {
        onFilterChange(
            buildEcommerceFilterParams(filters, userStores, {
                ecommerce_visible: visibility,
                category_id: categoryId,
                brand_id: brandId,
            })
        );
    }, [filters, visibility, categoryId, brandId, userStores, onFilterChange]);

    React.useEffect(() => {
        setCategoryId('all');
        setBrandId('all');
    }, [filters.storeId]);

    return (
        <UniversalFilter
            onFilterChange={setFilters}
            placeholder={t('ecommerce_products_search_placeholder')}
            showStoreFilter
            showDateFilter={false}
            showSearch
            onResetFilters={() => {
                setVisibility('all');
                setCategoryId('all');
                setBrandId('all');
            }}
            customFilters={
                <>
                    <SelectWrapper icon={<Tag className="h-5 w-5" />}>
                        <select value={visibility} onChange={(event) => setVisibility(event.target.value)} className={baseSelectClass}>
                            <option value="all">{t('ecommerce_all_visibility')}</option>
                            <option value="active">{visibilityLabel('active')}</option>
                            <option value="pending">{visibilityLabel('pending')}</option>
                            <option value="rejected">{visibilityLabel('rejected')}</option>
                        </select>
                    </SelectWrapper>
                    <SelectWrapper icon={<Package className="h-5 w-5" />}>
                        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value === 'all' ? 'all' : Number(event.target.value))} className={baseSelectClass}>
                            <option value="all">{t('ecommerce_all_categories')}</option>
                            {categories.map((category: any) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </SelectWrapper>
                    <SelectWrapper icon={<Tag className="h-5 w-5" />}>
                        <select value={brandId} onChange={(event) => setBrandId(event.target.value === 'all' ? 'all' : Number(event.target.value))} className={baseSelectClass}>
                            <option value="all">{t('ecommerce_all_brands')}</option>
                            {brands.map((brand: any) => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                    </SelectWrapper>
                </>
            }
        />
    );
};
