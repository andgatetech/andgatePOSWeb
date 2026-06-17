import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE, createTransform } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import { baseApi } from '@/store/api/baseApi';
import { affiliateAdminApi } from '@/store/features/affiliate/affiliateAdminApi';
import { affiliatePortalApi } from '@/store/features/affiliate/affiliatePortalApi';
import authReducer from '@/store/features/auth/authSlice';
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

// Auth token is kept in sessionStorage only (cleared on browser close, never written to localStorage).
// Everything else in auth (user, permissions, currentStore, isAuthenticated) stays in localStorage
// so the UI remains hydrated across page refreshes — API calls will fail with 401 and redirect to login.
const SESSION_TOKEN_KEY = 'andgatepos_session_token';

const authTokenTransform = createTransform(
    // Before writing to localStorage: strip token, save it to sessionStorage instead
    (inboundState: any) => {
        if (typeof window !== 'undefined') {
            if (inboundState.token) {
                sessionStorage.setItem(SESSION_TOKEN_KEY, inboundState.token);
            } else {
                sessionStorage.removeItem(SESSION_TOKEN_KEY);
            }
        }
        const { token, ...rest } = inboundState;
        return rest;
    },
    // On rehydration from localStorage: restore token from sessionStorage
    (outboundState: any) => {
        const token = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_TOKEN_KEY) : null;
        return { ...outboundState, token: token || null };
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
