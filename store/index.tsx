
import { baseApi } from '@/store/api/baseApi';
import authReducer from '@/store/features/auth/authSlice';
import supplierReducer from '@/store/features/supplier/supplierSlice'; // Adjust path as needed
import themeConfigSlice from '@/store/themeConfigSlice';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import invoiceReducer from '@/store/features/Order/OrderSlice'; // Adjust path



const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'supplier'], // Persist only auth and supplier slices
    blacklist: ['baseApi'], // Exclude baseApi from persistence
};

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    auth: authReducer,
    supplier: supplierReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    invoice: invoiceReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(baseApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
