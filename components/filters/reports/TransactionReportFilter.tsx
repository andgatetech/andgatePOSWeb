'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import type { RootState } from '@/store';
import { CreditCard, Wallet } from 'lucide-react';
import React from 'react';
import { useSelector } from 'react-redux';

interface TransactionReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const TransactionReportFilter: React.FC<TransactionReportFilterProps> = ({ onFilterChange }) => {
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('all');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('all');

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Get payment methods and statuses from Redux
    const paymentMethods = useSelector((state: RootState) => state.auth.currentStore?.payment_methods || []);
    const paymentStatuses = useSelector((state: RootState) => state.auth.currentStore?.payment_statuses || []);
    const activePaymentMethods = paymentMethods.filter((pm) => pm.is_active);
    const activePaymentStatuses = paymentStatuses.filter((ps) => ps.is_active);

    // Stabilize the callback to prevent unnecessary re-renders
    const stableOnFilterChange = React.useCallback(onFilterChange, [onFilterChange]);

    const handleReset = React.useCallback(() => {
        setSelectedPaymentStatus('all');
        setSelectedPaymentMethod('all');
    }, []);

    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedPaymentStatus !== 'all') {
            additionalParams.payment_status = selectedPaymentStatus;
        }
        if (selectedPaymentMethod !== 'all') {
            additionalParams.payment_method = selectedPaymentMethod;
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
    }, [filters, selectedPaymentStatus, selectedPaymentMethod]);

    React.useEffect(() => {
        setSelectedPaymentStatus('all');
        setSelectedPaymentMethod('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            <div className="relative">
                <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Status</option>
                    {activePaymentStatuses.length > 0 ? (
                        activePaymentStatuses.map((status) => (
                            <option key={status.id} value={status.status_name}>
                                {status.status_name.charAt(0).toUpperCase() + status.status_name.slice(1)}
                            </option>
                        ))
                    ) : (
                        <>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="pending">Pending</option>
                        </>
                    )}
                </select>
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
                <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Methods</option>
                    {activePaymentMethods.length > 0 ? (
                        activePaymentMethods.map((method) => (
                            <option key={method.id} value={method.payment_method_name}>
                                {method.payment_method_name.charAt(0).toUpperCase() + method.payment_method_name.slice(1)}
                            </option>
                        ))
                    ) : (
                        <option value="cash">Cash</option>
                    )}
                </select>
                <Wallet className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search transactions..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default TransactionReportFilter;
