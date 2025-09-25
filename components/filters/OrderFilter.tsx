'use client';
import UniversalFilter, { FilterOptions } from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { CreditCard, DollarSign, User } from 'lucide-react';
import React from 'react';

interface OrderFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const OrderFilter: React.FC<OrderFilterProps> = ({ onFilterChange }) => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('all');
    const [selectedOrderStatus, setSelectedOrderStatus] = React.useState<string>('all');
    const [minAmount, setMinAmount] = React.useState<string>('');
    const [maxAmount, setMaxAmount] = React.useState<string>('');

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter({
        onFilterChange: (filters: FilterOptions) => {
            const apiParams = buildApiParams({
                payment_method: selectedPaymentMethod !== 'all' ? selectedPaymentMethod : undefined,
                order_status: selectedOrderStatus !== 'all' ? selectedOrderStatus : undefined,
                min_amount: minAmount ? parseFloat(minAmount) : undefined,
                max_amount: maxAmount ? parseFloat(maxAmount) : undefined,
            });
            onFilterChange(apiParams);
        },
    });

    const customFilters = (
        <>
            {/* Payment Method Filter */}
            <div className="relative">
                <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">All Payment Methods</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile_payment">Mobile Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                </select>
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Order Status Filter */}
            <div className="relative">
                <select
                    value={selectedOrderStatus}
                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
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
                    <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
                    <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
            </div>
        </>
    );

    return (
        <UniversalFilter onFilterChange={handleFilterChange} placeholder="Search orders, customers..." showStoreFilter={true} showDateFilter={true} showSearch={true} customFilters={customFilters} />
    );
};

export default OrderFilter;
