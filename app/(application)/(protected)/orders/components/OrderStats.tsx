'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { AlertCircle, Banknote, CheckCircle, CreditCard, ShoppingCart, XCircle } from 'lucide-react';

interface OrderStatsProps {
    totalOrders: number;
    totalRevenue: number;
    paidOrders: number;
    partialOrders: number;
    dueOrders: number;
    pendingOrders: number;
}

const OrderStats: React.FC<OrderStatsProps> = ({ totalOrders, totalRevenue, paidOrders, partialOrders, dueOrders, pendingOrders }) => {
    const { formatCurrency } = useCurrency();
    const stats = [
        {
            label: 'Total Orders',
            value: totalOrders,
            icon: ShoppingCart,
            bgColor: 'bg-blue-500',
            lightBg: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            icon: Banknote,
            bgColor: 'bg-green-500',
            lightBg: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            label: 'Paid Orders',
            value: paidOrders,
            icon: CheckCircle,
            bgColor: 'bg-emerald-500',
            lightBg: 'bg-emerald-50',
            textColor: 'text-emerald-600',
        },
        {
            label: 'Partial Paid',
            value: partialOrders,
            icon: CreditCard,
            bgColor: 'bg-yellow-500',
            lightBg: 'bg-yellow-50',
            textColor: 'text-yellow-600',
        },
        {
            label: 'Due/Unpaid',
            value: dueOrders,
            icon: XCircle,
            bgColor: 'bg-red-500',
            lightBg: 'bg-red-50',
            textColor: 'text-red-600',
        },
        {
            label: 'Pending',
            value: pendingOrders,
            icon: AlertCircle,
            bgColor: 'bg-orange-500',
            lightBg: 'bg-orange-50',
            textColor: 'text-orange-600',
        },
    ];

    return (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                        <div className="p-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                                    <div className={`flex-shrink-0 rounded-full ${stat.lightBg} p-2`}>
                                        <Icon className={`h-4 w-4 ${stat.textColor}`} />
                                    </div>
                                </div>
                                <p className="truncate text-lg font-bold text-gray-900" title={stat.value.toString()}>
                                    {stat.value}
                                </p>
                            </div>
                        </div>
                        <div className={`h-1 ${stat.bgColor}`}></div>
                    </div>
                );
            })}
        </div>
    );
};

export default OrderStats;
