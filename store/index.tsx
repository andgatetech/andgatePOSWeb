import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { baseApi } from '@/store/api/baseApi';
import authReducer from '@/store/features/auth/authSlice';
import supplierReducer from '@/store/features/supplier/supplierSlice';
import invoiceReducer from '@/store/features/Order/OrderSlice';
import themeConfigSlice from '@/store/themeConfigSlice';

// --- persist config ---
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'supplier'], // persist only auth + supplier
    blacklist: ['baseApi'], // don’t persist API cache
};

// --- root reducer ---
const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: authReducer,
    supplier: supplierReducer,
    invoice: invoiceReducer,
    [baseApi.reducerPath]: baseApi.reducer, // RTK Query
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// --- store ---
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(baseApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
});

// --- persistor ---
export const persistor = persistStore(store);

// --- types ---
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
