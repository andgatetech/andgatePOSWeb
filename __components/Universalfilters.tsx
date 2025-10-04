'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import {
    endOfDay,
    endOfMonth,
    endOfWeek,
    endOfYear,
    format,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
    subDays,
    subMonths,
    subWeeks,
    subYears,
} from 'date-fns';
import { Calendar, ChevronDown, Filter, RotateCcw, Search, Store, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

export interface DropdownOption {
    value: string | number;
    label: string;
}

export interface CustomFilterConfig {
    key: string;
    label: string;
    type: 'select' | 'multiselect' | 'text' | 'number';
    options?: DropdownOption[];
    placeholder?: string;
    icon?: React.ReactNode;
    defaultValue?: any;
}

export interface FilterOptions {
    search?: string;
    storeId?: number | 'all';
    dateRange?: {
        type: 'none' | 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'custom';
        startDate?: string;
        endDate?: string;
    };
    [key: string]: any; // For custom filters
}

export interface UniversalFilterProps {
    onFilterChange: (filters: FilterOptions) => void;
    placeholder?: string;
    showStoreFilter?: boolean;
    showDateFilter?: boolean;
    showSearch?: boolean;
    customFilters?: CustomFilterConfig[];
    initialFilters?: FilterOptions;
    className?: string;
    searchDebounce?: number;
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
    customFilters = [],
    initialFilters = {},
    className = '',
    searchDebounce = 300,
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
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

    // Custom filters state
    const [customFilterValues, setCustomFilterValues] = useState<Record<string, any>>(() => {
        const initialValues: Record<string, any> = {};
        customFilters.forEach((filter) => {
            initialValues[filter.key] = initialFilters[filter.key] || filter.defaultValue || (filter.type === 'multiselect' ? [] : 'all');
        });
        return initialValues;
    });

    // Helper function to get date range based on filter type
    const getDateRange = useCallback(
        (type: string) => {
            const now = new Date();

            switch (type) {
                case 'none':
                    return null;
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
                    return null;
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
            ...customFilterValues,
        };
    }, [search, selectedStore, dateFilterType, customFilterValues, showSearch, showStoreFilter, showDateFilter, getDateRange]);

    // Emit filter changes with debounce for search
    useEffect(() => {
        const timer = setTimeout(() => {
            const filters = buildFilters();
            onFilterChange(filters);
        }, searchDebounce);

        return () => clearTimeout(timer);
    }, [buildFilters, onFilterChange, searchDebounce]);

    // Reset filters
    const resetFilters = () => {
        setSearch('');
        setSelectedStore(currentStoreId || 'all');
        setDateFilterType('none');
        setCustomStartDate(format(new Date(), 'yyyy-MM-dd'));
        setCustomEndDate(format(new Date(), 'yyyy-MM-dd'));

        const resetValues: Record<string, any> = {};
        customFilters.forEach((filter) => {
            resetValues[filter.key] = filter.defaultValue || (filter.type === 'multiselect' ? [] : 'all');
        });
        setCustomFilterValues(resetValues);
    };

    // Check if filters are active
    const hasActiveFilters = () => {
        const hasSearchFilter = search !== '';
        const hasStoreFilter = selectedStore !== (currentStoreId || 'all');
        const hasDateFilter = dateFilterType !== 'none';
        const hasCustomFilters = customFilters.some((filter) => {
            const value = customFilterValues[filter.key];
            const defaultValue = filter.defaultValue || (filter.type === 'multiselect' ? [] : 'all');
            return JSON.stringify(value) !== JSON.stringify(defaultValue);
        });

        return hasSearchFilter || hasStoreFilter || hasDateFilter || hasCustomFilters;
    };

    // Toggle dropdown
    const toggleDropdown = (key: string) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // Get display label for custom filter
    const getCustomFilterLabel = (filter: CustomFilterConfig) => {
        const value = customFilterValues[filter.key];

        if (filter.type === 'multiselect') {
            if (!value || value.length === 0) return `All ${filter.label}`;
            if (value.length === 1) {
                const option = filter.options?.find((opt) => opt.value === value[0]);
                return option?.label || `${filter.label}: ${value[0]}`;
            }
            return `${filter.label} (${value.length})`;
        }

        if (value === 'all' || !value) return `All ${filter.label}`;

        const option = filter.options?.find((opt) => opt.value === value);
        return option?.label || value;
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
                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Store Filter */}
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

                {/* Date Filter */}
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

                {/* Custom Filters */}
                {customFilters.map((filter) => (
                    <div key={filter.key} className="relative">
                        {filter.type === 'select' || filter.type === 'multiselect' ? (
                            <>
                                <button
                                    onClick={() => toggleDropdown(filter.key)}
                                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    {filter.icon}
                                    <span className="text-sm">{getCustomFilterLabel(filter)}</span>
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                </button>

                                {openDropdowns[filter.key] && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => toggleDropdown(filter.key)} />
                                        <div className="absolute right-0 top-full z-20 mt-1 max-h-64 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                                            {filter.type === 'select' && (
                                                <button
                                                    onClick={() => {
                                                        setCustomFilterValues((prev) => ({ ...prev, [filter.key]: 'all' }));
                                                        toggleDropdown(filter.key);
                                                    }}
                                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                                        customFilterValues[filter.key] === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                                                    }`}
                                                >
                                                    All {filter.label}
                                                </button>
                                            )}
                                            {filter.options?.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        if (filter.type === 'multiselect') {
                                                            const currentValues = customFilterValues[filter.key] || [];
                                                            const newValues = currentValues.includes(option.value)
                                                                ? currentValues.filter((v: any) => v !== option.value)
                                                                : [...currentValues, option.value];
                                                            setCustomFilterValues((prev) => ({ ...prev, [filter.key]: newValues }));
                                                        } else {
                                                            setCustomFilterValues((prev) => ({ ...prev, [filter.key]: option.value }));
                                                            toggleDropdown(filter.key);
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                                        filter.type === 'multiselect'
                                                            ? customFilterValues[filter.key]?.includes(option.value)
                                                                ? 'bg-blue-50 text-blue-600'
                                                                : 'text-gray-900'
                                                            : customFilterValues[filter.key] === option.value
                                                              ? 'bg-blue-50 text-blue-600'
                                                              : 'text-gray-900'
                                                    }`}
                                                >
                                                    {filter.type === 'multiselect' && (
                                                        <input
                                                            type="checkbox"
                                                            checked={customFilterValues[filter.key]?.includes(option.value)}
                                                            onChange={() => {}}
                                                            className="mr-2"
                                                        />
                                                    )}
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <input
                                type={filter.type}
                                placeholder={filter.placeholder}
                                value={customFilterValues[filter.key] || ''}
                                onChange={(e) => setCustomFilterValues((prev) => ({ ...prev, [filter.key]: e.target.value }))}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            />
                        )}
                    </div>
                ))}

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
                    {dateFilterType !== 'none' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                            Date: {DATE_FILTER_OPTIONS.find((option) => option.value === dateFilterType)?.label}
                            <button onClick={() => setDateFilterType('none')}>
                                <X className="h-3 w-3 hover:text-purple-600" />
                            </button>
                        </span>
                    )}
                    {customFilters.map((filter) => {
                        const value = customFilterValues[filter.key];
                        const defaultValue = filter.defaultValue || (filter.type === 'multiselect' ? [] : 'all');
                        const hasValue = JSON.stringify(value) !== JSON.stringify(defaultValue);

                        if (!hasValue) return null;

                        return (
                            <span key={filter.key} className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                                {filter.label}: {getCustomFilterLabel(filter)}
                                <button onClick={() => setCustomFilterValues((prev) => ({ ...prev, [filter.key]: defaultValue }))}>
                                    <X className="h-3 w-3 hover:text-orange-600" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UniversalFilter;