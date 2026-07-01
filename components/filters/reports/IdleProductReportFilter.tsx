'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { getTranslation } from '@/i18n';
import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { Clock, Layers, Tag } from 'lucide-react';
import React from 'react';

interface IdleProductReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    categories?: { id: number; name: string }[];
    brands?: { id: number; name: string }[];
}

const IdleProductReportFilter: React.FC<IdleProductReportFilterProps> = ({ onFilterChange, categories = [], brands = [] }) => {
    const { t } = getTranslation();
    const [idleDays, setIdleDays] = React.useState<string>('30');
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
    const [selectedBrand, setSelectedBrand] = React.useState<string>('all');

    const { currentStore, userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    const taxonomyQueryParams = React.useMemo(() => {
        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);

            if (allStoreIds.length === 1) {
                return { store_id: allStoreIds[0] };
            }

            return allStoreIds.length > 1 ? { store_ids: allStoreIds.join(',') } : {};
        }

        if (filters.storeId && typeof filters.storeId === 'number') {
            return { store_id: filters.storeId };
        }

        return currentStore?.id ? { store_id: currentStore.id } : {};
    }, [filters.storeId, userStores, currentStore?.id]);

    const { data: categoriesResponse } = useGetCategoryQuery(taxonomyQueryParams);
    const { data: brandsResponse } = useGetBrandsQuery(taxonomyQueryParams);

    const availableCategories = React.useMemo(() => {
        if (categories.length > 0) {
            return categories;
        }

        if (categoriesResponse?.data?.items && Array.isArray(categoriesResponse.data.items)) {
            return categoriesResponse.data.items;
        }

        return categoriesResponse?.data || [];
    }, [categories, categoriesResponse]);

    const availableBrands = React.useMemo(() => {
        if (brands.length > 0) {
            return brands;
        }

        if (brandsResponse?.data?.items && Array.isArray(brandsResponse.data.items)) {
            return brandsResponse.data.items;
        }

        return brandsResponse?.data || [];
    }, [brands, brandsResponse]);

    // Stabilize the callback to prevent unnecessary re-renders
    const stableOnFilterChange = React.useCallback(onFilterChange, [onFilterChange]);

    const handleReset = React.useCallback(() => {
        setIdleDays('30');
        setSelectedCategory('all');
        setSelectedBrand('all');
    }, []);

    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        additionalParams.idle_days = parseInt(idleDays);

        if (selectedCategory !== 'all') {
            additionalParams.category_id = parseInt(selectedCategory);
        }

        if (selectedBrand !== 'all') {
            additionalParams.brand_id = parseInt(selectedBrand);
        }

        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);
            if (allStoreIds.length > 1) {
                additionalParams.store_ids = allStoreIds;
            } else if (allStoreIds.length === 1) {
                additionalParams.store_id = allStoreIds[0];
            }
        }

        const apiParams = buildApiParams(additionalParams);
        stableOnFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, idleDays, selectedCategory, selectedBrand, userStores]);

    React.useEffect(() => {
        setIdleDays('30');
        setSelectedCategory('all');
        setSelectedBrand('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            <div className="relative">
                <select
                    value={idleDays}
                    onChange={(e) => setIdleDays(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                >
                    <option value="7">7+ {t('lbl_days_idle')}</option>
                    <option value="14">14+ {t('lbl_days_idle')}</option>
                    <option value="30">30+ {t('lbl_days_idle')}</option>
                    <option value="60">60+ {t('lbl_days_idle')}</option>
                    <option value="90">90+ {t('lbl_days_idle')}</option>
                </select>
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                >
                    <option value="all">{t('lbl_all_categories')}</option>
                    {availableCategories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <Layers className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
                <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-auto"
                >
                    <option value="all">{t('ecommerce_all_brands')}</option>
                    {availableBrands.map((brand: any) => (
                        <option key={brand.id} value={brand.id}>
                            {brand.name}
                        </option>
                    ))}
                </select>
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder={t('placeholder_search_products')}
            showStoreFilter={true}
            showDateFilter={false}
            showSearch={true}
            customFilters={customFilters}
            customActiveCount={(idleDays !== '30' ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (selectedBrand !== 'all' ? 1 : 0)}
            onResetFilters={handleReset}
        />
    );
};

export default IdleProductReportFilter;
