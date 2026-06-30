import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE, createTransform } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import { baseApi } from '@/store/api/baseApi';
import { affiliateAdminApi } from '@/store/features/affiliate/affiliateAdminApi';
import { affiliatePortalApi } from '@/store/features/affiliate/affiliatePortalApi';
import authReducer from '@/store/features/auth/authSlice';
import { AUTH_TOKEN_EXPIRES_AT_KEY, AUTH_TOKEN_STORAGE_KEY, isTokenExpired } from '@/lib/auth-session';
import labelReducer from '@/store/features/Label/labelSlice';
import cachedProductsReducer from '@/store/features/offline/cachedProductsSlice';
import offlineOrdersReducer from '@/store/features/offline/offlineOrdersSlice';
import orderEditReducer from '@/store/features/Order/OrderEditSlice';
import orderReturnReducer from '@/store/features/Order/OrderReturnSlice';
import invoiceReducer from '@/store/features/Order/OrderSlice';
import purchaseOrderReducer from '@/store/features/PurchaseOrder/PurchaseOrderSlice';
import stockAdjustmentReducer from '@/store/features/StockAdjustment/stockAdjustmentSlice';
import supplierReducer from '@/store/features/supplier/supplierSlice';
import themeConfigSlice from '@/store/themeConfigSlice';

// --- SSR-safe storage ---
const createNoopStorage = () => ({
    getItem: (_key: string) => Promise.resolve(null),
    setItem: (_key: string, value: string) => Promise.resolve(value),
    removeItem: (_key: string) => Promise.resolve(),
});

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

// PWA/offline login persistence:
// Keep the API token in localStorage with its real expiry so an installed app can reopen like Gmail.
// The backend expiry remains authoritative; expired tokens are removed during rehydration.

const authTokenTransform = createTransform(
    // Do not persist the API token; keep everything else.
    (inboundState: any) => {
        const { token, ...rest } = inboundState;
        return rest;
    },
    // Restore the separately saved token only if its backend expiry is still valid.
    (outboundState: any) => {
        if (typeof window === 'undefined') {
            return {
                ...outboundState,
                token: null,
                isAuthenticated: false,
            };
        }

        let token: string | null = null;
        let tokenExpiresAt: string | null = null;
        try {
            token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
            tokenExpiresAt = localStorage.getItem(AUTH_TOKEN_EXPIRES_AT_KEY) || outboundState?.tokenExpiresAt || null;
        } catch {
            token = null;
            tokenExpiresAt = null;
        }

        if (!token || isTokenExpired(tokenExpiresAt)) {
            return {
                ...outboundState,
                token: null,
                tokenExpiresAt,
                isAuthenticated: false,
            };
        }

        return {
            ...outboundState,
            token,
            tokenExpiresAt,
            isAuthenticated: Boolean(outboundState?.user),
        };
    },
    { whitelist: ['auth'] }
);

// --- persist config ---
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'invoice', 'orderEdit', 'orderReturn'], // durable offline POS data is stored in IndexedDB
    blacklist: [baseApi.reducerPath, affiliatePortalApi.reducerPath, affiliateAdminApi.reducerPath], // do not persist API cache
    transforms: [authTokenTransform],
};

// --- root reducer ---
const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: authReducer,
    supplier: supplierReducer,
    invoice: invoiceReducer,
    orderEdit: orderEditReducer,
    orderReturn: orderReturnReducer,
    purchaseOrder: purchaseOrderReducer,
    stockAdjustment: stockAdjustmentReducer,
    label: labelReducer,
    offlineOrders: offlineOrdersReducer,
    cachedProducts: cachedProductsReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [affiliatePortalApi.reducerPath]: affiliatePortalApi.reducer,
    [affiliateAdminApi.reducerPath]: affiliateAdminApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// --- store ---
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(baseApi.middleware, affiliatePortalApi.middleware, affiliateAdminApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
});

// --- persistor ---
export const persistor = persistStore(store);

// --- types ---
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
