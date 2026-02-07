'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import type { RootState } from '@/store';
import { CreditCard } from 'lucide-react';
import React from 'react';
import { useSelector } from 'react-redux';

interface OrderFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const OrderFilter: React.FC<OrderFilterProps> = ({ onFilterChange }) => {
    const { symbol } = useCurrency();
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('all');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('all');
    const [minAmount, setMinAmount] = React.useState<string>('');
    const [maxAmount, setMaxAmount] = React.useState<string>('');

    const { currentStore, userStores } = useCurrentStore();

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Get payment statuses from Redux
    const paymentStatuses = useSelector((state: RootState) => state.auth.currentStore?.payment_statuses || []);
    const activePaymentStatuses = paymentStatuses.filter((ps) => ps.is_active);

    // Reset function to reset all custom filters
    const handleReset = React.useCallback(() => {
        setSelectedPaymentStatus('all');
        setSelectedPaymentMethod('all');
        setMinAmount('');
        setMaxAmount('');
    }, []);

    // Handle filter changes separately using useEffect
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedPaymentStatus !== 'all') {
            additionalParams.payment_status = selectedPaymentStatus;
        }
        if (selectedPaymentMethod !== 'all') {
            additionalParams.payment_method = selectedPaymentMethod;
        }
        if (minAmount) {
            additionalParams.min_amount = parseFloat(minAmount);
        }
        if (maxAmount) {
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
        }

        const apiParams = buildApiParams(additionalParams);
        onFilterChange(apiParams);
    }, [filters, selectedPaymentStatus, selectedPaymentMethod, minAmount, maxAmount, buildApiParams, onFilterChange, userStores]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedPaymentStatus('all');
        setSelectedPaymentMethod('all');
        setMinAmount('');
        setMaxAmount('');
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Payment Status Filter */}
            <div className="relative">
                <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Payment Status</option>
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

            {/* Amount Range */}
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-40">
                    <input
                        type="number"
                        placeholder="Min Amount"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">{symbol}</span>
                </div>
                <span className="hidden text-gray-500 sm:inline">-</span>
                <div className="relative w-full sm:w-40">
                    <input
                        type="number"
                        placeholder="Max Amount"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">{symbol}</span>
                </div>
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search orders, customers..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default OrderFilter;
