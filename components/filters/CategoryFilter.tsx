'use client';
import UniversalFilter from '@/components/common/UniversalFilter';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useUniversalFilter } from '@/hooks/useUniversalFilter';
import { getTranslation } from '@/i18n';
import { Tag } from 'lucide-react';
import React from 'react';

interface CategoryFilterProps {
    onFilterChange: (apiParams: Record<string, any>) => void;
    currentStoreId?: number | null;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ onFilterChange }) => {
    const { t } = getTranslation();
    const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
    const { userStores } = useCurrentStore();

    const { filters, handleFilterChange, buildApiParams } = useUniversalFilter();

    // Handle all filter changes in one effect
    React.useEffect(() => {
        const additionalParams: Record<string, any> = {};

        if (selectedStatus !== 'all') {
            additionalParams.status = selectedStatus;
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
    }, [filters, selectedStatus, buildApiParams, onFilterChange, userStores]);

    const handleReset = React.useCallback(() => {
        setSelectedStatus('all');
    }, []);

    const customFilters = (
        <div className="relative">
            <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
                <option value="all">{t('lbl_all_status')}</option>
                <option value="active">{t('lbl_active')}</option>
                <option value="inactive">{t('lbl_inactive')}</option>
            </select>
            <Tag className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
    );

    return (
        <UniversalFilter
            onFilterChange={handleFilterChange}
            placeholder={t('placeholder_search_categories')}
            showStoreFilter={true}
            showDateFilter={false}
            showSearch={true}
            customFilters={customFilters}
            customActiveCount={selectedStatus !== 'all' ? 1 : 0}
            onResetFilters={handleReset}
            initialFilters={{
                dateRange: { type: 'none' }, // No default date filter
            }}
        />
    );
};

export default CategoryFilter;
