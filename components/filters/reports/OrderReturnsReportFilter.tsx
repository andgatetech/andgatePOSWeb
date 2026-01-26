'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { CreditCard, RefreshCw, Tag } from 'lucide-react';
import React from 'react';

interface OrderReturnsReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const OrderReturnsReportFilter: React.FC<OrderReturnsReportFilterProps> = ({ onFilterChange }) => {
    const [selectedReturnType, setSelectedReturnType] = React.useState<string>('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('all');
    const [selectedReturnReason, setSelectedReturnReason] = React.useState<string>('all');

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    const stableOnFilterChange = React.useCallback(onFilterChange, []);

    const handleReset = React.useCallback(() => {
        setSelectedReturnType('all');
        setSelectedPaymentStatus('all');
        setSelectedReturnReason('all');
    }, []);

    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedReturnType !== 'all') {
            additionalParams.return_type = selectedReturnType;
        }
        if (selectedPaymentStatus !== 'all') {
            additionalParams.payment_status = selectedPaymentStatus;
        }
        if (selectedReturnReason !== 'all') {
            additionalParams.return_reason = selectedReturnReason;
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
    }, [filters, selectedReturnType, selectedPaymentStatus, selectedReturnReason]);

    React.useEffect(() => {
        setSelectedReturnType('all');
        setSelectedPaymentStatus('all');
        setSelectedReturnReason('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Return Type Filter */}
            <div className="relative">
                <select
                    value={selectedReturnType}
                    onChange={(e) => setSelectedReturnType(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Types</option>
                    <option value="return">Return Only</option>
                    <option value="exchange">Exchange</option>
                </select>
                <RefreshCw className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Payment Status Filter */}
            <div className="relative">
                <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="partial">Partial</option>
                </select>
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Return Reason Filter */}
            <div className="relative">
                <select
                    value={selectedReturnReason}
                    onChange={(e) => setSelectedReturnReason(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Reasons</option>
                    <option value="defective">Defective</option>
                    <option value="wrong_item">Wrong Item</option>
                    <option value="damaged">Damaged</option>
                    <option value="customer_request">Customer Request</option>
                    <option value="other">Other</option>
                </select>
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search return number, invoice, customer..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default OrderReturnsReportFilter;
