const RECOVERY_KEY = 'andgatepos-error-cache-recovered';

export const recoverFromStaleClientCache = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    if (sessionStorage.getItem(RECOVERY_KEY) === 'true') return false;

    sessionStorage.setItem(RECOVERY_KEY, 'true');

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
    window.location.replace(url.toString());
    return true;
};

