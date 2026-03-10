// StorePopup.tsx — shown inside Leaflet <Popup> when a pin is clicked
'use client';

import { StoreLocation, TIER_CONFIG } from '@/lib/bangladesh-stores';
import { MapPin, Phone, Store } from 'lucide-react';

interface Props {
    store: StoreLocation;
}

export default function StorePopup({ store }: Props) {
    const tier = TIER_CONFIG[store.tier];

    return (
        <div className="min-w-[220px] font-sans">
            {/* Header */}
            <div className="flex items-center gap-2 rounded-t-lg px-4 py-3 text-white" style={{ backgroundColor: tier.color }}>
                <Store className="h-4 w-4 shrink-0" />
                <span className="text-sm font-bold">{store.name}</span>
            </div>

            {/* Body */}
            <div className="space-y-2 rounded-b-lg border border-t-0 border-gray-200 bg-white px-4 py-3">
                {/* Tier badge */}
                <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: tier.color }}>
                    {tier.label}
                </span>

                {/* Division */}
                <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Division: </span>
                    {store.division}
                </p>

                {/* Store count */}
                <p className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                    <Store className="h-3.5 w-3.5" style={{ color: tier.color }} />
                    {store.storeCount} Active POS {store.storeCount === 1 ? 'Store' : 'Stores'}
                </p>

                {/* Address */}
                {store.address && (
                    <p className="flex items-start gap-1 text-xs text-gray-500">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: tier.color }} />
                        {store.address}
                    </p>
                )}

                {/* Phone */}
                {store.phone && (
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: tier.color }} />
                        <a href={`tel:${store.phone}`} className="hover:underline" style={{ color: tier.color }}>
                            {store.phone}
                        </a>
                    </p>
                )}
            </div>
        </div>
    );
}
