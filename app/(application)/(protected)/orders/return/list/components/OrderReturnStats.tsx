'use client';

import { useCurrency } from '@/hooks/useCurrency';

interface OrderReturnStatsProps {
    totalReturns: number;
    totalRefundAmount: number;
    totalExchangeAmount: number;
    pureReturns: number;
    exchanges: number;
}

const OrderReturnStats: React.FC<OrderReturnStatsProps> = ({ totalReturns, totalRefundAmount, totalExchangeAmount, pureReturns, exchanges }) => {
    const { formatCurrency } = useCurrency();

    const netImpact = totalExchangeAmount - totalRefundAmount;

    const stats = [
        {
            title: 'Total Returns',
            value: totalReturns.toString(),
            color: 'amber',
            bgGradient: 'from-amber-500 to-orange-600',
        },
        {
            title: 'Pure Returns',
            value: pureReturns.toString(),
            subtitle: formatCurrency(totalRefundAmount),
            color: 'red',
            bgGradient: 'from-red-500 to-rose-600',
        },
        {
            title: 'Exchanges',
            value: exchanges.toString(),
            subtitle: formatCurrency(totalExchangeAmount),
            color: 'blue',
            bgGradient: 'from-blue-500 to-indigo-600',
        },
        {
            title: 'Net Impact',
            value: formatCurrency(Math.abs(netImpact)),
            subtitle: netImpact > 0 ? 'Positive' : netImpact < 0 ? 'Negative' : 'Neutral',
            color: netImpact > 0 ? 'green' : netImpact < 0 ? 'red' : 'gray',
            bgGradient: netImpact > 0 ? 'from-green-500 to-emerald-600' : netImpact < 0 ? 'from-red-500 to-rose-600' : 'from-gray-500 to-slate-600',
        },
    ];

    return (
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <div key={index} className="overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md">
                    <div className={`h-1.5 bg-gradient-to-r ${stat.bgGradient}`} />
                    <div className="p-5">
                        <p className="mb-2 text-sm font-medium text-gray-600">{stat.title}</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        {stat.subtitle && <p className="mt-1 text-xs text-gray-500">{stat.subtitle}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderReturnStats;
