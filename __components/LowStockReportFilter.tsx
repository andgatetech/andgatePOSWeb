'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { Layers, Tag } from 'lucide-react';
import React from 'react';

interface LowStockReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const LowStockReportFilter: React.FC<LowStockReportFilterProps> = ({ onFilterChange }) => {
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle all filter changes
    React.useEffect(() => {
        const apiParams = buildApiParams();
        onFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search by product name or SKU..."
            showStoreFilter={true}
            showSearch={true}
            customFilters={[
                // Category Filter
                <div key="category_id" className="flex flex-col">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Layers className="h-5 w-5 text-gray-400" />
                        Category
                    </label>
                    <select
                        defaultValue=""
                        onChange={(e) => handleFilterChange({ category_id: e.target.value || undefined })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {/* Add your category options here dynamically */}
                        {/* Example: */}
                        {/* {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)} */}
                    </select>
                </div>,
                // Brand Filter
                <div key="brand_id" className="flex flex-col">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Tag className="h-5 w-5 text-gray-400" />
                        Brand
                    </label>
                    <select
                        defaultValue=""
                        onChange={(e) => handleFilterChange({ brand_id: e.target.value || undefined })}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All Brands</option>
                        {/* Add your brand options here dynamically */}
                        {/* Example: */}
                        {/* {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)} */}
                    </select>
                </div>,
            ]}
        />
    );
};

export default LowStockReportFilter;
