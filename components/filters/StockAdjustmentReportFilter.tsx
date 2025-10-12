'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import React from 'react';

interface StockAdjustmentReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const StockAdjustmentReportFilter: React.FC<StockAdjustmentReportFilterProps> = ({ onFilterChange }) => {
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
            placeholder="Search reference no, products..."
            showStoreFilter={true}
            showDateFilter={true}
            showDirectionFilter={true}
            showStockTypeFilter={true}
            showSearch={true}
            initialFilters={{
                dateRange: { type: 'this_month' },
            }}
        />
    );
};

export default StockAdjustmentReportFilter;
