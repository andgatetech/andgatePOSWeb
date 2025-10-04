'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { CreditCard, DollarSign } from 'lucide-react';
import React from 'react';

interface TransactionReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const TransactionReportFilter: React.FC<TransactionReportFilterProps> = ({ onFilterChange }) => {
    const [paymentStatus, setPaymentStatus] = React.useState<string>('all');
    const [paymentMethod, setPaymentMethod] = React.useState<string>('all');

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle all filter changes
    React.useEffect(() => {
        const apiParams = buildApiParams({
            payment_status: paymentStatus !== 'all' ? paymentStatus : undefined,
            payment_method: paymentMethod !== 'all' ? paymentMethod : undefined,
        });
        onFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, paymentStatus, paymentMethod]);

    const customFilters = (
        <>
            {/* Payment Status Filter */}
            <div className="relative">
                <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                </select>
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Payment Method Filter */}
            <div className="relative">
                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">All Methods</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="mobile">Mobile Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                </select>
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search transactions, invoices..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            initialFilters={{
                dateRange: { type: 'this_month' },
            }}
        />
    );
};

export default TransactionReportFilter;
