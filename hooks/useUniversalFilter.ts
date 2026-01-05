'use client';
import { FilterOptions } from '@/components/common/UniversalFilter';
import { RootState } from '@/store';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

export interface UseUniversalFilterOptions {
    initialFilters?: FilterOptions;
    onFilterChange?: (filters: FilterOptions) => void;
}

export const useUniversalFilter = (options: UseUniversalFilterOptions = {}) => {
    const { initialFilters = {}, onFilterChange } = options;

    const [filters, setFilters] = useState<FilterOptions>(initialFilters);

    // Get all user stores from Redux - memoized to prevent re-renders
    const user = useSelector((state: RootState) => state.auth.user);
    const userStores = useMemo(() => user?.stores || [], [user?.stores]);

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

            // Add store parameter - FIXED for backend compatibility
            if (filters.storeId !== undefined) {
                if (filters.storeId === 'all') {
                    // When 'all' stores selected, send array of all user's store IDs
                    // const allStoreIds = userStores.map((store) => store.id);
                    // if (allStoreIds.length > 0) {
                    //     // Backend expects comma-separated string or array
                    //     params.store_ids = allStoreIds.join(',');
                    // }
                } else {
                    // Single store selected
                    params.store_id = filters.storeId;
                }
            }

            // Add date range parameters - only if not 'none'
            if (filters.dateRange && filters.dateRange.type !== 'none') {
                if (filters.dateRange.startDate) {
                    params.start_date = filters.dateRange.startDate;
                }
                if (filters.dateRange.endDate) {
                    params.end_date = filters.dateRange.endDate;
                }
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
