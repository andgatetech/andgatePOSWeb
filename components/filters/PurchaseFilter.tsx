'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { FileText, Package } from 'lucide-react';
import React from 'react';

interface PurchaseFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    showPurchaseType?: boolean; // For drafts/orders
    showPaymentStatus?: boolean; // For orders only
    showOrderStatus?: boolean; // For orders only
}

const PurchaseFilter: React.FC<PurchaseFilterProps> = ({ onFilterChange, showPurchaseType = true, showPaymentStatus = false, showOrderStatus = false }) => {
    const [selectedPurchaseType, setSelectedPurchaseType] = React.useState<string>('all');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = React.useState<string>('all');
    const [selectedOrderStatus, setSelectedOrderStatus] = React.useState<string>('all');

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Reset function
    const handleReset = React.useCallback(() => {
        setSelectedPurchaseType('all');
        setSelectedPaymentStatus('all');
        setSelectedOrderStatus('all');
    }, []);

    // Handle filter changes
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedPurchaseType !== 'all') {
            additionalParams.purchase_type = selectedPurchaseType;
        }
        if (selectedPaymentStatus !== 'all') {
            additionalParams.payment_status = selectedPaymentStatus;
        }
        if (selectedOrderStatus !== 'all') {
            additionalParams.status = selectedOrderStatus;
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
    }, [filters, selectedPurchaseType, selectedPaymentStatus, selectedOrderStatus, buildApiParams, onFilterChange, userStores]);

    // Reset filters when store selection changes
    React.useEffect(() => {
        setSelectedPurchaseType('all');
        setSelectedPaymentStatus('all');
        setSelectedOrderStatus('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            {/* Purchase Type Filter */}
            {showPurchaseType && (
                <div className="relative">
                    <select
                        value={selectedPurchaseType}
                        onChange={(e) => setSelectedPurchaseType(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                    >
                        <option value="all">All Types</option>
                        <option value="supplier">Supplier</option>
                        <option value="walk_in">Walk-in</option>
                    </select>
                    <FileText className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
            )}

            {/* Payment Status Filter (Orders only) */}
            {showPaymentStatus && (
                <div className="relative">
                    <select
                        value={selectedPaymentStatus}
                        onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                    >
                        <option value="all">All Payment Status</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="pending">Pending</option>
                        <option value="unpaid">Unpaid</option>
                    </select>
                    <Package className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
            )}

            {/* Order Status Filter (Orders only) */}
            {showOrderStatus && (
                <div className="relative">
                    <select
                        value={selectedOrderStatus}
                        onChange={(e) => setSelectedOrderStatus(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                    >
                        <option value="all">All Order Status</option>
                        <option value="ordered">Ordered</option>
                        <option value="partially_received">Partially Received</option>
                        <option value="received">Received</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <Package className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
            )}
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search purchase orders, suppliers..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default PurchaseFilter;
