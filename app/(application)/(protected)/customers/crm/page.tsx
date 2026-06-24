'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { buildWhatsAppUrl, CrmTask, getCrmTasks, updateCrmTaskStatus, whatsappTemplates } from '@/lib/crm';
import { useGetStoreCustomersListQuery } from '@/store/features/customer/customer';
import { CalendarDays, CheckCircle2, Gift, MessageCircle, Phone, Search, Star, UserCheck, Users, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type SegmentKey = 'all' | 'due' | 'vip' | 'birthday' | 'inactive';

const isBirthdayThisMonth = (date?: string | null) => {
    if (!date) return false;

    const parsed = new Date(date);
    return !Number.isNaN(parsed.getTime()) && parsed.getMonth() === new Date().getMonth();
};

const getCustomerBalance = (customer: any) => Number(customer.balance || 0);

export default function CustomerCrmPage() {
    const { currentStoreId, currentStore } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const [activeSegment, setActiveSegment] = useState<SegmentKey>('all');
    const [search, setSearch] = useState('');
    const [tasks, setTasks] = useState<CrmTask[]>([]);

    const { data: customersResponse, isLoading } = useGetStoreCustomersListQuery(
        {
            store_id: currentStoreId,
            per_page: 200,
            sort_field: 'name',
            sort_direction: 'asc',
        },
        { skip: !currentStoreId }
    );

    useEffect(() => {
        setTasks(getCrmTasks());
    }, []);

    const customers = useMemo(() => customersResponse?.data?.items || customersResponse?.data || [], [customersResponse]);
    const storeName = currentStore?.store_name || 'AndgatePOS';

    const segmentCustomers = useMemo(() => {
        const due = customers.filter((customer: any) => getCustomerBalance(customer) < 0);
        const vip = customers.filter((customer: any) => ['gold', 'platinum'].includes(String(customer.membership || '').toLowerCase()) || Number(customer.points || 0) >= 500);
        const birthday = customers.filter((customer: any) => isBirthdayThisMonth(customer.date_of_birth || customer.dob));
        const inactive = customers.filter((customer: any) => customer.is_active === false || customer.is_active === 0);

        return { all: customers, due, vip, birthday, inactive };
    }, [customers]);

    const visibleCustomers = useMemo(() => {
        const term = search.trim().toLowerCase();
        return segmentCustomers[activeSegment].filter((customer: any) => {
            if (!term) return true;
            return [customer.name, customer.phone, customer.trade_name, customer.email].some((value) => String(value || '').toLowerCase().includes(term));
        });
    }, [activeSegment, search, segmentCustomers]);

    const openTasks = tasks.filter((task) => task.status === 'open');
    const totalDue = segmentCustomers.due.reduce((sum: number, customer: any) => sum + Math.abs(getCustomerBalance(customer)), 0);

    const segments: Array<{ key: SegmentKey; label: string; value: number; icon: any; helper: string }> = [
        { key: 'all', label: 'All Customers', value: segmentCustomers.all.length, icon: Users, helper: 'Complete customer base' },
        { key: 'due', label: 'Due Customers', value: segmentCustomers.due.length, icon: WalletCards, helper: formatCurrency(totalDue) },
        { key: 'vip', label: 'VIP / Loyal', value: segmentCustomers.vip.length, icon: Star, helper: 'Gold, platinum or 500+ points' },
        { key: 'birthday', label: 'Birthdays', value: segmentCustomers.birthday.length, icon: Gift, helper: 'This month' },
        { key: 'inactive', label: 'Inactive', value: segmentCustomers.inactive.length, icon: UserCheck, helper: 'Inactive profiles' },
    ];

    const markTaskDone = (taskId: string) => {
        setTasks(updateCrmTaskStatus(taskId, 'done'));
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">CRM Dashboard</h1>
                    <p className="text-sm text-gray-500">Customer follow-up, loyalty, due and WhatsApp-ready segments.</p>
                </div>
                <Link href="/customers/create" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
                    Add Customer
                </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {segments.map((segment) => {
                    const Icon = segment.icon;
                    const isActive = activeSegment === segment.key;
                    return (
                        <button
                            key={segment.key}
                            onClick={() => setActiveSegment(segment.key)}
                            className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${isActive ? 'border-primary ring-2 ring-primary/10' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600">{segment.label}</span>
                                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                            </div>
                            <p className="mt-3 text-2xl font-black text-gray-900">{segment.value}</p>
                            <p className="mt-1 text-xs text-gray-500">{segment.helper}</p>
                        </button>
                    );
                })}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-bold text-gray-900">{segments.find((segment) => segment.key === activeSegment)?.label}</h2>
                            <p className="text-sm text-gray-500">{visibleCustomers.length} customers found</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input value={search} onChange={(event) => setSearch(event.target.value)} className="form-input w-full pl-9 sm:w-72" placeholder="Search customer" />
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {isLoading && <p className="p-4 text-sm text-gray-500">Loading CRM customers...</p>}
                        {!isLoading && visibleCustomers.length === 0 && <p className="p-4 text-sm text-gray-500">No customers in this segment.</p>}
                        {visibleCustomers.map((customer: any) => {
                            const dueAmount = Math.abs(getCustomerBalance(customer));
                            const inactiveUrl = buildWhatsAppUrl(customer.phone, whatsappTemplates.inactive(customer.name || 'Customer', storeName));
                            const birthdayUrl = buildWhatsAppUrl(customer.phone, whatsappTemplates.birthday(customer.name || 'Customer', storeName));

                            return (
                                <div key={customer.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <Link href={`/customers/${customer.id}`} className="font-bold text-gray-900 hover:text-primary">
                                            {customer.name || 'Unnamed customer'}
                                        </Link>
                                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                            <span>{customer.phone || 'No phone'}</span>
                                            <span>{customer.membership || 'normal'} tier</span>
                                            <span>{Number(customer.points || 0)} pts</span>
                                            {getCustomerBalance(customer) < 0 && <span className="font-semibold text-red-600">Due {formatCurrency(dueAmount)}</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {customer.phone && (
                                            <a href={`tel:${customer.phone}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                                <Phone className="h-4 w-4" /> Call
                                            </a>
                                        )}
                                        {birthdayUrl && activeSegment === 'birthday' && (
                                            <a href={birthdayUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-700">
                                                <Gift className="h-4 w-4" /> Wish
                                            </a>
                                        )}
                                        {inactiveUrl && activeSegment !== 'birthday' && (
                                            <a href={inactiveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                                                <MessageCircle className="h-4 w-4" /> WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-gray-900">Open Follow-Ups</h2>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{openTasks.length}</span>
                    </div>
                    <div className="mt-4 space-y-3">
                        {openTasks.length === 0 && <p className="text-sm text-gray-500">No open follow-ups yet. Add one from Customer 360.</p>}
                        {openTasks.slice(0, 12).map((task) => (
                            <div key={task.id} className="rounded-lg border border-gray-100 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <Link href={`/customers/${task.customerId}`} className="font-semibold text-gray-900 hover:text-primary">
                                            {task.title}
                                        </Link>
                                        <p className="mt-1 text-xs text-gray-500">{task.customerName}</p>
                                    </div>
                                    <button onClick={() => markTaskDone(task.id)} className="rounded-full p-1 text-green-600 hover:bg-green-50" aria-label="Mark follow-up done">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>{task.dueDate}</span>
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5">{task.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
