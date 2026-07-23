'use client';

import { useCallback, useEffect, useState } from 'react';

export type DashboardExperience = 'simple' | 'owner';

const STORAGE_KEY = 'andgatepos.dashboard_experience';
// Dashboard and Sidebar each call this hook independently. The native `storage`
// event only fires in *other* tabs, never the one that made the write, so
// without this, toggling on the dashboard wouldn't move the sidebar until a
// full reload — a custom same-tab event is the fix.
const CHANGE_EVENT = 'andgatepos:dashboard-experience-change';

const readStored = (): DashboardExperience | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'simple' || stored === 'owner' ? stored : null;
    } catch {
        return null;
    }
};

/**
 * Per-device, opt-in override for how much of the dashboard shows. Deliberately
 * local-only (no backend call): the existing dashboard-layout save/load API
 * (analytics.dashboard_widgets permission) is gated behind the paid Analytics &
 * BI subscription feature server-side — reusing it here would 403 for exactly
 * the basic/new accounts this toggle is for. Returns null when the user hasn't
 * chosen yet, so callers can fall back to today's unchanged default.
 */
export function useDashboardExperience(): [DashboardExperience | null, (value: DashboardExperience | null) => void] {
    const [value, setValue] = useState<DashboardExperience | null>(null);

    useEffect(() => {
        setValue(readStored());

        const sync = () => setValue(readStored());
        window.addEventListener(CHANGE_EVENT, sync);
        window.addEventListener('storage', sync); // other tabs/windows
        return () => {
            window.removeEventListener(CHANGE_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    const update = useCallback((next: DashboardExperience | null) => {
        try {
            if (next) localStorage.setItem(STORAGE_KEY, next);
            else localStorage.removeItem(STORAGE_KEY);
        } catch {
            // Best-effort — dispatch below still switches every mounted instance for this session.
        }
        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, []);

    return [value, update];
}
