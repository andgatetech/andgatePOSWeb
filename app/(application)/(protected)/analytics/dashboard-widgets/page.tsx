'use client';

import { useEffect, useState } from 'react';
import BrandedPageHeader from '@/components/common/BrandedPageHeader';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetDashboardLayoutQuery, useSaveDashboardLayoutMutation } from '@/store/features/analytics/analyticsApi';
import { GripVertical, LayoutDashboard, Save } from 'lucide-react';

// Business-owner priority sequence: urgent attention → guidance → pulse → action →
// money owed → billing → deep analytics → breakdowns. Keep in sync with
// DashboardLayoutController::DEFAULT_WIDGETS (backend) and components-dashboard-sales.tsx.
const DEFAULT_WIDGETS = [
    { key: 'alerts', label: 'Alerts', visible: true, order: 1, cols: 12 },
    { key: 'onboarding', label: 'Onboarding Checklist', visible: true, order: 2, cols: 12 },
    { key: 'business_health', label: 'Business Health Score', visible: true, order: 3, cols: 12 },
    { key: 'summary', label: 'Summary Cards', visible: true, order: 4, cols: 12 },
    { key: 'quick_actions', label: 'Quick Actions', visible: true, order: 5, cols: 12 },
    { key: 'customer_due', label: 'Customer Due Snapshot', visible: true, order: 6, cols: 12 },
    { key: 'supplier_due', label: 'Supplier Due Snapshot', visible: true, order: 7, cols: 12 },
    { key: 'cash_position', label: 'Cash Position', visible: true, order: 8, cols: 12 },
    { key: 'subscription', label: 'Subscription Status', visible: true, order: 9, cols: 12 },
    { key: 'analytics', label: 'Sales vs Purchase Analytics', visible: true, order: 10, cols: 12 },
    { key: 'sections', label: 'Top Selling / Low Stock / Recent Sales', visible: true, order: 11, cols: 12 },
    { key: 'dead_stock', label: 'Dead Stock', visible: true, order: 12, cols: 12 },
    { key: 'profit_expense', label: 'Profit Trend & Expense Breakdown', visible: true, order: 13, cols: 12 },
    { key: 'section_four', label: 'Payment Methods & Recent Transactions', visible: true, order: 14, cols: 12 },
    { key: 'section_five', label: 'Top Categories / Brands / Purchased', visible: true, order: 15, cols: 9 },
    { key: 'top_customers', label: 'Top Customers', visible: true, order: 16, cols: 3 },
];

export default function DashboardWidgetsPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { data, isLoading } = useGetDashboardLayoutQuery(currentStoreId ? { store_id: currentStoreId } : {}, { skip: false });
    const [saveLayout, { isLoading: saving }] = useSaveDashboardLayoutMutation();

    const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    useEffect(() => {
        const saved = data?.data?.layout?.widgets;
        if (saved?.length) {
            const defaultsByKey = new Map(DEFAULT_WIDGETS.map((w) => [w.key, w]));
            const merged = saved.map((w: (typeof DEFAULT_WIDGETS)[number]) => ({
                ...w,
                label: defaultsByKey.get(w.key)?.label ?? w.label ?? w.key,
            }));
            const savedKeys = new Set(saved.map((w: (typeof DEFAULT_WIDGETS)[number]) => w.key));
            const missing = DEFAULT_WIDGETS.filter((w) => !savedKeys.has(w.key));
            setWidgets([...merged, ...missing]);
        }
    }, [data]);

    const toggle = (key: string) => {
        setWidgets(widgets.map((w) => (w.key === key ? { ...w, visible: !w.visible } : w)));
    };

    const updateCols = (key: string, cols: number) => {
        setWidgets(widgets.map((w) => (w.key === key ? { ...w, cols } : w)));
    };

    const handleDragStart = (index: number) => setDragIndex(index);
    const handleDrop = (index: number) => {
        if (dragIndex === null) return;
        const list = [...widgets];
        const [moved] = list.splice(dragIndex, 1);
        list.splice(index, 0, moved);
        setWidgets(list.map((w, i) => ({ ...w, order: i + 1 })));
        setDragIndex(null);
    };

    const handleSave = async () => {
        await saveLayout({
            store_id: currentStoreId || undefined,
            layout: { widgets },
            is_default: !currentStoreId,
        }).unwrap();
    };

    if (isLoading) return <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-4 text-sm text-gray-500 sm:p-6">{t('lbl_loading')}</div>;

    return (
        <div className="min-h-[calc(100vh-120px)] bg-[#f6f8fb] p-4 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-5">
                <BrandedPageHeader
                    icon={<LayoutDashboard className="h-6 w-6" />}
                    title={t('lbl_dashboard_widgets')}
                    description={t('lbl_dashboard_widgets_desc')}
                    actions={
                        <button onClick={handleSave} disabled={saving} className="btn btn-primary inline-flex items-center gap-2">
                            <Save className="h-4 w-4" /> {saving ? t('lbl_saving') : t('lbl_save_layout')}
                        </button>
                    }
                />

                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>{t('lbl_drag_to_reorder')}</span>
                    </div>
                    <div className="space-y-2">
                        {widgets.map((widget, idx) => (
                            <div
                                key={widget.key}
                                draggable
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(idx)}
                                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                            >
                                <GripVertical className="h-5 w-5 cursor-grab text-gray-400" />
                                <input type="checkbox" checked={widget.visible} onChange={() => toggle(widget.key)} className="form-checkbox" />
                                <span className="flex-1 text-sm font-medium text-gray-700">{widget.label}</span>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-500">{t('lbl_width')}</label>
                                    <select value={widget.cols} onChange={(e) => updateCols(widget.key, Number(e.target.value))} className="form-select text-sm">
                                        <option value={6}>Half (6/12)</option>
                                        <option value={12}>Full (12/12)</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
