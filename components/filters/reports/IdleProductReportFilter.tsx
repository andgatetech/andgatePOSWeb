'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { Clock, Layers } from 'lucide-react';
import React from 'react';

interface IdleProductReportFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    categories?: { id: number; name: string }[];
}

const IdleProductReportFilter: React.FC<IdleProductReportFilterProps> = ({ onFilterChange, categories = [] }) => {
    const [idleDays, setIdleDays] = React.useState<string>('30');
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

    const { userStores } = useCurrentStore();
    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Stabilize the callback to prevent unnecessary re-renders
    const stableOnFilterChange = React.useCallback(onFilterChange, []);

    const handleReset = React.useCallback(() => {
        setIdleDays('30');
        setSelectedCategory('all');
    }, []);

    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        additionalParams.idle_days = parseInt(idleDays);

        if (selectedCategory !== 'all') {
            additionalParams.category_id = parseInt(selectedCategory);
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
    }, [filters, idleDays, selectedCategory]);

    React.useEffect(() => {
        setIdleDays('30');
        setSelectedCategory('all');
    }, [filters.storeId]);

    const customFilters = (
        <>
            <div className="relative">
                <select
                    value={idleDays}
                    onChange={(e) => setIdleDays(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="7">7+ Days Idle</option>
                    <option value="14">14+ Days Idle</option>
                    <option value="30">30+ Days Idle</option>
                    <option value="60">60+ Days Idle</option>
                    <option value="90">90+ Days Idle</option>
                </select>
                <Clock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="relative">
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
                >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <Layers className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
        </>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder="Search products..."
            showStoreFilter={true}
            showDateFilter={false}
            showSearch={true}
            customFilters={customFilters}
            onResetFilters={handleReset}
        />
    );
};

export default IdleProductReportFilter;
