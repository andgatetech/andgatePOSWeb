'use client';

import ReusableTable from '@/components/common/ReusableTable';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetReorderSuggestionsQuery } from '@/store/features/aiReports/aiReportsApi';
import { BrainCircuit } from 'lucide-react';
import { useState, useMemo } from 'react';

const ReorderSuggestionsPage = () => {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const [threshold, setThreshold] = useState<number | undefined>(undefined);

    const params = useMemo(() => {
        const p: Record<string, any> = {};
        if (currentStoreId) p.store_id = currentStoreId;
        if (threshold !== undefined) p.threshold = threshold;
        return p;
    }, [currentStoreId, threshold]);

    const { data, isLoading } = useGetReorderSuggestionsQuery(params, { skip: !currentStoreId });

    const suggestions = useMemo(() => data?.data?.suggestions || data?.data || [], [data]);

    const columns = [
        { key: 'name', label: t('lbl_product_name'), sortable: false },
        { key: 'sku', label: t('lbl_sku'), sortable: false },
        { key: 'current_stock', label: t('lbl_current_stock'), sortable: false },
        { key: 'reorder_point', label: t('lbl_reorder_point'), sortable: false },
        { key: 'suggested_quantity', label: t('lbl_suggested_qty'), sortable: false },
        { key: 'supplier', label: t('lbl_supplier'), sortable: false },
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#046ca9] to-[#034d79] px-6 py-5 text-white shadow-lg">
                <BrainCircuit className="h-8 w-8 flex-shrink-0 opacity-90" />
                <div>
                    <h1 className="text-xl font-bold">{t('lbl_reorder_suggestions')}</h1>
                    <p className="text-sm opacity-80">{t('lbl_reorder_suggestions_desc')}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-medium text-gray-600">{t('lbl_threshold')}:</label>
                <input
                    type="number"
                    min={0}
                    value={threshold ?? ''}
                    onChange={(e) => setThreshold(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder={t('lbl_min_stock_level')}
                    className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            <ReusableTable
                columns={columns}
                data={suggestions}
                isLoading={isLoading}
                emptyMessage={t('lbl_no_reorder_suggestions')}
            />
        </div>
    );
};

export default ReorderSuggestionsPage;
