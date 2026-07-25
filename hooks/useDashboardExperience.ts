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
        if (stored === 'simple' || stored === 'owner') return stored;
        // 2026-07-25: default flipped to 'simple' for everyone — the full dashboard
        // was the reported source of "hard to use" complaints, and Simple Mode
        // (6-item menu) already existed but was invisible opt-in-only, so almost no
        // one who needed it ever found it. Anyone who explicitly picked 'owner'
        // still keeps that choice (the branch above already returns it first) —
        // this only changes the answer for accounts that never chose either way.
        return 'simple';
    } catch {
        return 'simple';
    }
};

/**
 * Per-device override for how much of the dashboard shows, defaulting to
 * 'simple' for every account until they explicitly switch to 'owner' (see
 * DashboardExperienceToggle). Deliberately local-only (no backend call): the
 * existing dashboard-layout save/load API (analytics.dashboard_widgets
 * permission) is gated behind the paid Analytics & BI subscription feature
 * server-side — reusing it here would 403 for exactly the basic/new accounts
 * this toggle is for.
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
