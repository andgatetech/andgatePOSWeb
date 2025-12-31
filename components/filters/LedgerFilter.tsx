'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { BookOpen, CheckCircle } from 'lucide-react';
import React from 'react';

interface LedgerFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    currentStoreId?: number | null;
}

const LEDGER_TYPES = [
    { value: 'all', label: 'All Types' },
    { value: 'Assets', label: 'Assets' },
    { value: 'Expenses', label: 'Expenses' },
    { value: 'Income', label: 'Income' },
    { value: 'Liabilities', label: 'Liabilities' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

const LedgerFilter: React.FC<LedgerFilterProps> = ({ onFilterChange, currentStoreId }) => {
    const [selectedType, setSelectedType] = React.useState<string>('all');
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Reset function to reset all custom filters
    const handleReset = React.useCallback(() => {
        setSelectedType('all');
        setSelectedStatus('all');
    }, []);

    // Handle filter changes
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedType !== 'all') {
            additionalParams.ledger_type = selectedType;
        }

        if (selectedStatus !== 'all') {
            additionalParams.status = selectedStatus;
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
            // Specific store selected - make sure it's included
            additionalParams.store_id = filters.storeId;
        } else if (currentStoreId) {
            // Fallback to currentStoreId if no filter is set yet
            additionalParams.store_id = currentStoreId;
        }

        const apiParams = buildApiParams(additionalParams);

        // Debug log to see what params are being sent
        console.log('LedgerFilter - Sending API params:', JSON.stringify(apiParams));

        onFilterChange({ ...apiParams }); // Create new object reference to ensure state update
    }, [filters, selectedType, selectedStatus, buildApiParams, onFilterChange, userStores, currentStoreId]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedType('all');
        setSelectedStatus('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Ledger Type Filter */}
            <div className="relative">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    {LEDGER_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
                <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Status Filter */}
            <div className="relative">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
                <CheckCircle className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search ledgers by title..."
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

export default LedgerFilter;
