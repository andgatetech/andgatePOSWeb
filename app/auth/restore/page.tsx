'use client';

import Loading from '@/app/loading';
import { AUTH_TOKEN_EXPIRES_AT_COOKIE, AUTH_TOKEN_EXPIRES_AT_KEY, getCookieMaxAgeFromExpiry, isTokenExpired, setAuthCookie } from '@/lib/auth-session';
import type { RootState } from '@/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const safeRedirectPath = (value: string | null) => {
    if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/login')) {
        return '/pos';
    }

    try {
        const url = new URL(value, window.location.origin);
        return url.origin === window.location.origin ? `${url.pathname}${url.search}` : '/pos';
    } catch {
        return '/pos';
    }
};

export default function AuthRestorePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, token, tokenExpiresAt, user } = useSelector((state: RootState) => state.auth);
    const [fallbackPath, setFallbackPath] = useState('/pos');
    const [showRecovery, setShowRecovery] = useState(false);

    useEffect(() => {
        const redirectTo = safeRedirectPath(searchParams.get('redirect'));
        setFallbackPath(redirectTo);

        const recoveryTimer = window.setTimeout(() => setShowRecovery(true), 3000);

        const navigate = (path: string) => {
            router.replace(path);

            window.setTimeout(() => {
                if (window.location.pathname === '/auth/restore') {
                    window.location.replace(path);
                }
            }, 1200);
        };

        if (!isAuthenticated || !token || isTokenExpired(tokenExpiresAt)) {
            navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`);
            return () => window.clearTimeout(recoveryTimer);
        }

        const expiresAt = tokenExpiresAt || localStorage.getItem(AUTH_TOKEN_EXPIRES_AT_KEY);
        const maxAge = getCookieMaxAgeFromExpiry(expiresAt);

        if (!expiresAt || maxAge <= 0) {
            navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`);
            return () => window.clearTimeout(recoveryTimer);
        }

        const encodedPermissions = (() => {
            try {
                return btoa(JSON.stringify(user?.permissions ?? []));
            } catch {
                return btoa('[]');
            }
        })();

        setAuthCookie('token', token, maxAge);
        setAuthCookie('role', user?.role || '', maxAge);
        setAuthCookie('permissions', encodedPermissions, maxAge);
        setAuthCookie(AUTH_TOKEN_EXPIRES_AT_COOKIE, expiresAt, maxAge);
        localStorage.setItem(AUTH_TOKEN_EXPIRES_AT_KEY, expiresAt);

        navigate(redirectTo);

        return () => window.clearTimeout(recoveryTimer);
    }, [isAuthenticated, router, searchParams, token, tokenExpiresAt, user]);

    if (!showRecovery) return <Loading />;

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-4 text-center dark:bg-slate-950">
            <div className="max-w-sm">
                <div className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                    Opening AndGate POS
                </div>
                <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">
                    If the app does not open automatically, continue manually.
                </p>
                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white"
                        onClick={() => window.location.replace(fallbackPath)}
                    >
                        Open POS
                    </button>
                    <button
                        type="button"
                        className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                        onClick={() => window.location.replace(`/login?redirect=${encodeURIComponent(fallbackPath)}`)}
                    >
                        Go to login
                    </button>
                </div>
            </div>
        </main>
    );
}
