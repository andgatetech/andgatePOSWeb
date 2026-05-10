export const AUTH_TOKEN_EXPIRES_AT_KEY = 'token_expires_at';
export const AUTH_TOKEN_EXPIRES_AT_COOKIE = 'token_expires_at';

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
    const expiryTime = getTokenExpiryTime(expiresAt);
    return !expiryTime || expiryTime <= now;
};

export const getCookieMaxAgeFromExpiry = (expiresAt?: string | null): number => {
    const expiryTime = getTokenExpiryTime(expiresAt);
    if (!expiryTime) return 0;

    return Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
};

export const setAuthCookie = (name: string, value: string, maxAge: number) => {
    if (typeof document === 'undefined') return;

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeAuthCookieValue(value)}; path=/; max-age=${maxAge}; SameSite=Strict${secure}`;
};

export const clearAuthCookies = () => {
    if (typeof document === 'undefined') return;

    AUTH_COOKIE_NAMES.forEach((name) => {
        document.cookie = `${name}=; path=/; max-age=0; SameSite=Strict`;
        document.cookie = `${name}=; path=/; max-age=0; Secure; SameSite=Strict`;
    });
};

export const clearAuthLocalStorage = () => {
    if (typeof window === 'undefined') return;

    localStorage.clear();
};
