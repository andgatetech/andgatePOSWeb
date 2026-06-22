'use client';

import App from '@/App';
import Loading from '@/app/loading';

import { clearAuthCookies, clearAuthLocalStorage, isTokenExpired } from '@/lib/auth-session';
import { persistor, store } from '@/store';
import { logout } from '@/store/features/auth/authSlice';
import { ReactNode, Suspense, useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface ReduxProviderProps {
    children: ReactNode;
}

const PERSIST_BOOT_TIMEOUT_MS = 2000;

function PersistBootstrapGate({ children }: { children: ReactNode }) {
    const [canRender, setCanRender] = useState(() => persistor.getState().bootstrapped);

    useEffect(() => {
        if (persistor.getState().bootstrapped) {
            setCanRender(true);
            return;
        }

        const unsubscribe = persistor.subscribe(() => {
            if (persistor.getState().bootstrapped) {
                setCanRender(true);
            }
        });

        const timeout = window.setTimeout(() => {
            console.warn('Redux persistence did not bootstrap in time; rendering with current store state.');
            setCanRender(true);
        }, PERSIST_BOOT_TIMEOUT_MS);

        return () => {
            window.clearTimeout(timeout);
            unsubscribe();
        };
    }, []);

    return canRender ? <>{children}</> : <Loading />;
}

function AuthExpiryWatcher() {
    const dispatch = useDispatch();
    const { isAuthenticated, token, tokenExpiresAt } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (token && !isTokenExpired(tokenExpiresAt)) return;

        dispatch(logout());
        persistor.purge();
        clearAuthCookies();
        clearAuthLocalStorage();
    }, [dispatch, isAuthenticated, token, tokenExpiresAt]);

    return null;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
    return (
        <Provider store={store}>
            <PersistBootstrapGate>
                <AuthExpiryWatcher />
                <Suspense fallback={<Loading />}>
                    <App>{children}</App>
                </Suspense>
            </PersistBootstrapGate>
        </Provider>
    );
}

// if you want i18n support globally, uncomment this:
// export default appWithI18Next(ReduxProvider, ni18nConfig);
