'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { showMessage } from '@/lib/toast';
import {
    Banknote,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    PackageSearch,
    Plus,
    Receipt,
    RefreshCw,
    ShieldCheck,
    Store,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Closing = { id: string; date: string; openingCash: number; cashSales: number; cashExpense: number; dueCollection: number; supplierPayment: number; actualCash: number; note?: string };
type Shift = { id: string; staff: string; type: 'in' | 'out'; time: string; note?: string };
type Task = { id: string; title: string; dueDate: string; owner?: string; status: 'open' | 'done' };
type PettyCash = { id: string; title: string; amount: number; requestedBy?: string; status: 'pending' | 'approved' | 'rejected'; date: string };
type RepairJob = { id: string; customer: string; item: string; problem: string; status: 'received' | 'working' | 'ready' | 'delivered'; dueDate: string };

const storageKeys = {
    closings: 'andgatepos-bos-closings',
    shifts: 'andgatepos-bos-shifts',
    tasks: 'andgatepos-bos-tasks',
    pettyCash: 'andgatepos-bos-petty-cash',
    repairs: 'andgatepos-bos-repairs',
};

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toLocaleString();

const readList = <T,>(key: string): T[] => {
    if (typeof window === 'undefined') return [];
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const writeList = <T,>(key: string, items: T[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(items));
};

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const copy = {
    en: {
        title: 'Business OS',
        desc: 'Daily operating center for Bangladesh SME owners.',
        storeToday: 'Today at',
        quickActions: 'Quick actions',
        commandCenter: 'Business Command Center',
        counterClosing: 'Cash & Counter Closing',
        dueCollection: 'Due Collection Center',
        purchasePlanning: 'Purchase Planning',
        staffShift: 'Staff Shift & Attendance',
        notebook: 'Business Notebook',
        pettyCash: 'Petty Cash Approval',
        serviceRepair: 'Service / Warranty / Repair',
        viewDashboard: 'View dashboard',
        pos: 'Open POS',
        customerDue: 'Customer due',
        supplierDue: 'Supplier due',
        lowStock: 'Low stock',
        ecommerceOrders: 'Online orders',
        crm: 'CRM dashboard',
        createPurchase: 'Create purchase',
        reorder: 'Reorder suggestions',
        expenses: 'Expenses',
        employees: 'Employees',
        closingDesc: 'Record expected vs counted cash at day end.',
        openingCash: 'Opening cash',
        cashSales: 'Cash sales',
        cashExpense: 'Cash expense',
        dueCollectionAmount: 'Due collection',
        supplierPayment: 'Supplier payment',
        actualCash: 'Actual counted cash',
        expectedCash: 'Expected cash',
        difference: 'Difference',
        note: 'Note',
        saveClosing: 'Save closing',
        recentClosings: 'Recent closings',
        dueDesc: 'Use this as the daily collection workboard.',
        customerFollowup: 'Customer follow-up',
        supplierPaymentFollowup: 'Supplier payment follow-up',
        purchaseDesc: 'Turn stock signals into purchase action.',
        staffName: 'Staff name',
        checkIn: 'Check in',
        checkOut: 'Check out',
        shiftIn: 'In',
        shiftOut: 'Out',
        recentShifts: 'Recent shift records',
        taskTitle: 'Task title',
        owner: 'Owner',
        dueDate: 'Due date',
        addTask: 'Add task',
        openTasks: 'Open tasks',
        requestTitle: 'Request title',
        amount: 'Amount',
        requestedBy: 'Requested by',
        addRequest: 'Add request',
        pendingRequests: 'Pending requests',
        approve: 'Approve',
        reject: 'Reject',
        customer: 'Customer',
        item: 'Item / device',
        problem: 'Problem',
        status: 'Status',
        addJob: 'Add job',
        repairJobs: 'Repair jobs',
        repairReceived: 'Received',
        repairWorking: 'Working',
        repairReady: 'Ready',
        repairDelivered: 'Delivered',
        saved: 'Saved.',
        fillRequired: 'Fill required fields first.',
        noRecords: 'No records yet.',
        done: 'Done',
        todayChecklist: 'Today checklist',
        checklist1: 'Close counter after final sale',
        checklist2: 'Call overdue customers',
        checklist3: 'Review low stock before purchase',
        checklist4: 'Approve petty cash before cash closing',
    },
    bn: {
        title: 'বিজনেস ওএস',
        desc: 'বাংলাদেশি SME মালিকের দৈনিক ব্যবসা পরিচালনার কেন্দ্র।',
        storeToday: 'আজকের স্টোর',
        quickActions: 'দ্রুত কাজ',
        commandCenter: 'বিজনেস কমান্ড সেন্টার',
        counterClosing: 'ক্যাশ ও কাউন্টার ক্লোজিং',
        dueCollection: 'বাকি কালেকশন সেন্টার',
        purchasePlanning: 'ক্রয় পরিকল্পনা',
        staffShift: 'স্টাফ শিফট ও হাজিরা',
        notebook: 'ব্যবসার নোটবুক',
        pettyCash: 'পেটি ক্যাশ অনুমোদন',
        serviceRepair: 'সার্ভিস / ওয়ারেন্টি / রিপেয়ার',
        viewDashboard: 'ড্যাশবোর্ড দেখুন',
        pos: 'POS খুলুন',
        customerDue: 'গ্রাহকের বাকি',
        supplierDue: 'সাপ্লায়ারের বাকি',
        lowStock: 'কম স্টক',
        ecommerceOrders: 'অনলাইন অর্ডার',
        crm: 'CRM ড্যাশবোর্ড',
        createPurchase: 'ক্রয় তৈরি',
        reorder: 'রি-অর্ডার সাজেশন',
        expenses: 'খরচ',
        employees: 'কর্মচারী',
        closingDesc: 'দিন শেষে হিসাবের ক্যাশ আর হাতে থাকা ক্যাশ মিলিয়ে রাখুন।',
        openingCash: 'শুরুর ক্যাশ',
        cashSales: 'ক্যাশ বিক্রি',
        cashExpense: 'ক্যাশ খরচ',
        dueCollectionAmount: 'বাকি আদায়',
        supplierPayment: 'সাপ্লায়ার পেমেন্ট',
        actualCash: 'গোনা ক্যাশ',
        expectedCash: 'হিসাবের ক্যাশ',
        difference: 'পার্থক্য',
        note: 'নোট',
        saveClosing: 'ক্লোজিং সেভ',
        recentClosings: 'সাম্প্রতিক ক্লোজিং',
        dueDesc: 'প্রতিদিনের বাকি আদায়ের কাজ এখান থেকে চালান।',
        customerFollowup: 'গ্রাহক ফলো-আপ',
        supplierPaymentFollowup: 'সাপ্লায়ার পেমেন্ট ফলো-আপ',
        purchaseDesc: 'স্টক সিগন্যাল দেখে ক্রয়ের সিদ্ধান্ত নিন।',
        staffName: 'স্টাফের নাম',
        checkIn: 'চেক ইন',
        checkOut: 'চেক আউট',
        shiftIn: 'ইন',
        shiftOut: 'আউট',
        recentShifts: 'সাম্প্রতিক হাজিরা',
        taskTitle: 'টাস্কের নাম',
        owner: 'দায়িত্বে',
        dueDate: 'তারিখ',
        addTask: 'টাস্ক যোগ',
        openTasks: 'ওপেন টাস্ক',
        requestTitle: 'রিকোয়েস্টের নাম',
        amount: 'পরিমাণ',
        requestedBy: 'রিকোয়েস্ট করেছে',
        addRequest: 'রিকোয়েস্ট যোগ',
        pendingRequests: 'পেন্ডিং রিকোয়েস্ট',
        approve: 'অনুমোদন',
        reject: 'রিজেক্ট',
        customer: 'গ্রাহক',
        item: 'পণ্য / ডিভাইস',
        problem: 'সমস্যা',
        status: 'স্ট্যাটাস',
        addJob: 'জব যোগ',
        repairJobs: 'রিপেয়ার জব',
        repairReceived: 'রিসিভ হয়েছে',
        repairWorking: 'কাজ চলছে',
        repairReady: 'রেডি',
        repairDelivered: 'ডেলিভারি হয়েছে',
        saved: 'সেভ হয়েছে।',
        fillRequired: 'আগে প্রয়োজনীয় তথ্য দিন।',
        noRecords: 'এখনো কোনো রেকর্ড নেই।',
        done: 'সম্পন্ন',
        todayChecklist: 'আজকের চেকলিস্ট',
        checklist1: 'শেষ বিক্রির পর কাউন্টার ক্লোজ করুন',
        checklist2: 'ওভারডিউ গ্রাহকদের কল করুন',
        checklist3: 'ক্রয়ের আগে কম স্টক দেখুন',
        checklist4: 'ক্যাশ ক্লোজিংয়ের আগে পেটি ক্যাশ অনুমোদন করুন',
    },
};

export default function BusinessOsPage() {
    const { i18n } = getTranslation();
    const text = copy[i18n.language === 'en' ? 'en' : 'bn'];
    const { currentStore } = useCurrentStore();
    const { formatCurrency } = useCurrency();

    const [closings, setClosings] = useState<Closing[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [pettyCash, setPettyCash] = useState<PettyCash[]>([]);
    const [repairs, setRepairs] = useState<RepairJob[]>([]);

    const [closing, setClosing] = useState({ openingCash: '', cashSales: '', cashExpense: '', dueCollection: '', supplierPayment: '', actualCash: '', note: '' });
    const [shiftForm, setShiftForm] = useState({ staff: '', note: '' });
    const [taskForm, setTaskForm] = useState({ title: '', owner: '', dueDate: today() });
    const [pettyForm, setPettyForm] = useState({ title: '', amount: '', requestedBy: '' });
    const [repairForm, setRepairForm] = useState({ customer: '', item: '', problem: '', dueDate: today(), status: 'received' as RepairJob['status'] });

    useEffect(() => {
        setClosings(readList<Closing>(storageKeys.closings));
        setShifts(readList<Shift>(storageKeys.shifts));
        setTasks(readList<Task>(storageKeys.tasks));
        setPettyCash(readList<PettyCash>(storageKeys.pettyCash));
        setRepairs(readList<RepairJob>(storageKeys.repairs));
    }, []);

    const expectedCash = useMemo(
        () =>
            Number(closing.openingCash || 0) +
            Number(closing.cashSales || 0) +
            Number(closing.dueCollection || 0) -
            Number(closing.cashExpense || 0) -
            Number(closing.supplierPayment || 0),
        [closing]
    );
    const difference = Number(closing.actualCash || 0) - expectedCash;

    const saveClosing = () => {
        if (!closing.actualCash) {
            showMessage(text.fillRequired, 'error');
            return;
        }
        const next: Closing = {
            id: makeId(),
            date: nowTime(),
            openingCash: Number(closing.openingCash || 0),
            cashSales: Number(closing.cashSales || 0),
            cashExpense: Number(closing.cashExpense || 0),
            dueCollection: Number(closing.dueCollection || 0),
            supplierPayment: Number(closing.supplierPayment || 0),
            actualCash: Number(closing.actualCash || 0),
            note: closing.note.trim() || undefined,
        };
        const records = [next, ...closings].slice(0, 20);
        setClosings(records);
        writeList(storageKeys.closings, records);
        setClosing({ openingCash: '', cashSales: '', cashExpense: '', dueCollection: '', supplierPayment: '', actualCash: '', note: '' });
        showMessage(text.saved, 'success');
    };

    const addShift = (type: Shift['type']) => {
        if (!shiftForm.staff.trim()) {
            showMessage(text.fillRequired, 'error');
            return;
        }
        const records = [{ id: makeId(), staff: shiftForm.staff.trim(), type, time: nowTime(), note: shiftForm.note.trim() || undefined }, ...shifts].slice(0, 30);
        setShifts(records);
        writeList(storageKeys.shifts, records);
        setShiftForm({ staff: '', note: '' });
        showMessage(text.saved, 'success');
    };

    const addTask = () => {
        if (!taskForm.title.trim()) {
            showMessage(text.fillRequired, 'error');
            return;
        }
        const records: Task[] = [{ id: makeId(), title: taskForm.title.trim(), owner: taskForm.owner.trim() || undefined, dueDate: taskForm.dueDate, status: 'open' }, ...tasks];
        setTasks(records);
        writeList(storageKeys.tasks, records);
        setTaskForm({ title: '', owner: '', dueDate: today() });
        showMessage(text.saved, 'success');
    };

    const updateTask = (id: string) => {
        const records = tasks.map((task) => (task.id === id ? { ...task, status: 'done' as const } : task));
        setTasks(records);
        writeList(storageKeys.tasks, records);
    };

    const addPettyCash = () => {
        if (!pettyForm.title.trim() || !pettyForm.amount) {
            showMessage(text.fillRequired, 'error');
            return;
        }
        const records: PettyCash[] = [{ id: makeId(), title: pettyForm.title.trim(), amount: Number(pettyForm.amount), requestedBy: pettyForm.requestedBy.trim() || undefined, status: 'pending', date: nowTime() }, ...pettyCash];
        setPettyCash(records);
        writeList(storageKeys.pettyCash, records);
        setPettyForm({ title: '', amount: '', requestedBy: '' });
        showMessage(text.saved, 'success');
    };

    const updatePettyCash = (id: string, status: PettyCash['status']) => {
        const records = pettyCash.map((request) => (request.id === id ? { ...request, status } : request));
        setPettyCash(records);
        writeList(storageKeys.pettyCash, records);
    };

    const addRepair = () => {
        if (!repairForm.customer.trim() || !repairForm.item.trim()) {
            showMessage(text.fillRequired, 'error');
            return;
        }
        const records: RepairJob[] = [{ id: makeId(), customer: repairForm.customer.trim(), item: repairForm.item.trim(), problem: repairForm.problem.trim(), status: repairForm.status, dueDate: repairForm.dueDate }, ...repairs];
        setRepairs(records);
        writeList(storageKeys.repairs, records);
        setRepairForm({ customer: '', item: '', problem: '', dueDate: today(), status: 'received' });
        showMessage(text.saved, 'success');
    };

    const updateRepair = (id: string, status: RepairJob['status']) => {
        const records = repairs.map((job) => (job.id === id ? { ...job, status } : job));
        setRepairs(records);
        writeList(storageKeys.repairs, records);
    };

    const quickLinks = [
        { href: '/dashboard', label: text.viewDashboard, icon: Store },
        { href: '/pos', label: text.pos, icon: Receipt },
        { href: '/customers/due', label: text.customerDue, icon: Users },
        { href: '/suppliers/due', label: text.supplierDue, icon: CreditCard },
        { href: '/reports/low-stock', label: text.lowStock, icon: PackageSearch },
        { href: '/ecommerce/orders', label: text.ecommerceOrders, icon: ClipboardList },
        { href: '/customers/crm', label: text.crm, icon: Users },
        { href: '/purchases/create', label: text.createPurchase, icon: Plus },
        { href: '/reports/reorder-suggestions', label: text.reorder, icon: RefreshCw },
        { href: '/expenses/expense-list', label: text.expenses, icon: Banknote },
        { href: '/employees', label: text.employees, icon: ShieldCheck },
    ];
    const shiftLabels = { in: text.shiftIn, out: text.shiftOut };
    const repairStatusLabels = {
        received: text.repairReceived,
        working: text.repairWorking,
        ready: text.repairReady,
        delivered: text.repairDelivered,
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{text.title}</h1>
                    <p className="text-sm text-gray-500">{text.desc}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
                    {text.storeToday}: <span className="font-semibold text-gray-900">{currentStore?.store_name || '-'}</span>
                </div>
            </div>

            <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <h2 className="font-bold text-gray-900">{text.commandCenter}</h2>
                <p className="mt-1 text-sm text-gray-500">{text.quickActions}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    {quickLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link key={link.href} href={link.href} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary/30 hover:bg-primary/5">
                                <Icon className="h-4 w-4 text-primary" />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </section>

            <div className="grid gap-4 xl:grid-cols-2">
                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900">{text.counterClosing}</h2>
                    <p className="mt-1 text-sm text-gray-500">{text.closingDesc}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                            ['openingCash', text.openingCash],
                            ['cashSales', text.cashSales],
                            ['cashExpense', text.cashExpense],
                            ['dueCollection', text.dueCollectionAmount],
                            ['supplierPayment', text.supplierPayment],
                            ['actualCash', text.actualCash],
                        ].map(([key, label]) => (
                            <input key={key} type="number" value={closing[key as keyof typeof closing]} onChange={(event) => setClosing((prev) => ({ ...prev, [key]: event.target.value }))} className="form-input" placeholder={label} />
                        ))}
                    </div>
                    <textarea value={closing.note} onChange={(event) => setClosing((prev) => ({ ...prev, note: event.target.value }))} className="form-textarea mt-3" rows={2} placeholder={text.note} />
                    <div className="mt-3 grid gap-2 rounded-lg bg-gray-50 p-3 text-sm sm:grid-cols-2">
                        <span>{text.expectedCash}: <b>{formatCurrency(expectedCash)}</b></span>
                        <span className={difference < 0 ? 'text-red-600' : difference > 0 ? 'text-green-600' : 'text-gray-700'}>{text.difference}: <b>{formatCurrency(difference)}</b></span>
                    </div>
                    <button onClick={saveClosing} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{text.saveClosing}</button>
                    <RecordList empty={text.noRecords} title={text.recentClosings} records={closings.slice(0, 4).map((item) => `${item.date} · ${formatCurrency(item.actualCash)}`)} />
                </section>

                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900">{text.dueCollection}</h2>
                    <p className="mt-1 text-sm text-gray-500">{text.dueDesc}</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <Link href="/customers/due" className="rounded-lg border border-red-100 bg-red-50 px-3 py-3 text-sm font-semibold text-red-700">{text.customerDue}</Link>
                        <Link href="/suppliers/due" className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-3 text-sm font-semibold text-orange-700">{text.supplierDue}</Link>
                        <Link href="/customers/crm" className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-sm font-semibold text-blue-700">{text.customerFollowup}</Link>
                        <Link href="/suppliers/list" className="rounded-lg border border-green-100 bg-green-50 px-3 py-3 text-sm font-semibold text-green-700">{text.supplierPaymentFollowup}</Link>
                    </div>
                    <div className="mt-5 rounded-lg bg-gray-50 p-3">
                        <h3 className="text-sm font-bold text-gray-900">{text.todayChecklist}</h3>
                        {[text.checklist1, text.checklist2, text.checklist3, text.checklist4].map((item) => (
                            <div key={item} className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                {item}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900">{text.purchasePlanning}</h2>
                    <p className="mt-1 text-sm text-gray-500">{text.purchaseDesc}</p>
                    <div className="mt-4 space-y-2">
                        <Link href="/reports/low-stock" className="block rounded-lg border border-gray-100 px-3 py-2 text-sm font-semibold hover:bg-gray-50">{text.lowStock}</Link>
                        <Link href="/reports/reorder-suggestions" className="block rounded-lg border border-gray-100 px-3 py-2 text-sm font-semibold hover:bg-gray-50">{text.reorder}</Link>
                        <Link href="/purchases/create" className="block rounded-lg border border-gray-100 px-3 py-2 text-sm font-semibold hover:bg-gray-50">{text.createPurchase}</Link>
                    </div>
                </section>

                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900">{text.staffShift}</h2>
                    <div className="mt-4 space-y-3">
                        <input value={shiftForm.staff} onChange={(event) => setShiftForm((prev) => ({ ...prev, staff: event.target.value }))} className="form-input" placeholder={text.staffName} />
                        <input value={shiftForm.note} onChange={(event) => setShiftForm((prev) => ({ ...prev, note: event.target.value }))} className="form-input" placeholder={text.note} />
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => addShift('in')} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">{text.checkIn}</button>
                            <button onClick={() => addShift('out')} className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white">{text.checkOut}</button>
                        </div>
                    </div>
                    <RecordList empty={text.noRecords} title={text.recentShifts} records={shifts.slice(0, 5).map((item) => `${item.staff} · ${shiftLabels[item.type]} · ${item.time}`)} />
                </section>

                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900">{text.notebook}</h2>
                    <div className="mt-4 space-y-3">
                        <input value={taskForm.title} onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))} className="form-input" placeholder={text.taskTitle} />
                        <div className="grid grid-cols-2 gap-2">
                            <input value={taskForm.owner} onChange={(event) => setTaskForm((prev) => ({ ...prev, owner: event.target.value }))} className="form-input" placeholder={text.owner} />
                            <input type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))} className="form-input" />
                        </div>
                        <button onClick={addTask} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{text.addTask}</button>
                    </div>
                    <div className="mt-4 space-y-2">
                        <h3 className="text-sm font-bold text-gray-900">{text.openTasks}</h3>
                        {tasks.filter((task) => task.status === 'open').length === 0 && <p className="text-sm text-gray-500">{text.noRecords}</p>}
                        {tasks.filter((task) => task.status === 'open').slice(0, 5).map((task) => (
                            <div key={task.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-2 text-sm">
                                <span>{task.title} · {task.dueDate}</span>
                                <button onClick={() => updateTask(task.id)} className="text-green-600">{text.done}</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900">{text.pettyCash}</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <input value={pettyForm.title} onChange={(event) => setPettyForm((prev) => ({ ...prev, title: event.target.value }))} className="form-input" placeholder={text.requestTitle} />
                        <input type="number" value={pettyForm.amount} onChange={(event) => setPettyForm((prev) => ({ ...prev, amount: event.target.value }))} className="form-input" placeholder={text.amount} />
                        <input value={pettyForm.requestedBy} onChange={(event) => setPettyForm((prev) => ({ ...prev, requestedBy: event.target.value }))} className="form-input" placeholder={text.requestedBy} />
                    </div>
                    <button onClick={addPettyCash} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{text.addRequest}</button>
                    <div className="mt-4 space-y-2">
                        <h3 className="text-sm font-bold text-gray-900">{text.pendingRequests}</h3>
                        {pettyCash.filter((item) => item.status === 'pending').length === 0 && <p className="text-sm text-gray-500">{text.noRecords}</p>}
                        {pettyCash.filter((item) => item.status === 'pending').slice(0, 5).map((item) => (
                            <div key={item.id} className="rounded-lg border border-gray-100 p-3 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold">{item.title} · {formatCurrency(item.amount)}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => updatePettyCash(item.id, 'approved')} className="text-green-600">{text.approve}</button>
                                        <button onClick={() => updatePettyCash(item.id, 'rejected')} className="text-red-600">{text.reject}</button>
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">{item.requestedBy || '-'} · {item.date}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900">{text.serviceRepair}</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <input value={repairForm.customer} onChange={(event) => setRepairForm((prev) => ({ ...prev, customer: event.target.value }))} className="form-input" placeholder={text.customer} />
                        <input value={repairForm.item} onChange={(event) => setRepairForm((prev) => ({ ...prev, item: event.target.value }))} className="form-input" placeholder={text.item} />
                        <input value={repairForm.problem} onChange={(event) => setRepairForm((prev) => ({ ...prev, problem: event.target.value }))} className="form-input" placeholder={text.problem} />
                        <input type="date" value={repairForm.dueDate} onChange={(event) => setRepairForm((prev) => ({ ...prev, dueDate: event.target.value }))} className="form-input" />
                    </div>
                    <button onClick={addRepair} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{text.addJob}</button>
                    <div className="mt-4 space-y-2">
                        <h3 className="text-sm font-bold text-gray-900">{text.repairJobs}</h3>
                        {repairs.length === 0 && <p className="text-sm text-gray-500">{text.noRecords}</p>}
                        {repairs.slice(0, 6).map((job) => (
                            <div key={job.id} className="rounded-lg border border-gray-100 p-3 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold">{job.customer} · {job.item}</span>
                                    <select value={job.status} onChange={(event) => updateRepair(job.id, event.target.value as RepairJob['status'])} className="rounded border border-gray-200 px-2 py-1 text-xs">
                                        <option value="received">{repairStatusLabels.received}</option>
                                        <option value="working">{repairStatusLabels.working}</option>
                                        <option value="ready">{repairStatusLabels.ready}</option>
                                        <option value="delivered">{repairStatusLabels.delivered}</option>
                                    </select>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">{job.problem || '-'} · {job.dueDate}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

const RecordList = ({ title, records, empty }: { title: string; records: string[]; empty: string }) => (
    <div className="mt-4 space-y-2">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {records.length === 0 && <p className="text-sm text-gray-500">{empty}</p>}
        {records.map((record) => (
            <div key={record} className="rounded-lg border border-gray-100 p-2 text-sm text-gray-600">
                {record}
            </div>
        ))}
    </div>
);
