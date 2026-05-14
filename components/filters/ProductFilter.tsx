'use client';
import UniversalFilter, { FilterOptions } from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { useGetBrandsQuery } from '@/store/features/brand/brandApi';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { Boxes, Package, Tag } from 'lucide-react';
import { getTranslation } from '@/i18n';
import React from 'react';

interface ProductFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ onFilterChange }) => {
    const { t } = getTranslation();
    const [selectedCategory, setSelectedCategory] = React.useState<number | 'all'>('all');
    const [selectedBrand, setSelectedBrand] = React.useState<number | 'all'>('all');
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
    const [selectedStockStatus, setSelectedStockStatus] = React.useState<string>('all');

    const { currentStore, userStores } = useCurrentStore();

    // Memoize the filter change handler to prevent infinite re-renders
    const handleUniversalFilterChange = React.useCallback((filters: FilterOptions) => {
        // This function should be stable and not recreated on every render
    }, []);

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter({
        onFilterChange: handleUniversalFilterChange,
    });

    // Handle filter changes separately using useEffect
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedCategory !== 'all') {
            additionalParams.category_id = selectedCategory;
        }

        if (selectedBrand !== 'all') {
            additionalParams.brand_id = selectedBrand;
        }

        if (selectedStatus !== 'all') {
            additionalParams.status = selectedStatus;
        }

        if (selectedStockStatus !== 'all') {
            additionalParams.stock_status = selectedStockStatus;
        }

        const apiParams = buildApiParams(additionalParams);
        onFilterChange(apiParams);
    }, [filters, selectedCategory, selectedBrand, selectedStatus, selectedStockStatus, buildApiParams, onFilterChange]);

    // Build category query params based on selected store from filter
    const categoryQueryParams = React.useMemo(() => {
        // Use store selection from UniversalFilter if available
        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);

            if (allStoreIds.length === 1) {
                return { store_id: allStoreIds[0] };
            }

            return allStoreIds.length > 1 ? { store_ids: allStoreIds.join(',') } : {};
        } else if (filters.storeId && typeof filters.storeId === 'number') {
            // Specific store selected
            return { store_id: filters.storeId };
        } else if (currentStore?.id) {
            // Fallback to current store from sidebar
            return { store_id: currentStore.id };
        }
        return {};
    }, [filters.storeId, userStores, currentStore?.id]);

    // Get categories based on selected store(s)
    const { data: categoriesResponse } = useGetCategoryQuery(categoryQueryParams);
    const { data: brandsResponse } = useGetBrandsQuery(categoryQueryParams);
    const categories = React.useMemo(() => {
        if (categoriesResponse?.data?.items && Array.isArray(categoriesResponse.data.items)) {
            return categoriesResponse.data.items;
        }
        return categoriesResponse?.data || [];
    }, [categoriesResponse]);

    const brands = React.useMemo(() => {
        if (brandsResponse?.data?.items && Array.isArray(brandsResponse.data.items)) {
            return brandsResponse.data.items;
        }
        return brandsResponse?.data || [];
    }, [brandsResponse]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedCategory('all');
        setSelectedBrand('all');
        setSelectedStatus('all');
        setSelectedStockStatus('all');
    }, [filters.storeId]);

    // Handle reset callback from UniversalFilter
    const handleResetFilters = React.useCallback(() => {
        setSelectedCategory('all');
        setSelectedBrand('all');
        setSelectedStatus('all');
        setSelectedStockStatus('all');
    }, []);

    const customFilters = (
        <>
            {/* Category Filter */}
            <div className="relative">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={categories.length === 0}
                >
                    <option value="all">{categories.length === 0 ? t('lbl_no_categories') : t('lbl_all_categories')}</option>
                    {categories.map((category: any) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <Package className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Brand Filter */}
            <div className="relative">
                <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    disabled={brands.length === 0}
                >
                    <option value="all">{brands.length === 0 ? t('msg_no_brands_available') : t('ecommerce_all_brands')}</option>
                    {brands.map((brand: any) => (
                        <option key={brand.id} value={brand.id}>
                            {brand.name}
                        </option>
                    ))}
                </select>
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Status Filter - Updated to match backend (active/inactive for available yes/no) */}
            <div className="relative">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="all">{t('lbl_all_status')}</option>
                    <option value="active">{t('lbl_active_available')}</option>
                    <option value="inactive">{t('lbl_inactive_unavailable')}</option>
                </select>
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Stock Status Filter */}
            <div className="relative">
                <select
                    value={selectedStockStatus}
                    onChange={(e) => setSelectedStockStatus(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                    <option value="all">{t('lbl_all_stock_statuses')}</option>
                    <option value="in_stock">{t('lbl_in_stock')}</option>
                    <option value="low_stock">{t('status_low_stock')}</option>
                    <option value="out_of_stock">{t('status_out_of_stock')}</option>
                </select>
                <Boxes className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            placeholder={t('placeholder_search_products')}
            showStoreFilter={true}
            showDateFilter={false}
            showSearch={true}
            customFilters={customFilters}
            customActiveCount={(selectedCategory !== 'all' ? 1 : 0) + (selectedBrand !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedStockStatus !== 'all' ? 1 : 0)}
        />
    );
};

export default ProductFilter;
