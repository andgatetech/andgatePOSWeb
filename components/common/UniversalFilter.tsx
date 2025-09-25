'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { endOfDay, endOfMonth, endOfWeek, endOfYear, format, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays, subMonths, subWeeks, subYears } from 'date-fns';
import { Calendar, ChevronDown, Filter, RotateCcw, Search, Store, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

export interface FilterOptions {
    search?: string;
    storeId?: number | 'all';
    dateRange?: {
        type: 'none' | 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';
        startDate?: string;
        endDate?: string;
    };
    customFilters?: Record<string, any>;
}

export interface UniversalFilterProps {
    onFilterChange: (filters: FilterOptions) => void;
    placeholder?: string;
    showStoreFilter?: boolean;
    showDateFilter?: boolean;
    showSearch?: boolean;
    customFilters?: React.ReactNode;
    initialFilters?: FilterOptions;
    className?: string;
}

const DATE_FILTER_OPTIONS = [
    { value: 'none', label: 'No Date Filter' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
];

const UniversalFilter: React.FC<UniversalFilterProps> = ({
    onFilterChange,
    placeholder = 'Search...',
    showStoreFilter = true,
    showDateFilter = true,
    showSearch = true,
    customFilters,
    initialFilters = {},
    className = '',
}) => {
    const { currentStoreId, userStores } = useCurrentStore();

    // State management
    const [search, setSearch] = useState(initialFilters.search || '');
    const [selectedStore, setSelectedStore] = useState<number | 'all'>(initialFilters.storeId || currentStoreId || 'all');
    const [dateFilterType, setDateFilterType] = useState(initialFilters.dateRange?.type || 'none');
    const [customStartDate, setCustomStartDate] = useState(initialFilters.dateRange?.startDate || format(new Date(), 'yyyy-MM-dd'));
    const [customEndDate, setCustomEndDate] = useState(initialFilters.dateRange?.endDate || format(new Date(), 'yyyy-MM-dd'));
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [showStoreDropdown, setShowStoreDropdown] = useState(false);

    // Helper function to get date range based on filter type
    const getDateRange = useCallback(
        (type: string) => {
            const now = new Date();

            switch (type) {
                case 'none':
                    return null; // No date filter
                case 'today':
                    return {
                        startDate: format(startOfDay(now), 'yyyy-MM-dd HH:mm:ss'),
                        endDate: format(endOfDay(now), 'yyyy-MM-dd HH:mm:ss'),
                    };
                case 'yesterday':
                    const yesterday = subDays(now, 1);
                    return {
                        startDate: format(startOfDay(yesterday), 'yyyy-MM-dd HH:mm:ss'),
                        endDate: format(endOfDay(yesterday), 'yyyy-MM-dd HH:mm:ss'),
                    };
                case 'this_week':
                    return {
                        startDate: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd HH:mm:ss'),
                        endDate: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd HH:mm:ss'),
                    };
                case 'last_week':
                    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
                    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
                    return {
                        startDate: format(lastWeekStart, 'yyyy-MM-dd HH:mm:ss'),
                        endDate: format(lastWeekEnd, 'yyyy-MM-dd HH:mm:ss'),
                    };
                case 'this_month':
                    return {
                        startDate: format(startOfMonth(now), 'yyyy-MM-dd HH:mm:ss'),
                        endDate: format(endOfMonth(now), 'yyyy-MM-dd HH:mm:ss'),
                    };
                case 'last_month':
                    const lastMonth = subMonths(now, 1);
                    return {
                        startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd HH:mm:ss'),
                        endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd HH:mm:ss'),
                    };
                case 'this_year':
                    return {
                        startDate: format(startOfYear(now), 'yyyy-MM-dd HH:mm:ss'),
                        endDate: format(endOfYear(now), 'yyyy-MM-dd HH:mm:ss'),
                    };
                case 'last_year':
                    const lastYear = subYears(now, 1);
                    return {
                        startDate: format(startOfYear(lastYear), 'yyyy-MM-dd HH:mm:ss'),
                        endDate: format(endOfYear(lastYear), 'yyyy-MM-dd HH:mm:ss'),
                    };
                case 'custom':
                    return {
                        startDate: customStartDate + ' 00:00:00',
                        endDate: customEndDate + ' 23:59:59',
                    };
                default:
                    return {
                        startDate: format(startOfDay(now), 'yyyy-MM-dd HH:mm:ss'),
                        endDate: format(endOfDay(now), 'yyyy-MM-dd HH:mm:ss'),
                    };
            }
        },
        [customStartDate, customEndDate]
    );

    // Build filters object
    const buildFilters = useCallback((): FilterOptions => {
        const dateRange = getDateRange(dateFilterType);

        return {
            ...(showSearch && search && { search: search.trim() }),
            ...(showStoreFilter && { storeId: selectedStore }),
            ...(showDateFilter &&
                dateRange && {
                    dateRange: {
                        type: dateFilterType as any,
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate,
                    },
                }),
        };
    }, [search, selectedStore, dateFilterType, showSearch, showStoreFilter, showDateFilter, getDateRange]);

    // Emit filter changes
    useEffect(() => {
        const filters = buildFilters();
        onFilterChange(filters);
    }, [buildFilters, onFilterChange]);

    // Reset filters
    const resetFilters = () => {
        setSearch('');
        setSelectedStore(currentStoreId || 'all');
        setDateFilterType('none');
        setCustomStartDate(format(new Date(), 'yyyy-MM-dd'));
        setCustomEndDate(format(new Date(), 'yyyy-MM-dd'));
    };

    // Check if filters are active (not default)
    const hasActiveFilters = () => {
        return search !== '' || selectedStore !== (currentStoreId || 'all') || dateFilterType !== 'none';
    };

    return (
        <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
            <div className="flex flex-wrap items-center gap-4">
                {/* Search Input */}
                {showSearch && (
                    <div className="min-w-[200px] flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={placeholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Store Filter Dropdown */}
                {showStoreFilter && userStores.length > 0 && (
                    <div className="relative">
                        <button
                            onClick={() => setShowStoreDropdown(!showStoreDropdown)}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <Store className="h-5 w-5 text-gray-400" />
                            <span className="text-sm">{selectedStore === 'all' ? 'All Stores' : userStores.find((store) => store.id === selectedStore)?.store_name || 'Select Store'}</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>

                        {showStoreDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowStoreDropdown(false)} />
                                <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                                    <button
                                        onClick={() => {
                                            setSelectedStore('all');
                                            setShowStoreDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedStore === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}`}
                                    >
                                        All Stores
                                    </button>
                                    {userStores.map((store) => (
                                        <button
                                            key={store.id}
                                            onClick={() => {
                                                setSelectedStore(store.id);
                                                setShowStoreDropdown(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedStore === store.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}`}
                                        >
                                            {store.store_name}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Date Filter Dropdown */}
                {showDateFilter && (
                    <div className="relative">
                        <button
                            onClick={() => setShowDateDropdown(!showDateDropdown)}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="text-sm">{DATE_FILTER_OPTIONS.find((option) => option.value === dateFilterType)?.label}</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>

                        {showDateDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowDateDropdown(false)} />
                                <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                                    {DATE_FILTER_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setDateFilterType(option.value as any);
                                                if (option.value !== 'custom') {
                                                    setShowDateDropdown(false);
                                                }
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${dateFilterType === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}

                                    {/* Custom Date Range Inputs */}
                                    {dateFilterType === 'custom' && (
                                        <div className="space-y-3 border-t border-gray-100 p-4">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-700">From Date</label>
                                                <input
                                                    type="date"
                                                    value={customStartDate}
                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-700">To Date</label>
                                                <input
                                                    type="date"
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setShowDateDropdown(false)}
                                                className="w-full rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Custom Filters Slot */}
                {customFilters}

                {/* Reset Button */}
                {hasActiveFilters() && (
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-600 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        title="Reset Filters"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="text-sm">Reset</span>
                    </button>
                )}

                {/* Filter Icon */}
                <div className="flex items-center">
                    <Filter className="h-5 w-5 text-gray-400" />
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {search && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Search: &quot;{search}&quot;
                            <button onClick={() => setSearch('')}>
                                <X className="h-3 w-3 hover:text-blue-600" />
                            </button>
                        </span>
                    )}
                    {selectedStore !== (currentStoreId || 'all') && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Store: {selectedStore === 'all' ? 'All Stores' : userStores.find((store) => store.id === selectedStore)?.store_name}
                            <button onClick={() => setSelectedStore(currentStoreId || 'all')}>
                                <X className="h-3 w-3 hover:text-green-600" />
                            </button>
                        </span>
                    )}
                    {dateFilterType !== 'today' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                            Date: {DATE_FILTER_OPTIONS.find((option) => option.value === dateFilterType)?.label}
                            <button onClick={() => setDateFilterType('today')}>
                                <X className="h-3 w-3 hover:text-purple-600" />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default UniversalFilter;
