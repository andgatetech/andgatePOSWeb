'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { Clock } from 'lucide-react';
import React from 'react';

interface IdleProductFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
}

const IdleProductFilter: React.FC<IdleProductFilterProps> = ({ onFilterChange }) => {
    const [idleDays, setIdleDays] = React.useState<number>(30);

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle all filter changes
    React.useEffect(() => {
        const apiParams = buildApiParams({
            idle_days: idleDays,
        });
        onFilterChange(apiParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, idleDays]);

    const customFilters = (
        <>
            {/* Idle Days Filter */}
            <div className="relative">
                <select
                    value={idleDays}
                    onChange={(e) => setIdleDays(Number(e.target.value))}
                    className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value={5}>5 Days Idle</option>
                    <option value={10}>10 Days Idle</option>
                    <option value={15}>15 Days Idle</option>
                    <option value={30}>30 Days Idle</option>
                    <option value={180}>180 Days Idle</option>
                </select>
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search products, SKU, categories..."
            showStoreFilter={true}
            showDateFilter={false}
            showSearch={true}
            customFilters={customFilters}
            initialFilters={{
                dateRange: { type: 'none' },
            }}
        />
    );
};

export default IdleProductFilter;
