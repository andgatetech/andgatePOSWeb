'use client';
import UniversalFilter, { FilterOptions } from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { CreditCard, User } from 'lucide-react';
import React from 'react';

interface OrderFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const OrderFilter: React.FC<OrderFilterProps> = ({ onFilterChange }) => {
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('all');
    const [minAmount, setMinAmount] = React.useState<string>('');
    const [maxAmount, setMaxAmount] = React.useState<string>('');

    const { currentStore, userStores } = useCurrentStore();

    // Memoize the filter change handler to prevent infinite re-renders
    const handleUniversalFilterChange = React.useCallback((filters: FilterOptions) => {
        // This function should be stable and not recreated on every render
    }, []);

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter({
        onFilterChange: handleUniversalFilterChange,
    });

    // Handle filter changes separately using useEffect
    React.useEffect(() => {
        const apiParams = buildApiParams({
            payment_status: selectedPaymentStatus !== 'all' ? selectedPaymentStatus : 'all',
            min_amount: minAmount ? parseFloat(minAmount) : undefined,
            max_amount: maxAmount ? parseFloat(maxAmount) : undefined,
        });
        onFilterChange(apiParams);
    }, [filters, selectedPaymentStatus, minAmount, maxAmount, buildApiParams, onFilterChange]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedPaymentStatus('all');
        setMinAmount('');
        setMaxAmount('');
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Payment Method Filter */}
            <div className="relative">
                <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">All Payment Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="bank_transfer">Bank Transfer</option>
                </select>
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Payment Status Filter */}
            <div className="relative">
                <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">All Payment Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                </select>
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Amount Range */}
            <div className="flex items-center gap-2">
                <div className="relative">
                    <input
                        type="number"
                        placeholder="Min Amount"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="w-28 rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">৳</span>
                </div>
                <span className="text-gray-500">-</span>
                <div className="relative">
                    <input
                        type="number"
                        placeholder="Max Amount"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="w-28 rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">৳</span>
                </div>
            </div>
        </>
    );

    return (
        <UniversalFilter onFilterChange={handleFilterChange} placeholder="Search orders, customers..." showStoreFilter={true} showDateFilter={true} showSearch={true} customFilters={customFilters} />
    );
};

export default OrderFilter;
