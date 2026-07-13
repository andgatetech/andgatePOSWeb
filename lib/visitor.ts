'use client';

const VISITOR_ID_KEY = 'andgatebos:visitor_id';
const SESSION_KEY = 'andgatebos:session';
const EXPERIMENT_PREFIX = 'andgatebos:experiment:';
const SESSION_TTL_MS = 30 * 60 * 1000;

type SessionRecord = {
    id: string;
    touched_at: number;
};

export function getVisitorId() {
    return getOrCreateLocalId(VISITOR_ID_KEY, 'v');
}

export function getSessionId() {
    if (typeof window === 'undefined') return '';

    const now = Date.now();
    try {
        const raw = window.sessionStorage.getItem(SESSION_KEY) || window.localStorage.getItem(SESSION_KEY);
        const existing = raw ? (JSON.parse(raw) as SessionRecord) : null;
        if (existing?.id && now - existing.touched_at < SESSION_TTL_MS) {
            const renewed = { ...existing, touched_at: now };
            window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(renewed));
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(renewed));
            return existing.id;
        }
    } catch {
        // Fall through and create a new session id.
    }

    const record = { id: createId('s'), touched_at: now };
    try {
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(record));
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(record));
    } catch {
        // Analytics should degrade quietly when storage is blocked.
    }
    return record.id;
}

export function getExperimentVariant(key: string, variants: string[] = ['control', 'outcome_hero']) {
    if (typeof window === 'undefined' || variants.length === 0) {
        return variants[0] || 'control';
    }

    const storageKey = `${EXPERIMENT_PREFIX}${key}`;
    try {
        const existing = window.localStorage.getItem(storageKey);
        if (existing && variants.includes(existing)) return existing;

        const visitorId = getVisitorId();
        const hash = Array.from(`${key}:${visitorId}`).reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const assigned = variants[hash % variants.length];
        window.localStorage.setItem(storageKey, assigned);
        return assigned;
    } catch {
        return variants[0] || 'control';
    }
}

function getOrCreateLocalId(key: string, prefix: string) {
    if (typeof window === 'undefined') return '';

    try {
        const existing = window.localStorage.getItem(key);
        if (existing) return existing;

        const id = createId(prefix);
        window.localStorage.setItem(key, id);
        return id;
    } catch {
        return createId(prefix);
    }
}

function createId(prefix: string) {
    const value = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return `${prefix}_${value}`;
}
