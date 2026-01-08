'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { CheckCircle, Layers, Tag } from 'lucide-react';
import React from 'react';

interface StockReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    categories?: { id: number; name: string }[];
    brands?: { id: number; name: string }[];
}

const StockReportFilter: React.FC<StockReportFilterProps> = ({ onFilterChange, categories = [], brands = [] }) => {
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
    const [selectedBrand, setSelectedBrand] = React.useState<string>('all');
    const [selectedAvailable, setSelectedAvailable] = React.useState<string>('all');

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Stabilize the callback to prevent unnecessary re-renders
    const stableOnFilterChange = React.useCallback(onFilterChange, [onFilterChange]);

    const handleReset = React.useCallback(() => {
        setSelectedCategory('all');
        setSelectedBrand('all');
        setSelectedAvailable('all');
    }, []);

    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

       
        if (selectedAvailable !== 'all') {
            additionalParams.available = selectedAvailable;
        }

        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);
            if (allStoreIds.length > 1) {
                additionalParams.store_ids = allStoreIds.join(',');
            } else if (allStoreIds.length === 1) {
                additionalParams.store_id = allStoreIds[0];
            }
        }

        const apiParams = buildApiParams(additionalParams);
        stableOnFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, selectedCategory, selectedBrand, selectedAvailable]);

    React.useEffect(() => {
        setSelectedCategory('all');
        setSelectedBrand('all');
        setSelectedAvailable('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
           

          
            <div className="relative">
                <select
                    value={selectedAvailable}
                    onChange={(e) => setSelectedAvailable(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Availability</option>
                    <option value="yes">In Stock</option>
                    <option value="no">Out of Stock</option>
                </select>
                <CheckCircle className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search products, SKU..."
            showStoreFilter={true}
            showDateFilter={false}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default StockReportFilter;
