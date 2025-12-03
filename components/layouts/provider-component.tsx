'use client';

import App from '@/App';
import Loading from '@/components/layouts/loading';
import { persistor, store } from '@/store';
import { ReactNode, Suspense } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

interface ReduxProviderProps {
    children: ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
    return (
        <Provider store={store}>
            <PersistGate loading={<Loading />} persistor={persistor}>
                <Suspense fallback={<Loading />}>
                    <App>{children}</App>
                </Suspense>
            </PersistGate>
        </Provider>
    );
}

// if you want i18n support globally, uncomment this:
// export default appWithI18Next(ReduxProvider, ni18nConfig);
