'use client';
import { clearAuthCookies, clearAuthLocalStorage, isTokenExpired } from '@/lib/auth-session';
import Loading from '@/app/loading';
import { RootState, persistor } from '@/store';
import { logout as logoutAction } from '@/store/features/auth/authSlice';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StoreDisabledScreen from './StoreDisabledScreen';
import StoreInactiveScreen from './StoreInactiveScreen';
import UserBlockedScreen from './UserBlockedScreen';
import UserPendingScreen from './UserPendingScreen';

interface StatusGuardProps {
    children: React.ReactNode;
}

export default function StatusGuard({ children }: StatusGuardProps) {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const { user, token, tokenExpiresAt, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const currentStore = useSelector((state: RootState) => state.auth.currentStore);
    const [isChecking, setIsChecking] = useState(true);
    const redirectingRef = useRef(false);

    const getLoginPath = useCallback(() => {
        const redirect = pathname && pathname !== '/login' ? `?redirect=${encodeURIComponent(pathname)}` : '';
        return `/login${redirect}`;
    }, [pathname]);

    const clearExpiredSession = useCallback(() => {
        if (redirectingRef.current) return;
        redirectingRef.current = true;
        dispatch(logoutAction());
        clearAuthCookies();
        clearAuthLocalStorage();
        Promise.resolve()
            .then(() => persistor.purge())
            .then(() => persistor.flush())
            .catch(() => {})
            .finally(() => {
                window.location.replace(getLoginPath());
            });
    }, [dispatch, getLoginPath]);

    // Force logout if the saved token expiry is missing or expired while the tab is open.
    useEffect(() => {
        const forceLogoutIfExpired = () => {
            if (isAuthenticated && (!token || isTokenExpired(tokenExpiresAt))) {
                clearExpiredSession();
            }
        };

        forceLogoutIfExpired();

        const interval = setInterval(forceLogoutIfExpired, 5 * 60 * 1000);
        document.addEventListener('visibilitychange', forceLogoutIfExpired);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', forceLogoutIfExpired);
        };
    }, [isAuthenticated, token, tokenExpiresAt, clearExpiredSession]);

    useEffect(() => {
        // If not authenticated, redirect to login
        if (isAuthenticated && (!token || isTokenExpired(tokenExpiresAt))) {
            clearExpiredSession();
            return;
        }

        if (!isAuthenticated || !user) {
            clearExpiredSession();
            return;
        }

        // Finished checking
        setIsChecking(false);
    }, [isAuthenticated, user, token, tokenExpiresAt, clearExpiredSession]);

    // If not authenticated, don't render anything (will redirect)
    if (isChecking || !isAuthenticated || !user) {
        return <Loading />;
    }

    // Check user status first (highest priority)
    const userStatus = user.status?.toLowerCase();

    if (userStatus === 'blocked') {
        return (
            <div className="min-h-[calc(100vh-200px)]">
                <UserBlockedScreen />
            </div>
        );
    }

    if (userStatus === 'pending') {
        return (
            <div className="min-h-[calc(100vh-200px)]">
                <UserPendingScreen />
            </div>
        );
    }

    // Subscription status is no longer checked here — SubscriptionGate handles it
    // inside the content slot so Sidebar/Header/Footer stay mounted (see layout.tsx).

    // Check current store status (is_active and store_disabled)
    if (currentStore) {
        // Check if store is inactive (is_active = 0 or false)
        const storeIsActive = currentStore.is_active;
        if (storeIsActive === 0 || storeIsActive === false) {
            return (
                <div className="min-h-[calc(100vh-200px)]">
                    <StoreInactiveScreen storeName={currentStore.store_name} />
                </div>
            );
        }

        // Check if store is disabled (store_disabled = 1 or true)
        const storeDisabled = currentStore.store_disabled;
        if (storeDisabled === 1 || storeDisabled === true) {
            return (
                <div className="min-h-[calc(100vh-200px)]">
                    <StoreDisabledScreen storeName={currentStore.store_name} />
                </div>
            );
        }
    }

    // All checks passed, render the protected content
    return <>{children}</>;
}
