'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { getTranslation } from '@/i18n';
import { useGetDashboardHealthScoreQuery } from '@/store/features/dashboard/dashboad';
import { AlertTriangle, CheckCircle2, HeartPulse, TrendingDown } from 'lucide-react';

const STATUS_STYLES: Record<string, { ring: string; text: string; bg: string; Icon: typeof CheckCircle2 }> = {
    healthy: { ring: '#0f9f6e', text: 'text-success', bg: 'bg-success/10', Icon: CheckCircle2 },
    attention: { ring: '#e2a03f', text: 'text-warning', bg: 'bg-warning/10', Icon: AlertTriangle },
    critical: { ring: '#e7515a', text: 'text-danger', bg: 'bg-danger/10', Icon: TrendingDown },
};

const COMPONENT_LABEL_KEYS: Record<string, string> = {
    sales_momentum: 'lbl_health_sales_momentum',
    profit_margin: 'lbl_health_profit_margin',
    inventory_health: 'lbl_health_inventory',
    receivables_health: 'lbl_health_receivables',
};

const Skeleton = () => (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 h-6 w-48 rounded bg-gray-200" />
        <div className="flex items-center gap-6">
            <div className="h-28 w-28 flex-shrink-0 rounded-full bg-gray-100" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-3 w-3/4 rounded bg-gray-100" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
            </div>
        </div>
    </div>
);

export default function BusinessHealthScore() {
    const { t } = getTranslation();
    const { currentStoreId } = useCurrentStore();

    const { data, isLoading, isError } = useGetDashboardHealthScoreQuery(
        { store_id: currentStoreId },
        { skip: !currentStoreId }
    );

    if (isLoading) return <Skeleton />;
    if (isError || !data?.data) return null;

    const { score, status, components, top_recommendation } = data.data;
    const style = STATUS_STYLES[status] ?? STATUS_STYLES.attention;
    const { Icon } = style;

    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <HeartPulse className="h-5 w-5 text-primary" />
                {t('lbl_business_health_score')}
            </h3>

            <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="relative flex h-32 w-32 flex-shrink-0 items-center justify-center">
                    <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                        <circle
                            cx="60" cy="60" r="50" fill="none"
                            stroke={style.ring} strokeWidth="10" strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-gray-900">{score}</span>
                        <span className="text-[11px] text-gray-400">/ 100</span>
                    </div>
                </div>

                <div className="flex-1 space-y-3">
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {t(`lbl_health_status_${status}`)}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(components).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs">
                                <span className="truncate text-gray-600">{t(COMPONENT_LABEL_KEYS[key] ?? key)}</span>
                                <span className="font-bold text-gray-900">{value as number}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-gray-600">{top_recommendation}</p>
                </div>
            </div>
        </div>
    );
}
