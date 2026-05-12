'use client';

import { useCurrency } from '@/hooks/useCurrency';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetDashboardProfitTrendQuery } from '@/store/features/dashboard/dashboad';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const COLORS = ['#046ca9', '#0f9f6e', '#e79237', '#f43f5e', '#6d5dfc', '#0891b2', '#d97706'];

const Skeleton = () => (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
                <div className="mb-4 h-6 w-40 rounded bg-gray-200" />
                <div className="h-56 rounded bg-gray-100" />
            </div>
        ))}
    </div>
);

export default function ProfitExpenseWidget() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();
    const { formatCurrency } = useCurrency();

    const { data, isLoading, isError } = useGetDashboardProfitTrendQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );

    if (isLoading) return <Skeleton />;
    if (isError || !data?.data) return null;

    const { weekly_trend, expense_breakdown } = data.data;

    const CustomTrendTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs">
                <p className="mb-1 font-semibold text-gray-800">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.dataKey} style={{ color: p.color }}>
                        {p.name}: <span className="font-bold">{formatCurrency(p.value)}</span>
                    </p>
                ))}
            </div>
        );
    };

    const CustomPieTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs">
                <p className="font-semibold text-gray-800">{payload[0].name}</p>
                <p className="text-gray-600">{formatCurrency(payload[0].value)}</p>
                <p className="text-gray-500">{payload[0].payload.percent}%</p>
            </div>
        );
    };

    const total = expense_breakdown.reduce((s: number, r: any) => s + r.value, 0);
    const pieData = expense_breakdown.map((r: any) => ({
        ...r,
        percent: total > 0 ? ((r.value / total) * 100).toFixed(1) : '0',
    }));

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Net Profit Trend */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <h3 className="mb-4 text-base font-bold text-gray-900">{t('lbl_profit_trend')}</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={weekly_trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0f9f6e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#0f9f6e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="#9ca3af"
                            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v)}
                        />
                        <Tooltip content={<CustomTrendTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="profit" name={t('lbl_business_profit')} stroke="#0f9f6e" strokeWidth={2} fill="url(#profitGrad)" dot={{ r: 3 }} />
                        <Area type="monotone" dataKey="expenses" name={t('lbl_total_expenses')} stroke="#f43f5e" strokeWidth={2} fill="url(#expenseGrad)" dot={{ r: 3 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Expense Breakdown */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <h3 className="mb-4 text-base font-bold text-gray-900">{t('lbl_expense_breakdown')} <span className="text-xs font-normal text-gray-400">({t('lbl_this_month')})</span></h3>
                {pieData.length === 0 ? (
                    <div className="flex h-[220px] items-center justify-center text-sm text-gray-400">{t('msg_no_data_available')}</div>
                ) : (
                    <div className="flex items-center gap-4">
                        <PieChart width={160} height={160}>
                            <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value" stroke="none">
                                {pieData.map((_: any, i: number) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                        <div className="flex-1 space-y-2 overflow-auto">
                            {pieData.map((item: any, i: number) => (
                                <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="truncate text-gray-700">{item.name}</span>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <span className="font-semibold text-gray-900">{item.percent}%</span>
                                        <span className="ml-1 text-gray-400">{formatCurrency(item.value)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
