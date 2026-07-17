'use client';

import { ReactNode } from 'react';
import { getTranslation } from '@/i18n';

// Semantic meaning, not decoration: what a KPI *is* determines its color everywhere in
// the app, not a per-page pick. revenue = money in, cost = money out/given away,
// neutral = a count/total with no direction, insight = a computed metric (%, forecast).
export type SummaryRole = 'revenue' | 'cost' | 'neutral' | 'insight' | 'warning';

const ROLE_CLASSES: Record<SummaryRole, { bgColor: string; lightBg: string; textColor: string }> = {
    revenue: { bgColor: 'bg-success', lightBg: 'bg-success-light', textColor: 'text-success' },
    cost: { bgColor: 'bg-danger', lightBg: 'bg-danger-light', textColor: 'text-danger' },
    neutral: { bgColor: 'bg-primary', lightBg: 'bg-primary-light', textColor: 'text-primary' },
    insight: { bgColor: 'bg-info', lightBg: 'bg-info-light', textColor: 'text-info' },
    warning: { bgColor: 'bg-warning', lightBg: 'bg-warning-light', textColor: 'text-warning' },
};

interface SummaryItem {
    label: string;
    value: string | number;
    icon: ReactNode;
    /** Preferred: what this number means. Colors are derived from this, not picked per page. */
    role?: SummaryRole;
    /** Legacy escape hatch — prefer `role`. Used only when `role` is absent. */
    bgColor?: string;
    lightBg?: string;
    textColor?: string;
}

interface ReportSummaryCardProps {
    items: SummaryItem[];
}

const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({ items }) => {
    const { t } = getTranslation();
    return (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {items.map((stat, index) => {
                const roleClasses = stat.role ? ROLE_CLASSES[stat.role] : null;
                const bgColor = roleClasses?.bgColor ?? stat.bgColor ?? ROLE_CLASSES.neutral.bgColor;
                const lightBg = roleClasses?.lightBg ?? stat.lightBg ?? ROLE_CLASSES.neutral.lightBg;
                return (
                    <div key={index} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                        <div className="p-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                                    <div className={`flex-shrink-0 rounded-full ${lightBg} p-2`}>{stat.icon}</div>
                                </div>
                                <p className="break-words text-lg font-bold leading-tight text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                        <div className={`h-1 ${bgColor}`}></div>
                    </div>
                );
            })}
        </div>
    );
};

export default ReportSummaryCard;
