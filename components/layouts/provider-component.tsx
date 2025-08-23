'use client';

import App from '@/App';
import { store, persistor } from '@/store';
import { Provider } from 'react-redux';
import React, { ReactNode, Suspense } from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import Loading from '@/components/layouts/loading';



interface IProps {
    children?: ReactNode;
}

const ProviderComponent = ({ children }: IProps) => {
    return (
        <Provider store={store}>
            <PersistGate loading={<Loading />} persistor={persistor}>
                <Suspense fallback={<Loading />}>
                    <App>{children}</App>
                </Suspense>
            </PersistGate>
        </Provider>
    );
};

// if you want i18n support globally, uncomment this:
// export default appWithI18Next(ProviderComponent, ni18nConfig);

export default ProviderComponent;
