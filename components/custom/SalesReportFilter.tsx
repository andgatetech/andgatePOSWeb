'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import React from 'react';

interface SalesReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const SalesReportFilter: React.FC<SalesReportFilterProps> = ({ onFilterChange }) => {
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
            placeholder="Search by invoice, customer name, or phone..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={[
                <div key="payment_status" className="flex flex-col space-y-1">
                    <select
                        defaultValue="all"
                        onChange={(e) => {
                            const value = e.target.value;
                            // ✅ Merge with existing filters and nest under customFilters
                            handleFilterChange({
                                ...filters,
                                customFilters: {
                                    ...(filters.customFilters || {}),
                                    payment_status: value === 'all' ? undefined : value, // Backend skips if falsy
                                },
                            });
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>,
            ]}
            initialFilters={{
                dateRange: { type: 'this_month' },
            }}
        />
    );
};

export default SalesReportFilter;
