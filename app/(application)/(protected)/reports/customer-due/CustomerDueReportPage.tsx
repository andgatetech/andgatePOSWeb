'use client';

import ReportExportToolbar, { ExportColumn } from '@/app/(application)/(protected)/reports/_shared/ReportExportToolbar';
import ReportSummaryCard from '@/app/(application)/(protected)/reports/_shared/ReportSummaryCard';
import DateColumn from '@/components/common/DateColumn';
import ReusableTable from '@/components/common/ReusableTable';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useClearCustomerDueMutation, useCollectCustomerDuePaymentMutation, useGetCustomerDuesQuery, useUpdateCustomerDueFollowUpMutation } from '@/store/features/customerDue/customerDueApi';
import { AlertCircle, Bell, CalendarClock, CheckCircle2, Clock, CreditCard, FileText, MessageCircle, Phone, Receipt, Search, Users, Wallet } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

const paymentMethods = ['cash', 'bkash', 'nagad', 'rocket', 'card', 'bank'];
const followUpActions = [
    { value: 'called', label: 'Called' },
    { value: 'whatsapp_sent', label: 'WhatsApp sent' },
    { value: 'sms_sent', label: 'SMS sent' },
    { value: 'visited', label: 'Visited shop/home' },
    { value: 'promised_to_pay', label: 'Promised to pay' },
    { value: 'no_response', label: 'No response' },
    { value: 'dispute', label: 'Dispute/issue' },
    { value: 'other', label: 'Other' },
];

const bdWhatsAppNumber = (phone?: string) => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('880')) return digits;
    if (digits.startsWith('0')) return `88${digits}`;
    return `880${digits}`;
};

