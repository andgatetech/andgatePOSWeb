'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useCreateCustomReportMutation, useDeleteCustomReportMutation, useGetCustomReportsQuery, useUpdateCustomReportMutation } from '@/store/features/analytics/analyticsApi';
import { BarChart3, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';

const REPORT_TYPES = [
    { value: 'sales', label: 'Sales' },
    { value: 'expenses', label: 'Expenses' },
    { value: 'inventory', label: 'Inventory' },
];

const COLUMN_OPTIONS: Record<string, { value: string; label: string }[]> = {
    sales: [
        { value: 'id', label: 'Order ID' },
        { value: 'date', label: 'Date' },
        { value: 'customer', label: 'Customer' },
        { value: 'payment_status', label: 'Payment Status' },
        { value: 'payment_method', label: 'Payment Method' },
        { value: 'subtotal', label: 'Subtotal' },
        { value: 'tax', label: 'Tax' },
        { value: 'discount', label: 'Discount' },
        { value: 'grand_total', label: 'Grand Total' },
        { value: 'status', label: 'Status' },
    ],
    expenses: [
        { value: 'id', label: 'ID' },
        { value: 'date', label: 'Date' },
        { value: 'category', label: 'Category' },
        { value: 'amount', label: 'Amount' },
        { value: 'reference', label: 'Reference' },
        { value: 'notes', label: 'Notes' },
    ],
    inventory: [
        { value: 'product', label: 'Product' },
        { value: 'sku', label: 'SKU' },
        { value: 'category', label: 'Category' },
        { value: 'brand', label: 'Brand' },
        { value: 'quantity', label: 'Quantity' },
        { value: 'purchase_price', label: 'Purchase Price' },
        { value: 'stock_value', label: 'Stock Value' },
        { value: 'low_stock_quantity', label: 'Low Stock Qty' },
    ],
};

const GROUP_OPTIONS: Record<string, { value: string; label: string }[]> = {
    sales: [
        { value: '', label: 'None' },
        { value: 'date', label: 'Date' },
        { value: 'payment_status', label: 'Payment Status' },
        { value: 'payment_method', label: 'Payment Method' },
        { value: 'customer', label: 'Customer' },
    ],
    expenses: [
        { value: '', label: 'None' },
        { value: 'date', label: 'Date' },
        { value: 'category', label: 'Category' },
    ],
    inventory: [
        { value: '', label: 'None' },
        { value: 'category', label: 'Category' },
    ],
};

const AGGREGATE_COLUMNS: Record<string, string[]> = {
    sales: ['grand_total', 'subtotal', 'tax', 'discount', 'quantity'],
    expenses: ['amount'],
    inventory: ['quantity', 'purchase_price', 'stock_value'],
};

const emptyForm = {
    name: '',
    description: '',
    report_type: 'sales',
    columns: ['date', 'grand_total'],
    filters: { start_date: '', end_date: '', payment_status: '', payment_method: '', category: '', low_stock: false },
    group_by: '',
    aggregate: { column: 'grand_total', method: 'sum' },
    sort_by: 'date',
    sort_order: 'desc',
    is_active: true,
    is_shared: false,
};

export default function CustomReportsPage() {
    const { t } = getTranslation();
    const router = useRouter();
    const { currentStoreId } = useCurrentStore();
    const { data, isLoading, refetch } = useGetCustomReportsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const [createReport] = useCreateCustomReportMutation();
    const [updateReport] = useUpdateCustomReportMutation();
    const [deleteReport] = useDeleteCustomReportMutation();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<any>(emptyForm);
    const [dragIndex, setDragIndex] = useState<number | null>(null);

    const reports = data?.data?.reports || [];

    const columnOptions = useMemo(() => COLUMN_OPTIONS[form.report_type] || [], [form.report_type]);
    const groupOptions = useMemo(() => GROUP_OPTIONS[form.report_type] || [], [form.report_type]);
    const aggregateOptions = useMemo(() => columnOptions.filter((c) => AGGREGATE_COLUMNS[form.report_type]?.includes(c.value)), [columnOptions, form.report_type]);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (report: any) => {
        setEditingId(report.id);
        setForm({
            name: report.name || '',
            description: report.description || '',
            report_type: report.report_type,
            columns: report.config?.columns || COLUMN_OPTIONS[report.report_type].map((c) => c.value),
            filters: { ...emptyForm.filters, ...(report.config?.filters || {}) },
            group_by: report.config?.group_by || '',
            aggregate: report.config?.aggregate || { column: AGGREGATE_COLUMNS[report.report_type]?.[0] || 'grand_total', method: 'sum' },
            sort_by: report.config?.sort_by || 'date',
            sort_order: report.config?.sort_order || 'desc',
            is_active: report.is_active ?? true,
            is_shared: report.is_shared ?? false,
        });
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('msg_confirm_delete'))) return;
        await deleteReport(id).unwrap();
        refetch();
    };

    const toggleColumn = (value: string) => {
        const cols = form.columns.includes(value) ? form.columns.filter((c: string) => c !== value) : [...form.columns, value];
        setForm({ ...form, columns: cols });
    };

    const handleDragStart = (index: number) => setDragIndex(index);
    const handleDrop = (index: number) => {
        if (dragIndex === null) return;
        const cols = [...form.columns];
        const [moved] = cols.splice(dragIndex, 1);
        cols.splice(index, 0, moved);
        setForm({ ...form, columns: cols });
        setDragIndex(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentStoreId) return;
        const payload = {
            store_id: currentStoreId,
            name: form.name,
            description: form.description,
            report_type: form.report_type,
            config: {
                columns: form.columns,
                filters: form.filters,
                group_by: form.group_by,
                aggregate: form.group_by ? form.aggregate : null,
                sort_by: form.sort_by,
                sort_order: form.sort_order,
            },
            is_active: form.is_active,
            is_shared: form.is_shared,
        };
        if (editingId) {
            await updateReport({ id: editingId, ...payload }).unwrap();
        } else {
            await createReport(payload).unwrap();
        }
        setModalOpen(false);
        refetch();
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('lbl_custom_reports')}</h1>
                    <p className="text-sm text-gray-500">{t('lbl_custom_reports_desc')}</p>
                </div>
                <button onClick={openCreate} className="btn btn-primary inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" /> {t('lbl_add_custom_report')}
                </button>
            </div>

            {isLoading ? (
                <p className="text-sm text-gray-500">{t('lbl_loading')}</p>
            ) : reports.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-3 text-sm text-gray-500">{t('msg_no_custom_reports')}</p>
                    <button onClick={openCreate} className="btn btn-outline-primary mt-4">
                        {t('lbl_add_custom_report')}
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {reports.map((report: any) => (
                        <div key={report.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-bold text-gray-900">{report.name}</p>
                                    <p className="text-xs capitalize text-gray-500">{report.report_type}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(report)} className="rounded p-1.5 text-gray-500 hover:bg-gray-100">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDelete(report.id)} className="rounded p-1.5 text-danger hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            {report.description && <p className="mt-2 text-sm text-gray-600">{report.description}</p>}
                            <button onClick={() => router.push(`/analytics/custom-reports/${report.id}`)} className="btn btn-outline-primary mt-4 w-full text-sm">
                                {t('lbl_run_report')}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-gray-900">{editingId ? t('lbl_edit_custom_report') : t('lbl_add_custom_report')}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_name')}</label>
                                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="form-input w-full" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_report_type')}</label>
                                    <select
                                        value={form.report_type}
                                        onChange={(e) => {
                                            const type = e.target.value;
                                            setForm({
                                                ...form,
                                                report_type: type,
                                                columns: COLUMN_OPTIONS[type].slice(0, 3).map((c) => c.value),
                                                group_by: '',
                                                aggregate: { column: AGGREGATE_COLUMNS[type]?.[0] || '', method: 'sum' },
                                            });
                                        }}
                                        className="form-select w-full"
                                    >
                                        {REPORT_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_description')}</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="form-textarea w-full" />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_columns')}</label>
                                <div className="rounded-lg border border-gray-200 p-3">
                                    {columnOptions.map((col, idx) => (
                                        <div
                                            key={col.value}
                                            draggable
                                            onDragStart={() => handleDragStart(idx)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={() => handleDrop(idx)}
                                            className="flex items-center gap-2 py-1"
                                        >
                                            <GripVertical className="h-4 w-4 cursor-grab text-gray-400" />
                                            <input type="checkbox" checked={form.columns.includes(col.value)} onChange={() => toggleColumn(col.value)} className="form-checkbox" />
                                            <span className="text-sm text-gray-700">{col.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_start_date')}</label>
                                    <input
                                        type="date"
                                        value={form.filters.start_date}
                                        onChange={(e) => setForm({ ...form, filters: { ...form.filters, start_date: e.target.value } })}
                                        className="form-input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_end_date')}</label>
                                    <input
                                        type="date"
                                        value={form.filters.end_date}
                                        onChange={(e) => setForm({ ...form, filters: { ...form.filters, end_date: e.target.value } })}
                                        className="form-input w-full"
                                    />
                                </div>
                            </div>

                            {form.report_type === 'sales' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_payment_status')}</label>
                                        <input
                                            value={form.filters.payment_status}
                                            onChange={(e) => setForm({ ...form, filters: { ...form.filters, payment_status: e.target.value } })}
                                            className="form-input w-full"
                                            placeholder="e.g. Paid"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_payment_method')}</label>
                                        <input
                                            value={form.filters.payment_method}
                                            onChange={(e) => setForm({ ...form, filters: { ...form.filters, payment_method: e.target.value } })}
                                            className="form-input w-full"
                                            placeholder="e.g. Cash"
                                        />
                                    </div>
                                </div>
                            )}

                            {form.report_type === 'expenses' && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_category')}</label>
                                    <input value={form.filters.category} onChange={(e) => setForm({ ...form, filters: { ...form.filters, category: e.target.value } })} className="form-input w-full" />
                                </div>
                            )}

                            {form.report_type === 'inventory' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.filters.low_stock}
                                        onChange={(e) => setForm({ ...form, filters: { ...form.filters, low_stock: e.target.checked } })}
                                        className="form-checkbox"
                                    />
                                    <label className="text-sm">{t('lbl_low_stock_only')}</label>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_group_by')}</label>
                                    <select value={form.group_by} onChange={(e) => setForm({ ...form, group_by: e.target.value })} className="form-select w-full">
                                        {groupOptions.map((g) => (
                                            <option key={g.value} value={g.value}>
                                                {g.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {form.group_by && aggregateOptions.length > 0 && (
                                    <>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_aggregate_column')}</label>
                                            <select
                                                value={form.aggregate.column}
                                                onChange={(e) => setForm({ ...form, aggregate: { ...form.aggregate, column: e.target.value } })}
                                                className="form-select w-full"
                                            >
                                                {aggregateOptions.map((c) => (
                                                    <option key={c.value} value={c.value}>
                                                        {c.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_aggregate_method')}</label>
                                            <select
                                                value={form.aggregate.method}
                                                onChange={(e) => setForm({ ...form, aggregate: { ...form.aggregate, method: e.target.value } })}
                                                className="form-select w-full"
                                            >
                                                {['sum', 'avg', 'count', 'max', 'min'].map((m) => (
                                                    <option key={m} value={m}>
                                                        {m}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_sort_by')}</label>
                                    <select value={form.sort_by} onChange={(e) => setForm({ ...form, sort_by: e.target.value })} className="form-select w-full">
                                        {columnOptions.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t('lbl_sort_order')}</label>
                                    <select value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="form-select w-full">
                                        <option value="asc">Ascending</option>
                                        <option value="desc">Descending</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="form-checkbox" />
                                    <label className="text-sm">{t('lbl_active')}</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={form.is_shared} onChange={(e) => setForm({ ...form, is_shared: e.target.checked })} className="form-checkbox" />
                                    <label className="text-sm">{t('lbl_shared')}</label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline-secondary">
                                    {t('lbl_cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? t('lbl_update') : t('lbl_save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
