'use client';
import UniversalFilter, { FilterOptions } from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { useGetCategoryQuery } from '@/store/features/category/categoryApi';
import { Package, Tag } from 'lucide-react';
import React from 'react';

interface ProductFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ onFilterChange }) => {
    const [selectedCategory, setSelectedCategory] = React.useState<number | 'all'>('all');
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

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

        if (selectedStatus !== 'all') {
            additionalParams.status = selectedStatus;
        }

        const apiParams = buildApiParams(additionalParams);
        onFilterChange(apiParams);
    }, [filters, selectedCategory, selectedStatus, buildApiParams, onFilterChange]);

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
    const categories = categoriesResponse?.data || [];

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedCategory('all');
        setSelectedStatus('all');
    }, [filters.storeId]);

    // Handle reset callback from UniversalFilter
    const handleResetFilters = React.useCallback(() => {
        setSelectedCategory('all');
        setSelectedStatus('all');
    }, []);

    const customFilters = (
        <>
            {/* Category Filter */}
            <div className="relative">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={categories.length === 0}
                >
                    <option value="all">{categories.length === 0 ? 'No Categories' : 'All Categories'}</option>
                    {categories.map((category: any) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <Package className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Status Filter - Updated to match backend (active/inactive for available yes/no) */}
            <div className="relative">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active (Available)</option>
                    <option value="inactive">Inactive (Unavailable)</option>
                </select>
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return <UniversalFilter onFilterChange={handleFilterChange} onResetFilters={handleResetFilters} placeholder="Search products..." showStoreFilter={true} showDateFilter={true} showSearch={true} customFilters={customFilters} />;
};

export default ProductFilter;
