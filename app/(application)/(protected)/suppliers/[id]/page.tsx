'use client';

import DateColumn from '@/components/common/DateColumn';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { addSupplierTask, buildSupplierWhatsAppUrl, SupplierTask, supplierWhatsappTemplates, getSupplierTasks, updateSupplierTaskStatus } from '@/lib/supplier-crm';
import { showMessage } from '@/lib/toast';
import { useGetSupplierDueReportMutation, useGetSupplierReportMutation } from '@/store/features/reports/reportApi';
import { useGetSingleSupplierQuery } from '@/store/features/supplier/supplierApi';
import { ArrowLeft, Banknote, CheckCircle2, Clipboard, CreditCard, MessageCircle, Phone, Plus, Receipt, StickyNote, Truck, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);

export default function Supplier360Page() {
    const { t } = getTranslation();
    const { id } = useParams();
    const router = useRouter();
    const { formatCurrency, formatNumber } = useCurrency();
    const { currentStoreId, currentStore } = useCurrentStore();
    const supplierId = String(id || '');
    const { data: supplierResponse, isLoading } = useGetSingleSupplierQuery(supplierId, { skip: !supplierId });
    const [getSupplierReport, { data: purchaseReportData, isLoading: isPurchaseLoading }] = useGetSupplierReportMutation();
    const [getSupplierDueReport, { data: dueReportData, isLoading: isDueLoading }] = useGetSupplierDueReportMutation();

    const [tasks, setTasks] = useState<SupplierTask[]>([]);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskType, setTaskType] = useState<SupplierTask['type']>('call');
    const [taskDueDate, setTaskDueDate] = useState(today());
    const [taskNote, setTaskNote] = useState('');

    const supplier = supplierResponse?.data?.supplier || supplierResponse?.data || supplierResponse;
    const storeName = currentStore?.store_name || 'AndgatePOS';

    useEffect(() => {
        if (supplierId) {
            setTasks(getSupplierTasks().filter((task) => String(task.supplierId) === supplierId));
        }
    }, [supplierId]);

    useEffect(() => {
        if (!supplierId || !currentStoreId) return;

        const params = { store_id: currentStoreId, supplier_id: supplierId, search: supplier?.name || '', per_page: 8 };
        getSupplierReport(params);
        getSupplierDueReport(params);
    }, [currentStoreId, getSupplierDueReport, getSupplierReport, supplier?.name, supplierId]);

    const purchaseOrders = useMemo(() => purchaseReportData?.data?.pos_orders || [], [purchaseReportData]);
    const purchaseSummary = purchaseReportData?.data?.summary || {};
    const dueOrders = useMemo(() => dueReportData?.data?.pos_orders || dueReportData?.data?.orders || [], [dueReportData]);
    const dueSummary = dueReportData?.data?.summary || {};
    const currentDue = Number(dueSummary.total_due || 0);
    const totalPurchase = Number(purchaseSummary.total_amount || dueSummary.total_amount || 0);
    const totalPaid = Number(purchaseSummary.total_paid || dueSummary.total_paid || 0);

    const taskTypes = useMemo(
        () => [
            { value: 'call', label: t('supplier_task_call') },
            { value: 'whatsapp', label: t('supplier_task_whatsapp') },
            { value: 'payment', label: t('supplier_task_payment') },
            { value: 'purchase', label: t('supplier_task_purchase') },
            { value: 'visit', label: t('supplier_task_visit') },
            { value: 'other', label: t('supplier_task_other') },
        ],
        [t]
    );
    const taskTypeLabels = useMemo(() => taskTypes.reduce<Record<string, string>>((labels, type) => ({ ...labels, [type.value]: type.label }), {}), [taskTypes]);

    const copyText = useCallback(
        async (text?: string | null) => {
            if (!text) return;
            try {
                await navigator.clipboard?.writeText(text);
                showMessage(t('supplier_copied'), 'success');
            } catch {
                showMessage(t('supplier_copy_failed'), 'error');
            }
        },
        [t]
    );

    const addTask = () => {
        if (!supplier || !taskTitle.trim()) {
            showMessage(t('supplier_followup_title_required'), 'error');
            return;
        }

        const next = addSupplierTask({
            supplierId: supplier.id,
            supplierName: supplier.name,
            phone: supplier.phone,
            type: taskType,
            title: taskTitle.trim(),
            dueDate: taskDueDate || today(),
            note: taskNote.trim() || undefined,
        });

        setTasks((prev) => [next, ...prev]);
        setTaskTitle('');
        setTaskNote('');
        setTaskDueDate(today());
        showMessage(t('supplier_followup_added'), 'success');
    };

    const markTaskDone = (taskId: string) => {
        const next = updateSupplierTaskStatus(taskId, 'done').filter((task) => String(task.supplierId) === supplierId);
        setTasks(next);
    };

    const paymentWhatsappUrl = buildSupplierWhatsAppUrl(supplier?.phone, supplierWhatsappTemplates.paymentUpdate(supplier?.name || t('lbl_supplier'), formatCurrency(currentDue), storeName));
    const purchaseWhatsappUrl = buildSupplierWhatsAppUrl(supplier?.phone, supplierWhatsappTemplates.purchaseFollowup(supplier?.name || t('lbl_supplier'), storeName));

    if (isLoading) {
        return <div className="rounded-xl bg-white p-6 text-sm text-gray-500">{t('supplier_360_loading')}</div>;
    }

    if (!supplier?.id) {
        return (
            <div className="rounded-xl bg-white p-6 text-center">
                <p className="text-sm text-gray-500">{t('supplier_not_found')}</p>
                <button onClick={() => router.push('/suppliers/list')} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                    {t('supplier_back_to_list')}
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{t('supplier_360_title')}</h1>
                        <p className="text-sm text-gray-500">{supplier.name}</p>
                    </div>
                </div>
                <Link href={`/suppliers/edit/${supplier.id}`} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                    {t('supplier_edit_profile')}
                </Link>
            </div>

            <div className="grid gap-4 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm xl:col-span-2">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
                            {supplier.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-bold text-gray-900">{supplier.name}</h2>
                            <p className="text-sm text-gray-500">{supplier.company_name || supplier.supplier_type || t('supplier_regular_supplier')}</p>
                            <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                                <span>{supplier.phone || t('crm_no_phone')}</span>
                                <span>{supplier.email || t('crm_no_email')}</span>
                                <span>{supplier.contact_person || t('supplier_no_contact_person')}</span>
                                <span>{supplier.payment_terms || t('supplier_terms_select')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {supplier.phone && (
                            <a href={`tel:${supplier.phone}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                <Phone className="h-4 w-4" /> {t('crm_call')}
                            </a>
                        )}
                        {paymentWhatsappUrl && (
                            <a href={paymentWhatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                                <MessageCircle className="h-4 w-4" /> {t('supplier_payment_whatsapp')}
                            </a>
                        )}
                        {purchaseWhatsappUrl && (
                            <a href={purchaseWhatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                                <Truck className="h-4 w-4" /> {t('supplier_purchase_whatsapp')}
                            </a>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">{t('supplier_current_due')}</p>
                    <p className={`mt-2 text-2xl font-black ${currentDue > 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrency(currentDue)}</p>
                    <p className="mt-1 text-xs text-gray-400">{t('supplier_due_orders_count', { count: dueOrders.length })}</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">{t('supplier_total_purchase')}</p>
                    <p className="mt-2 text-2xl font-black text-gray-900">{formatCurrency(totalPurchase)}</p>
                    <p className="mt-1 text-xs text-gray-400">{t('supplier_total_paid_label')}: {formatCurrency(totalPaid)}</p>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">{t('supplier_payment_information')}</h3>
                    <div className="mt-4 space-y-3 text-sm">
                        {[
                            { label: t('supplier_mobile_banking_number'), value: supplier.mobile_banking_number, copy: true },
                            { label: t('supplier_bank_name'), value: supplier.bank_name },
                            { label: t('supplier_bank_account_name'), value: supplier.bank_account_name },
                            { label: t('supplier_bank_account_number'), value: supplier.bank_account_number, copy: true },
                            { label: t('supplier_credit_limit'), value: supplier.credit_limit ? formatCurrency(supplier.credit_limit) : null },
                            { label: t('supplier_opening_balance'), value: supplier.opening_balance ? formatCurrency(supplier.opening_balance) : null },
                        ].map((row) => (
                            <div key={row.label} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2">
                                <span className="text-gray-500">{row.label}</span>
                                <span className="flex items-center gap-2 text-right font-semibold text-gray-900">
                                    {row.value || '-'}
                                    {row.copy && row.value && (
                                        <button onClick={() => copyText(String(row.value))} className="rounded p-1 text-gray-400 hover:bg-gray-50 hover:text-primary" aria-label={t('supplier_copy')}>
                                            <Clipboard className="h-4 w-4" />
                                        </button>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">{t('supplier_add_followup')}</h3>
                    <div className="mt-4 space-y-3">
                        <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} className="form-input" placeholder={t('supplier_followup_placeholder')} />
                        <div className="grid grid-cols-2 gap-2">
                            <select value={taskType} onChange={(event) => setTaskType(event.target.value as SupplierTask['type'])} className="form-select">
                                {taskTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </select>
                            <input type="date" value={taskDueDate} onChange={(event) => setTaskDueDate(event.target.value)} className="form-input" />
                        </div>
                        <textarea value={taskNote} onChange={(event) => setTaskNote(event.target.value)} className="form-textarea" rows={3} placeholder={t('crm_note')} />
                        <button onClick={addTask} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                            <Plus className="h-4 w-4" /> {t('crm_add_task')}
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">{t('supplier_open_followups')}</h3>
                    <div className="mt-4 space-y-2">
                        {tasks.filter((task) => task.status === 'open').length === 0 && <p className="text-sm text-gray-500">{t('supplier_no_open_followups')}</p>}
                        {tasks.filter((task) => task.status === 'open').map((task) => (
                            <div key={task.id} className="rounded-lg border border-gray-100 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-900">{task.title}</p>
                                        <p className="text-xs text-gray-500">{taskTypeLabels[task.type] || task.type} · {task.dueDate}</p>
                                    </div>
                                    <button onClick={() => markTaskDone(task.id)} className="rounded-full p-1 text-green-600 hover:bg-green-50" aria-label={t('crm_mark_followup_done')}>
                                        <CheckCircle2 className="h-5 w-5" />
                                    </button>
                                </div>
                                {task.note && <p className="mt-2 text-xs text-gray-500">{task.note}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">{t('supplier_recent_purchases')}</h3>
                    <div className="mt-4 space-y-2">
                        {isPurchaseLoading && <p className="text-sm text-gray-500">{t('supplier_purchases_loading')}</p>}
                        {!isPurchaseLoading && purchaseOrders.length === 0 && <p className="text-sm text-gray-500">{t('supplier_no_purchases')}</p>}
                        {purchaseOrders.slice(0, 8).map((order: any) => (
                            <div key={order.id || order.reference} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-900">{order.reference || order.invoice_number || '-'}</p>
                                    <p className="text-xs text-gray-500"><DateColumn date={order.created_at} /></p>
                                </div>
                                <span className="font-bold text-gray-900">{formatCurrency(order.amount || order.total_amount || 0)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">{t('supplier_due_history')}</h3>
                    <div className="mt-4 space-y-2">
                        {isDueLoading && <p className="text-sm text-gray-500">{t('supplier_due_loading')}</p>}
                        {!isDueLoading && dueOrders.length === 0 && <p className="text-sm text-gray-500">{t('supplier_no_due_orders')}</p>}
                        {dueOrders.slice(0, 8).map((due: any) => (
                            <div key={due.id || due.reference} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-900">{due.reference || '-'}</p>
                                    <p className="text-xs text-gray-500">{due.status || '-'}</p>
                                </div>
                                <span className="font-bold text-red-600">{formatCurrency(due.due || 0)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500"><Wallet className="h-4 w-4" /> {t('supplier_payment_terms')}</div>
                    <p className="mt-2 font-bold text-gray-900">{supplier.payment_terms || '-'}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500"><CreditCard className="h-4 w-4" /> {t('supplier_preferred_payment_method')}</div>
                    <p className="mt-2 font-bold text-gray-900">{supplier.preferred_payment_method || '-'}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500"><Receipt className="h-4 w-4" /> {t('lbl_status')}</div>
                    <p className="mt-2 font-bold capitalize text-gray-900">{supplier.status || '-'}</p>
                </div>
            </div>

            {supplier.notes && (
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-gray-900"><StickyNote className="h-4 w-4" /> {t('lbl_notes')}</div>
                    <p className="mt-3 text-sm text-gray-600">{supplier.notes}</p>
                </div>
            )}
        </div>
    );
}
