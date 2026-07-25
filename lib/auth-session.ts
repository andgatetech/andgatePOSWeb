export const AUTH_TOKEN_EXPIRES_AT_KEY = 'token_expires_at';
export const AUTH_TOKEN_EXPIRES_AT_COOKIE = 'token_expires_at';
export const AUTH_TOKEN_STORAGE_KEY = 'andgatepos_auth_token';

const AUTH_COOKIE_NAMES = ['token', 'role', 'permissions', AUTH_TOKEN_EXPIRES_AT_COOKIE];

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
