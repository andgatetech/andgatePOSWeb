'use client';

import App from '@/App';
import Loading from '@/app/loading';

import { clearAuthCookies, clearAuthLocalStorage, isTokenExpired } from '@/lib/auth-session';
import { persistor, store } from '@/store';
import { logout } from '@/store/features/auth/authSlice';
import { ReactNode, Suspense, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import type { RootState } from '@/store';

interface ReduxProviderProps {
    children: ReactNode;
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
            <PersistGate loading={<Loading />} persistor={persistor}>
                <AuthExpiryWatcher />
                <Suspense fallback={<Loading />}>
                    <App>{children}</App>
                </Suspense>
            </PersistGate>
        </Provider>
    );
}

// if you want i18n support globally, uncomment this:
// export default appWithI18Next(ReduxProvider, ni18nConfig);
