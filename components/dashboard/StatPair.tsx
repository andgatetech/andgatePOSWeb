'use client';

import CountUp from 'react-countup';

export interface StatPairItem {
    label: string;
    value: number;
    percentage: number;
    color: string; // hex color for the bar segment + dot
    textColor: string; // tailwind text-color class for the value/label
}

interface StatPairProps {
    items: [StatPairItem, StatPairItem];
    total?: number;
    totalLabel?: string;
    formatValue?: (value: number) => string;
}

// Two-value comparison without a chart — replaces a 2-slice pie/donut, which
// forces a legend + arc-decoding step for something a proportional bar and two
// numbers communicate instantly. Reusable for any binary split (new vs return
// customers, paid vs due, etc.).
export default function StatPair({ items, total, totalLabel, formatValue }: StatPairProps) {
    const [a, b] = items;
    const format = formatValue ?? ((n: number) => Math.round(n).toLocaleString());
    const aWidth = a.percentage + b.percentage > 0 ? (a.percentage / (a.percentage + b.percentage)) * 100 : 50;

    return (
        <div className="space-y-3">
            {total !== undefined && (
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-gray-900">
                        <CountUp end={total} duration={1.5} formattingFn={(n) => format(Math.round(n))} />
                    </span>
                    {totalLabel && <span className="text-xs text-gray-500">{totalLabel}</span>}
                </div>
            )}

            <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full transition-all" style={{ width: `${aWidth}%`, backgroundColor: a.color }} />
                <div className="h-full flex-1 transition-all" style={{ backgroundColor: b.color }} />
            </div>

            <div className="grid grid-cols-2 gap-2">
                {items.map((item) => (
                    <div key={item.label} className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                        <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className={`truncate text-[10px] font-medium ${item.textColor}`}>{item.label}</span>
                        </div>
                        <div className="mt-1 flex items-baseline justify-between gap-1">
                            <span className="text-lg font-bold text-gray-900">
                                <CountUp end={item.value} duration={1.5} formattingFn={(n) => format(Math.round(n))} />
                            </span>
                            <span className="rounded-md bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">{item.percentage}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
