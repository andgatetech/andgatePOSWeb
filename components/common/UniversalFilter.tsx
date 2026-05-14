'use client';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { endOfDay, endOfMonth, endOfWeek, endOfYear, format, startOfDay, startOfMonth, startOfWeek, startOfYear, subDays, subMonths, subWeeks, subYears } from 'date-fns';
import { Calendar, ChevronDown, Filter, RotateCcw, Search, Store, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
    onResetFilters?: () => void; // Callback when filters are reset
    externalResetTrigger?: number; // External trigger to reset filters
    customActiveCount?: number;
}

const UniversalFilter: React.FC<UniversalFilterProps> = ({
    onFilterChange,
    placeholder = 'Search...',
    showStoreFilter = true,
    showDateFilter = true,
    showSearch = true,
    customFilters,
    initialFilters = {},
    className = '',
    onResetFilters,
    externalResetTrigger = 0,
    customActiveCount = 0,
}) => {
    const { t } = getTranslation();
    const { currentStoreId, userStores } = useCurrentStore();
    const isMounted = useRef(false);

    const DATE_FILTER_OPTIONS = [
        { value: 'none', label: t('filter_no_date') },
        { value: 'today', label: t('filter_today') },
        { value: 'yesterday', label: t('filter_yesterday') },
        { value: 'this_week', label: t('filter_this_week') },
        { value: 'last_week', label: t('filter_last_week') },
        { value: 'this_month', label: t('filter_this_month') },
        { value: 'last_month', label: t('filter_last_month') },
        { value: 'this_year', label: t('filter_this_year') },
        { value: 'last_year', label: t('filter_last_year') },
        { value: 'custom', label: t('filter_custom_range') },
    ];

    // State management
    const [search, setSearch] = useState(initialFilters.search || '');
    const [localSearch, setLocalSearch] = useState(initialFilters.search || ''); // Local state for input
    const [selectedStore, setSelectedStore] = useState<number | 'all'>(initialFilters.storeId || currentStoreId || 'all');
    const [dateFilterType, setDateFilterType] = useState<string>(initialFilters.dateRange?.type || 'none');
    const [customStartDate, setCustomStartDate] = useState(initialFilters.dateRange?.startDate || format(new Date(), 'yyyy-MM-dd'));
    const [customEndDate, setCustomEndDate] = useState(initialFilters.dateRange?.endDate || format(new Date(), 'yyyy-MM-dd'));
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [showStoreDropdown, setShowStoreDropdown] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showDesktopFilters, setShowDesktopFilters] = useState(false);

    useEffect(() => {
        if (!showMobileFilters) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [showMobileFilters]);

    // Sync filter with global store changes, but respect initial filters on mount
    useEffect(() => {
        if (isMounted.current) {
            if (currentStoreId) {
                setSelectedStore(currentStoreId);
            }
        } else {
            isMounted.current = true;
        }
    }, [currentStoreId]);

    // Reset filters
    const resetFilters = useCallback(() => {
        setSearch('');
        setLocalSearch(''); // Also reset local search
        setSelectedStore(currentStoreId || 'all');
        setDateFilterType('none');
        setCustomStartDate(format(new Date(), 'yyyy-MM-dd'));
        setCustomEndDate(format(new Date(), 'yyyy-MM-dd'));
        onResetFilters?.(); // Call parent reset callback
    }, [onResetFilters, currentStoreId]);

    // Listen to external reset trigger
    useEffect(() => {
        if (externalResetTrigger > 0) {
            resetFilters();
        }
    }, [externalResetTrigger, resetFilters]);

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

    // Emit filter changes - only when search state changes (after button click)
    useEffect(() => {
        const filters = buildFilters();
        onFilterChange(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, selectedStore, dateFilterType, customStartDate, customEndDate]);

    // Check if filters are active (not default)
    const hasActiveFilters = () => {
        const isStoreActive = selectedStore !== (currentStoreId || 'all');
        return search !== '' || isStoreActive || dateFilterType !== 'none' || customActiveCount > 0;
    };

    const activeFilterCount = () => {
        const isStoreActive = selectedStore !== (currentStoreId || 'all');
        return [search !== '', isStoreActive, dateFilterType !== 'none'].filter(Boolean).length + customActiveCount;
    };

    // Handle search button click
    const handleSearchClick = () => {
        setSearch(localSearch);
    };

    // Handle Enter key press in search input
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    };

    // Clear search
    const handleClearSearch = () => {
        setLocalSearch('');
        setSearch('');
    };

    const renderFilterControls = (mode: 'desktop' | 'mobile') => (
        <div className={`${mode === 'mobile' ? 'grid grid-cols-1 gap-3' : 'flex flex-wrap items-center gap-2 sm:gap-3'}`}>
            {/* Store Filter Dropdown */}
            {showStoreFilter && userStores.length > 0 && (
                <div className="relative">
                    <button
                        onClick={() => setShowStoreDropdown(!showStoreDropdown)}
                        className={`${mode === 'mobile' ? 'w-full justify-between px-4 py-3' : 'px-3 py-2 sm:px-4 sm:py-2.5'} flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    >
                        <span className="flex min-w-0 items-center gap-2">
                            <Store className="h-4 w-4 flex-shrink-0 text-gray-400 sm:h-5 sm:w-5" />
                            <span className={`${mode === 'mobile' ? 'max-w-[220px] text-sm' : 'max-w-[120px] text-xs sm:max-w-none sm:text-sm'} truncate`}>
                                {selectedStore === 'all' ? t('lbl_all_stores') : userStores.find((store) => store.id === selectedStore)?.store_name || t('lbl_select_store')}
                            </span>
                        </span>
                        <ChevronDown className="h-3 w-3 flex-shrink-0 text-gray-400 sm:h-4 sm:w-4" />
                    </button>

                    {showStoreDropdown && (
                        <>
                            <div className="fixed inset-0 z-[55]" onClick={() => setShowStoreDropdown(false)} />
                            <div className={`${mode === 'mobile' ? 'left-0 right-0 w-full' : 'left-0 w-56 sm:left-auto sm:right-0 sm:w-64'} absolute top-full z-[60] mt-1 rounded-lg border border-gray-200 bg-white py-2 shadow-lg`}>
                                <button
                                    onClick={() => {
                                        setSelectedStore('all');
                                        setShowStoreDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedStore === 'all' ? 'bg-primary/[0.08] text-primary' : 'text-gray-900'}`}
                                >
                                    {t('lbl_all_stores')}
                                </button>
                                {userStores.map((store) => (
                                    <button
                                        key={store.id}
                                        onClick={() => {
                                            setSelectedStore(store.id);
                                            setShowStoreDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedStore === store.id ? 'bg-primary/[0.08] text-primary' : 'text-gray-900'}`}
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
                        className={`${mode === 'mobile' ? 'w-full justify-between px-4 py-3' : 'px-3 py-2 sm:px-4 sm:py-2.5'} flex items-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
                    >
                        <span className="flex min-w-0 items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400 sm:h-5 sm:w-5" />
                            <span className={`${mode === 'mobile' ? 'max-w-[220px] text-sm' : 'max-w-[100px] text-xs sm:max-w-none sm:text-sm'} truncate`}>{DATE_FILTER_OPTIONS.find((option) => option.value === dateFilterType)?.label}</span>
                        </span>
                        <ChevronDown className="h-3 w-3 flex-shrink-0 text-gray-400 sm:h-4 sm:w-4" />
                    </button>

                    {showDateDropdown && (
                        <>
                            <div className="fixed inset-0 z-[55]" onClick={() => setShowDateDropdown(false)} />
                            <div className={`${mode === 'mobile' ? 'left-0 right-0 w-full' : 'left-0 w-56 sm:left-auto sm:right-0 sm:w-64'} absolute top-full z-[60] mt-1 rounded-lg border border-gray-200 bg-white py-2 shadow-lg`}>
                                {DATE_FILTER_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setDateFilterType(option.value as any);
                                            if (option.value !== 'custom') {
                                                setShowDateDropdown(false);
                                            }
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${dateFilterType === option.value ? 'bg-primary/[0.08] text-primary' : 'text-gray-900'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}

                                {/* Custom Date Range Inputs */}
                                {dateFilterType === 'custom' && (
                                    <div className="space-y-3 border-t border-gray-100 p-4">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-700">{t('lbl_from_date')}</label>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-700">{t('lbl_to_date')}</label>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setShowDateDropdown(false)}
                                            className="w-full rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                        >
                                            {t('btn_apply')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Custom Filters Slot */}
            {customFilters && <div className={`${mode === 'mobile' ? 'grid grid-cols-1 gap-3' : 'contents'} [&_input]:min-h-10 [&_input]:w-full [&_select]:min-h-10 [&_select]:w-full`}>{customFilters}</div>}

            {/* Reset Button */}
            {mode === 'mobile' && hasActiveFilters() && (
                <button
                    onClick={resetFilters}
                    className={`${mode === 'mobile' ? 'w-full justify-center px-4 py-3' : 'px-3 py-2 sm:px-4 sm:py-2.5'} flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:gap-2`}
                    title={t('lbl_reset_filters')}
                >
                    <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">{t('btn_reset')}</span>
                </button>
            )}

        </div>
    );

    const renderActiveFilters = () =>
        hasActiveFilters() && (
            <div className="mt-3 flex flex-wrap gap-2">
                {search && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/[0.1] px-2.5 py-0.5 text-xs font-medium text-primary">
                        {t('lbl_search')}: &quot;{search}&quot;
                        <button
                            onClick={() => {
                                setSearch('');
                                setLocalSearch('');
                            }}
                        >
                            <X className="h-3 w-3 hover:text-primary" />
                        </button>
                    </span>
                )}
                {selectedStore !== (currentStoreId || 'all') && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {t('lbl_store')}: {selectedStore === 'all' ? t('lbl_all_stores') : userStores.find((store) => store.id === selectedStore)?.store_name || t('lbl_unknown')}
                        <button onClick={() => setSelectedStore(currentStoreId || 'all')}>
                            <X className="h-3 w-3 hover:text-green-600" />
                        </button>
                    </span>
                )}
                {dateFilterType !== 'none' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                        {t('lbl_date')}: {DATE_FILTER_OPTIONS.find((option) => option.value === dateFilterType)?.label}
                        <button onClick={() => setDateFilterType('none')}>
                            <X className="h-3 w-3 hover:text-purple-600" />
                        </button>
                    </span>
                )}
            </div>
        );

    return (
        <div className={className}>
            <div className="sticky top-0 z-30 -mx-2 border-y border-[#e8eef4] bg-white/95 px-2 py-2 shadow-sm backdrop-blur md:hidden">
                <div className="flex items-center gap-2">
                    {showSearch && (
                        <div className="relative min-w-0 flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={placeholder}
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-9 text-sm text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            {localSearch && (
                                <button onClick={handleClearSearch} className="absolute right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    )}
                    {showSearch && (
                        <button
                            onClick={handleSearchClick}
                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/90"
                            title={t('lbl_search')}
                        >
                            <Search className="h-5 w-5" />
                        </button>
                    )}
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm"
                        title={t('btn_filter')}
                    >
                        <Filter className="h-5 w-5" />
                        {activeFilterCount() > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{activeFilterCount()}</span>}
                    </button>
                </div>
                {renderActiveFilters()}
            </div>

            {showMobileFilters && (
                <div className="fixed inset-0 z-[520] md:hidden">
                    <div className="absolute inset-0 bg-black/45" onClick={() => setShowMobileFilters(false)} />
                    <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">{t('lbl_filters_and_search')}</h3>
                                <p className="text-xs text-gray-500">{activeFilterCount() > 0 ? `${activeFilterCount()} ${t('btn_filter')}` : t('lbl_no_active_filters')}</p>
                            </div>
                            <button onClick={() => setShowMobileFilters(false)} className="rounded-full p-2 text-gray-500 hover:bg-gray-100" title={t('lbl_close')}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {renderFilterControls('mobile')}

                        <div className="sticky bottom-0 -mx-4 mt-4 border-t border-gray-100 bg-white p-4">
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
                            >
                                {t('btn_apply')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="hidden rounded-xl border border-[#e8eef4] bg-white p-3 shadow-sm sm:p-4 md:block">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    {showSearch && (
                        <div className="min-w-0 flex-1">
                            <div className="relative flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={placeholder}
                                        value={localSearch}
                                        onChange={(e) => setLocalSearch(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                    />
                                    {localSearch && (
                                        <button onClick={handleClearSearch} className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={handleSearchClick}
                                    className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-white transition-colors hover:bg-primary/90"
                                    title={t('lbl_search')}
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowDesktopFilters((value) => !value)}
                            className={`relative inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                                showDesktopFilters || hasActiveFilters() ? 'border-[#046ca9] bg-[#046ca9]/10 text-[#034d79]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Filter className="h-4 w-4" />
                            {t('btn_filter')}
                            {activeFilterCount() > 0 && <span className="ml-1 rounded-full bg-[#046ca9] px-1.5 py-0.5 text-[10px] font-bold text-white">{activeFilterCount()}</span>}
                        </button>
                        {hasActiveFilters() && (
                            <button
                                onClick={resetFilters}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                title={t('lbl_reset_filters')}
                            >
                                <RotateCcw className="h-4 w-4" />
                                {t('btn_reset')}
                            </button>
                        )}
                    </div>
                </div>

                {showDesktopFilters && (
                    <div className="mt-4 rounded-lg border border-gray-100 bg-slate-50/70 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{t('lbl_filters_and_search')}</p>
                                <p className="text-xs text-gray-500">{t('lbl_no_active_filters')}</p>
                            </div>
                            <button type="button" onClick={() => setShowDesktopFilters(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-white hover:text-gray-700" title={t('lbl_close')}>
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        {renderFilterControls('desktop')}
                    </div>
                )}

                {renderActiveFilters()}
            </div>
        </div>
    );
};

export default UniversalFilter;
