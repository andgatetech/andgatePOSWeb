'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetBusinessOsQuery } from '@/store/features/businessOs/businessOsApi';
import { Banknote, BriefcaseBusiness, CalendarCheck, ClipboardList, CreditCard, PackageSearch, Receipt, Users, Wrench } from 'lucide-react';
import Link from 'next/link';

const copy = {
    en: {
        title: 'Business OS',
        desc: 'Owner command center. Operational work is separated into the right modules.',
        todayAt: 'Today at',
        pending: 'Pending',
        open: 'Open',
        recent: 'Recent',
        cashClosing: 'Cash & Counter Closing',
        pettyCash: 'Petty Cash',
        hrAttendance: 'HR Attendance',
        serviceJobs: 'Service Jobs',
        dueCollection: 'Due Collection',
        purchasePlanning: 'Purchase Planning',
        businessTasks: 'Business Tasks',
        cashDesc: 'Cashier submits, owner/manager approves.',
        pettyDesc: 'Staff requests, owner approves small cash.',
        hrDesc: 'Clock in/out and view attendance records.',
        serviceDesc: 'Repair, warranty and service job tracking.',
        dueDesc: 'Customer and supplier due follow-up.',
        purchaseDesc: 'Low stock and reorder action board.',
        tasksDesc: 'Daily owner/manager task list.',
        customerDue: 'Customer Due',
        supplierDue: 'Supplier Due',
        lowStock: 'Low Stock',
        reorder: 'Reorder Suggestions',
        crm: 'CRM Dashboard',
        supplierList: 'Supplier List',
    },
    bn: {
        title: 'বিজনেস ওএস',
        desc: 'মালিকের কমান্ড সেন্টার। অপারেশনাল কাজ আলাদা সঠিক মডিউলে রাখা হয়েছে।',
        todayAt: 'আজকের স্টোর',
        pending: 'পেন্ডিং',
        open: 'ওপেন',
        recent: 'সাম্প্রতিক',
        cashClosing: 'ক্যাশ ও কাউন্টার ক্লোজিং',
        pettyCash: 'পেটি ক্যাশ',
        hrAttendance: 'HR হাজিরা',
        serviceJobs: 'সার্ভিস জব',
        dueCollection: 'বাকি কালেকশন',
        purchasePlanning: 'ক্রয় পরিকল্পনা',
        businessTasks: 'ব্যবসার টাস্ক',
        cashDesc: 'ক্যাশিয়ার সাবমিট করবে, মালিক/ম্যানেজার অনুমোদন করবে।',
        pettyDesc: 'স্টাফ ছোট ক্যাশ রিকোয়েস্ট করবে, মালিক অনুমোদন করবে।',
        hrDesc: 'চেক ইন/আউট এবং হাজিরা রেকর্ড দেখুন।',
        serviceDesc: 'রিপেয়ার, ওয়ারেন্টি ও সার্ভিস জব ট্র্যাকিং।',
        dueDesc: 'গ্রাহক ও সাপ্লায়ারের বাকি ফলো-আপ।',
        purchaseDesc: 'কম স্টক ও রি-অর্ডার অ্যাকশন বোর্ড।',
        tasksDesc: 'মালিক/ম্যানেজারের দৈনিক টাস্ক তালিকা।',
        customerDue: 'গ্রাহকের বাকি',
        supplierDue: 'সাপ্লায়ারের বাকি',
        lowStock: 'কম স্টক',
        reorder: 'রি-অর্ডার সাজেশন',
        crm: 'CRM ড্যাশবোর্ড',
        supplierList: 'সাপ্লায়ার তালিকা',
    },
};

export default function BusinessOsPage() {
    const { i18n } = getTranslation();
    const t = copy[i18n.language === 'en' ? 'en' : 'bn'];
    const { currentStoreId, currentStore } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data } = useGetBusinessOsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const bos = data?.data || {};
    const pendingClosings = (bos.closings || []).filter((item: any) => item.status === 'submitted').length;
    const pendingPetty = (bos.petty_cash || []).filter((item: any) => item.status === 'pending').length;
    const openTasks = (bos.tasks || []).filter((item: any) => item.status === 'open').length;
    const openJobs = (bos.repairs || []).filter((item: any) => item.status !== 'delivered').length;
    const lastClosing = bos.closings?.[0];

    const modules = [
        { href: '/cash-closing', title: t.cashClosing, desc: t.cashDesc, icon: Receipt, stat: `${pendingClosings} ${t.pending}` },
        { href: '/petty-cash', title: t.pettyCash, desc: t.pettyDesc, icon: Banknote, stat: `${pendingPetty} ${t.pending}` },
        { href: '/hr/attendance', title: t.hrAttendance, desc: t.hrDesc, icon: CalendarCheck, stat: `${bos.shifts?.length || 0} ${t.recent}` },
        { href: '/service-jobs', title: t.serviceJobs, desc: t.serviceDesc, icon: Wrench, stat: `${openJobs} ${t.open}` },
        { href: '/customers/crm', title: t.businessTasks, desc: t.tasksDesc, icon: ClipboardList, stat: `${openTasks} ${t.open}` },
        { href: '/reports/low-stock', title: t.purchasePlanning, desc: t.purchaseDesc, icon: PackageSearch, stat: t.lowStock },
    ];

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900"><BriefcaseBusiness className="h-5 w-5 text-primary" /> {t.title}</h1>
                    <p className="text-sm text-gray-500">{t.desc}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
                    {t.todayAt}: <span className="font-semibold text-gray-900">{currentStore?.store_name || '-'}</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <SummaryCard label={t.cashClosing} value={lastClosing ? formatCurrency(lastClosing.actual_cash || 0) : '-'} />
                <SummaryCard label={t.pettyCash} value={`${pendingPetty} ${t.pending}`} />
                <SummaryCard label={t.serviceJobs} value={`${openJobs} ${t.open}`} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {modules.map((module) => {
                    const Icon = module.icon;
                    return (
                        <Link key={module.href} href={module.href} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{module.stat}</span>
                            </div>
                            <h2 className="mt-4 font-bold text-gray-900">{module.title}</h2>
                            <p className="mt-1 text-sm text-gray-500">{module.desc}</p>
                        </Link>
                    );
                })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <QuickLink href="/customers/due" icon={Users} label={t.customerDue} />
                <QuickLink href="/suppliers/due" icon={CreditCard} label={t.supplierDue} />
                <QuickLink href="/reports/reorder-suggestions" icon={PackageSearch} label={t.reorder} />
                <QuickLink href="/suppliers/list" icon={Users} label={t.supplierList} />
            </div>
        </div>
    );
}

const SummaryCard = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-2 text-2xl font-black text-gray-900">{value}</p>
    </div>
);

const QuickLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
    <Link href={href} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
        <Icon className="h-4 w-4 text-primary" />
        {label}
    </Link>
);
