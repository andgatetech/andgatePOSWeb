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

    const modules = [
        { icon: Receipt, label: t('bos_cash_closing'), desc: t('bos_cash_closing_desc'), href: '/cash-closing', badge: pendingClosings, badgeColor: 'text-blue-600 bg-blue-50' },
        { icon: Banknote, label: t('bos_petty_cash'), desc: t('bos_petty_cash_desc'), href: '/petty-cash', badge: pendingPetty, badgeColor: 'text-amber-600 bg-amber-50' },
        { icon: CalendarCheck, label: t('bos_attendance'), desc: t('bos_attendance_desc'), href: '/hr/attendance', badge: 0, badgeColor: 'text-emerald-600 bg-emerald-50' },
        { icon: Wrench, label: t('bos_service_jobs'), desc: t('bos_service_jobs_desc'), href: '/business-os', badge: openJobs, badgeColor: 'text-orange-600 bg-orange-50' },
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

            {/* Module Cards — Primary navigation grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {modules.map((mod) => (
                    <Link
                        key={mod.label}
                        href={mod.href}
                        className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <mod.icon className="h-5 w-5 text-primary" />
                            </div>
                            {mod.badge > 0 && (
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${mod.badgeColor}`}>
                                    {mod.badge} {t('bos_pending_label')}
                                </span>
                            )}
                        </div>
                        <h3 className="mt-3 text-base font-bold text-gray-900 group-hover:text-primary transition-colors">{mod.label}</h3>
                        <p className="mt-1 text-sm text-gray-500">{mod.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Two-column detail */}
            <div className="grid gap-5 lg:grid-cols-2">
                {/* Recent Closings */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-primary" />
                            {t('bos_recent_closings')}
                        </h3>
                        <Link href="/cash-closing" className="text-xs font-medium text-primary hover:underline">{t('lbl_view_all')} →</Link>
                    </div>
                    {lastClosings.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">{t('bos_no_closings')}</p>
                    ) : (
                        <div className="space-y-2">
                            {lastClosings.map((c: any) => (
                                <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-50 px-4 py-3 text-sm hover:bg-gray-50">
                                    <div>
                                        <span className="font-semibold text-gray-900">{formatCurrency(c.actual_cash || 0)}</span>
                                        <span className={`ml-2 text-xs font-medium ${parseFloat(c.difference || 0) < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {parseFloat(c.difference || 0) > 0 ? '+' : ''}{formatCurrency(c.difference || 0)}
                                        </span>
                                    </div>
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
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

                {/* Tasks + Quick Links */}
                <div className="space-y-4">
                    {/* Open Tasks */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-bold text-gray-700 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-primary" />
                            {t('bos_open_tasks_title')}
                            {openTasks > 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{openTasks}</span>}
                        </h3>
                        {recentTasks.length === 0 ? (
                            <p className="py-6 text-center text-sm text-gray-400">{t('bos_no_tasks')}</p>
                        ) : (
                            <div className="space-y-1.5">
                                {recentTasks.map((task: any) => (
                                    <div key={task.id} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                                        <Clock className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                                        <span className="text-gray-700 truncate">{task.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-bold text-gray-700">{t('bos_quick_links')}</h3>
                        <div className="grid grid-cols-2 gap-1.5">
                            {[
                                { label: t('bos_due_collection'), href: '/customers/due' },
                                { label: t('bos_supplier_due'), href: '/suppliers/due' },
                                { label: t('lbl_customers'), href: '/customers/crm' },
                                { label: t('lbl_low_stock'), href: '/reports/low-stock' },
                            ].map((link) => (
                                <Link key={link.label} href={link.href} className="rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-primary/5 hover:text-primary">
                                    {link.label} →
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
