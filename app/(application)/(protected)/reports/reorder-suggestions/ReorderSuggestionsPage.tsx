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

    const params = useMemo(() => {
        const p: Record<string, any> = {};
        if (currentStoreId) p.store_id = currentStoreId;
        return p;
    }, [currentStoreId]);

    const { data, isLoading } = useGetReorderSuggestionsQuery(params, { skip: !currentStoreId });

    const suggestions = useMemo(() => data?.data?.suggestions || data?.data || [], [data]);

    const columns = [
        { key: 'product_name', label: t('lbl_product_name'), sortable: false },
        { key: 'sku', label: t('lbl_sku'), sortable: false },
        { key: 'current_qty', label: t('lbl_current_stock'), sortable: false },
        { key: 'low_stock_qty', label: t('lbl_reorder_point'), sortable: false },
        { key: 'suggested_reorder_qty', label: t('lbl_suggested_qty'), sortable: false },
        {
            key: 'urgency',
            label: t('lbl_urgency'),
            sortable: false,
            render: (row: any) => (
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                    row.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                    row.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                    row.urgency === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                }`}>
                    {t(`lbl_urgency_${row.urgency}`)}
                </span>
            ),
        },
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
