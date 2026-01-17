'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { ClipboardList, CreditCard } from 'lucide-react';
import React from 'react';

interface PurchaseReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const PurchaseReportFilter: React.FC<PurchaseReportFilterProps> = ({ onFilterChange }) => {
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('all');

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Stabilize the callback to prevent unnecessary re-renders
    const stableOnFilterChange = React.useCallback(onFilterChange, []);

    const handleReset = React.useCallback(() => {
        setSelectedStatus('all');
        setSelectedPaymentStatus('all');
    }, []);

    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedStatus !== 'all') {
            additionalParams.status = selectedStatus;
        }
        if (selectedPaymentStatus !== 'all') {
            additionalParams.payment_status = selectedPaymentStatus;
        }

        if (filters.storeId === 'all') {
            const allStoreIds = userStores.map((store: any) => store.id);
            if (allStoreIds.length > 1) {
                additionalParams.store_ids = allStoreIds.join(',');
            } else if (allStoreIds.length === 1) {
                additionalParams.store_id = allStoreIds[0];
            }
        }

        const apiParams = buildApiParams(additionalParams);
        stableOnFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, selectedStatus, selectedPaymentStatus, userStores]);

    React.useEffect(() => {
        setSelectedStatus('all');
        setSelectedPaymentStatus('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            <div className="relative">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Status</option>
                    <option value="ordered">Ordered</option>
                    <option value="received">Received</option>
                </select>
                <ClipboardList className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
                <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Payment</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                </select>
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search purchases..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default PurchaseReportFilter;
