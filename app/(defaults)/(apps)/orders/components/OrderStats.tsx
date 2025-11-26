'use client';

import { CreditCard, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

interface OrderStatsProps {
    totalOrders: number;
    totalRevenue: number;
    paidOrders: number;
    dueOrders: number;
}

const OrderStats: React.FC<OrderStatsProps> = ({ totalOrders, totalRevenue, paidOrders, dueOrders }) => {
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
            value: `৳${totalRevenue.toFixed(2)}`,
            icon: DollarSign,
            bgColor: 'bg-green-500',
            lightBg: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            label: 'Paid Orders',
            value: paidOrders,
            icon: CreditCard,
            bgColor: 'bg-purple-500',
            lightBg: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
        {
            label: 'Due Orders',
            value: dueOrders,
            icon: TrendingUp,
            bgColor: 'bg-orange-500',
            lightBg: 'bg-orange-50',
            textColor: 'text-orange-600',
        },
    ];

    return (
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="mb-1 text-sm font-medium text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`rounded-full ${stat.lightBg} p-3`}>
                                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                                </div>
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
