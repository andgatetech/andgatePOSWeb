export const AUTH_TOKEN_EXPIRES_AT_KEY = 'token_expires_at';
export const AUTH_TOKEN_EXPIRES_AT_COOKIE = 'token_expires_at';
export const AUTH_TOKEN_STORAGE_KEY = 'andgatepos_auth_token';

// A single cookie is capped around 4096 bytes by the browser — a role with most/all
// permissions (100+) easily produces a JSON string past that, and an oversized
// document.cookie write is silently dropped (no exception), leaving proxy.ts's route
// gate with zero permissions even though login succeeded. Split across numbered
// cookies instead so it can't silently overflow regardless of how large the
// permission catalog grows.
const PERMISSIONS_COOKIE_BASE = 'permissions';
const PERMISSIONS_CHUNK_SIZE = 3000; // chars per cookie, safely under the ~4096-byte limit
const PERMISSIONS_MAX_CHUNKS = 25; // generous ceiling; also how many chunk slots get cleared on every write/logout

const permissionsChunkCookieName = (index: number): string => (index === 0 ? PERMISSIONS_COOKIE_BASE : `${PERMISSIONS_COOKIE_BASE}_${index}`);

const AUTH_COOKIE_NAMES = [
    'token',
    'role',
    ...Array.from({ length: PERMISSIONS_MAX_CHUNKS }, (_, i) => permissionsChunkCookieName(i)),
    AUTH_TOKEN_EXPIRES_AT_COOKIE,
];

export const encodeAuthCookieValue = (value: string): string => encodeURIComponent(value);

export const decodeAuthCookieValue = (value?: string | null): string | null => {
    if (!value) return null;

    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

export const getLoginTokenExpiresAt = (data: any): string | null => {
    return data?.token_expires_at || data?.expires_at || null;
};

export const getTokenExpiryTime = (expiresAt?: string | null): number | null => {
    if (!expiresAt) return null;

    const expiryTime = Date.parse(decodeAuthCookieValue(expiresAt) ?? expiresAt);
    return Number.isNaN(expiryTime) ? null : expiryTime;
};

export const isTokenExpired = (expiresAt?: string | null, now = Date.now()): boolean => {
    if (!expiresAt) return true; // missing expiry info = treat token as expired
    const expiryTime = getTokenExpiryTime(expiresAt);
    return !expiryTime || expiryTime <= now;
};

export const getCookieMaxAgeFromExpiry = (expiresAt?: string | null): number => {
    const expiryTime = getTokenExpiryTime(expiresAt);
    if (!expiryTime) return 0;

    return Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
};

export const getAuthCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeAuthCookieValue(match[1]) : null;
};

// Writes the permissions list across permissions, permissions_1, permissions_2, ...
// so no single cookie ever exceeds the browser's size limit. Also clears any leftover
// chunk slots from a previous login that needed more chunks than this one.
export const setPermissionsCookie = (permissions: string[], maxAge: number) => {
    if (typeof document === 'undefined') return;

    let encoded: string;
    try {
        encoded = encodeURIComponent(JSON.stringify(permissions ?? []));
    } catch {
        encoded = encodeURIComponent('[]');
    }

    const chunks: string[] = [];
    for (let i = 0; i < encoded.length; i += PERMISSIONS_CHUNK_SIZE) {
        chunks.push(encoded.slice(i, i + PERMISSIONS_CHUNK_SIZE));
    }
    if (chunks.length === 0) chunks.push('');

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    for (let i = 0; i < PERMISSIONS_MAX_CHUNKS; i++) {
        const name = permissionsChunkCookieName(i);
        if (i < chunks.length) {
            // Chunk is already percent-encoded — write as-is, decode once after reassembly.
            document.cookie = `${name}=${chunks[i]}; path=/; max-age=${maxAge}; SameSite=Strict${secure}`;
        } else {
            document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict${secure}`;
        }
    }
};

// Shared by proxy.ts (via request.cookies) and any client code (via getAuthCookie) —
// takes a cookie-lookup callback so both call sites can reuse the same reassembly logic.
export const readPermissionsFromCookies = (getCookie: (name: string) => string | undefined | null): string[] => {
    let combined = '';
    for (let i = 0; i < PERMISSIONS_MAX_CHUNKS; i++) {
        const value = getCookie(permissionsChunkCookieName(i));
        if (!value) break;
        combined += value;
    }

    if (!combined) return [];

    try {
        const decoded = JSON.parse(decodeURIComponent(combined));
        return Array.isArray(decoded) ? decoded : [];
    } catch {
        return [];
    }
};

export const setAuthCookie = (name: string, value: string, maxAge: number) => {
    if (typeof document === 'undefined') return;

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeAuthCookieValue(value)}; path=/; max-age=${maxAge}; SameSite=Strict${secure}`;
};

export const clearAuthCookies = () => {
    if (typeof document === 'undefined') return;

    const hostname = window.location.hostname;
    const domains = new Set<string | null>([null, hostname]);

    if (hostname.includes('.')) {
        domains.add(`.${hostname}`);
        domains.add(`.${hostname.split('.').slice(-2).join('.')}`);
    }

    AUTH_COOKIE_NAMES.forEach((name) => {
        domains.forEach((domain) => {
            const domainPart = domain ? `; domain=${domain}` : '';
            document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict${domainPart}`;
            document.cookie = `${name}=; path=/; max-age=0; Secure; SameSite=Strict${domainPart}`;
            document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${domainPart}`;
            document.cookie = `${name}=; path=/; max-age=0; Secure; SameSite=Lax${domainPart}`;
        });
    });
};

export const clearAuthLocalStorage = () => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_EXPIRES_AT_KEY);
    } catch {
        // Storage can be unavailable in mobile/private contexts.
    }
};
