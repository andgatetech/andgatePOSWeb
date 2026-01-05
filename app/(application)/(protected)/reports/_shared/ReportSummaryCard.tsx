'use client';

import { ReactNode } from 'react';

interface SummaryItem {
    label: string;
    value: string | number;
    icon: ReactNode;
    bgColor: string;
    lightBg: string;
    textColor: string;
}

interface ReportSummaryCardProps {
    items: SummaryItem[];
}

const ReportSummaryCard: React.FC<ReportSummaryCardProps> = ({ items }) => {
    return (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {items.map((stat, index) => (
                <div key={index} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="p-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                                <div className={`flex-shrink-0 rounded-full ${stat.lightBg} p-2`}>{stat.icon}</div>
                            </div>
                            <p className="truncate text-lg font-bold text-gray-900" title={stat.value.toString()}>
                                {stat.value}
                            </p>
                        </div>
                    </div>
                    <div className={`h-1 ${stat.bgColor}`}></div>
                </div>
            ))}
        </div>
    );
};

export default ReportSummaryCard;
