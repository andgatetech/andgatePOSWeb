'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetDashboardSectionsFourQuery } from '@/store/features/dashboard/dashboad';
import { motion } from 'framer-motion';
import { Banknote, Clock, CreditCard, FileText, MoreHorizontal, Receipt, Settings, ShoppingCart, TrendingUp } from 'lucide-react';
import { useState } from 'react';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
};

// Skeleton components for loading state
const SectionSkeleton = () => (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-40 rounded bg-gray-200"></div>
            <div className="h-8 w-32 rounded-lg bg-gray-200"></div>
        </div>
        <div className="mb-4 h-48 rounded-lg bg-gray-200"></div>
        <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-full rounded bg-gray-200"></div>
        </div>
    </div>
);

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getMethodIcon = (method: string) => {
    const icons: Record<string, React.ReactNode> = {
        bkash: <CreditCard className="h-5 w-5" />,
        cash: <Banknote className="h-5 w-5" />,
        due: <Clock className="h-5 w-5" />,
        other: <MoreHorizontal className="h-5 w-5" />,
    };
    return icons[method] || icons.other;
};

const getMethodColor = (method: string) => {
    const colors: Record<string, string> = { bkash: 'bg-pink-500', cash: 'bg-emerald-500', due: 'bg-amber-500', other: 'bg-blue-500' };
    return colors[method] || colors.other;
};

const getMethodBgColor = (method: string) => {
    const colors: Record<string, string> = { bkash: 'bg-pink-50', cash: 'bg-emerald-50', due: 'bg-amber-50', other: 'bg-blue-50' };
    return colors[method] || colors.other;
};

const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
        paid: 'bg-emerald-100 text-emerald-700',
        partial: 'bg-amber-100 text-amber-700',
        pending: 'bg-yellow-100 text-yellow-700',
        ordered: 'bg-orange-100 text-orange-700',
        sent: 'bg-emerald-100 text-emerald-700',
        received: 'bg-blue-100 text-blue-700',
        preparing: 'bg-purple-100 text-purple-700',
    };
    return styles[status] || styles.pending;
};

const getAvatarColor = (name: string) => {
    const colors = ['bg-primary/20 text-primary', 'bg-emerald-100 text-emerald-700', 'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700'];
    return colors[name.charCodeAt(0) % colors.length];
};

type TabType = 'sale' | 'purchase' | 'quotation';
type PaymentTabType = 'sales' | 'purchases';

