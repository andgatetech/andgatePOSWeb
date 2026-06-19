'use client';

import Loading from '@/app/loading';
import { AUTH_TOKEN_EXPIRES_AT_COOKIE, AUTH_TOKEN_EXPIRES_AT_KEY, getCookieMaxAgeFromExpiry, isTokenExpired, setAuthCookie } from '@/lib/auth-session';
import type { RootState } from '@/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
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

    useEffect(() => {
        const redirectTo = safeRedirectPath(searchParams.get('redirect'));

        if (!isAuthenticated || !token || isTokenExpired(tokenExpiresAt)) {
            router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`);
            return;
        }

        const expiresAt = tokenExpiresAt || localStorage.getItem(AUTH_TOKEN_EXPIRES_AT_KEY);
        const maxAge = getCookieMaxAgeFromExpiry(expiresAt);

        if (!expiresAt || maxAge <= 0) {
            router.replace(`/login?redirect=${encodeURIComponent(redirectTo)}`);
            return;
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

        router.replace(redirectTo);
    }, [isAuthenticated, router, searchParams, token, tokenExpiresAt, user]);

    return <Loading />;
}
