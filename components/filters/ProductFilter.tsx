'use client';
import UniversalFilter, { FilterOptions } from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { Package, Tag } from 'lucide-react';
import React from 'react';

interface ProductFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    categories?: Array<{ id: number; name: string }>;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ onFilterChange, categories = [] }) => {
    const [selectedCategory, setSelectedCategory] = React.useState<number | 'all'>('all');
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter({
        onFilterChange: (filters: FilterOptions) => {
            const apiParams = buildApiParams({
                category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
            });
            onFilterChange(apiParams);
        },
    });

    const customFilters = (
        <>
            {/* Category Filter */}
            {categories.length > 0 && (
                <div className="relative">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                        className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <Package className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
            )}

            {/* Status Filter */}
            <div className="relative">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                </select>
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return <UniversalFilter onFilterChange={handleFilterChange} placeholder="Search products..." showStoreFilter={true} showDateFilter={true} showSearch={true} customFilters={customFilters} />;
};

export default ProductFilter;