export default function SectionFour() {
    const { formatCurrency } = useCurrency();
    const { currentStoreId } = useCurrentStore();

    const [activeTab, setActiveTab] = useState<TabType>('sale');
    const [paymentTab, setPaymentTab] = useState<PaymentTabType>('sales');
    const [paymentFilter, setPaymentFilter] = useState('last_week');
    const [paymentStartDate, setPaymentStartDate] = useState('');
    const [paymentEndDate, setPaymentEndDate] = useState('');
    const [recentLimit] = useState(6);

    const {
        data: sectionData,
        isLoading,
        isError,
    } = useGetDashboardSectionsFourQuery({
        store_id: currentStoreId,
        payment_filter: paymentFilter,
        payment_start_date: paymentFilter === 'custom' ? paymentStartDate : undefined,
        payment_end_date: paymentFilter === 'custom' ? paymentEndDate : undefined,
        recent_limit: recentLimit,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <SectionSkeleton />
                </div>
                <div className="lg:col-span-8">
                    <SectionSkeleton />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center sm:p-6">
                <p className="text-sm text-red-600 sm:text-base">Failed to load section data. Please try again.</p>
            </div>
        );
    }

    const payment_summary = sectionData?.data?.payment_summary || { sales_by_method: [], purchases_by_method: [] };
    const recent_transactions = sectionData?.data?.recent_transactions || { sales: [], purchases: [], quotations: [] };

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'sale', label: 'Sale', icon: <TrendingUp className="h-4 w-4" /> },
        { id: 'purchase', label: 'Purchase', icon: <ShoppingCart className="h-4 w-4" /> },
        { id: 'quotation', label: 'Quotation', icon: <FileText className="h-4 w-4" /> },
    ];

    const currentPaymentMethods = paymentTab === 'sales' ? payment_summary.sales_by_method : payment_summary.purchases_by_method;
    const totalAmount = currentPaymentMethods.reduce((acc: number, m: any) => acc + m.amount, 0);

    const renderRows = () => {
        const data =
            activeTab === 'sale'
                ? recent_transactions.sales.map((s: any) => ({ ...s, name: s.customer_name, ref: s.order_id }))
                : activeTab === 'purchase'
                ? recent_transactions.purchases.map((p: any) => ({ ...p, name: p.supplier_name, ref: p.invoice_number }))
                : activeTab === 'quotation'
                ? recent_transactions.quotations.map((q: any) => ({ ...q, name: q.supplier_name, ref: q.draft_reference, total: q.estimated_total }))
                : [];

        if (!data.length)
            return (
                <tr>
                    <td colSpan={4} className="text-muted-foreground py-12 text-center">
                        No data available
                    </td>
                </tr>
            );

        return data.map((item: any, index: number) => (
            <motion.tr
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-border group cursor-pointer border-b transition-all duration-300 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
                <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="text-foreground text-sm font-medium">{formatDate(item.date)}</div>
                    <div className="text-muted-foreground text-xs">{item.time || ''}</div>
                </td>
                <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-transform duration-300 group-hover:scale-110 ${getAvatarColor(
                                item.name
                            )}`}
                        >
                            {item.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .slice(0, 2)}
                        </div>
                        <div>
                            <p className="text-foreground text-sm font-medium transition-colors duration-300 group-hover:text-primary">{item.name}</p>
                            <p className="text-xs text-primary">#{item.ref}</p>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3.5">
                    <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-transform duration-300 group-hover:scale-105 ${getStatusBadge(
                            item.status
                        )}`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                </td>
                <td className="text-foreground px-4 py-3.5 text-right font-semibold">{formatCurrency(item.total)}</td>
            </motion.tr>
        ));
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Payment Methods */}
            <motion.div variants={itemVariants} className="lg:col-span-4">
                <div className="flex max-h-[550px] min-h-[550px] flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-[#1f2937] sm:p-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                            <Banknote className="h-5 w-5 text-primary" />
                            Payment Methods
                        </h2>
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="today">Today</option>
                            <option value="last_week">Weekly</option>
                            <option value="last_year">Yearly</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    {/* Custom Date Range Picker */}
                    {paymentFilter === 'custom' && (
                        <div className="animate-fade-in-up mb-4 flex gap-2 rounded-lg bg-gray-50 p-3">
                            <div className="flex-1">
                                <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
                                <input
                                    type="date"
                                    value={paymentStartDate}
                                    onChange={(e) => setPaymentStartDate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
                                <input
                                    type="date"
                                    value={paymentEndDate}
                                    onChange={(e) => setPaymentEndDate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    )}

                    {/* Payment Tabs */}
                    <div className="mb-4 flex items-center gap-2">
                        <button
                            onClick={() => setPaymentTab('sales')}
                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                paymentTab === 'sales' ? 'bg-emerald-500 text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            <TrendingUp className="mr-1.5 inline h-4 w-4" />
                            Sales
                        </button>
                        <button
                            onClick={() => setPaymentTab('purchases')}
                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                paymentTab === 'purchases' ? 'bg-orange-500 text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            <ShoppingCart className="mr-1.5 inline h-4 w-4" />
                            Purchases
                        </button>
                    </div>

                    {/* Payment Methods Content */}
                    <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 min-h-0 flex-1 overflow-y-auto p-4">
                        {currentPaymentMethods.length === 0 ? (
                            <div className="flex h-48 w-full items-center justify-center text-gray-500">No payment data</div>
                        ) : (
                            <div className="w-full space-y-4">
                                {currentPaymentMethods.map((method: any, index: number) => {
                                    const percentage = ((method.amount / totalAmount) * 100).toFixed(1);
                                    return (
                                        <motion.div
                                            key={method.method}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className={`group cursor-pointer rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md ${getMethodBgColor(method.method)}`}
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-white transition-transform duration-300 group-hover:scale-110 ${getMethodColor(
                                                            method.method
                                                        )}`}
                                                    >
                                                        {getMethodIcon(method.method)}
                                                    </div>
                                                    <div>
                                                        <p className="text-foreground font-semibold capitalize transition-colors duration-300 group-hover:text-gray-900">{method.method}</p>
                                                        <p className="text-muted-foreground text-xs">{method.count} transactions</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-foreground font-bold">{formatCurrency(method.amount)}</p>
                                                    <p className="text-muted-foreground text-xs">{percentage}%</p>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/60">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${percentage}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                                                    className={`h-full rounded-full ${getMethodColor(method.method)}`}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-4">
                        <h3 className="mb-2 text-sm font-semibold text-gray-700">Payment Summary</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="h-2 w-2 rounded-full bg-blue-900"></div>
                                    Total {paymentTab === 'sales' ? 'Sales' : 'Purchases'}
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                    Total Transactions
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">{currentPaymentMethods.reduce((acc: number, m: any) => acc + m.count, 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right: Recent Transactions */}
            <motion.div variants={itemVariants} className="relative lg:col-span-8">
                <div className="flex max-h-[550px] min-h-[550px] flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-[#1f2937] sm:p-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                            <Receipt className="h-5 w-5 text-primary" />
                            Recent Transactions
                        </h2>
                        <button className="text-sm font-medium text-primary transition-all hover:underline">View All</button>
                    </div>

                    {/* Tabs */}
                    <div className="mb-3 flex items-center gap-1 overflow-x-auto border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-all ${
                                    activeTab === tab.id ? 'border-primary text-primary' : 'text-muted-foreground hover:text-foreground border-transparent'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 min-h-0 flex-1 overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 z-10">
                                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Date & Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                        {activeTab === 'purchase' || activeTab === 'quotation' ? 'Supplier' : 'Customer'}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Total</th>
                                </tr>
                            </thead>
                            <tbody>{renderRows()}</tbody>
                        </table>
                    </div>

                    {/* Settings FAB */}
                    <button className="text-primary-foreground absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                        <Settings className="h-5 w-5" />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
