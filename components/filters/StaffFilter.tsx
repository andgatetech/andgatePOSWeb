'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { Users } from 'lucide-react';
import React from 'react';

interface StaffFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    currentStoreId?: number | null;
}

const StaffFilter: React.FC<StaffFilterProps> = ({ onFilterChange, currentStoreId }) => {
    const [selectedRole, setSelectedRole] = React.useState<string>('all');

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle all filter changes in one effect
    React.useEffect(() => {
        const apiParams = buildApiParams({
            role: selectedRole !== 'all' ? selectedRole : undefined,
        });
        onFilterChange(apiParams);
    }, [filters, selectedRole, buildApiParams, onFilterChange]);

    // Handle reset callback
    const handleResetFilters = React.useCallback(() => {
        setSelectedRole('all');
    }, []);

    const customFilters = (
        <>
            {/* Role Filter */}
            <div className="relative">
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="all">All Roles</option>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="store_admin">Store Admin</option>
                </select>
                <Users className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            placeholder="Search staff members..."
            showStoreFilter={true}
            showDateFilter={true}
            showSearch={true}
            customFilters={customFilters}
            initialFilters={{
                dateRange: { type: 'none' }, // No default date filter
            }}
        />
    );
};

export default StaffFilter;
