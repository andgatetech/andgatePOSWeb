'use client';
import { FilterOptions } from '@/components/common/UniversalFilter';
import { useCallback, useState } from 'react';

export interface UseUniversalFilterOptions {
    initialFilters?: FilterOptions;
    onFilterChange?: (filters: FilterOptions) => void;
}

export const useUniversalFilter = (options: UseUniversalFilterOptions = {}) => {
    const { initialFilters = {}, onFilterChange } = options;

    const [filters, setFilters] = useState<FilterOptions>(initialFilters);

    const handleFilterChange = useCallback(
        (newFilters: FilterOptions) => {
            setFilters(newFilters);
            if (onFilterChange) {
                onFilterChange(newFilters);
            }
        },
        [onFilterChange]
    );

    const resetFilters = useCallback(() => {
        const defaultFilters: FilterOptions = {};
        setFilters(defaultFilters);
        if (onFilterChange) {
            onFilterChange(defaultFilters);
        }
    }, [onFilterChange]);

    // Helper function to build API query parameters
    const buildApiParams = useCallback(
        (additionalParams: Record<string, any> = {}) => {
            const params: Record<string, any> = { ...additionalParams };

            // Add search parameter
            if (filters.search) {
                params.search = filters.search;
            }

            // Add store parameter
            if (filters.storeId) {
                if (filters.storeId === 'all') {
                    // When 'all' stores selected, send all store IDs
                    params.store_ids = 'all'; // Backend should handle this
                } else {
                    params.store_id = filters.storeId;
                }
            }

            // Add date range parameters
            if (filters.dateRange) {
                params.start_date = filters.dateRange.startDate;
                params.end_date = filters.dateRange.endDate;
                params.date_filter_type = filters.dateRange.type;
            }

            // Add custom filters
            if (filters.customFilters) {
                Object.assign(params, filters.customFilters);
            }

            return params;
        },
        [filters]
    );

    return {
        filters,
        handleFilterChange,
        resetFilters,
        buildApiParams,
    };
};
