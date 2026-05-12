'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetDashboardTopCustomersQuery } from '@/store/features/dashboard/dashboad';
import { motion } from 'framer-motion';
import { ShoppingBag, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 25 } },
};

const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const avatarColor = (name: string) => {
    const palette = [
        'bg-[#046ca9]/10 text-[#046ca9]',
        'bg-[#0f9f6e]/10 text-[#0f9f6e]',
        'bg-[#e79237]/10 text-[#9b5a18]',
        'bg-[#6d5dfc]/10 text-[#4338ca]',
        'bg-[#f43f5e]/10 text-[#be123c]',
    ];
    return palette[(name?.charCodeAt(0) ?? 0) % palette.length];
};

export default function TopCustomers() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();
    const [period, setPeriod] = useState('monthly');

    const { data, isLoading } = useGetDashboardTopCustomersQuery(
        { store_id: currentStoreId, period },
        { skip: !currentStoreId }
    );

    const customers = data?.data?.customers || [];

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                    <Users className="h-5 w-5 text-[#046ca9]" />
                    {t('dashboard_top_customers')}
                </h3>
                <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="today">{t('lbl_today')}</option>
                    <option value="weekly">{t('lbl_this_week')}</option>
                    <option value="monthly">{t('lbl_this_month')}</option>
                    <option value="yearly">{t('lbl_this_year')}</option>
                </select>
            </div>

            <Link href="/reports/customer" className="mb-3 block w-full text-center text-sm font-medium text-primary transition-colors hover:text-primary/80">
                {t('lbl_view_all')}
            </Link>
            <div className="mb-3 border-t border-gray-200" />

            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex animate-pulse items-center gap-3 rounded-lg bg-gray-50 p-2">
                            <div className="h-9 w-9 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-1">
                                <div className="h-3 w-3/4 rounded bg-gray-200" />
                                <div className="h-2 w-1/2 rounded bg-gray-200" />
                            </div>
                            <div className="h-4 w-16 rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
            ) : customers.length === 0 ? (
                <div className="py-8 text-center">
                    <Users className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">{t('msg_no_data_available')}</p>
                </div>
            ) : (
                <motion.div variants={listVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-2">
                    {customers.map((c: any, i: number) => (
                        <motion.div
                            key={c.id}
                            variants={itemVariants}
                            className="group flex items-center gap-3 rounded-lg border border-gray-100 p-2 transition-all hover:bg-gray-50"
                        >
                            <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform duration-200 group-hover:scale-110 ${avatarColor(c.name)}`}>
                                {c.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-primary">{c.name}</p>
                                <p className="flex items-center gap-1 text-xs text-gray-500">
                                    <ShoppingBag className="h-3 w-3" />
                                    {c.order_count} {t('lbl_orders')}
                                </p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <p className="text-sm font-bold text-gray-900">{formatCurrency(c.total_spent)}</p>
                                <p className="text-[10px] font-semibold text-[#046ca9]">#{i + 1}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
