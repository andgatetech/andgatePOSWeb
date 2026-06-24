'use client';

import DateColumn from '@/components/common/DateColumn';
import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { addCrmTask, buildWhatsAppUrl, CrmTask, getCrmTasks, updateCrmTaskStatus, whatsappTemplates } from '@/lib/crm';
import { showMessage } from '@/lib/toast';
import { useGetCustomerDuesQuery } from '@/store/features/customerDue/customerDueApi';
import { useGetCustomerPointTransactionsQuery, useGetSingleCustomerQuery } from '@/store/features/customer/customer';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock, Gift, MessageCircle, Phone, Plus, Receipt, StickyNote, UserRound, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);

export default function Customer360Page() {
    const { t } = getTranslation();
    const { id } = useParams();
    const router = useRouter();
    const { formatCurrency } = useCurrency();
    const { currentStoreId, currentStore } = useCurrentStore();
    const customerId = String(id || '');
    const { data: customerResponse, isLoading } = useGetSingleCustomerQuery(customerId, { skip: !customerId });
    const { data: pointsResponse } = useGetCustomerPointTransactionsQuery({ customerId, per_page: 8 }, { skip: !customerId });
    const customer = customerResponse?.data?.customer || customerResponse?.data || customerResponse;
    const { data: dueResponse } = useGetCustomerDuesQuery(
        { store_id: currentStoreId, search: customer?.phone || customer?.name || '', per_page: 5 },
        { skip: !currentStoreId || !customer?.id }
    );

    const [tasks, setTasks] = useState<CrmTask[]>([]);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskType, setTaskType] = useState<CrmTask['type']>('call');
    const [taskDueDate, setTaskDueDate] = useState(today());
    const [taskNote, setTaskNote] = useState('');

    useEffect(() => {
        if (customerId) {
            setTasks(getCrmTasks().filter((task) => String(task.customerId) === customerId));
        }
    }, [customerId]);

    const pointTransactions = useMemo(() => pointsResponse?.data?.data || [], [pointsResponse]);
    const dues = useMemo(() => dueResponse?.data?.dues || [], [dueResponse]);
    const totalDue = dues.reduce((sum: number, due: any) => sum + Number(due.remaining || 0), 0);
    const storeName = currentStore?.store_name || 'AndgatePOS';
    const taskTypes = useMemo(
        () => [
            { value: 'call', label: t('crm_task_call') },
            { value: 'whatsapp', label: t('crm_task_whatsapp') },
            { value: 'sms', label: 'SMS' },
            { value: 'visit', label: t('crm_task_visit') },
            { value: 'payment', label: t('crm_task_payment') },
            { value: 'reorder', label: t('crm_task_reorder') },
            { value: 'birthday', label: t('crm_task_birthday') },
            { value: 'other', label: t('crm_task_other') },
        ],
        [t]
    );
    const taskTypeLabels = useMemo(() => taskTypes.reduce<Record<string, string>>((labels, type) => ({ ...labels, [type.value]: type.label }), {}), [taskTypes]);

    const timeline = useMemo(() => {
        const items = [
            customer?.created_at && { date: customer.created_at, title: t('crm_timeline_customer_created'), detail: customer.store_name || storeName, icon: UserRound },
            customer?.updated_at && { date: customer.updated_at, title: t('crm_timeline_profile_updated'), detail: customer.phone || customer.email || '', icon: StickyNote },
            ...pointTransactions.map((txn: any) => ({
                date: txn.created_at,
                title: txn.type === 'earn' ? t('crm_timeline_points_earned') : t('crm_timeline_points_redeemed'),
                detail: t('crm_points_label', { count: `${Number(txn.points) >= 0 ? '+' : ''}${txn.points}` }),
                icon: Gift,
            })),
            ...dues.map((due: any) => ({
                date: due.due_date || due.created_at,
                title: Number(due.remaining || 0) > 0 ? t('crm_timeline_due_pending') : t('crm_timeline_due_cleared'),
                detail: `${due.reference || ''} ${formatCurrency(due.remaining || 0)}`,
                icon: Receipt,
            })),
            ...tasks.map((task) => ({
                date: task.dueDate,
                title: task.status === 'done' ? t('crm_completed_task', { title: task.title }) : task.title,
                detail: task.note || taskTypeLabels[task.type] || task.type,
                icon: CalendarClock,
            })),
        ].filter(Boolean) as Array<{ date: string; title: string; detail: string; icon: any }>;

        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [customer, dues, formatCurrency, pointTransactions, storeName, t, taskTypeLabels, tasks]);

    const addTask = () => {
        if (!customer || !taskTitle.trim()) {
            showMessage(t('crm_followup_title_required'), 'error');
            return;
        }

        const next = addCrmTask({
            customerId: customer.id,
            customerName: customer.name,
            phone: customer.phone,
            type: taskType,
            title: taskTitle.trim(),
            dueDate: taskDueDate || today(),
            note: taskNote.trim() || undefined,
        });

        setTasks((prev) => [next, ...prev]);
        setTaskTitle('');
        setTaskNote('');
        setTaskDueDate(today());
        showMessage(t('crm_followup_added'), 'success');
    };

    const markTaskDone = (taskId: string) => {
        const next = updateCrmTaskStatus(taskId, 'done').filter((task) => String(task.customerId) === customerId);
        setTasks(next);
    };

    const dueMessageUrl = buildWhatsAppUrl(customer?.phone, whatsappTemplates.dueReminder(customer?.name || t('lbl_customer'), formatCurrency(totalDue), storeName));
    const birthdayMessageUrl = buildWhatsAppUrl(customer?.phone, whatsappTemplates.birthday(customer?.name || t('lbl_customer'), storeName));
    const reorderMessageUrl = buildWhatsAppUrl(customer?.phone, whatsappTemplates.reorder(customer?.name || t('lbl_customer'), storeName));

    if (isLoading) {
        return <div className="rounded-xl bg-white p-6 text-sm text-gray-500">{t('crm_loading_customer')}</div>;
    }

    if (!customer?.id) {
        return (
            <div className="rounded-xl bg-white p-6 text-center">
                <p className="text-sm text-gray-500">{t('crm_customer_not_found')}</p>
                <button onClick={() => router.push('/customers/list')} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                    {t('crm_back_to_customers')}
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
                        <h1 className="text-xl font-bold text-gray-900">{t('crm_customer_360')}</h1>
                        <p className="text-sm text-gray-500">{customer.name}</p>
                    </div>
                </div>
                <Link href={`/customers/edit/${customer.id}`} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                    {t('crm_edit_profile')}
                </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:col-span-2">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
                            {customer.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-bold text-gray-900">{customer.name}</h2>
                            <p className="text-sm text-gray-500">{customer.trade_name || customer.customer_type || t('crm_regular_customer')}</p>
                            <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                                <span>{customer.phone || t('crm_no_phone')}</span>
                                <span>{customer.email || t('crm_no_email')}</span>
                                <span>{customer.preferred_contact_method || t('crm_no_preferred_contact')}</span>
                                <span>{customer.city || customer.state || t('crm_no_area_saved')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {customer.phone && (
                            <a href={`tel:${customer.phone}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                <Phone className="h-4 w-4" /> {t('crm_call')}
                            </a>
                        )}
                        {dueMessageUrl && (
                            <a href={dueMessageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                                <MessageCircle className="h-4 w-4" /> {t('crm_due_reminder')}
                            </a>
                        )}
                        {birthdayMessageUrl && (
                            <a href={birthdayMessageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-700">
                                <Gift className="h-4 w-4" /> {t('crm_birthday')}
                            </a>
                        )}
                        {reorderMessageUrl && (
                            <a href={reorderMessageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                                <Receipt className="h-4 w-4" /> {t('crm_reorder')}
                            </a>
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">{t('crm_current_due')}</p>
                    <p className={`mt-2 text-2xl font-black ${totalDue > 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrency(totalDue)}</p>
                    <p className="mt-1 text-xs text-gray-400">{t('crm_due_records_found', { count: dues.length })}</p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-500">{t('crm_loyalty')}</p>
                    <p className="mt-2 text-2xl font-black text-gray-900">{t('crm_points_label', { count: customer.points || 0 })}</p>
                    <p className="mt-1 text-xs uppercase text-gray-400">{t('crm_tier_label', { tier: customer.membership || t('status_normal') })}</p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">{t('crm_add_followup')}</h3>
                    <div className="mt-4 space-y-3">
                        <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="form-input" placeholder={t('crm_followup_placeholder')} />
                        <div className="grid grid-cols-2 gap-2">
                            <select value={taskType} onChange={(e) => setTaskType(e.target.value as CrmTask['type'])} className="form-select">
                                {taskTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </select>
                            <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="form-input" />
                        </div>
                        <textarea value={taskNote} onChange={(e) => setTaskNote(e.target.value)} className="form-textarea" rows={3} placeholder={t('crm_note')} />
                        <button onClick={addTask} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                            <Plus className="h-4 w-4" /> {t('crm_add_task')}
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">{t('crm_open_followups')}</h3>
                    <div className="mt-4 space-y-2">
                        {tasks.filter((task) => task.status === 'open').length === 0 && <p className="text-sm text-gray-500">{t('crm_no_open_followups')}</p>}
                        {tasks.filter((task) => task.status === 'open').map((task) => (
                            <div key={task.id} className="rounded-lg border border-gray-100 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-900">{task.title}</p>
                                        <p className="text-xs text-gray-500">{taskTypeLabels[task.type] || task.type} · {task.dueDate}</p>
                                    </div>
                                    <button onClick={() => markTaskDone(task.id)} className="rounded-full p-1 text-green-600 hover:bg-green-50">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </button>
                                </div>
                                {task.note && <p className="mt-2 text-xs text-gray-500">{task.note}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">{t('crm_activity_timeline')}</h3>
                    <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto">
                        {timeline.length === 0 && <p className="text-sm text-gray-500">{t('crm_no_activity')}</p>}
                        {timeline.map((item, index) => {
                            const Icon = item.icon || Clock;
                            return (
                                <div key={`${item.title}-${index}`} className="flex gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 border-b border-gray-100 pb-3">
                                        <p className="font-semibold text-gray-900">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.detail}</p>
                                        <div className="mt-1 text-xs text-gray-400"><DateColumn date={item.date} /></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">{t('crm_due_records')}</h3>
                    <div className="mt-4 space-y-2">
                        {dues.length === 0 && <p className="text-sm text-gray-500">{t('crm_no_due_records')}</p>}
                        {dues.map((due: any) => (
                            <div key={due.id || due.reference} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
                                <div>
                                    <p className="font-semibold text-gray-900">{due.reference || t('lbl_due')}</p>
                                    <p className="text-xs text-gray-500">{due.status || due.aging_bucket || '-'}</p>
                                </div>
                                <span className="font-bold text-red-600">{formatCurrency(due.remaining || 0)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h3 className="font-bold text-gray-900">{t('crm_financial_snapshot')}</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-gray-50 p-3">
                            <div className="flex items-center gap-2 text-gray-500"><Wallet className="h-4 w-4" /> {t('lbl_balance')}</div>
                            <p className="mt-2 font-bold text-gray-900">{formatCurrency(Math.abs(Number(customer.balance || 0)))}</p>
                        </div>
                        <div className="rounded-lg bg-gray-50 p-3">
                            <div className="flex items-center gap-2 text-gray-500"><Receipt className="h-4 w-4" /> {t('lbl_credit_limit')}</div>
                            <p className="mt-2 font-bold text-gray-900">{customer.credit_limit ? formatCurrency(customer.credit_limit) : '-'}</p>
                        </div>
                    </div>
                    {customer.details && <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{customer.details}</p>}
                </div>
            </div>
        </div>
    );
}
