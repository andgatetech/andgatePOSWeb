import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

import { baseApi } from '@/store/api/baseApi';
import authReducer from '@/store/features/auth/authSlice';
import labelReducer from '@/store/features/Label/labelSlice';
import orderEditReducer from '@/store/features/Order/OrderEditSlice';
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

// --- persist config ---
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'invoice', 'orderEdit', 'purchaseOrder', 'stockAdjustment', 'label'], // slices to persist
    blacklist: [baseApi.reducerPath], // do not persist API cache
};

// --- root reducer ---
const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: authReducer,
    supplier: supplierReducer,
    invoice: invoiceReducer,
    orderEdit: orderEditReducer,
    purchaseOrder: purchaseOrderReducer,
    stockAdjustment: stockAdjustmentReducer,
    label: labelReducer,
    [baseApi.reducerPath]: baseApi.reducer,
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
