'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { ChevronDown } from 'lucide-react';
import React from 'react';

interface PurchaseFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    showDraftFilters?: boolean; // If true, show draft-specific filters
}

const PurchaseFilter: React.FC<PurchaseFilterProps> = ({ onFilterChange, showDraftFilters = false }) => {
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('all');
    const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);
    const [showPaymentStatusDropdown, setShowPaymentStatusDropdown] = React.useState(false);
    const [resetTrigger, setResetTrigger] = React.useState(0);

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Reset function to reset all custom filters
    const handleReset = React.useCallback(() => {
        setSelectedStatus('all');
        setSelectedPaymentStatus('all');
        setResetTrigger((prev) => prev + 1); // Trigger UniversalFilter reset
    }, []);

    // Status options for purchase orders
    const ORDER_STATUS_OPTIONS = [
        { value: 'all', label: 'All Statuses' },
        { value: 'draft', label: 'Draft' },
        { value: 'approved', label: 'Approved' },
        { value: 'ordered', label: 'Ordered' },
        { value: 'partially_received', label: 'Partially Received' },
        { value: 'received', label: 'Received' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    // Status options for purchase drafts
    const DRAFT_STATUS_OPTIONS = [
        { value: 'all', label: 'All Statuses' },
        { value: 'preparing', label: 'Preparing' },
        { value: 'converted_to_purchase', label: 'Converted' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    // Payment status options
    const PAYMENT_STATUS_OPTIONS = [
        { value: 'all', label: 'All Payment Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'due', label: 'Due' },
        { value: 'partial', label: 'Partial' },
        { value: 'advanced', label: 'Advanced' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
    ];

    const statusOptions = showDraftFilters ? DRAFT_STATUS_OPTIONS : ORDER_STATUS_OPTIONS;

    // Handle all filter changes in one effect
    React.useEffect(() => {
        const apiParams = buildApiParams({
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            payment_status: !showDraftFilters && selectedPaymentStatus !== 'all' ? selectedPaymentStatus : undefined,
        });
        onFilterChange(apiParams);
    }, [filters, selectedStatus, selectedPaymentStatus, showDraftFilters, buildApiParams, onFilterChange]);

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder={showDraftFilters ? 'Search drafts...' : 'Search purchase orders...'}
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            initialFilters={{
                dateRange: { type: 'this_month' }, // Default to current month
            }}
            onResetFilters={handleReset}
            externalResetTrigger={resetTrigger}
            customFilters={
                <div className="flex gap-3">
                    {/* Status Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <span className="text-sm">{statusOptions.find((opt) => opt.value === selectedStatus)?.label}</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>

                        {showStatusDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                                <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                                    {statusOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSelectedStatus(option.value);
                                                setShowStatusDropdown(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${selectedStatus === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Payment Status Filter (only for purchase orders) */}
                    {!showDraftFilters && (
                        <div className="relative">
                            <button
                                onClick={() => setShowPaymentStatusDropdown(!showPaymentStatusDropdown)}
                                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <span className="text-sm">{PAYMENT_STATUS_OPTIONS.find((opt) => opt.value === selectedPaymentStatus)?.label}</span>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>

                            {showPaymentStatusDropdown && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowPaymentStatusDropdown(false)} />
                                    <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                                        {PAYMENT_STATUS_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSelectedPaymentStatus(option.value);
                                                    setShowPaymentStatusDropdown(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                                                    selectedPaymentStatus === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            }
        />
    );
};

export default PurchaseFilter;
