'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import React from 'react';

interface StockReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const StockReportFilter: React.FC<StockReportFilterProps> = ({ onFilterChange }) => {
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
            placeholder="Search products, categories, brands..."
            showStoreFilter={true}
            showCategoryFilter={true}
            showBrandFilter={true}
            showSearch={true}
            initialFilters={{}}
        />
    );
};

export default StockReportFilter;
