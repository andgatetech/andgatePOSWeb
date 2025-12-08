'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { DollarSign } from 'lucide-react';
import React from 'react';

interface PurchaseDuesFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const PurchaseDuesFilter: React.FC<PurchaseDuesFilterProps> = ({ onFilterChange }) => {
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
    const [hasDueOnly, setHasDueOnly] = React.useState<boolean>(false);

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle filter changes
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        // Status filter
        if (selectedStatus !== 'all') {
            additionalParams.status = selectedStatus;
        }

        // Due only filter
        if (hasDueOnly) {
            additionalParams.has_due_only = 'true';
        }

        // Handle store_ids for 'all' stores
        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);
            if (allStoreIds.length > 1) {
                additionalParams.store_ids = allStoreIds.join(',');
            } else if (allStoreIds.length === 1) {
                additionalParams.store_id = allStoreIds[0];
            }
        }

        const apiParams = buildApiParams(additionalParams);
        onFilterChange(apiParams);
    }, [filters, selectedStatus, hasDueOnly, buildApiParams, onFilterChange, userStores]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedStatus('all');
        setHasDueOnly(false);
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Payment Status Filter */}
            <div className="relative">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                </select>
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Has Due Only Checkbox */}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5">
                <input type="checkbox" checked={hasDueOnly} onChange={(e) => setHasDueOnly(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-gray-700">Only with Due</span>
            </label>
        </>
    );

    return <UniversalFilter onFilterChange={handleFilterChange} customFilters={customFilters} />;
};

export default PurchaseDuesFilter;
