// MapLegend.tsx — floating legend card rendered inside the map
'use client';

import { BANGLADESH_DIVISIONS, TIER_CONFIG } from '@/lib/bangladesh-stores';

export default function MapLegend() {
    return (
        <div className="pointer-events-auto rounded-xl border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Store Tier</h4>

            <ul className="space-y-2">
                {(Object.entries(TIER_CONFIG) as [keyof typeof TIER_CONFIG, (typeof TIER_CONFIG)[keyof typeof TIER_CONFIG]][]).map(([key, cfg]) => (
                    <li key={key} className="flex items-center gap-2">
                        {/* Dot sized proportionally */}
                        <span
                            className="shrink-0 rounded-full"
                            style={{
                                width: cfg.size * 0.5,
                                height: cfg.size * 0.5,
                                backgroundColor: cfg.color,
                                border: `2px solid ${cfg.color}33`,
                            }}
                        />
                        <span className="text-xs text-gray-700">{cfg.label}</span>
                    </li>
                ))}
            </ul>

            <div className="my-3 border-t border-gray-100" />

            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Divisions</h4>

            <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {BANGLADESH_DIVISIONS.map((div) => (
                    <li key={div.id} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: div.color }} />
                        <span className="text-[11px] text-gray-600">{div.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
