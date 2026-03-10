// BangladeshMap.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Public-facing wrapper.
// Uses next/dynamic with ssr:false so Leaflet never runs on the server.
// Import THIS file everywhere — never import BangladeshMapInner directly.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import dynamic from 'next/dynamic';

// Skeleton shown while the map JS bundle is loading
function MapSkeleton() {
    return (
        <div className="h-[560px] w-full animate-pulse rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                    <p className="text-sm font-medium text-blue-400">Loading map…</p>
                </div>
            </div>
        </div>
    );
}

const BangladeshMapInner = dynamic(() => import('./BangladeshMapInner'), {
    ssr: false, // ← Critical: Leaflet needs browser DOM
    loading: MapSkeleton,
});

export default function BangladeshMap() {
    return <BangladeshMapInner />;
}
