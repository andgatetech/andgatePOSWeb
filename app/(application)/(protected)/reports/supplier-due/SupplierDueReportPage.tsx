'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import DateColumn from '@/components/common/DateColumn';
import ReusableTable from '@/components/common/ReusableTable';
import PurchaseReportFilter from '@/components/filters/reports/PurchaseReportFilter';
import { useCurrency } from '@/hooks/useCurrency';
import { getTranslation } from '@/i18n';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useClearFullDueMutation, useMakePartialPaymentMutation } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
import { useGetSupplierDueReportMutation } from '@/store/features/reports/reportApi';
import { AlertCircle, Banknote, CheckCircle2, CreditCard, FileText, Receipt, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';

const paymentMethods = ['cash', 'bkash', 'nagad', 'rocket', 'card', 'bank'];

const SupplierDueReportPage = () => {
    const { t } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [apiParams, setApiParams] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('due');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [paymentModal, setPaymentModal] = useState<{ type: 'partial' | 'full'; due: any } | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNotes, setPaymentNotes] = useState('');

    const [getSupplierDueReport, { data: reportData, isLoading }] = useGetSupplierDueReportMutation();
    const [getSupplierDueReportForExport] = useGetSupplierDueReportMutation();
    const [makePartialPayment, { isLoading: isPaymentLoading }] = useMakePartialPaymentMutation();
    const [clearFullDue, { isLoading: isClearingDue }] = useClearFullDueMutation();

    const lastQueryParams = useRef<string>('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { page: currentPage, per_page: itemsPerPage, sort_field: sortField, sort_direction: sortDirection, ...apiParams };
        if (!params.store_id && !params.store_ids && currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [apiParams, currentStoreId, currentPage, itemsPerPage, sortField, sortDirection]);

    // Reset lastQueryParams when store changes to force API recall
    useEffect(() => {
        lastQueryParams.current = '';
    }, [currentStoreId]);

    useEffect(() => {
        const queryString = JSON.stringify(queryParams);
        if (lastQueryParams.current === queryString) return;
        if (currentStoreId || apiParams.store_id || apiParams.store_ids) {
            lastQueryParams.current = queryString;
            getSupplierDueReport(queryParams);
        }
    }, [queryParams, currentStoreId, apiParams.store_id, apiParams.store_ids, getSupplierDueReport]);

    const orders = useMemo(() => reportData?.data?.pos_orders || reportData?.data?.orders || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const pagination = useMemo(() => reportData?.data?.pagination || {}, [reportData]);

    const handleFilterChange = useCallback((n: Record<string, any>) => {
        setApiParams(n);
        setCurrentPage(1);
    }, []);
    const handleSort = useCallback(
        (f: string) => {
            if (sortField === f) setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
            else {
                setSortField(f);
                setSortDirection('asc');
            }
            setCurrentPage(1);
        },
        [sortField]
    );
    const handlePageChange = useCallback((p: number) => setCurrentPage(p), []);
    const handleItemsPerPageChange = useCallback((i: number) => {
        setItemsPerPage(i);
        setCurrentPage(1);
    }, []);

    const fetchAllDataForExport = useCallback(async (): Promise<any[]> => {
        const exportParams: Record<string, any> = { ...apiParams, export: true, sort_field: sortField, sort_direction: sortDirection };
        if (!exportParams.store_id && !exportParams.store_ids && currentStoreId) exportParams.store_id = currentStoreId;
        try {
            const result = await getSupplierDueReportForExport(exportParams).unwrap();
            return result?.data?.pos_orders || result?.data?.orders || [];
        } catch (e) {
            console.error('Export failed:', e);
            return orders;
        }
    }, [apiParams, currentStoreId, sortField, sortDirection, orders, getSupplierDueReportForExport]);

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'reference', label: t('lbl_reference'), width: 15 },
            { key: 'supplier', label: t('lbl_supplier'), width: 20 },
            { key: 'total_amount', label: t('lbl_total'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'paid', label: t('status_paid'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'due', label: t('lbl_due'), width: 15, format: (v) => formatCurrency(v) },
            { key: 'status', label: t('lbl_status'), width: 10 },
            { key: 'created_at', label: t('lbl_date'), width: 12, format: (v) => v || '' },
        ],
        [t, formatCurrency]
    );

    const filterSummary = useMemo(() => {
        const selectedStore = apiParams.store_ids
            ? t('lbl_all_stores')
            : apiParams.store_id
            ? userStores.find((s: any) => s.id === apiParams.store_id)?.store_name || currentStore?.store_name || t('lbl_all_stores')
            : currentStore?.store_name || t('lbl_all_stores');
        let dateType = 'none';
        if (apiParams.date_range_type) dateType = apiParams.date_range_type;
        else if (apiParams.start_date || apiParams.end_date) dateType = 'custom';
        return { dateRange: { startDate: apiParams.start_date, endDate: apiParams.end_date, type: dateType }, storeName: selectedStore, customFilters: [] };
    }, [apiParams, currentStore, userStores, t]);

    const exportSummary = useMemo(
        () => [
            { label: 'lbl_orders_with_due', value: summary.total_orders_with_due || 0 },
            { label: 'lbl_due', value: formatCurrency(summary.total_due) },
        ],
        [summary, formatCurrency]
    );

    const selectedStoreName = useMemo(() => filterSummary.storeName || currentStore?.store_name || t('lbl_all_stores'), [filterSummary.storeName, currentStore, t]);

    const openPaymentModal = (type: 'partial' | 'full', due: any) => {
        setPaymentModal({ type, due });
        setPaymentAmount(type === 'full' ? String(due.due || 0) : '');
        setPaymentMethod('cash');
        setPaymentNotes('');
    };

    const closePaymentModal = () => {
        setPaymentModal(null);
        setPaymentAmount('');
        setPaymentNotes('');
    };

    const printReceipt = useCallback(
        (due: any, amount: number, method: string) => {
            const receiptWindow = window.open('', '_blank', 'width=420,height=720');
            if (!receiptWindow) return;
            const remaining = Math.max(0, Number(due.due || 0) - amount);
            receiptWindow.document.write(`
                <html>
                    <head>
                        <title>${t('lbl_money_receipt')}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; color: #111827; }
                            .receipt { max-width: 360px; margin: 0 auto; }
                            h1 { font-size: 18px; text-align: center; margin: 0 0 4px; }
                            h2 { font-size: 14px; text-align: center; margin: 0 0 16px; letter-spacing: 1px; }
                            .row { display: flex; justify-content: space-between; gap: 16px; padding: 7px 0; border-bottom: 1px dashed #d1d5db; font-size: 13px; }
                            .label { color: #6b7280; }
                            .value { font-weight: 700; text-align: right; }
                            .amount { font-size: 22px; font-weight: 800; text-align: center; margin: 18px 0; color: #dc2626; }
                            .footer { margin-top: 28px; display: flex; justify-content: space-between; font-size: 12px; color: #4b5563; }
                            @media print { body { padding: 0; } }
                        </style>
                    </head>
                    <body>
                        <div class="receipt">
                            <h1>${selectedStoreName}</h1>
                            <h2>${t('lbl_money_receipt')}</h2>
                            <div class="amount">${formatCurrency(amount)}</div>
                            <div class="row"><span class="label">${t('lbl_reference')}</span><span class="value">${due.reference}</span></div>
                            <div class="row"><span class="label">${t('lbl_supplier')}</span><span class="value">${due.supplier || '-'}</span></div>
                            <div class="row"><span class="label">${t('lbl_payment_method')}</span><span class="value">${method}</span></div>
                            <div class="row"><span class="label">${t('lbl_payment_for')}</span><span class="value">${t('lbl_supplier_due')}</span></div>
                            <div class="row"><span class="label">${t('lbl_remaining_due')}</span><span class="value">${formatCurrency(remaining)}</span></div>
                            <div class="footer"><span>${new Date().toLocaleString()}</span><span>${t('lbl_signature')}</span></div>
                        </div>
                        <script>window.print(); setTimeout(() => window.close(), 500);</script>
                    </body>
                </html>
            `);
            receiptWindow.document.close();
        },
        [formatCurrency, selectedStoreName, t]
    );

    const submitPayment = async () => {
        if (!paymentModal || !currentStoreId) return;
        const due = paymentModal.due;
        const amount = paymentModal.type === 'full' ? Number(due.due || 0) : Number(paymentAmount);
        if (!amount || amount <= 0) {
            Swal.fire(t('msg_error'), t('msg_payment_amount_positive'), 'error');
            return;
        }
        if (amount > Number(due.due || 0)) {
            Swal.fire(t('msg_error'), t('msg_payment_exceed_due'), 'error');
            return;
        }

        try {
            const payload = { id: due.id, store_id: currentStoreId, amount, payment_method: paymentMethod, notes: paymentNotes };
            if (paymentModal.type === 'full') await clearFullDue(payload).unwrap();
            else await makePartialPayment(payload).unwrap();
            Swal.fire(t('msg_success'), paymentModal.type === 'full' ? t('msg_full_due_cleared') : t('msg_partial_payment_success'), 'success');
            printReceipt(due, amount, paymentMethod);
            closePaymentModal();
            lastQueryParams.current = '';
            getSupplierDueReport(queryParams);
        } catch (error: any) {
            Swal.fire(t('msg_error'), error?.data?.message || t('msg_payment_failed'), 'error');
        }
    };

    const summaryItems = useMemo(
        () => [
            {
                label: t('lbl_orders_with_due'),
                value: formatNumber(summary.total_orders_with_due || 0),
                icon: <Receipt className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: t('lbl_total'),
                value: formatCurrency(summary.total_amount),
                icon: <Banknote className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: t('report_total_paid'),
                value: formatCurrency(summary.total_paid),
                icon: <TrendingUp className="h-4 w-4 text-green-600" />,
                bgColor: 'bg-green-500',
                lightBg: 'bg-green-50',
                textColor: 'text-green-600',
            },
            {
                label: t('lbl_due'),
                value: formatCurrency(summary.total_due),
                icon: <AlertCircle className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
        ],
        [summary, formatCurrency, formatNumber, t]
    );

    const columns = useMemo(
        () => [
            { key: 'reference', label: t('lbl_reference'), sortable: true, render: (v: any) => <span className="font-mono text-sm font-semibold text-gray-900">{v}</span> },
            { key: 'supplier', label: t('lbl_supplier'), render: (v: any) => <span className="text-sm text-gray-700">{v || 'N/A'}</span> },
            { key: 'total_amount', label: t('lbl_total'), sortable: true, render: (v: any) => <span className="font-semibold text-gray-900">{formatCurrency(v)}</span> },
            { key: 'paid', label: t('status_paid'), sortable: true, render: (v: any) => <span className="font-semibold text-green-600">{formatCurrency(v)}</span> },
            { key: 'due', label: t('lbl_due'), sortable: true, render: (v: any) => <span className="font-bold text-red-600">{formatCurrency(v)}</span> },
            {
                key: 'status',
                label: t('lbl_status'),
                render: (v: any) => {
                    const s = v?.toLowerCase();
                    let c = 'bg-gray-100 text-gray-800';
                    if (s === 'paid') c = 'bg-green-100 text-green-800';
                    else if (s === 'partial') c = 'bg-yellow-100 text-yellow-800';
                    else if (s === 'pending') c = 'bg-red-100 text-red-800';
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${c}`}>{v}</span>;
                },
            },
            {
                key: 'created_at',
                label: t('lbl_order_date'),
                sortable: true,
                render: (v) => <DateColumn date={v} />,
            },
            {
                key: 'due_date',
                label: t('lbl_due_date'),
                render: (v: any) => (v ? <DateColumn date={v} /> : <span className="text-xs text-gray-400">Not set</span>),
            },
        ],
        [t, formatCurrency]
    );

    const actions = [
        {
            label: t('btn_make_partial_payment'),
            icon: <CreditCard className="h-4 w-4" />,
            className: 'text-blue-600',
            onClick: (row: any) => openPaymentModal('partial', row),
            hidden: (row: any) => Number(row.due || 0) <= 0,
        },
        {
            label: t('btn_clear_full_due'),
            icon: <CheckCircle2 className="h-4 w-4" />,
            className: 'text-green-600',
            onClick: (row: any) => openPaymentModal('full', row),
            hidden: (row: any) => Number(row.due || 0) <= 0,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="mx-auto">
                <ReportExportToolbar
                    reportTitle={t('report_supplier_due_title')}
                    reportDescription={t('report_supplier_due_desc')}
                    reportIcon={<AlertCircle className="h-6 w-6 text-white" />}
                    iconBgClass="bg-gradient-to-r from-red-600 to-red-700"
                    data={orders}
                    columns={exportColumns}
                    summary={exportSummary}
                    filterSummary={filterSummary}
                    fileName="supplier_due_report"
                    fetchAllData={fetchAllDataForExport}
                />
                <ReportSummaryCard items={summaryItems} />
                <div className="mb-6">
                    <PurchaseReportFilter onFilterChange={handleFilterChange} />
                </div>
                <ReusableTable
                    data={orders}
                    columns={columns}
                    actions={actions}
                    isLoading={isLoading}
                    pagination={{
                        currentPage,
                        totalPages: pagination.last_page || 1,
                        itemsPerPage,
                        totalItems: pagination.total || 0,
                        onPageChange: handlePageChange,
                        onItemsPerPageChange: handleItemsPerPageChange,
                    }}
                    sorting={{ field: sortField, direction: sortDirection, onSort: handleSort }}
                    emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: t('report_no_dues_found'), description: t('report_dues_up_to_date') }}
                />
            </div>
            {paymentModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                        <div className="border-b border-gray-200 p-5">
                            <h2 className="text-lg font-bold text-gray-900">{paymentModal.type === 'full' ? t('btn_clear_full_due') : t('btn_make_partial_payment')}</h2>
                            <p className="mt-1 text-sm text-gray-500">{paymentModal.due.supplier || 'N/A'} · {paymentModal.due.reference}</p>
                        </div>
                        <div className="space-y-4 p-5">
                            <div className="rounded-lg bg-red-50 p-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t('lbl_total_due')}</span>
                                    <span className="font-bold text-red-600">{formatCurrency(paymentModal.due.due)}</span>
                                </div>
                            </div>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-gray-700">{t('lbl_payment_amount')}</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    disabled={paymentModal.type === 'full'}
                                    className="form-input w-full"
                                />
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-gray-700">{t('lbl_payment_method')}</span>
                                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="form-select w-full">
                                    {paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-gray-700">{t('lbl_notes_optional')}</span>
                                <textarea value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} className="form-textarea w-full" rows={3} placeholder={t('placeholder_payment_notes')} />
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 p-5">
                            <button type="button" className="btn btn-outline-danger" onClick={closePaymentModal}>{t('btn_cancel')}</button>
                            <button type="button" className="btn btn-primary" onClick={submitPayment} disabled={isPaymentLoading || isClearingDue}>
                                {isPaymentLoading || isClearingDue ? t('lbl_processing') : t('btn_make_payment')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierDueReportPage;
