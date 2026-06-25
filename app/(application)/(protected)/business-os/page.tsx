'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetBusinessOsQuery } from '@/store/features/businessOs/businessOsApi';
import { Banknote, BriefcaseBusiness, CalendarCheck, CheckCircle2, ClipboardList, Clock, Receipt, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function BusinessOsPage() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const { data } = useGetBusinessOsQuery({ store_id: currentStoreId }, { skip: !currentStoreId });
    const bos = data?.data || {};

    const pendingClosings = (bos.closings || []).filter((i: any) => i.status === 'submitted').length;
    const pendingPetty = (bos.petty_cash || []).filter((i: any) => i.status === 'pending').length;
    const openTasks = (bos.tasks || []).filter((i: any) => i.status === 'open').length;
    const openJobs = (bos.repairs || []).filter((i: any) => i.status !== 'delivered').length;

    const summaryCards = [
        { icon: Receipt, value: pendingClosings, label: t('bos_pending_closings'), href: '/cash-closing', color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: Banknote, value: pendingPetty, label: t('bos_pending_petty'), href: '/petty-cash', color: 'text-amber-600', bg: 'bg-amber-50' },
        { icon: ClipboardList, value: openTasks, label: t('bos_open_tasks'), href: '/business-os', color: 'text-purple-600', bg: 'bg-purple-50' },
        { icon: Wrench, value: openJobs, label: t('bos_open_jobs'), href: '/business-os', color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    const modules = [
        { icon: Receipt, label: t('bos_cash_closing'), desc: t('bos_cash_closing_desc'), href: '/cash-closing', bg: 'from-blue-500 to-blue-600' },
        { icon: Banknote, label: t('bos_petty_cash'), desc: t('bos_petty_cash_desc'), href: '/petty-cash', bg: 'from-amber-500 to-orange-600' },
        { icon: CalendarCheck, label: t('bos_attendance'), desc: t('bos_attendance_desc'), href: '/hr/attendance', bg: 'from-emerald-500 to-teal-600' },
        { icon: Wrench, label: t('bos_service_jobs'), desc: t('bos_service_jobs_desc'), href: '/business-os', bg: 'from-purple-500 to-violet-600' },
    ];

    const quickLinks = [
        { label: t('bos_tasks'), href: '/business-os', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
        { label: t('bos_due_collection'), href: '/customers/due', icon: <BriefcaseBusiness className="h-3.5 w-3.5" /> },
        { label: t('bos_supplier_due'), href: '/suppliers/due', icon: <BriefcaseBusiness className="h-3.5 w-3.5" /> },
    ];

    const lastClosings = (bos.closings || []).slice(0, 5);
    const recentTasks = (bos.tasks || []).filter((i: any) => i.status === 'open').slice(0, 5);

    return (
        <div className="space-y-5 p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm">
                    <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{t('bos_title')}</h1>
                    <p className="text-sm text-gray-500">{t('bos_desc')}</p>
                </div>
            </div>

            {/* Summary Cards — Pending Actions */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {summaryCards.map((card) => (
                    <Link key={card.label} href={card.href} className={`rounded-xl border border-gray-100 p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${card.bg}`}>
                        <card.icon className={`mx-auto mb-1 h-5 w-5 ${card.color}`} />
                        <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
                        <p className="text-xs text-gray-500">{card.label}</p>
                    </Link>
                ))}
            </div>

            {/* Module Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {modules.map((mod) => (
                    <Link key={mod.label} href={mod.href} className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${mod.bg} p-5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg`}>
                        <mod.icon className="mb-3 h-8 w-8 opacity-80" />
                        <h3 className="text-lg font-bold">{mod.label}</h3>
                        <p className="mt-1 text-sm text-white/80">{mod.desc}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/90 group-hover:text-white">
                            Open → 
                        </span>
                    </Link>
                ))}
            </div>

            {/* Recent Activity + Quick Links */}
            <div className="grid gap-5 lg:grid-cols-2">
                {/* Recent Cash Closings */}
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700">{t('bos_recent_closings')}</h3>
                        <Link href="/cash-closing" className="text-xs text-primary hover:underline">{t('lbl_view_all')}</Link>
                    </div>
                    {lastClosings.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400">{t('bos_no_closings')}</p>
                    ) : (
                        <div className="space-y-2">
                            {lastClosings.map((c: any) => (
                                <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-50 px-3 py-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-900">{formatCurrency(c.actual_cash || 0)}</span>
                                        <span className={`ml-2 text-xs ${parseFloat(c.difference || 0) < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {parseFloat(c.difference || 0) > 0 ? '+' : ''}{formatCurrency(c.difference || 0)}
                                        </span>
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                        c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                        c.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {c.status === 'approved' ? t('bos_approved') : c.status === 'rejected' ? t('bos_rejected') : t('bos_submitted')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Links + Tasks */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t('bos_quick_links')}</h3>
                        <div className="space-y-1.5">
                            {quickLinks.map((link) => (
                                <Link key={link.label} href={link.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary">
                                    {link.icon} {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">{t('bos_open_tasks_title')}</h3>
                        {recentTasks.length === 0 ? (
                            <p className="py-4 text-center text-sm text-gray-400">{t('bos_no_tasks')}</p>
                        ) : (
                            <div className="space-y-2">
                                {recentTasks.map((task: any) => (
                                    <div key={task.id} className="flex items-center gap-2 rounded-lg border border-gray-50 px-3 py-2 text-sm">
                                        <Clock className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                                        <span className="text-gray-700">{task.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
