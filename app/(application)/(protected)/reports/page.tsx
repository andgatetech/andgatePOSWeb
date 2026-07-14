'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Boxes, CreditCard, ReceiptText, TrendingUp, Users } from 'lucide-react';
import { getTranslation } from '@/i18n';

const SIMPLE_REPORTS = [
    {
        titleKey: 'report_hub_sales_title',
        descKey: 'report_hub_sales_desc',
        href: '/reports/sales',
        icon: TrendingUp,
    },
    {
        titleKey: 'report_hub_due_title',
        descKey: 'report_hub_due_desc',
        href: '/reports/customer-due',
        icon: Users,
    },
    {
        titleKey: 'report_hub_stock_title',
        descKey: 'report_hub_stock_desc',
        href: '/reports/stock',
        icon: Boxes,
    },
    {
        titleKey: 'report_hub_low_stock_title',
        descKey: 'report_hub_low_stock_desc',
        href: '/reports/low-stock',
        icon: Boxes,
    },
    {
        titleKey: 'report_hub_profit_title',
        descKey: 'report_hub_profit_desc',
        href: '/reports/profit-loss',
        icon: BarChart3,
    },
    {
        titleKey: 'report_hub_expense_title',
        descKey: 'report_hub_expense_desc',
        href: '/reports/expense',
        icon: CreditCard,
    },
];

const ADVANCED_REPORTS = [
    { label: 'Business Overview', href: '/reports/business-overview' },
    { label: 'Transactions', href: '/reports/transaction' },
    { label: 'Purchase Report', href: '/reports/purchase' },
    { label: 'Supplier Due', href: '/reports/supplier-due' },
    { label: 'Sales Items', href: '/reports/sales-items' },
    { label: 'Tax Report', href: '/reports/tax' },
];

export default function ReportsHubPage() {
    const { t } = getTranslation();

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#046ca9] text-white">
                        <ReceiptText className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('report_hub_title')}</h1>
                        <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-300">{t('report_hub_desc')}</p>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {SIMPLE_REPORTS.map(({ titleKey, descKey, href, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#046ca9]/30 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                    >
                        <div className="flex gap-3">
                            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#046ca9]/10 text-[#046ca9]">
                                <Icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <h2 className="font-semibold text-gray-900 dark:text-white">{t(titleKey)}</h2>
                                <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">{t(descKey)}</p>
                                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#046ca9]">
                                    {t('btn_view')}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('report_hub_advanced_title')}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                    {ADVANCED_REPORTS.map((report) => (
                        <Link key={report.href} href={report.href} className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:border-[#046ca9] hover:text-[#046ca9] dark:border-slate-700 dark:text-slate-300">
                            {report.label}
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