const CustomerDueReportPage = () => {
    const { t } = getTranslation();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId, currentStore, userStores } = useCurrentStore();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [sortField, setSortField] = useState('remaining');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [filters, setFilters] = useState({ search: '', aging: 'all', status: '', follow_up: 'all' });
    const [paymentModal, setPaymentModal] = useState<{ type: 'partial' | 'full'; due: any } | null>(null);
    const [followUpModal, setFollowUpModal] = useState<any | null>(null);
    const [followUpForm, setFollowUpForm] = useState({ action_type: 'called', promised_payment_date: '', reminder_days_before: '1', note: '' });
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNote, setPaymentNote] = useState('');

    const queryParams = useMemo(() => {
        const params: Record<string, any> = {
            page: currentPage,
            per_page: itemsPerPage,
            sort_field: sortField,
            sort_direction: sortDirection,
            aging: filters.aging,
        };
        if (filters.search.trim()) params.search = filters.search.trim();
        if (filters.status) params.status = filters.status;
        if (filters.follow_up && filters.follow_up !== 'all') params.follow_up = filters.follow_up;
        if (currentStoreId) params.store_id = currentStoreId;
        return params;
    }, [currentPage, itemsPerPage, sortField, sortDirection, filters, currentStoreId]);

    const { data: reportData, isLoading, refetch } = useGetCustomerDuesQuery(queryParams, { skip: !currentStoreId });
    const [collectPayment, { isLoading: isCollecting }] = useCollectCustomerDuePaymentMutation();
    const [clearDue, { isLoading: isClearing }] = useClearCustomerDueMutation();
    const [updateFollowUp, { isLoading: isUpdatingFollowUp }] = useUpdateCustomerDueFollowUpMutation();
    const { data: exportData } = useGetCustomerDuesQuery({ ...queryParams, export: true }, { skip: !currentStoreId });

    const dues = useMemo(() => reportData?.data?.dues || [], [reportData]);
    const summary = useMemo(() => reportData?.data?.summary || {}, [reportData]);
    const pagination = useMemo(() => reportData?.data?.pagination || {}, [reportData]);
    const exportRows = useMemo(() => exportData?.data?.dues || dues, [exportData, dues]);

    const selectedStoreName = useMemo(() => {
        if (currentStore?.store_name) return currentStore.store_name;
        return userStores.find((s: any) => s.id === currentStoreId)?.store_name || t('lbl_all_stores');
    }, [currentStore, userStores, currentStoreId, t]);

    const openPaymentModal = (type: 'partial' | 'full', due: any) => {
        setPaymentModal({ type, due });
        setPaymentAmount(type === 'full' ? String(due.remaining || 0) : '');
        setPaymentMethod('cash');
        setPaymentNote('');
    };

    const closePaymentModal = () => {
        setPaymentModal(null);
        setPaymentAmount('');
        setPaymentNote('');
    };

    const openFollowUpModal = (due: any) => {
        setFollowUpModal(due);
        setFollowUpForm({
            action_type: due.last_follow_up_action || 'called',
            promised_payment_date: due.promised_payment_date || '',
            reminder_days_before: String(due.reminder_days_before ?? 1),
            note: '',
        });
    };

    const closeFollowUpModal = () => {
        setFollowUpModal(null);
        setFollowUpForm({ action_type: 'called', promised_payment_date: '', reminder_days_before: '1', note: '' });
    };

    const submitFollowUp = async () => {
        if (!followUpModal || !currentStoreId) return;

        try {
            await updateFollowUp({
                id: followUpModal.id,
                store_id: currentStoreId,
                action_type: followUpForm.action_type,
                promised_payment_date: followUpForm.promised_payment_date,
                reminder_days_before: Number(followUpForm.reminder_days_before || 1),
                note: followUpForm.note,
            }).unwrap();
            Swal.fire(t('msg_success'), 'Customer due follow-up updated.', 'success');
            closeFollowUpModal();
            refetch();
        } catch (error: any) {
            Swal.fire(t('msg_error'), error?.data?.message || 'Failed to update follow-up.', 'error');
        }
    };

    const formatActionLabel = useCallback((action?: string) => followUpActions.find((item) => item.value === action)?.label || (action ? String(action).replaceAll('_', ' ') : 'No action yet'), []);

    const followUpBadgeClass = (status?: string) => {
        if (status === 'promise_overdue') return 'bg-red-100 text-red-800';
        if (status === 'due_today' || status === 'reminder_due') return 'bg-amber-100 text-amber-800';
        if (status === 'scheduled') return 'bg-blue-100 text-blue-800';
        if (status === 'paid') return 'bg-emerald-100 text-emerald-800';
        return 'bg-gray-100 text-gray-700';
    };

    const printReceipt = useCallback(
        (due: any, payment: any) => {
            const receiptWindow = window.open('', '_blank', 'width=420,height=720');
            if (!receiptWindow) return;

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
                            <div class="amount">${formatCurrency(payment.paid_amount || payment.amount || 0)}</div>
                            <div class="row"><span class="label">${t('lbl_receipt_no')}</span><span class="value">${payment.reference_no || due.reference}</span></div>
                            <div class="row"><span class="label">${t('lbl_received_from')}</span><span class="value">${due.customer}</span></div>
                            <div class="row"><span class="label">${t('lbl_contact_no')}</span><span class="value">${due.phone || '-'}</span></div>
                            <div class="row"><span class="label">${t('lbl_payment_method')}</span><span class="value">${payment.payment_method || paymentMethod}</span></div>
                            <div class="row"><span class="label">${t('lbl_payment_for')}</span><span class="value">${t('lbl_customer_due')}</span></div>
                            <div class="row"><span class="label">${t('lbl_remaining_due')}</span><span class="value">${formatCurrency(payment.remaining ?? Math.max(0, Number(due.remaining || 0) - Number(payment.paid_amount || payment.amount || 0)))}</span></div>
                            <div class="footer"><span>${new Date().toLocaleString()}</span><span>${t('lbl_signature')}</span></div>
                        </div>
                        <script>window.print(); setTimeout(() => window.close(), 500);</script>
                    </body>
                </html>
            `);
            receiptWindow.document.close();
        },
        [formatCurrency, paymentMethod, selectedStoreName, t]
    );

    const submitPayment = async () => {
        if (!paymentModal || !currentStoreId) return;
        const due = paymentModal.due;
        const amount = paymentModal.type === 'full' ? Number(due.remaining || 0) : Number(paymentAmount);

        if (!amount || amount <= 0) {
            Swal.fire(t('msg_error'), t('msg_payment_amount_positive'), 'error');
            return;
        }

        if (amount > Number(due.remaining || 0)) {
            Swal.fire(t('msg_error'), t('msg_payment_exceed_due'), 'error');
            return;
        }

        try {
            const payload = { id: due.id, store_id: currentStoreId, amount, payment_method: paymentMethod, note: paymentNote };
            const result = paymentModal.type === 'full' ? await clearDue(payload).unwrap() : await collectPayment(payload).unwrap();
            const payment = result?.data?.payment || { paid_amount: amount, payment_method: paymentMethod, reference_no: due.reference };
            const updatedDue = result?.data?.due || due;
            Swal.fire(t('msg_success'), paymentModal.type === 'full' ? t('msg_full_due_cleared') : t('msg_partial_payment_success'), 'success');
            printReceipt(updatedDue, { ...payment, remaining: updatedDue.remaining });
            closePaymentModal();
            refetch();
        } catch (error: any) {
            Swal.fire(t('msg_error'), error?.data?.message || t('msg_payment_failed'), 'error');
        }
    };

    const handleSort = useCallback(
        (field: string) => {
            if (sortField === field) setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            else {
                setSortField(field);
                setSortDirection('asc');
            }
            setCurrentPage(1);
        },
        [sortField]
    );

    const exportColumns: ExportColumn[] = useMemo(
        () => [
            { key: 'reference', label: t('lbl_reference'), width: 14 },
            { key: 'customer', label: t('lbl_customer'), width: 22 },
            { key: 'phone', label: t('lbl_phone'), width: 15 },
            { key: 'total_due', label: t('lbl_total_due'), width: 14, format: (v) => formatCurrency(v) },
            { key: 'paid', label: t('lbl_paid'), width: 14, format: (v) => formatCurrency(v) },
            { key: 'remaining', label: t('lbl_remaining_due'), width: 14, format: (v) => formatCurrency(v) },
            { key: 'promised_payment_date', label: 'Promise Date', width: 14 },
            { key: 'last_follow_up_action', label: 'Last Follow-up', width: 16, format: (v) => formatActionLabel(v) },
            { key: 'aging_bucket', label: t('lbl_aging'), width: 10 },
            { key: 'status', label: t('lbl_status'), width: 10 },
        ],
        [t, formatCurrency, formatActionLabel]
    );

    const summaryItems = useMemo(
        () => [
            {
                label: t('lbl_customers_with_due'),
                value: formatNumber(summary.total_customers_with_due || 0),
                icon: <Users className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: t('lbl_total_due'),
                value: formatCurrency(summary.total_due),
                icon: <Receipt className="h-4 w-4 text-purple-600" />,
                bgColor: 'bg-purple-500',
                lightBg: 'bg-purple-50',
                textColor: 'text-purple-600',
            },
            {
                label: t('report_total_paid'),
                value: formatCurrency(summary.total_paid),
                icon: <Wallet className="h-4 w-4 text-emerald-600" />,
                bgColor: 'bg-emerald-500',
                lightBg: 'bg-emerald-50',
                textColor: 'text-emerald-600',
            },
            {
                label: t('lbl_remaining_due'),
                value: formatCurrency(summary.total_remaining),
                icon: <AlertCircle className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
            {
                label: t('lbl_over_30_days'),
                value: formatNumber(summary.overdue_30_plus || 0),
                icon: <Clock className="h-4 w-4 text-amber-600" />,
                bgColor: 'bg-amber-500',
                lightBg: 'bg-amber-50',
                textColor: 'text-amber-600',
            },
            {
                label: 'Promise due today',
                value: formatNumber(summary.promised_today || 0),
                icon: <CalendarClock className="h-4 w-4 text-blue-600" />,
                bgColor: 'bg-blue-500',
                lightBg: 'bg-blue-50',
                textColor: 'text-blue-600',
            },
            {
                label: 'Promise overdue',
                value: formatNumber(summary.promise_overdue || 0),
                icon: <Bell className="h-4 w-4 text-red-600" />,
                bgColor: 'bg-red-500',
                lightBg: 'bg-red-50',
                textColor: 'text-red-600',
            },
        ],
        [summary, formatCurrency, formatNumber, t]
    );

    const columns = useMemo(
        () => [
            {
                key: 'reference',
                label: t('lbl_reference'),
                sortable: true,
                render: (value: any, row: any) => (
                    <div className="space-y-1">
                        <span className="font-mono text-sm font-semibold text-gray-900">{value}</span>
                        <div className="text-xs text-gray-500">{row.open_invoice_count} {t('lbl_invoice')}</div>
                    </div>
                ),
            },
            {
                key: 'customer',
                label: t('lbl_customer'),
                sortable: true,
                render: (value: any, row: any) => (
                    <div>
                        <div className="font-semibold text-gray-900">{value}</div>
                        <div className="text-xs text-gray-500">{row.phone || '-'}</div>
                    </div>
                ),
            },
            {
                key: 'promised_payment_date',
                label: 'Promise / follow-up',
                render: (value: any, row: any) => (
                    <div className="space-y-1">
                        {value ? (
                            <div className="font-semibold text-gray-900">
                                <DateColumn date={value} />
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400">No promise date</span>
                        )}
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${followUpBadgeClass(row.follow_up_status)}`}>
                            {String(row.follow_up_status || 'not_scheduled').replaceAll('_', ' ')}
                        </span>
                        <div className="text-xs text-gray-500">{formatActionLabel(row.last_follow_up_action)}</div>
                    </div>
                ),
            },
            { key: 'total_due', label: t('lbl_total_due'), sortable: true, render: (v: any) => <span className="font-semibold text-gray-900">{formatCurrency(v)}</span> },
            { key: 'paid', label: t('lbl_paid'), sortable: true, render: (v: any) => <span className="font-semibold text-emerald-600">{formatCurrency(v)}</span> },
            { key: 'remaining', label: t('lbl_remaining_due'), sortable: true, render: (v: any) => <span className="font-bold text-red-600">{formatCurrency(v)}</span> },
            {
                key: 'aging_bucket',
                label: t('lbl_aging'),
                render: (value: any, row: any) => (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.age_days > 30 ? 'bg-red-100 text-red-800' : row.age_days > 15 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                        {value} {t('lbl_days')}
                    </span>
                ),
            },
            { key: 'oldest_due_date', label: t('lbl_oldest_due'), render: (v: any) => (v ? <DateColumn date={v} /> : <span className="text-xs text-gray-400">-</span>) },
            {
                key: 'status',
                label: t('lbl_status'),
                render: (value: any) => (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${value === 'paid' ? 'bg-emerald-100 text-emerald-800' : value === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                        {value}
                    </span>
                ),
            },
        ],
        [formatActionLabel, formatCurrency, t]
    );

    const actions = useMemo(
        () => [
            {
                label: 'Follow up',
                icon: <MessageCircle className="h-4 w-4" />,
                className: 'text-amber-600',
                onClick: (row: any) => openFollowUpModal(row),
                hidden: (row: any) => Number(row.remaining || 0) <= 0,
            },
            {
                label: t('btn_make_partial_payment'),
                icon: <CreditCard className="h-4 w-4" />,
                className: 'text-blue-600',
                onClick: (row: any) => openPaymentModal('partial', row),
                hidden: (row: any) => Number(row.remaining || 0) <= 0,
            },
            {
                label: t('btn_clear_full_due'),
                icon: <CheckCircle2 className="h-4 w-4" />,
                className: 'text-green-600',
                onClick: (row: any) => openPaymentModal('full', row),
                hidden: (row: any) => Number(row.remaining || 0) <= 0,
            },
        ],
        [t]
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <ReportExportToolbar
                reportTitle={t('report_customer_due_title')}
                reportDescription={t('report_customer_due_desc')}
                reportIcon={<AlertCircle className="h-6 w-6 text-white" />}
                iconBgClass="bg-gradient-to-r from-red-600 to-red-700"
                data={exportRows}
                columns={exportColumns}
                summary={[
                    { label: 'lbl_customers_with_due', value: summary.total_customers_with_due || 0 },
                    { label: 'lbl_remaining_due', value: formatCurrency(summary.total_remaining) },
                ]}
                filterSummary={{ storeName: selectedStoreName, customFilters: [], dateRange: { type: 'none' } }}
                fileName="customer_due_report"
            />

            <ReportSummaryCard items={summaryItems} />

            <div className="mb-5 grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px_200px]">
                <label className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        value={filters.search}
                        onChange={(e) => { setFilters((prev) => ({ ...prev, search: e.target.value })); setCurrentPage(1); }}
                        className="form-input w-full pl-9"
                        placeholder={t('lbl_search_customer_phone')}
                    />
                </label>
                <select value={filters.aging} onChange={(e) => { setFilters((prev) => ({ ...prev, aging: e.target.value })); setCurrentPage(1); }} className="form-select">
                    <option value="all">{t('lbl_all_aging')}</option>
                    <option value="0_7">0-7 {t('lbl_days')}</option>
                    <option value="8_15">8-15 {t('lbl_days')}</option>
                    <option value="16_30">16-30 {t('lbl_days')}</option>
                    <option value="30_plus">30+ {t('lbl_days')}</option>
                </select>
                <select value={filters.status} onChange={(e) => { setFilters((prev) => ({ ...prev, status: e.target.value })); setCurrentPage(1); }} className="form-select">
                    <option value="">{t('lbl_open_due')}</option>
                    <option value="all">{t('lbl_all_status')}</option>
                    <option value="active">{t('lbl_active')}</option>
                    <option value="partial">{t('status_partial')}</option>
                    <option value="paid">{t('status_paid')}</option>
                </select>
                <select value={filters.follow_up} onChange={(e) => { setFilters((prev) => ({ ...prev, follow_up: e.target.value })); setCurrentPage(1); }} className="form-select">
                    <option value="all">All follow-ups</option>
                    <option value="due_today">Promise due today</option>
                    <option value="overdue">Promise overdue</option>
                    <option value="scheduled">Promise scheduled</option>
                    <option value="none">No promise date</option>
                </select>
            </div>

            <ReusableTable
                data={dues}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                pagination={{
                    currentPage,
                    totalPages: pagination.last_page || 1,
                    itemsPerPage,
                    totalItems: pagination.total || 0,
                    onPageChange: setCurrentPage,
                    onItemsPerPageChange: (items) => { setItemsPerPage(items); setCurrentPage(1); },
                }}
                sorting={{ field: sortField, direction: sortDirection, onSort: handleSort }}
                emptyState={{ icon: <FileText className="mx-auto h-16 w-16" />, title: t('report_no_dues_found'), description: t('report_dues_up_to_date') }}
            />

            {paymentModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                        <div className="border-b border-gray-200 p-5">
                            <h2 className="text-lg font-bold text-gray-900">{paymentModal.type === 'full' ? t('btn_clear_full_due') : t('btn_make_partial_payment')}</h2>
                            <p className="mt-1 text-sm text-gray-500">{paymentModal.due.customer} · {paymentModal.due.phone || '-'}</p>
                        </div>
                        <div className="space-y-4 p-5">
                            <div className="rounded-lg bg-red-50 p-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t('lbl_total_due')}</span>
                                    <span className="font-bold text-red-600">{formatCurrency(paymentModal.due.remaining)}</span>
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
                                <textarea value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} className="form-textarea w-full" rows={3} />
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 p-5">
                            <button type="button" className="btn btn-outline-danger" onClick={closePaymentModal}>{t('btn_cancel')}</button>
                            <button type="button" className="btn btn-primary" onClick={submitPayment} disabled={isCollecting || isClearing}>
                                {isCollecting || isClearing ? t('lbl_processing') : t('btn_make_payment')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {followUpModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
                        <div className="border-b border-gray-200 p-5">
                            <h2 className="text-lg font-bold text-gray-900">Customer due follow-up</h2>
                            <p className="mt-1 text-sm text-gray-500">{followUpModal.customer} · {followUpModal.phone || '-'}</p>
                        </div>
                        <div className="space-y-4 p-5">
                            <div className="grid gap-3 rounded-lg bg-red-50 p-3 text-sm sm:grid-cols-2">
                                <div>
                                    <span className="text-gray-600">Remaining due</span>
                                    <div className="font-bold text-red-600">{formatCurrency(followUpModal.remaining)}</div>
                                </div>
                                <div className="flex gap-2 sm:justify-end">
                                    {followUpModal.phone && (
                                        <>
                                            <a className="btn btn-outline-primary px-3 py-2" href={`tel:${followUpModal.phone}`}>
                                                <Phone className="h-4 w-4" />
                                            </a>
                                            <a className="btn btn-outline-success px-3 py-2" href={`https://wa.me/${bdWhatsAppNumber(followUpModal.phone)}`} target="_blank" rel="noreferrer">
                                                <MessageCircle className="h-4 w-4" />
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-gray-700">Action taken</span>
                                <select value={followUpForm.action_type} onChange={(e) => setFollowUpForm((prev) => ({ ...prev, action_type: e.target.value }))} className="form-select w-full">
                                    {followUpActions.map((action) => <option key={action.value} value={action.value}>{action.label}</option>)}
                                </select>
                            </label>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700">Customer promised pay date</span>
                                    <input
                                        type="date"
                                        value={followUpForm.promised_payment_date}
                                        onChange={(e) => setFollowUpForm((prev) => ({ ...prev, promised_payment_date: e.target.value }))}
                                        className="form-input w-full"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700">Notify before days</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="30"
                                        value={followUpForm.reminder_days_before}
                                        onChange={(e) => setFollowUpForm((prev) => ({ ...prev, reminder_days_before: e.target.value }))}
                                        className="form-input w-full"
                                    />
                                </label>
                            </div>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-gray-700">Action note</span>
                                <textarea
                                    value={followUpForm.note}
                                    onChange={(e) => setFollowUpForm((prev) => ({ ...prev, note: e.target.value }))}
                                    className="form-textarea w-full"
                                    rows={3}
                                    placeholder="Example: Customer said he will pay after salary on Friday."
                                />
                            </label>
                            {followUpModal.last_follow_up_note && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                                    <div className="font-semibold text-gray-800">Last note</div>
                                    <p className="mt-1">{followUpModal.last_follow_up_note}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-200 p-5">
                            <button type="button" className="btn btn-outline-danger" onClick={closeFollowUpModal}>{t('btn_cancel')}</button>
                            <button type="button" className="btn btn-primary" onClick={submitFollowUp} disabled={isUpdatingFollowUp}>
                                {isUpdatingFollowUp ? t('lbl_processing') : 'Save follow-up'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDueReportPage;
