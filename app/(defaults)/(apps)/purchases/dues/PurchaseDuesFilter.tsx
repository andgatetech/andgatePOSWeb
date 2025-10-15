'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { useGetSuppliersQuery } from '@/store/features/supplier/supplierApi';
import React from 'react';

interface PurchaseDuesFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    currentStoreId?: number | null;
}

const PurchaseDuesFilter: React.FC<PurchaseDuesFilterProps> = ({ onFilterChange, currentStoreId }) => {
    const [selectedSupplier, setSelectedSupplier] = React.useState<string>('');
    const [selectedStatus, setSelectedStatus] = React.useState<string>('');

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Fetch suppliers for the dropdown
    const { data: suppliersResponse } = useGetSuppliersQuery(currentStoreId ? { store_id: currentStoreId } : {});
    const suppliers = React.useMemo(() => {
        return Array.isArray(suppliersResponse?.data) ? suppliersResponse.data : [];
    }, [suppliersResponse]);

    // Handle all filter changes in one effect
    React.useEffect(() => {
        const apiParams = buildApiParams({
            supplier_id: selectedSupplier ? parseInt(selectedSupplier) : undefined,
            status: selectedStatus || undefined,
        });

        // Log to see what's being sent
        console.log('PurchaseDuesFilter - API Params:', apiParams);
        console.log('PurchaseDuesFilter - Filters:', filters);
        console.log('PurchaseDuesFilter - Selected Supplier:', selectedSupplier);
        console.log('PurchaseDuesFilter - Selected Status:', selectedStatus);

        onFilterChange(apiParams);
    }, [filters, selectedSupplier, selectedStatus, buildApiParams, onFilterChange]);

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search invoices, suppliers..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={
                <div className="flex gap-3">
                    {/* Supplier Filter */}
                    <div className="min-w-[180px]">
                        <select
                            value={selectedSupplier}
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map((supplier: any) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="min-w-[160px]">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                </div>
            }
            initialFilters={{
                dateRange: { type: 'none' }, // No default date filter
            }}
        />
    );
};

export default PurchaseDuesFilter;
