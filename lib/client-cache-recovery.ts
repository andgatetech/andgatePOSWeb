const RECOVERY_KEY = 'andgatepos-error-cache-recovered';

const safeSessionStorageGet = (key: string): string | null => {
    try {
        return sessionStorage.getItem(key);
    } catch {
        return null;
    }
};

const safeSessionStorageSet = (key: string, value: string): boolean => {
    try {
        sessionStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
};

export const recoverFromStaleClientCache = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    if (safeSessionStorageGet(RECOVERY_KEY) === 'true') return false;

    const hasRecoveryGuard = safeSessionStorageSet(RECOVERY_KEY, 'true');

    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.unregister()));
        }

        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
        }
    } catch (error) {
        console.error('Failed to clear stale app cache:', error);
    }

    const url = new URL(window.location.href);
    url.searchParams.set('cache-recovered', Date.now().toString());
    if (!hasRecoveryGuard) {
        url.searchParams.set('storage-guard', 'unavailable');
    }
    window.location.replace(url.toString());
    return true;
};
