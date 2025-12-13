'use client';

import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { DollarSign, Package } from 'lucide-react';
import React from 'react';

interface PurchaseDuesFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const PurchaseDuesFilter: React.FC<PurchaseDuesFilterProps> = ({ onFilterChange }) => {
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState('all');
    const [selectedOrderStatus, setSelectedOrderStatus] = React.useState('all');
    const [hasDueOnly, setHasDueOnly] = React.useState(false);

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle filter changes
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        // Exclude orders that are both received AND paid (completed orders)
        additionalParams.exclude_completed = 'true';

        // Payment Status filter
        if (selectedPaymentStatus !== 'all') {
            additionalParams.payment_status = selectedPaymentStatus;
        }

        // Order Status filter
        if (selectedOrderStatus !== 'all') {
            additionalParams.status = selectedOrderStatus;
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
    }, [filters, selectedPaymentStatus, selectedOrderStatus, hasDueOnly, buildApiParams, onFilterChange, userStores]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedPaymentStatus('all');
        setSelectedOrderStatus('all');
        setHasDueOnly(false);
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Order Status Filter */}
            <div className="relative">
                <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                    value={selectedOrderStatus}
                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Orders</option>
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                    <option value="ordered">Ordered</option>
                    <option value="partially_received">Partially Received</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Payment Status Filter */}
            <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Payment Status</option>
                    <option value="pending">Pending</option>
                    <option value="due">Due</option>
                    <option value="partial">Partial</option>
                    <option value="advanced">Advanced</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            
        </>
    );

    return <UniversalFilter  onFilterChange={handleFilterChange} customFilters={customFilters} />;
};

export default PurchaseDuesFilter;
