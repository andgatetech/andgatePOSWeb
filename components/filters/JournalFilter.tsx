'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { ArrowDownUp, DollarSign } from 'lucide-react';
import React from 'react';

interface JournalFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    currentStoreId?: number | null;
}

const TYPE_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: 'debit', label: 'Debit' },
    { value: 'credit', label: 'Credit' },
];

const JournalFilter: React.FC<JournalFilterProps> = ({ onFilterChange, currentStoreId }) => {
    const [selectedType, setSelectedType] = React.useState<string>('all');
    const [minAmount, setMinAmount] = React.useState<string>('');
    const [maxAmount, setMaxAmount] = React.useState<string>('');

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Reset function to reset all custom filters
    const handleReset = React.useCallback(() => {
        setSelectedType('all');
        setMinAmount('');
        setMaxAmount('');
    }, []);

    // Handle filter changes
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedType !== 'all') {
            additionalParams.type = selectedType;
        }

        if (minAmount && !isNaN(parseFloat(minAmount))) {
            additionalParams.min_amount = parseFloat(minAmount);
        }

        if (maxAmount && !isNaN(parseFloat(maxAmount))) {
            additionalParams.max_amount = parseFloat(maxAmount);
        }

        // Handle store_ids for 'all' stores
        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);
            if (allStoreIds.length > 1) {
                additionalParams.store_ids = allStoreIds.join(',');
            } else if (allStoreIds.length === 1) {
                additionalParams.store_id = allStoreIds[0];
            }
        } else if (filters.storeId) {
            additionalParams.store_id = filters.storeId;
        } else if (currentStoreId) {
            additionalParams.store_id = currentStoreId;
        }

        const apiParams = buildApiParams(additionalParams);
        onFilterChange({ ...apiParams });
    }, [filters, selectedType, minAmount, maxAmount, buildApiParams, onFilterChange, userStores, currentStoreId]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedType('all');
        setMinAmount('');
        setMaxAmount('');
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Type Filter */}
            <div className="relative">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    {TYPE_OPTIONS.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
                <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Amount Range - Min */}
            <div className="relative">
                <input
                    type="number"
                    placeholder="Min Amount"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-28 rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-32"
                />
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Amount Range - Max */}
            <div className="relative">
                <input
                    type="number"
                    placeholder="Max Amount"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-28 rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-32"
                />
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search journal entries..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
            initialFilters={{
                dateRange: { type: 'none' },
            }}
        />
    );
};

export default JournalFilter;
