// BangladeshMapInner.tsx
// ⚠️  This file MUST be imported via dynamic() with { ssr: false }
//     Leaflet requires DOM — it cannot run on the server.
'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LeafletProvider, createLeafletContext } from '@react-leaflet/core';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CircleMarker, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet';

import { BANGLADESH_DIVISIONS, STORE_LOCATIONS, TIER_CONFIG, TOTAL_CITIES, TOTAL_DIVISIONS, TOTAL_STORES } from '@/lib/bangladesh-stores';
import MapLegend from './MapLegend';
import StorePopup from './StorePopup';

// ─── Removed Leaflet default icon path fix that can crash SSR/Next.js builds ───
// We use custom DivIcon and CircleMarkers so we do not need the default icon.

// ─── Bangladesh bounding box ──────────────────────────────────────────────────
// SW corner ≈ 20.74°N 88.01°E   NE corner ≈ 26.63°N 92.68°E
const BD_BOUNDS: L.LatLngBoundsExpression = [
    [20.5, 87.8], // SW
    [26.8, 92.9], // NE
];
const BD_CENTER: L.LatLngExpression = [23.685, 90.3563];


type SafeMapContainerProps = L.MapOptions & {
    center: L.LatLngExpression;
    zoom: number;
    children: ReactNode;
    className?: string;
    id?: string;
    style?: CSSProperties;
};

type LeafletContainer = HTMLDivElement & {
    _leaflet_id?: number | null;
};

function SafeMapContainer({ center, children, className, id, style, zoom, ...options }: SafeMapContainerProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const mapOptionsRef = useRef(options);
    const [context, setContext] = useState<ReturnType<typeof createLeafletContext> | null>(null);

    const resetContainer = useCallback((container: HTMLDivElement) => {
        const leafletContainer = container as LeafletContainer;
        leafletContainer._leaflet_id = null;
        container.replaceChildren();
    }, []);

    const removeMap = useCallback(() => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
        setContext(null);

        const container = containerRef.current;
        if (container) {
            resetContainer(container);
        }
    }, [resetContainer]);

    const bindContainer = useCallback((node: HTMLDivElement | null) => {
        if (node === null) {
            removeMap();
        }
        containerRef.current = node;
    }, [removeMap]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || mapRef.current) return; // Prevent double initialization

        resetContainer(container);
        const map = L.map(container, mapOptionsRef.current);
        map.setView(center, zoom);
        mapRef.current = map;
        setContext(createLeafletContext(map));

        return removeMap;
    }, [center, removeMap, zoom]);

    return (
        <div ref={bindContainer} className={className} id={id} style={style}>
            {context ? <LeafletProvider value={context}>{children}</LeafletProvider> : null}
        </div>
    );
}

// ─── Auto-fit to Bangladesh on mount ─────────────────────────────────────────
function BoundsFitter() {
    const map = useMap();
    useEffect(() => {
        map.fitBounds(BD_BOUNDS, { padding: [20, 20] });
    }, [map]);
    return null;
}

// ─── Division label markers (SVG DivIcon) ────────────────────────────────────
function DivisionLabels() {
    const map = useMap();

    useEffect(() => {
        const markers: L.Marker[] = [];

        BANGLADESH_DIVISIONS.forEach((div) => {
            const icon = L.divIcon({
                className: '',
                html: `<div style="
                    background:${div.color};
                    color:#fff;
                    font-size:9px;
                    font-weight:700;
                    padding:2px 6px;
                    border-radius:999px;
                    white-space:nowrap;
                    box-shadow:0 1px 4px rgba(0,0,0,.25);
                    letter-spacing:.4px;
                ">${div.name}</div>`,
                iconAnchor: [30, 8],
            });

            const m = L.marker([div.lat, div.lng], { icon, interactive: false });
            m.addTo(map);
            markers.push(m);
        });

        return () => markers.forEach((m) => m.remove());
    }, [map]);

    return null;
}

export default function BangladeshMapInner() {
    return (
        <div className="relative h-[560px] w-full overflow-hidden rounded-2xl shadow-2xl">
            <div className="pointer-events-none absolute bottom-4 left-4 z-[1000]">
                <MapLegend />
            </div>

            {/* ── Floating stat strip ── */}
            <div className="pointer-events-none absolute left-1/2 top-4 z-[1000] -translate-x-1/2">
                <div className="flex gap-3 rounded-xl border border-white/30 bg-white/90 px-5 py-2.5 shadow-lg backdrop-blur-sm">
                    {[
                        { value: TOTAL_DIVISIONS, label: 'Divisions' },
                        { value: TOTAL_CITIES, label: 'Cities' },
                        { value: TOTAL_STORES, label: 'Stores' },
                    ].map(({ value, label }) => (
                        <div key={label} className="text-center">
                            <div className="text-lg font-extrabold text-blue-600">{value}</div>
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Leaflet map ── */}
            <SafeMapContainer center={BD_CENTER} zoom={7} minZoom={6} maxZoom={13} maxBounds={BD_BOUNDS} maxBoundsViscosity={0.85} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                {/* Light, clean tile layer — no API key required */}
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                {/* Zoom controls — top-right */}
                <ZoomControl position="topright" />

                {/* Fit view to Bangladesh */}
                <BoundsFitter />

                {/* Division coloured text labels */}
                <DivisionLabels />

                {/* ── Store circle markers ── */}
                {STORE_LOCATIONS.map((store) => {
                    const cfg = TIER_CONFIG[store.tier];
                    return (
                        <CircleMarker
                            key={store.id}
                            center={[store.lat, store.lng]}
                            radius={cfg.size / 2}
                            pathOptions={{
                                color: cfg.color,
                                fillColor: cfg.color,
                                fillOpacity: 0.85,
                                weight: 2,
                            }}
                            eventHandlers={{
                                mouseover: (e) => e.target.setStyle({ fillOpacity: 1, weight: 3 }),
                                mouseout: (e) => e.target.setStyle({ fillOpacity: 0.85, weight: 2 }),
                            }}
                        >
                            <Popup minWidth={220} className="leaflet-popup-bd" closeButton={false}>
                                <StorePopup store={store} />
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </SafeMapContainer>
        </div>
    );
}
